---
toc: true
tags: [vim, script, editor, programming]
---

# Vim Script를 배워봅시다

이 페이지는 Vim 사용법을 알려주는 페이지가 아닙니다. 좀 더 고급 사용자로 가기 위해 Vim Script를 배우는 페이지입니다.

이 페이지를 읽기 전 기본적인 buffer, window, tab, vim operator (dd, x, i)와, insert/ex/visual mode 등에 대해 익숙한 사용자를 대상으로 합니다.

크게 세 가지 섹션으로 나누어서 설명할 것입니다.

- 기본적인 key map을 이용하는 방법
- 프로그래밍하는 방식을 통해 접근하는 Vim Script, 변수나 함수, 제어구조 등이 포함됩니다.
- 샘플 plugin 제작을 통해 실제 Vim 생태에 기여하는 방법

## .vimrc

기본적으로 Vim을 시작하게 되면 로드하게 되는 스크립트 파일은 `.vimrc` 파일입니다.

`.vimrc` 파일은 시스템마다 로드하는 위치와 순서가 다를 수 있습니다.

본인의 컴퓨터의 환경에 대해서 살펴보고 싶으면 `:version` 해보면 로드하는 vimrc에 대한 정보를 알 수 있습니다.

조금 더 일반적인 내용에 대해서 보고 싶으면 `:help vimrc`를 입력해보세요.

```vim
Places for your personal initializations:
    Unix		$HOME/.vimrc or $HOME/.vim/vimrc
    OS/2		$HOME/.vimrc, $HOME/vimfiles/vimrc
            or $VIM/.vimrc (or _vimrc)
    MS-Windows	$HOME/_vimrc, $HOME/vimfiles/vimrc
            or $VIM/_vimrc
    Amiga		s:.vimrc, home:.vimrc, home:vimfiles:vimrc
            or $VIM/.vimrc
```

위와 같이 나옵니다. 각 시스템에서 어떻게 동작하는지 자세한 설명도 볼 수 있습니다.

이처럼 Vim은 뭔가에 대해 궁금할 때 `:help something`을 이용하면 원하는 정보를 얻을 수 있습니다.

Vim에서는 간단히 `:e ~/.vimrc` 정도만 입력해도 자기 시스템에 맞는 vimrc를 편집할 수 있습니다.

앞으로 설명할 스크립트들은 간단히 inline으로 Vim editor 창에 입력해도 되지만, 영구히 저장하고 싶다면 자기 시스템에 맞는 vimrc 파일에 기록하면 됩니다.

다음 시작 때부터 Vim은 vimrc를 읽어들여 실행하게 됩니다.

```vim
:echo $MYVIMRC
```

으로도 확인할 수 있습니다.

### Echo Message

Vim 스크립트를 본격적으로 배우기 전에 기본적인 변수 확인이나 디버깅 방법을 알아야 합니다.

우리가 지금까지 프로그래밍을 하면서 디버깅을 할 때 로그를 남기면서 한 것과 같은 이치입니다.

Vim에서는 `echo` 내장 명령어를 통해서 변수 값을 간단하게 확인할 수 있습니다.

```vim
:echo "hello world"
```

쳐보면 하단에 "hello world"가 찍히는 것을 볼 수 있습니다.

하지만 이걸로만은 나중에 확인하기엔 부족합니다. 지나간 로그에 대해서 보고 싶을 때가 있습니다.

```vim
:echo "hello1"
:echom "hello2"
:messages 
```

입력해보고 `echo`와 `echom`의 차이를 스스로 판단해 보세요.

좀 더 알고 싶으면 `:help echom`, `:help echo`를 활용하세요.

### Comment

Vim에서 가독성을 높이기 위해서 주석을 달 수 있습니다.

`~/.vimrc`:
```vim
" open my vimrc
nnoremap <leader>feR :source ~/.vimrc<CR>
```

`"` 뒤에 나오는 문자는 전부 무효 처리됩니다.

### Options

Vim은 어떻게 동작할지에 대한 많은 옵션을 가지고 있습니다.

대부분 옵션은 on/off 식으로 작동하게 되는데 `:set XXX`, `:set noXXX` 식으로 XXX에 대한 사항을 토글할 수 있습니다.

```vim
:set number 
:set nonumber
```

둘 다 Vim에 쳐보면 알 수 있습니다.

이미 Vim에 익숙한 사용자라면 잘 알겠지만, postfix로 붙는 `?`와 `!`에 대해서도 알아둬야 합니다.

```vim
:set number!
```

on/off 토글하기 위해서는 `!`를 붙입니다.

현재 상태를 확인하기 위해서는

```vim
:set number?
```

끝에 `?`를 붙입니다.

### Basic Mapping

Vim의 장점 중 하나가 키매핑을 이용해서 동작을 바꿀 수 있다는 점입니다.

```vim
:map _ x
```

타이핑을 하고 문자 위에서 `_`를 쳐보면 문자가 지워지는 것을 볼 수 있습니다.

특별한 키를 위해서는 `<>`으로 묶어서 표현하기도 합니다. 예를 들면 `<space>`, `<C-d>` 정도가 될 수 있습니다.

