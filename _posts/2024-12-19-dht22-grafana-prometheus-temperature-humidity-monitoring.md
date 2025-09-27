---
title: "DHT22와 Grafana, Prometheus를 이용한 집안 온습도 모니터링 시스템"
toc: true
tags: [iot, dht22, grafana, prometheus, temperature, humidity, monitoring, esp32, arduino]
---

# DHT22와 Grafana, Prometheus를 이용한 집안 온습도 모니터링 시스템

집안 온습도를 실시간으로 모니터링하고 싶어서 만든 IoT 시스템입니다. ESP32와 DHT22 센서로 데이터를 수집하고, Prometheus와 Grafana로 시각화하는 간단한 프로젝트인데 생각보다 잘 동작하네요.

## 시스템 구성

전체적인 흐름은 이렇습니다:

```
ESP32 + DHT22 → API 서버 → Prometheus → Grafana
```

- **ESP32**: 5분마다 깨어나서 DHT22에서 온습도 읽고 WiFi로 서버에 전송
- **API 서버**: ESP32 데이터 받아서 Prometheus 메트릭으로 변환
- **Prometheus**: 데이터 저장 (15일간 보관)
- **Grafana**: 예쁜 그래프로 시각화

## 하드웨어 구성

### 필요한 부품들
- ESP32 개발보드 (아무거나)
- DHT22 온습도 센서 (3000원 정도)
- 점퍼 와이어
- 브레드보드 (테스트용)
- 만능기판 (영구 제작용)
- 케이스 (플라스틱 박스)
- USB 연장 케이블 (Micro 5Pin, 50cm)
- 납땜 도구들
- 보조배터리 (집에 굴러다니는 거 사용)

### 1단계: 브레드보드로 테스트

일단 브레드보드에 회로 꽂아서 제대로 동작하는지 확인해봤습니다.

```
DHT22 센서 연결:
- VCC → ESP32 3.3V
- GND → ESP32 GND  
- DATA → ESP32 GPIO 4
```

![브레드보드 테스트 회로도](/assets/img/grafana/circuit.png)
![브레드보드실제](/assets/img/grafana/bread.jpg)

브레드보드에서 확인한 것들:
- DHT22 센서가 제대로 값 읽는지
- WiFi 연결 잘 되는지
- Deep Sleep 모드로 전력 절약되는지
- 데이터 전송 잘 되는지

### 2단계: 만능기판에 납땜

테스트가 잘 되니까 이제 만능기판에 영구적으로 납땜했습니다.

![만능기판 회로도](/assets/img/grafana/solder.jpg)

**만능기판 제작 과정:**
1. ESP32와 DHT22 센서 위치 정하기
2. 점퍼 와이어로 연결할 핀들 확인
3. 납땜으로 안정적으로 연결
4. 다시 한번 테스트해보기

### 3단계: 케이스 만들기

만능기판이 완성되니까 이제 케이스에 넣어야겠더라고요.

**케이스 제작 과정:**

1. **케이스 고르기**: 적당한 크기의 플라스틱 박스 구했음
2. **구멍 뚫기**:
   - USB 포트용 구멍: 드라이버 달궈서 플라스틱 녹여서 구멍 만들기
   - 부족한 부분은 핀바이스로 넓혀서 맞춤
   - 가운데 구멍은 못 쓰는 인두기로 뚫어서 정리
3. **USB 연장 케이블 설치**: 
   - [Coms] USB 연장 포트 케이블 - Micro 5Pin (M)/(F)브라켓연결용 판넬형, 50cm, Black[NE776] 사용
   - 케이스 안에서 ESP32 USB 포트와 연결
   - 케이스 밖으로 USB 포트 노출

![뚫기](/assets/img/grafana/drill.jpg)
![뚫기-안](/assets/img/grafana/drill-in.jpg)

## ESP32 펌웨어 코드

ESP32는 Deep Sleep 모드로 전력 절약하면서 5분마다 깨어나서 센서 데이터 읽고 전송합니다.

```cpp
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi 설정
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// 센서 설정
#define DHTPIN 4
#define DHTTYPE DHT22

// API 설정
const char* serverUrl = "https://your-domain.com/api/env";
const char* location = "living_room";

// Deep Sleep 설정
#define uS_TO_S_FACTOR 1000000ULL  // 마이크로초 -> 초 변환
#define TIME_TO_SLEEP  300         // 5분 (300초)

// RTC 메모리에 저장 (Deep Sleep 중에도 유지)
RTC_DATA_ATTR int bootCount = 0;

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  bootCount++;
  
  Serial.print("부팅 횟수: ");
  Serial.println(bootCount);
  
  // 센서 초기화
  dht.begin();
  delay(2000);  // DHT22 안정화
  
  // 센서 읽기
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  Serial.print("온도: ");
  Serial.print(temperature);
  Serial.print("°C, 습도: ");
  Serial.print(humidity);
  Serial.println("%");
  
  // 센서 값 확인
  if (!isnan(humidity) && !isnan(temperature)) {
    // WiFi 연결 (전송할 때만)
    connectWiFi();
    
    // 데이터 전송
    sendData(temperature, humidity);
    
    // WiFi 연결 해제 (전력 절약)
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
  } else {
    Serial.println("센서 읽기 실패!");
  }
  
  // Deep Sleep 설정
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  Serial.println("5분 후 깨어납니다...");
  Serial.flush();
  
  // Deep Sleep 진입 (전력 소비 ~10μA)
  esp_deep_sleep_start();
}

void loop() {
  // Deep Sleep 사용시 loop는 실행되지 않음
}

void connectWiFi() {
  Serial.print("WiFi 연결 중...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" 연결됨!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(" 연결 실패!");
  }
}

void sendData(float temp, float hum) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi 연결 없음");
    return;
  }
  
  WiFiClientSecure client;
  HTTPClient https;
  
  // HTTPS 설정
  client.setInsecure();
  
  // JSON 생성
  StaticJsonDocument<200> doc;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["location"] = location;
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.print("전송: ");
  Serial.println(payload);
  
  // POST 전송
  https.begin(client, serverUrl);
  https.addHeader("Content-Type", "application/json");
  
  int httpCode = https.POST(payload);
  
  if (httpCode > 0) {
    Serial.print("응답: ");
    Serial.println(httpCode);
    
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      Serial.println("전송 성공!");
    }
  } else {
    Serial.print("에러: ");
    Serial.println(https.errorToString(httpCode));
  }
  
  https.end();
}
```

