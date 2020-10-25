---
toc: true
hidden: true
---

# Jerryscript 란?

최근 스터디로 관심이 가게 된 jerryscript 라는게 있다. 딱봐도 javascript 의 향기가 솔솔 나는데 공식 사이트에 가보면 

https://github.com/jerryscript-project/jerryscript 
```
JerryScript : 사물 인터넷을위한 JavaScript 엔진
```

JerryScript 는 정말 작은 소형 기기에서도 쓸 수 있는 경량 js 엔진이라고 한다. 

ECMAScript 5.1 표준까지 지원하고 낮은 메모리 소비를 위한 최적화를 장점으로 꼽는다. 또 포터블하기 위해 C99 표준코드를 사용했고 뭐라뭐라 하지만, 여튼 경량화된 js 엔진이라고 보면 된다.

글 작성방식은 JerryScript 를 정리하는건 아니고, JerryScript 소스를 보면서 생각했던 생각을 글로 남기는 방식으로 쓴다. 아마 어떤 코드를 볼 때 어떤 과정으로 이 거대한 녀석을 요리하는지 과정 그 자체를 담는데 목적이 있다.

# 기본구조 예측

