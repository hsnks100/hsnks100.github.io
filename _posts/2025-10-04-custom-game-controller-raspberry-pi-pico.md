---
title: "Raspberry Pi Pico로 커스텀 게임 컨트롤러 만들기"
excerpt: "3D 프린팅과 아두이노 코딩으로 나만의 게임 컨트롤러를 제작해보자"
header:
  teaser: /assets/img/game-controller/workspace.jpg
categories:
  - DIY
  - Hardware
tags:
  - Raspberry Pi Pico
  - 3D Printing
  - Game Controller
  - Arduino
  - DIY
---

게임을 좋아하는 사람이라면 한 번쯤은 나만의 게임 컨트롤러를 만들어보고 싶었을 것입니다. 이번에는 Raspberry Pi Pico를 이용해서 완전히 커스텀한 게임 컨트롤러를 제작해보겠습니다.

## 준비물

### 하드웨어
- **[Raspberry Pi] 라즈베리파이 피코 (Raspberry Pi Pico)** - 메인 컨트롤러
- **[럭킷] UL1007 AWG22 검정 10M** - 전선
- **[ATTEN] 실습용 무연납 TS-99.38050 (0.8mm / 50g)** - 납땜용
- **[SMG-A] 30mm Arcade Game Machine Switch (White) [SZH-ZR003]** - 아케이드 버튼
- **[거상인] [RA3]보급형 원형만능기판(100*100_양면)** - 회로 기판
- **[(주)엔티렉스] M3 황동 서포트 키트 [NT-KIT-M002]** - 지지대
- **[CONNFLY (중국)] 핀헤더소켓 Single 1x40 Straight(2.54mm)** - 피코 결합용
- **[SMG] 둥근머리 렌치볼트 + 너트 샘플키트(340pcs) [NT-KIT-LS027]** - 결합용 나사

### 도구
- 납땜 인두
- 3D 프린터 (또는 3D 프린팅 서비스)
- 드릴, 파일 등 가공 도구

## 1단계: 3D 모델링 및 프린팅

![3D 모델](/assets/img/game-controller/3dmodel.jpg)

먼저 TinkerCAD를 사용해서 컨트롤러 케이스를 모델링했습니다. 주요 설계 포인트는:

- **M3 규격 나사**로 결합할 수 있도록 설계
- **체리스위치 구멍**: 40mm × 40mm 사각형으로 뚫음
- **아케이드 버튼 구멍**: 버튼 스펙에 맞춰 원형으로 뚫음

3D 프린터가 없어서 숨고에서 견적을 받아 진행했습니다. 비용은 약 5만원 정도 들었네요. 

> 💡 **팁**: 사실 사는 게 훨씬 싸긴 합니다. 하지만 나만의 디자인으로 만드는 재미는 돈으로 살 수 없죠!

## 2단계: 회로 구성

![작업 공간](/assets/img/game-controller/workspace.jpg)

### 핀헤더 설치
만능기판에 핀헤더를 꽂고 피코를 연결했습니다.

![피코 연결](/assets/img/game-controller/pico.jpg)

### GND 허브 구성
GND가 많이 필요해서 핀헤더를 이용해 GND 허브를 만들었습니다.

![GND 허브](/assets/img/game-controller/groundhub.jpg)