### Modal Mapping

`map`을 쓸 때 특정 모드에서만 가능하도록 매핑할 수 있습니다.

```vim
:imap jj <ESC>j 
```
라고 입력 후 insert 모드에서 `jj`를 눌러보세요.

Vim에서는 이러한 모드가 여러 가지가 있습니다.

```vim
:help :map-modes
```
으로 확인해보세요.

꼭 확인해봐야 합니다. 이 중에서 우리가 주로 쓰는 매핑은 사람마다 다르겠지만 대체로 `imap`, `vmap`, `nmap` 이 세 가지를 씁니다.

### Recursive Mapping

```vim
:nmap x dd
:nmap _ x
```

라고 입력 후에 어떤 내용이 있는 텍스트 위에서 `_`를 타이핑하면 어떤 일이 일어날까요?

Vim은 `_`를 입력받아서 `x`를 타이핑하게 하고, 또 Vim은 `x`는 `dd`니까 최종적으로 `dd`를 실행하게 됩니다.

이러한 방식은 때때로 다른 플러그인과의 충돌을 발생시키고, 원하지 않는 결과를 만듭니다.

이를 위해서 Vim은 `no-remap`을 제공합니다.

```vim
:nnoremap x dd
:nnoremap _ x
```

라고 해보고 아까 했던 행동을 해보세요.

### Leaders

앞에서 정했듯

```vim
:nnoremap x dd 
```

라고 정의하고 `x`를 누르면 `dd`가 실행되는 것을 알 수 있었습니다. 하지만 이러한 매핑은 기본 동작을 바꾸는 좋지 않은 행동입니다.

그래서

```vim
:nnoremap -x dd
```

처럼 `-`와 같은 접두사(prefix)를 붙여서 이러한 동작을 지원해 줄 수 있습니다.

하지만 사용자가 이미 `-x`와 같은 명령어를 개인적으로 매핑해서 쓴다면 해결할 방법이 없습니다.

사용자가 직접 찾아서 플러그인의 매핑된 코드를 바꿔야 합니다.

이때 `leader` key를 쓰면 사용자가 매핑한 `leader` key 기준으로 매핑을 할 수 있습니다.

```vim
:let mapleader = ","
:nnoremap <leader>x dd
```

후에 `,x`라고 쳐보세요.

이러한 `leader` key의 장점은 사용자가 원하는 키로 매핑을 일괄적으로 변경할 수 있다는 점입니다.

local에서 `leader` key를 지정하고 싶다면

```vim
:help maplocalleader
```

를 통해 공부하세요.

### Load Script

자신이 만드는 스크립트는 앞서 설명했듯 `$MYVIMRC` 경로에 저장해놓으면 Vim을 재시작할 때 불러온다고 했습니다.

그 경로는 `:echo $MYVIMRC`를 통해 경로를 알 수 있었습니다.

하지만 매번 스크립트를 불러올 때, `$MYVIMRC` 혹은 `~/.vimrc`를 입력하기엔 고통이 따릅니다.

우리는 키매핑을 배웠기 때문에 다음과 같이 매핑을 합니다.

```vim
:nnoremap <leader>fed :source $MYVIMRC<cr>
```

자기가 편한 키 배열로 세팅하면 됩니다.

그리고 `.vimrc`를 편집하고 저장하고, `:source %`를 입력하면 스크립트를 다시 불러옵니다.

(여기서 `%`는 현재 파일을 가리키는 특별한 문자)

여기서 `:source %` 또한 키매핑으로 다음과 같이

```vim
:nnoremap <leader>feR :source $MYVIMRC<cr>
```

할 수 있습니다. 하지만 이 방법도 저장하고 매번 타이핑해야 합니다.

아직 배우지 않았지만 `autocmd`를 이용하여 다음과 같이 설정할 수 있습니다.

```vim
augroup filetype_vim
  autocmd!
  autocmd BufWritePost *.vimrc,*.vim source $MYVIMRC
augroup END
```

위 코드를 자신의 `$MYVIMRC`에 넣고 저장하고 테스트해보세요. (처음 저장 시 `:e %` 필요할 수도 있습니다.)

### A More Complicated Mapping

지금까지 간단한 키매핑을 만들어보았습니다.

이것만 가지고는 우리가 처음 목표로 삼았던 plugin 제작과는 거리가 멀다고 느껴질 수도 있습니다.

아주 조금, 복잡한 키매핑을 만들어보겠습니다.

우리가 "목표로" 하는 키매핑은 해당 커서에 있는 단어에 대괄호 `[]`로 감싸는 것입니다.

어떻게 하면 될까요? "일단" 키매핑을 바로 만들지 말고 어떻게 하면 해당 단어를 기계적인 방법으로 `[]`로 감쌀지 생각해봅니다.

일단 나 같은 경우엔

```vim
bi"<esc>ww...
```

으로 시도해보았습니다. 하지만 `ww`에서 다음 단어의 시작으로 가서 실패했습니다.

두 번째 시도에선 `bi"<esc>ea"`로 성공했습니다.

```vim
<leader>S[
```

으로 매핑을 한다고 하면