## Docker Compose 설정

Grafana와 Prometheus를 Docker Compose로 구성합니다:

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus:v2.53.0
    container_name: prometheus
    user: root
    volumes:
      - ./prometheus/config/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./data/prometheus:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:11.0.0
    container_name: grafana
    user: root
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=your_password
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - ./data/grafana:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
```

## Prometheus 설정

`prometheus/config/prometheus.yml` 파일을 생성합니다:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'temperature-humidity-api'
    scheme: https
    metrics_path: /prometheus
    static_configs:
      - targets: ['your-api-server.com']
```

이 설정은 API 서버의 `/prometheus` 엔드포인트에서 HTTPS로 메트릭을 수집합니다.

## API 서버 구현

ESP32에서 전송된 데이터를 받아 Prometheus 메트릭으로 변환하는 API 서버가 필요합니다.

**API 서버의 주요 기능:**
1. ESP32에서 전송된 JSON 데이터 수신 (`/api/env` 엔드포인트)
2. 온도/습도 데이터를 Prometheus 메트릭으로 변환
3. Prometheus가 수집할 수 있는 `/prometheus` 엔드포인트 제공

**구현 방법:**
- Node.js + Express + prom-client 라이브러리 사용
- 또는 Python + Flask + prometheus_client 라이브러리 사용
- 또는 다른 언어/프레임워크로 구현 가능

API 서버는 ESP32에서 전송된 데이터를 받아서 Prometheus 형식의 메트릭으로 변환하여 저장하는 역할을 합니다.

## Grafana 대시보드 설정

### 데이터 소스 설정

Grafana 데이터 소스는 `grafana/provisioning/datasources/datasource.yml` 파일로 자동 설정됩니다:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

이 설정으로 Grafana가 자동으로 Prometheus를 기본 데이터 소스로 사용합니다.

### 대시보드 설정

**Grafana 접속**: http://localhost:3000 (각자 설정한 관리자 계정 사용)
**대시보드 생성**: Dashboard → New Dashboard
**패널 추가**: 온도/습도 그래프 생성
   - Query: `temperature_celsius{location="living_room"}`
   - Query: `humidity_percent{location="living_room"}`

![Grafana 대시보드](/assets/img/grafana/photo_2025-09-27_22-45-41.jpg)

실제로 동작하는 Grafana 대시보드입니다. 온도와 습도가 실시간으로 그래프에 표시되고 있어요.


## 전력 소비 최적화

- **Deep Sleep 모드**: ESP32가 5분마다 깨어나서 데이터 전송 후 다시 잠들어서 전력 절약
- **WiFi 연결 최적화**: 데이터 전송할 때만 WiFi 연결하고 바로 해제
- **배터리 수명**: 집에 굴러다니는 보조배터리로도 충분히 동작 (약 1-2개월)

## 제작 과정 요약

### 브레드보드 → 만능기판 → 케이스 순서로 진행

**브레드보드 테스트**: 회로 동작 확인하고 펌웨어 테스트
**만능기판 제작**: 안정적으로 납땜해서 영구적인 회로 구성
**케이스 제작**: 
   - 플라스틱 케이스에 구멍 뚫기 (드라이버 가열 + 핀바이스 + 인두기)
   - USB 연장 케이블 설치해서 외부에서 접근 가능하게
   - DHT22 센서 노출을 위한 구멍 뚫기

### 제작할 때 주의할 점

- **브레드보드 테스트**: 모든 기능이 제대로 동작하는지 확인하고 다음 단계로
- **만능기판 납땜**: 연결이 안정적이도록 솔더 충분히 사용
- **케이스 구멍**: USB 포트와 센서 노출을 위한 구멍을 정확한 위치에 뚫기
- **USB 케이블**: 50cm 길이로 충분한 여유 두고 설치

## 마무리

DHT22 센서와 Grafana, Prometheus로 집안 온습도를 모니터링하는 시스템을 만들어봤습니다. Deep Sleep으로 전력 절약하면서도 장기간 안정적으로 동작하네요.. ㅎㅎ

