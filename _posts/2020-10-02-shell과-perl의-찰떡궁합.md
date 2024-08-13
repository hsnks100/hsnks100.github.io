---
toc: true 
---

# 쉘과 Perl의 환상 조합

대부분의 시스템에서는 Perl 컴파일러가 기본적으로 제공되고 있고, 쉘과의 조합이 매우 막강하여 Perl을 깊게 배우지 않더라도 간단히 교양 수준으로 배워놓으면 활용도가 매우 크다.

기본적으로 쉘 프로그래밍은 stdin, stdout을 다루는 작업이라고 볼 수 있는데, linux/unix에서는 파이프(|) 문자를 이용해서 이 목적을 달성하곤 한다.

예를 들어 process name이 ksoo인 프로세스를 모두 종료시키는 스크립트를 짜본다고 가정한다. (pkill 있는거 안다 쫌!!)

먼저 `ps aux`로 프로세스 목록을 뽑고 `grep`을 통해서 필터링하고 `kill -9`으로 종료, 빵!

`ps aux | grep ksoo`를 실행해보면

USER PID %CPU %MEM VSZ RSS TTY STAT ...

으로 이뤄진 테이블이 출력된다. 우리가 관심있는 필드는 두 번째 PID 다.

```
ps aux | grep ksoo | awk '{print $2}'
```

이러면 ksoo인 pid가 싸그리 나오게 된다. 그러면 `kill -9 pid1 pid2 pid3 ...` 형태로 넘겨줘야 하는데 어떻게 하나? 우리의 친구 xargs를 이용한다.

```
ps aux | grep ksoo | awk '{print $2}'  | xargs kill -9
```

이처럼 쉘 프로그래밍은 stdin/stdout을 이용하여 작업을 하게 되는데, 여기서 정보 처리의 복잡도를 더 늘려보자. ksoo 프로세스 이름을 가지는 애들의 TIME을 분 단위로 나타내보자. TIME은 hh:mm 단위로 나타나고 hh * 60 + mm 으로 표시하면 된다.

자, 어떻게 하나?

```
ps aux | grep ksoo | awk '{print $10}' | awk -F ':' '{print $1,"___",$2, $1 * 60 + $2}'
```

위처럼 하면 되지만, awk의 문서를 찾아봐야 하고, 어떤 경우에는 한 줄로 쓰기가 곤란할 정도의 처리를 할 때도 있고, 쉘 프로그래밍을 하기에도 곤란한 경우가 있다. 정규식으로 파싱하고 캡쳐하여 후처리가 필요하다거나...

Perl로 해볼까?

some.pl
```perl
while(<>) {
@s=split(" ");
@a=split(":", $s[9]);
print $a[0]*60 + $a[1], "\n";
}
```

```
ps aux | grep ksoo | perl some.pl
```

동작을 확인한 후 이제 oneline으로 바꿔보자.

여기서 `-ne` 옵션, `perl -ne 'CODE'` 다음 프로그램과 똑같다.

```perl
while (<>) {
CODE
}
```

그러면 oneline으로 고쳐보면,

```
ps aux | grep usr | perl -ne '@s=split(" "); @a=split(":", $s[9]); print $a[0]*60 + $a[1], "\n"'
```

정규식을 이용한 방법

```
ps aux | grep usr | perl -ne '@s=split(" "); $s[9]=~/(.+):(.+)/; print $1*60+$2,"\n";'
```

# 마무리

Perl은 쉘 프로그래밍과 찰떡 궁합의 퍼포먼스를 보이며, 익혀 놓으면 여러분의 리눅스 생활을 윤택하게 해줄 수 있는 도구가 될 것이다.