```vim
:nnoremap <leader>S[ bi"<esc>ea"
```

이렇게 하면 됩니다.

감이 조금 "왔으면" 합니다.

### Buffer-Local Options and Mappings

Buffer-local 기준으로 옵션과 키매핑을 지정할 수도 있습니다.

```vim
:nnoremap <buffer> - x
```

으로 `nnoremap` 지정하고, `:vs some.txt` 후

`some.txt` buffer에서 `-`로 지워보려고 하면 `x` 명령어로 작동하지 않을 것입니다.

Buffer마다 키매핑을 다르게 할 수 있다는 이야기입니다.

nerdtree가 설치되어 있다면 nerdtree를 열고 `:nnoremap <buffer>`를 타이핑해보면

nerdtree에서만 사용되는 키매핑을 볼 수 있습니다.

### Options & Leader Key

`set number`과 같은 일반 옵션도 buffer 기준으로 지정할 수 있습니다.

`setlocal`을 통해 지정합니다.

leader key도 마찬가지로

```vim
:let maplocalleader=","
:nnoremap <localleader> x
```
위처럼 local로 지정할 수 있습니다.

자세한 것은

```vim
:help setlocal
:help maplocalleader
```

참고하면 됩니다.

### Shadowing

```vim
:nnoremap <buffer> - x
:nnoremap - i
```

두 가지 매핑을 실행하고 `-`를 눌렀을 때 어떤 결과가 나올까요?

Vim은 buffer 명령어를 우선순위로 잡습니다.

일반적인 프로그래밍 방식이랑 일치하며 이치에 맞아보입니다.

## Auto Commands

앞서 vimrc 로드를 위해 잠깐 소개했던 auto commands를 정식으로 소개합니다.

```vim
:autocmd BufNewFile * :echom "hi newfile"
:autocmd BufNewFile *.txt :echom "hi textfile"
:e somefile
:e somefile.txt
```

위 명령을 실행하고 `:messages` 해보세요.

`autocmd`는 특정한 이벤트가 발생할 때 실행할 명령어를 등록할 수 있습니다.

이 단문일 경우엔 inline으로 명령을 삽입하면 됩니다. 만약 여러 문장이면

뒷장에서 소개할 함수를 이용하여

```vim
:call function()
```

함수를 호출할 수도 있습니다.

```vim
:autocmd BufNewFile * :write
     ^          ^ ^
     |          | |
     |          | 여기서부터 커맨드
     |          |
     |          대상이 되는 파일의 패턴
     |
     이벤트 종류
```

여기서 이벤트 종류와 파일의 패턴에 대해서 좀 더 알아보고 싶으면

```vim
:help event
:help autocmd-patterns 
```

을 통해 알아보세요.

Normal 명령어와 같이 써서 일련의 키 시퀀스도 전달 가능합니다.

```vim
:autocmd BufWritePre *.vimrc normal gg=G 
```

### Multiple Events

```vim
:autocmd BufWritePre *.virmc normal gg=G 
:autocmd BufRead *.virmc normal gg=G 
```

위 명령어는

```vim
:autocmd BufNewFile,BufRead *.html normal gg=G
```

이렇게 하나의 명령어로 합칠 수 있습니다.

### autocmd FileType

```vim
:autocmd FileType javascript nnoremap <buffer> _ I//<esc>
:autocmd FileType python     nnoremap <buffer> _ I#<esc> 
```

FileType에 따라 명령어를 지정할 수도 있습니다.

### Buffer-local autocommands

```vim
:au CursorHold <buffer>  echo 'hold'
:au BufNewFile *.txt au CursorHold <buffer>  echo 'hold txtfile'
:au BufNewFile *.js au CursorHold <buffer>  echo 'hold jsfile'
```

`autocmd` 또한 buffer 단위로 명령을 지정할 수 있습니다.

위 명령어 중 모르는 이벤트가 있을 것입니다. 지금까지 이 문서를 잘 따라왔다면 모르는 이벤트에 대해 어떻게 정보를 얻어야 하는지 알 것입니다.

즉시 실행해보세요.

```vim
:help autocmd-buflocal
```

`autocmd-buflocal`에 대해 더 알아보고 싶으면 위 명령어를 통해 더 확인해보세요.

## Auto Command Groups

위에 소개했던 `autocmd`는 사실 한 가지 문제가 있었습니다.

이를 알아보기 위해

```vim
:au BufWrite * :echom "writing buffer."
:w
:messages
```

해보세요. 예상대로 "writing buffer"를 볼 수 있을 것입니다.

여기서 멈추지 말고 한번 더

```vim
:au BufWrite * :echom "writing buffer."
```

를 실행하고

```vim
:w
```

해보세요. `messages` 창에는 앞에 기록됐던 로그를 포함하여, 로그가 3개가 찍혀 있습니다.

무슨 일이 일어난 걸까요?

Vim의 `au`는 명령어들이 중첩됩니다.

이를 해결하기 위해 `autocmd group`이라는 게 있습니다.

```vim
:augroup testgroup
  :au BufWrite * :echom "writing buffer1 in a group"
:augroup END
:augroup testgroup
  :au BufWrite * :echom "writing buffer2 in a group"
:augroup END
:w
```