### 간단한 테스트
먼저 간단하게 버튼 확인용으로 게임 컨트롤러를 테스트해봤습니다. [Hardware Tester](https://hardwaretester.com/gamepad)에서 테스트한 결과 잘 작동하는 것을 확인했습니다.

![게임패드 테스터](/assets/img/game-controller/gamepadtester.jpg)

## 3단계: 스위치 설치 및 납땜

![버튼 설치](/assets/img/game-controller/installbutton.jpg)

3D 프린팅한 상판에 모든 스위치를 결합했습니다.

### 납땜 작업
먼저 GND 연결부터 시작했습니다.

![GND 납땜](/assets/img/game-controller/groundsolder.jpg)

그리고 나머지 핀들도 각각의 핀에 맞춰서 납땜했습니다.

![납땜 준비](/assets/img/game-controller/solderready.jpg)

![배선](/assets/img/game-controller/wiring.jpg)

## 4단계: 코드 작성

Raspberry Pi Pico용 Arduino 코드입니다:

```cpp
#include "Adafruit_TinyUSB.h"
#include "hardware/regs/sio.h" // sio_hw->gpio_in 사용을 위해 추가

// --- 핀 설정 (최대 16버튼 지원) ---
// 방향키 핀 (위: GP18, 아래: GP19, 왼쪽: GP20, 오른쪽: GP21)
const int directionPins[] = {18, 19, 20, 21}; 

// 액션 버튼 핀 (총 12개, B0 ~ B11 버튼에 순서대로 할당됨)
const int actionPins[] = {
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
}; 

// --- USB HID 장치 설정 ---
uint8_t const desc_hid_report[] = { TUD_HID_REPORT_DESC_GAMEPAD() };

Adafruit_USBD_HID usb_hid;
hid_gamepad_report_t report;
hid_gamepad_report_t prevReport;
uint32_t pin_mask = 0;

void report_init() {
  // report와 prevReport를 모두 0으로 초기화
  memset(&report, 0, sizeof(report));
  memcpy(&prevReport, &report, sizeof(report));
}

// hid_task: 모든 입력 처리 및 리포트 생성을 담당 (최종 최적화)
void hid_task() {
  uint32_t pins = ~sio_hw->gpio_in & pin_mask;

  // 1. 방향키 입력 상태 읽기
  bool up_pressed    = (pins & (1 << directionPins[0]));
  bool down_pressed  = (pins & (1 << directionPins[1]));
  bool left_pressed  = (pins & (1 << directionPins[2]));
  bool right_pressed = (pins & (1 << directionPins[3]));

  // 2. SOCD 처리 로직
  if (left_pressed && right_pressed) {
    left_pressed = false;
    right_pressed = false;
  }
  if (up_pressed && down_pressed) {
    up_pressed = false;
    down_pressed = false;
  }

  // 3. report.buttons 값만 계산 (hat, x, y는 사용 안 함)
  uint16_t new_buttons = 0;
  
  // 액션 버튼 매핑 (B0 ~ B11)
  const int numActionPins = sizeof(actionPins) / sizeof(actionPins[0]);
  for (int i = 0; i < numActionPins; i++) {
    if (pins & (1 << actionPins[i])) {
      new_buttons |= (1 << i);
    }
  }

  // 방향키 버튼 매핑 (B12 ~ B15)
  if (up_pressed)    new_buttons |= (1 << (numActionPins + 0));
  if (down_pressed)  new_buttons |= (1 << (numActionPins + 1));
  if (left_pressed)  new_buttons |= (1 << (numActionPins + 2));
  if (right_pressed) new_buttons |= (1 << (numActionPins + 3));
  
  report.buttons = new_buttons;
}

// send_report: 상태가 변경되었을 때만 리포트를 전송
void send_report() {
  // x, y, hat 등은 항상 0이므로 버튼 값만 비교해도 충분
  if (prevReport.buttons != report.buttons) {
    if ( TinyUSBDevice.mounted() && usb_hid.ready() ) {
      usb_hid.sendReport(0, &report, sizeof(report));
      memcpy(&prevReport, &report, sizeof(report));
    }
  }
}

void setup() {
  for (int pin : directionPins) {
    pinMode(pin, INPUT_PULLUP);
    pin_mask |= (1 << pin);
  }
  for (int pin : actionPins) {
    pinMode(pin, INPUT_PULLUP);
    pin_mask |= (1 << pin);
  }

  report_init();
  
  usb_hid.setReportDescriptor(desc_hid_report, sizeof(desc_hid_report));
  usb_hid.begin();
  
  while ( !TinyUSBDevice.mounted() ) delay(1);
}

void loop() {
  hid_task();
  send_report();
}
```

### 코드 설명

- **16개 버튼 지원**: 방향키 4개 + 액션 버튼 12개
- **SOCD 처리**: 동시에 반대 방향을 누르면 무효화 (게임에서 일반적인 규칙)
- **최적화된 입력 처리**: 하드웨어 레지스터를 직접 사용해 빠른 응답
- **USB HID 호환**: 표준 게임패드로 인식되어 대부분의 게임에서 사용 가능

## 5단계: 최종 테스트

![핀 체크](/assets/img/game-controller/checkpin.jpg)

모든 납땜이 완료된 후 다시 [Hardware Tester](https://hardwaretester.com/gamepad)에서 테스트했습니다. 모든 버튼이 정상적으로 작동하는 것을 확인했습니다.

## 완성!

![게임패드 테스터 결과](/assets/img/game-controller/gamepadtester.jpg)

드디어 나만의 커스텀 게임 컨트롤러가 완성되었습니다! 

### 총평
직접 만들면 비싸니까 시제품 사세요 ㅠ