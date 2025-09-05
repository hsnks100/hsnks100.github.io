---
toc: true
tags: [code-cave, reverse-engineering, packing, patching]
---

# Code Cave 예제

[code-cave.zip](https://github.com/hsnks100/hsnks100.github.io/files/2836720/code-cave.zip)

위 파일의 메시지의 내용을 바꾸는 것이 미션이다.

언뜻보기엔 쉬울거 같지만, 이중으로 packing 이 되어있어서 문자열을 바꿀 수도 없고 바꾼다 하더라도 CRC check 때문에 실행이 제대로 안된다.



![image](https://user-images.githubusercontent.com/3623889/52348621-1f345700-2a68-11e9-82e3-8fb9f034e4f8.png)
 
![image](https://user-images.githubusercontent.com/3623889/52348639-28bdbf00-2a68-11e9-80a6-cde0b8a50bb7.png)

![image](https://user-images.githubusercontent.com/3623889/52348624-222f4780-2a68-11e9-8aec-927df1e6fe24.png)