위 명령어를 실행해보세요. 어떤지 살펴보세요. 기대했던 결과가 나왔나요?

`autocmd group`이 아까와 같은 불상사를 해결할 수 있다고 했는데, 사기당한 기분이 들 것입니다.

그렇습니다, `augroup` 조차 명령어가 중첩됩니다.

```vim
:augroup testgroup
  :au!
  :au BufWrite * :echom "writing buffer in a group"
:augroup END
:w
```

위와 같이 입력을 다시 해보고 로그를 살펴보세요.

`au!`는 선택된 그룹의 `autocmd` 명령어를 초기화시켜줍니다.

자세한 사항은

```vim
:help autocmd-remove
```

자기의 vimrc에 다음과 같이 `augroup`을 등록시켜보세요.

```vim
augroup testgroup
  au!
  au BufWrite * :echom "writing buffer in a group"
augroup END 
```

그리고 테스트해보세요. 기대한 결과가 나오는지 확인하세요.

## Status Lines

Vim에서 제공하는 기능 중에 현재 상태를 보여주는 곳이 있습니다. 그곳이 status line입니다.

```vim
:set statusline=filename:%f\ filetype:%y\ %l/%L."asdasd"
```

길게 설명할 것이 없이 위 명령어를 적용시켜 보세요.

마치 C 언어의 `printf`를 보는 듯합니다.

### General Format

```text
The option consists of printf style '%' items interspersed with
normal text.  Each status line item is of the form:
%-0{minwid}.{maxwid}{item}
```

`:help statusline`을 통해 일반적인 표현법을 보면 위처럼 설명이 나와 있습니다.

간단히 확인하기 위해서

```vim
:set statusline=%l/%5.7L
```
해보세요.

무한한 가능성을 statusline에 부여하기 위해

```vim
:let g:ksoo="happy"
:set statusline=%{g:ksoo} 
```

해서 어떤 게 나오는지 살펴보세요.

## Variables

지금까지 단일 명령어에 대한 것만 우리는 다룰 수 있었습니다.

이번 장부터는 정말 프로그래밍적인 관점에서 Vim Script를 다뤄보려 합니다.

간단히 변수 할당부터 시작해보세요.

```vim
:let t = "test"
:echo t
```

"test"라는 글자가 찍히는 것을 볼 수 있습니다. `t`라는 변수에 문자열 "test"를 넣은 것입니다.

test 대신 숫자를 쓸 수도 있습니다.

```vim
:let t = 1004
:echo t
```

즉, Vim Script 변수엔 타입이 없습니다. 그냥 대입하면 됩니다.

### Option as Variables

Vim option들을 변수로써 다룰 수도 있습니다.

예를 들어 `sw`(shiftwidth) 값을 echo로 출력해보세요.

```vim
:echo &sw
```

그렇습니다. 옵션

에 대해서 접근하려면 `&`를 붙여서 접근합니다. 이 `&` 표기는 C++의 reference와는 전혀 성격도 다르고 관련이 없습니다.

`&sw`는 읽기 전용의 변수가 아닙니다. 그래서

```vim
let &sw = &sw * 2
```

이런 식으로 두 배씩 올리는 명령도 등록 가능합니다.

그러면 `set`과 `let` 둘 다 option을 변경시킬 수 있는데 무슨 차이가 있을까요?

`let`은 프로그래밍적으로 제어할 수 있는 여지를 제공해주기 때문에 좀 더 프로그래머 관점에서 유연하게 옵션 값을 다룰 수 있습니다.

### Local Options

전장에서 `:setlocal`이라는 명령어가 기억나나요?

`setlocal`을 `let`로서 제어하는 변수가 있을 것입니다.

간단하게 앞에 `l:`만 붙여주면 됩니다.

예를 들어

```vim
:let &l:sw=8
```

이것은 `:setlocal sw=8`과 동일한 효과를 냅니다. 앞서 설명했지만 `let`을 이용한 방식은 프로그래밍적으로 유연성을 제공해줍니다.

### Registers as Variables

당장 `:reg`를 쳐보세요.

우리가 Vim을 쓰면서 등록해뒀던 registers가 보일 것입니다.

이 registers를 변수로서 가져오는 방법이 있습니다.

prefix `@`를 붙이면 됩니다.

아무 문장이나 `yy`를 통해 yank 한 후에

```vim
:echo @0 
```

을 타이핑해보세요.

이를 이용해서 지워진 버퍼를 이용해 레지스터를 이용하는 방법은 그다지 추천되지 않습니다.

왜냐하면 사용자가 레지스터에 중요한 내용을 가지고 있을 가능성이 있기 때문입니다.

## Variable Scoping

전장에서 `&l:something`이 기억나나요? 다양한 프로그래밍 언어에서 변수의 스코프를 지원합니다.

C 언어를 예를 들면

```c
int a = 3;
{
    int a = 5;
    print a 
}
print a
```

블록 `{}`을 기준으로 스코프가 결정됩니다. Vim은 텍스트 에디터답게 특이한 방식으로 변수의 스코프를 결정합니다.

