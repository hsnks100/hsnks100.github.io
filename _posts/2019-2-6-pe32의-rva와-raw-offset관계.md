---
toc: true
tags: [pe32, rva, raw-offset, reverse-engineering, windows]
---

# PE32의 RVA와 RAW offset 관계

파일 리버싱에 있어서 RVA와 RAW offset을 서로간의 위치 관계를 잘 매핑해야 한다. 

여러가지 이유가 있겠지만 그 중 하나는 파일 패치를 위해 바이너리를 고치는 경우, 파일에서 고친부분이 프로세스가 메모리에 올라갔을 때는 몇번지인지 정확히 알 필요가 있다.

RVA 는 메모리상의 주소, RAW 는 파일상의 오프셋으로 정의할 수 있겠다.

찾는 방법은 간단하다. 

 1. RVA 가 속한 섹션 s 를 찾는다.
 2. RAW = RVA - s.VirtualAddress + s.PointerToRawData
 
 
 실험용 exe: [01.zip](https://github.com/hsnks100/hsnks100.github.io/files/2834481/01.zip)
 
 
![image](https://user-images.githubusercontent.com/3623889/52314093-5bc66b00-29f4-11e9-9730-fe597c1b4968.png)

RVA to RAW offset 을 이용하여 간단한 바이너리 패치를 해보자.

그림을 보면 402012 라는 주소에 "Make me ... CD-ROM." 이라는 문자열이 들어있다. 우리는 이 문자열을 우리가 원하는 글자로 바꾸고 싶다. 

우리가 원하는 문자열이 이미 들어있는 문자열의 길이보다 작으면 상관없지만, 만약 더 길다면 문제가 된다.

![image](https://user-images.githubusercontent.com/3623889/52314606-ce384a80-29f6-11e9-811f-db0d9cd741fd.png)

하지만 해당 주소를 덤프떠보니, 뒤에 우리가 필요한 문자열을 붙일 공간이 없다.

아래 공간을 보니 아래쪽에 null padding 문자가 잔뜩 있다. 0x4020b2 부분의 데이터 영역을 이용하여 문자열 패치를 해보겠다.

먼저 push 402012 를 push 0x4020b2 로 고쳐준다. 그리고 실행파일을 gl.exe 로 저장한다.

이제 gl.exe 의 0x4020b2 에 대응하는 RAW offset 을 찾아서 hex editor 로 패치하면 끝난다.

RVA = 0x4020b2 - ImageBase = 0x20b2

![image](https://user-images.githubusercontent.com/3623889/52314771-6afae800-29f7-11e9-9269-7f54f651503a.png)

0x20b2 에 해당하는 섹션 s 는 DATA section 이다. 

소개했던 공식에 그대로 대입하면 

```
RAW = 0x20b2 - s.VirtualAddress + s.PointerToRawData
    = 0x20b2 - 0x2000 + 0x800
    = 0x8b2
```


![image](https://user-images.githubusercontent.com/3623889/52314887-e8265d00-29f7-11e9-8383-29531413e992.png)

애용하는 hex editor 로 0x8b2 로 가서 원하는 문자를 채워주고 저장하고 실행해보자.

![image](https://user-images.githubusercontent.com/3623889/52314913-03916800-29f8-11e9-8ceb-b2ab658212ec.png)

성공.
