---
title: "간단하게 펄과 함께 하는 숏코딩 (Short Coding)"
date: 2020-10-09
categories: [programming]
tags: [perl, short-coding, algorithm]
---

# 숏코딩

숏코딩은 코드 길이를 극한까지 줄이는 코딩을 의미한다. 
골프에서 낮은 타수로 홀인하는 것처럼 숏코딩은 최소한의 바이트수로 해당 문제를 풀어내는 것을 말한다. 

예를 들면 int value = 0; 를 공백과 이름을 줄여서 int v=0; 으로 하는 것도 일종의 숏코딩 기법이다.

가독성 따윈 개나줘라의 코딩이 무슨 의미가 있냐고 물어볼 수 있겠으나, 해당 언어의 테크닉을 극한까지 알고 있어야 최대한으로 바이트 절약이 가능하다. 

숏코딩을 시도하면 언어의 상세 스펙문서를 얼마나 꿰차는지가 중요한지 알게된다. 

# 문제

https://www.acmicpc.net/problem/14425

```
5 11
baekjoononlinejudge
startlink
codeplus
sundaycoding
codingsh
--------------------------------
baekjoon
codeplus
codeminus
startlink
starlink
sundaycoding
codingsh
codinghs
sondaycoding
startrink
icerink
```
위와 같이 s 집합의 문자열이 나머지 문자열에서 얼마나 나타나는지 체크하는 프로그램을 작성하라고 한다. 위 그림에서 ---------- 로 나눠진 부분.

세어보면 4개 임을 알 수 있다. 문제 풀이는 간단해보인다. 해시형 자료구조에 해당 문자열을 넣고, 다음 검사문자열에서 해당 문자열이 있다면 카운팅을 하고 최종적으로 프린트 하면 될것 같다.

떠오르는 대로 코딩해보자.

```perl
($n, $m) = split(/ /, <STDIN>);
%s = {};
while(--$n >= 0) {
    $_ = <STDIN>;
    chomp;
    $s->{$_} = 1; 
}
$sol = 0;
while($m--) {
    $_ = <STDIN>;
    chomp;
    if ($s->{$_} == 1) {
        $sol++;
    }
}

print $sol;
```
두개의 루프로 문제풀이를 했다. 먼저 %s 에 해당 문자열에 대한 값을 1로 셋하고 다음 루프에서 검사하면서 1 이면 카운팅 하는 방식.

점점 줄여보도록 하자. 먼저 <STDIN> 는 표준입력으로부터 문자열을 리턴하는 펄 명령어인데, <> 처럼 STDIN 을 생략해도 된다.

또한 함수 호출의 괄호또한 생략가능하므로 split/ /,<>; 으로 고쳐 쓸 수 있다.

```perl
$_ = <STDIN>;
chomp;
$s->{$_} = 1;
```
또한 다음과 같이 고칠 수 있다.

```perl
$s->${<>}=1;
```

위 과정을 적용 시키면


```perl
($n, $m) = split/ /, <>;
while($n--) {
    $s->{<>} = 1; 
} 
$v = 0;
while($m--) {
    if ($s->{<>} == 1) {
        $v++;
    }
}
print $v;
```

perl 에서 한줄 짜리 명령어일 때 if, while, for 등의 명령어는 뒤에 위치하면서 괄호를 생략할 수 있다.

예를 들면

```
if(condition) { s; }
는 
s if(condition);
으로 고쳐쓸 수 있다.
```

적용시켜보자.

```perl
($n, $m) = split/ /, <>;
$s->{<>} = 1 while$n--;
$v = 0;
while($m--) {
    if ($s->{<>} == 1) {
        $v++;
    }
}
print $v;
```

밑의 while 은 하나의 명령이 아니다. 하지만 삼항연산자로 하나의 명령으로 바꾸고 한줄 짜리 while 로 바꾸면

```perl
$s->{<>}==1?$v++:0 while$m--;
print$v;
```

조금 더 줄여보자.perl 에서는 ==1 으로 검사를 하지 않더라도 undefined 나 0 이 아니면 참으로 반환한다.
```perl
$s->{<>}?$v++:0 while$m--;
print$v;
```
print 함수는 인자가 생략되면 특별한 변수 $_ 를 출력하게 되어있다. 고쳐보자.
```perl
$_=0;$s->{<>}?$_++:0 while$m--;print;
```

위 테크닉을 다 적용하고 나면~

```perl
($n,$m)=split/ /,<>;$s->{<>}=1 while$n--;$_=0;$s->{<>}?$_++:0 while$m--;print;
```

78 bytes!

현재 숏코딩 1위 파이썬 코드 84 bytes 

```
I=input;n,m=map(int,I().split());*s,=map(I,['']*n);print(sum(I()in s for _ in[0]*m))
```

보다 6 bytes 줄인 78 bytes 로 1등이다~^_^

더 줄일 방법이 있을까요? 제 펄 실력의 한계네요.