간단하게 버퍼 스코프를 테스트해보세요.

일단 아무 문서나 열고

```vim
:let b:vim = "script"
:echo b:vim
```

써보고 다른 버퍼를 열어서 또 다시

```vim
:echo b:vim
```

을 써보세요. 두 번째 `:echo` 명령어에서 변수를 찾을 수 없다고 떴을 것입니다.

이러한 스코프는 `b:`를 포함해서 8개의 스코프가 있습니다. 이를 확인하기 위해서

```vim
:help internal-variables 
```

을 통해 한번 어떤 스코프가 있는지 살펴보세요.

이번에는 친절하게 help 문서를 직접 가져왔습니다.

```text
|buffer-variable|    b:	  Local to the current buffer.
|window-variable|    w:	  Local to the current window.
|tabpage-variable|   t:	  Local to the current tab page.
|global-variable|    g:	  Global.
|local-variable|     l:	  Local to a function.
|script-variable|    s:	  Local to a |:source|'ed Vim script.
|function-argument|  a:	  Function argument (only inside a function).
|vim-variable|       v:	  Global, predefined by Vim.
```

언제나 help 문서를 보는 버릇을 들이세요.

## Control Statements

이 장부터는 `test.vim`과 같은 Vim을 열어놓고 테스트 하는게 편합니다.

### If

먼저 if 문을 확인해보세요.

`test.vim`
```vim
if 1
  echom "one"
endif 

if "string"
  echom "string != false?"
endif
```

기대했던 결과가 나왔나요? 아마 아닐 것입니다.

두 번째 `echom`이 나오지 않았습니다. 무슨 일일까요?

이 현상을 좀 더 고찰하기 위해서 다음 명령을 수행해보세요.

```vim
if "11"
  echom "wow!"
endif
```

`wow!`가 보입니다. 감이 올 것입니다. 좀 더 테스트 해보세요.

```vim
echom "string" + 5
echom "10string" + 5
echom "string10" + 10 
```

결과는

```text
5
15
10 
```

아하! Vim은 string이 정수로 평가되는 장소에 있으면 정수로 바뀌려는 성질을 가지고 있군요.

그 변환 규칙은 문자열의 앞에 숫자가 없으면 0이 됩니다!

이제 다시 한번 위에 처음 제시한 `test.vim`을 보면 결과가 빠르게 이해될 것입니다.

### Else and Elseif

if가 있으면 당연히 else가 있습니다.

`test.vim`
```vim
let k=5
if k==1
  echo "k=1"
elseif k>=6
  echo "k>=6"
else
  echo "k=?"
endif 
```

위 예문으로 확인하세요.

### Condition

위에서 다룬 비교 명령만으로는 정말로 부족합니다.

문자열에 대해서 비교를 해보세요.

```vim
set noignorecase
if "hello" == "HELLO"
  echom "case INsensitive"
elseif "foo" == "foo"
  echom "case sensitive"
endif

set ignorecase
if "hello" == "HELLO"
  echom "case INsensitive"
elseif "foo" == "foo"
  echom "case sensitive"
endif
```

실행하고 결과를 보세요.

다른 언어들처럼 `==`는 무조건 insensitive 혹은 sensitive 둘 중에 하나가 동작하는 게 아니라, `set ignorecase` 유무에 따라 다른 동작을 하다니 어처구니가 없습니다.

이처럼 문자열 비교에 있어서 `==`를 쓰게 되면 `set ignorecase` 유무에 따라 다른 동작을 하게 됩니다. 이는 스크립트 제작에 있어서 큰 걸림돌로 다가옵니다.

유저의 세팅을 믿으면 안 됩니다.

그러면 어떻게 하나요?

비교 연산자 Vim은 `==?`, `==#`를 제공합니다.

```vim
if "hello" ==? "HELLO"
  echom "case INsensitive"
elseif "foo" ==? "foo"
  echom "case sensitive"
endif

if "hello" ==# "HELLO"
  echom "case INsensitive"
elseif "foo" ==# "foo"
  echom "case sensitive"
endif
```

`==?` : INsensitive   
`==#` : sensitive

### List Type

다음 장에서 반복문에 대해 이야기할 텐데, 그 전에 list 자료형을 먼저 소개해야겠습니다.

```vim
echo [1,2,3]
echo [1, [2,3]]
echo [1,[2,3]][1]
echo [1,[2,3]][-1] 
echo [1,2,3,4][0:2]
```

를 타이핑해보세요.

Vim의 list indexing은 파이썬의 list와 흡사합니다. 하지만 `[0:2]`에서 범위는 실제로 `[0,2]`였습니다. (파이썬은 `[0,1]` 범위)

indexing에서 음수가 나오면 -1은 마지막 요소를 가리킵니다.

하나만 더 해보세요.

```vim
:echo [1,2,3][:1]
:echo [1,2,3][1:]
```

여전히 파이썬의 indexing과 비슷합니다.

또한 Vim은 string을 indexing으로 접근하는 것을 허용합니다.

```vim
:echo "hello"[1:2] 
```

실행해보면 `el`이 나옵니다.

### Concatenation

```vim
:echo "hello" + "world"
:echo "hello" . "world"
:echo [1,2] + [3]
:echo [100, 101, [1,2] + [3]]
```

문자열의 결합은 `.`으로 하게 되고, 문자열의 결합을 `+`로 하면 앞서 살펴봤듯 숫자로 평가되면서 0이 나옵니다.

list는 `+`으로 결합하면 합쳐지게 됩니다. 이 표현은 nested된 표현식에도 쓸 수 있고 매우 유연하게 쓸 수 있습니다.

### Built-in Functions For List

```vim
:let var = ['a']
:call add(var, 'b')
:echo var
:echo get(var, 0, "defaultvalue")
:echo get(var, 33, "defaultvalue2") 
:echo index(var, 'b')
:echo index(var, 'c') 
```

echo의 결과
```text
[a, b]
a
defaultvalue2
1
-1
```

부연 설명은 하지 않겠습니다. 더 궁금한 사항이 있으면 `:help`를 활용하세요.

### For

Vim의 for 문은 기본적으로 list를 순회하는데 목적이 있습니다.

간단히 예문을 적어보자면

```vim
for i in [1,2,3,4]
  echom i
endfor

for [i, j] in [[1,2], [3,4]]
  echom i . j
  echom "-------"
endfor

for [i, j, k] in [[1,2,3], [4,5, 6]]
  echom i . j . k
  echom "-------"
endfor
```

결과

```text
1
2
3
4
-------
12
-------
34
....
```

형태가 됩니다. 마지막 `[i, j, k]`는 어떻게 될지 직접 실행해보세요.

그리고

```vim
let var = [[:apple_1000_banana_2000_pineapple_3000]]
```

이러한 `listlist`가 있을 때

```text
apple price : 1000  
banana price : 2000  
pineapple price : 3000  
```

결과가 나오기 위해서 어떻게 코딩을 해야 할지 풀어보세요. 농담이 아닙니다. 진짜 해봐야 합니다.

그래야 기억에 남습니다.

그리고 Vim-for는 c-style의 for 문을 제공하지 않습니다.

예를 들면 `for(i=0; i<=10; i++)` 이러한 세 개의 섹션으로 이루어진 for 문을 지원하지 않습니다.

이는 while로 처리해야 합니다.

### While

while은 아주 오래된 고전적인 루프문입니다.

이전에 c-style의 for 문이 없다고 했지만 while은 이를 100% 대체할 수 있습니다.

```text
for(A; B; C) 
D 
```

위와 같은 문장이 있을 때 while은

```text
A
while B
D
C 
endwhile
```

으로 1:1 대응되는 문법이기 때문입니다.

간단히 예문을 살펴보세요.

```vim
let c = 1

while c <= 10
  echo c
  let c += 1
endwhile 
```

직접 실행해보고 결과를 살펴보세요.

그리고

```text
*
**
***
****
*****
```

이러한 별이 찍히도록 while 문을 사용해서 코딩해보세요.
(hint : Concatenation, while, let)

Vim Script는 다른 언어랑 다르게 조금 문법이 조잡한 편이라서 이런 거 직접 해보는 게 도움이 됩니다.

지금부터는 내가 내는 문제들을 직접 코딩하면서 익혀야 합니다. 손이 기억을 해야 나중에 필요한 것들을 무리 없이 만들 수 있습니다.

## Dictionary

Dictionary 형태의 자료형에 대해서 소개합니다.

이 자료형은 매우 매우 중요합니다. 기본 string, number 타입은 당연히 알아야 하고 앞서 소개했던 list도 많이 쓰지만, Dictionary 자료형태도 무지무지하게 많이 쓰입니다.

다른 프로그래밍을 접해봤다면 이 자료형의 중요성과 잠재력에 대해서는 알 것이라 생각합니다.

말이 길어졌는데, 내 문서의 특징은 "말은 짧게, 코드는 길게"라는 철학이 있기 때문에 바로 예제 코드를 살펴보겠습니다.

```vim
let c = {"apple":1000, "banana":2000, "pineapple":3000, "watermelon":10000}

echo c

echo c["apple"]

echo c["banana"]
echo c.watermelon

let index = "banana"
echo c[index]

" error
echo c.index 

let c["banana"] = 10
echo c["banana"]
```

`{key1:value1, key2:value2, ... }` 형태입니다.

보다시피 `{}`으로 표현하고 JavaScript의 그것과 매우 흡사합니다.

자료의 접근은 `[]` 또는 `.`으로 합니다. 하지만 `.` 간단하게 접근할 수 있지만 변수를 index로 쓰는 건 안됩니다. 쓰임이 조금 제한됩니다.

자료의 변경 또한 `let`으로 자유롭게 가능합니다.

하지만 한 가지 제한이 있는데, key는 무조건 문자열(문자)만 들어올 수 있습니다.

### Remove

```vim
let c = {"apple":1000, "banana":2000, "pineapple":3000, "watermelon":10000} 
let t = remove(c, "apple") 
echo t
echo c 

let c = {"apple":1000, "banana":2000, "pineapple":3000, "watermelon":10000}
unlet c["apple"]
echo c 
```

위 코드를 실행해보세요. `remove`는 삭제하면서 해당하는 key의 value를 리턴합니다.

반면 `unlet`은 그렇지 않습니다. `remove`를 쓸 건지 `unlet`을 쓸 건지는 순전히 개인적인 취향 차이라고 볼 수 있습니다.

### Value-Check

이때 없는 값을 조회해보세요. 예를 들면 `c["dsjflajdfl"]` 이러한 값을 echo로 출력해보세요.

error가 날 것입니다. Vim은 매우 유연하여 스크립트에 일부 에러가 나더라도 밑의 문장을 계속하여 실행합니다. 하지만 이러한 메시지가 뜬다면 사용자도 신뢰를 가지지 못할 것이고, 더러운 메시지가 Vim을 덮을 것입니다.

그래서 해당하는 key가 유효한지 확인하는 작업이 필요하게 됩니다.

크게 세 가지 스타일이 있습니다.

```vim
let c = {"apple":1000, "banana":2000, "pineapple":3000, "watermelon":10000}
try
  let t = remove(c, "djfldsjlk")
  echo t
catch
  echo "error"
endtry

""""""""""""""""""""""""""""""""""""""""""" 

let c = {"apple":1000, "banana":2000, "pineapple":3000, "watermelon":10000}

if has_key(c, "asdasld")
  echo "has"
else
  echo "has not"
endif

""""""""""""""""""""""""""""""""""""""""""" 

let value = get(c, "asdjasdjl", "defaultvalue")
if value ==# "defaultvalue"
  ...
else
  ...
endif
```

try-catch 문을 이용하여 예외처리를 하거나, `has_key`로 검사하거나, `get`을 이용하여 defaultvalue를 비교하면 됩니다.

마지막으로 dictionary를 loop 시키는 방법에 대해서 알아봅니다.

```vim
let c = {"apple":1000, "banana":2000, "pineapple":3000, "watermelon":10000} 
echo items(c)
for [i, j] in items(c)
  echo i . " : " . j
endfor
```

먼저 `items(c)`의 출력 값을 보세요. 앞서 설명했던 dictionary를 `listlist`로 바꿔줍니다.

그리고 우리는 `listlists`를 loop를 도는 방법을 배웠기 때문에 이를 활용할 수 있습니다.

더 알고 싶으면 `:help items`를 참고하세요.

## Functions

대부분의 프로그래밍 언어에서처럼 Vim Script도 함수를 지원합니다.

어떻게 하는지 코드로 살펴보세요.

### Basic

```vim
function Foo()
  echom "hello"
endfunction

call Foo()
```

실행해보세요. 여기서 주목할 점은 함수 이름의 시작이 대문자인 것을 주목해야 합니다. 소문자로 써보고 결과를 살펴보세요.

그리고 여기서 확인한 에러 넘버 Exxx를 기억해서 `:help Exxx`를 쳐보세요.

관련 내용을 확인하고 숙지하세요.

```vim
function s:foo()
  echom "hello"
endfunction 
call s:foo()
```

저번 장에서 배운 scope가 기억나나요?

변수뿐만 아니라 function도 scope를 지정할 수 있습니다.

반복하자면

```vim
:help internal-variables 
```

을 이용해서 변수를 확인해보세요.

### Redefinition

실행했던 코드에서 다시 한번 `:so %`를 해서 실행해보세요.

이미 함수가 존재한다고 에러를 뿜습니다. 해결은 간단합니다.

```vim
function! s:foo()
  echom "hello"
endfunction 
call s:foo()
```

앞에 `!`를 붙이면 이미 함수가 정의되어 있더라도 에러를 무시하게 됩니다.

### Parameters

다른 언어에서도 마찬가지이겠지만 Vim 함수에는 파라미터가 들어갈 수 있습니다.

```vim
function! s:power(name)
  echom "hello : " . a:name
endfunction

call s:power("kangssu")
```

Vim 함수에서는 파라미터를 참조하기 위해서는 `a:`라는 스코프 지정자를 사용합니다.

만약 `a:`를 붙이지 않는다면, Vim Script는 `name`을 찾을 수 없다고 에러를 뿜을 것입니다.

### ... Parameter

```vim
function! s:power(...)
  echom a:0
  echom a:1
  echo a:000

  let l:i = 0
  while l:i < len(a:000)
    echo a:000[l:i]
    let l:i += 1
  endwhile
endfunction

call s:power("h", "i", "

man")
```

위 코드는 `...`로 가변 인자를 받았을 때, 어떻게 접근하는지 알아볼 수 있는 코드입니다.

차례대로 `a:0`, `a:1`, `a:2`, ... 식으로 접근 가능하고, 전체 리스트를 뽑기 위해서는

특별한 인덱스인 `a:000`을 이용해서 접근합니다.

```vim
echo a:000
```

의 결과를 살펴보면

```text
["h", "i", "man"]
```

으로 나옵니다.

이 배열은 `len`으로 크기를 얻어올 수 있어서 while 문으로 순회 가능합니다.

`l:`에 대해서 잘 모르겠다면 앞장을 복습해보세요.

C 언어의 `printf`처럼 첫 인자만 문자열로 받고 나머지만 가변 인자로 받는 것이 가능합니다.

함수 선언부를

```vim
function! s:power(fixed, ...)
```

으로 바꾸고 다시 실행해보세요.

### Rvalue-Parameters

들어온 arguments는 read-only입니다. 이를 테스트해보세요.

```vim
function! s:power(foo)
  let a:foo = "error"
  echo a:foo
endfunction

call s:power("man") 
```

다음과 같은 에러를 뱉을 겁니다. `can not change read-only variable a:foo`

이로써 Vim의 function에 대해서 조금 맛을 봤습니다. 아직은 살짝 맛만 본 단계지만 활용하는 건 너의 몫입니다.

## Strings

Vim은 기본적으로 텍스트 에디터입니다. 문자열을 다루는 소프트웨어의 스크립트에서 가장 중요한 것은 문자열을 처리하는 방법입니다.

그래서 이 장은 매우 중요합니다.

마지막 부분에 예제 문제를 몇 개 던져줄 텐데, 꼭 코딩을 해보고 넘어가도록 하세요.

### Basic

```vim
:echom "100 apple" + "200 man"
```

결과는 `300`입니다.

```vim
:echom "apple 100" + "man 200"
```

결과는 `0`입니다.

기본적으로 `+` 연산은 오직 숫자에게만 적용됩니다.

```vim
:echom "apple 100" . "man 200"
```

결과는 `apple 100man 200`입니다.

### Special Characters

특수한 문자 `"`나 `\`를 표시하고 싶을 때는 escape 문자 `\`를 씁니다.

```vim
:echom "my name is \"apple\"."
```

실행해보세요.

그리고

```vim
:echom 'my name is "apple".'
```

실행해보세요.

`"`는 `<\n, ">`와 같은 특수문자를 표현하기 위해 escape 문자가 필요합니다.

하지만 `'`는 escape가 필요하지 않습니다.

조금 더 테스트하기 위해

```vim
:echom 'a''b'
:echom 'a''''b'
```

두 개의 명령어를 실행해보세요.

그렇습니다. `''`는 `'`로 나옵니다.

### String Functions

```vim
:echo split("sang moo hospital")
:echo split("sang|moo|hospital", "|")
```

결과는 둘 다,
`['sang', 'moo', 'hospital']`

그리고 합치는 것도 가능합니다.

```vim
:echo join(split("sang moo hospital"))
:echo join(split("sang moo hospital"), "!!")
```

쳐보고 결과를 보세요.

join의 인자로 list를 받습니다. list를 두 번째 인자를 끼워 합친 결과가 리턴됩니다.

## Execute

Excute~Excute Normal!까지 굉장히 중요한 장입니다.

사실 목차를 이것부터 해야 한다고도 생각할 정도로 뭔가 만들 때 비중이 높은 챕터고, 개념을 확실히 짚고 넘어가야 합니다.

execute는 문자열로 된 식을 평가하는 함수입니다.

```vim
execute "echo 'hello'"
```

라고 쳐보세요. 예상대로 `hello`가 뜰 것입니다. 그렇다면 `:echo 'hello'`랑 뭐가 다르냐고?

```vim
:echo getpid()
```

라고 쳐보세요. 현재 Vim의 process id가 뜹니다.

만약 Vim에서 현재 `<process id>.txt`의 파일을 열고 싶다면 어떻게 해야 할까요?

먼저 시도해보세요. `:e getpid().txt`

`4443.txt` 이런 식의 파일이 열리길 기대했지만 Vim은 문자 그대로 `getpid().txt`가 열립니다.

이럴 때 `execute` 내장 함수가 요긴하게 쓰입니다.

```vim
:execute "e " . getpid() . ".txt"
```

성공합니다. `4443.txt`의 파일이 열립니다.

## Normal

```vim
:norm[al][!] {commands}	
```

이때 commands는 normal mode에서 사용되는 키보드 스트로크의 집합입니다.

예를 들면

`apple banana pineapple`

이라는 단어가 있을 때

`banana` 위에서

```vim
:normal diw
```
하게 되면 banana에서 `diw` 한 것과 같습니다.

`[!]`는 현재 매핑된 key와 관계없이 Vim 고유의 매핑을 이용하고 싶을 때 사용합니다.

```vim
:nnoremap w dd
```

으로 매핑한 상태에서

```vim
:normal w
```

으로 해보고

```vim
:normal! w
```

으로 실행해보세요.

## Execute Normal!

`getpid`는 현재 프로세스의 아이디를 가져옵니다.

전장에서 배웠던 `execute`와 `normal`과의 절묘한 조합으로

커서 위의 단어를 현재 프로세스 아이디로 교체할 수 있습니다.

```vim
execute "normal! ciw".getpid()."\<ESC>"
```

위 코드는

```vim
execute "normal! ciw30334\<ESC>"
```

이렇게 변환이 됩니다. normal로만 해결할 수 없고, execute만으로 해결할 수 없는 문제를 `execute normal!`로 해결하는 모습입니다.

## Functional Programming

Functional Programming이 이어집니다.