# vim-surround 분석

vim-surround 플러그인이 어떻게 구현되었는지 궁금해졌습니다.

코드를 보기 전에 감싸기를 어떻게 구현할지 생각해봤습니다.

# Normal Mode1

```vim
function! s:Sur() 
    execute "normal! ciw< \<C-R>\" >" 
endfunction

vnoremap <leader>G :<C-U>call <SID>Sur()<CR>
```

위 코드는 현재 커서가 있는 단어를 `<>`로 감싸주는 코드입니다.

간단하게 구현되었지만, 한 가지 문제가 있습니다. 사용자 레지스터 `"`를 사용하고 있습니다.

어떤 사용자는 이 작업을 하기 전에 중요한 데이터가 `"` 레지스터에 있을 수도 있으므로 플러그인이 이를 건드리면 안 됩니다.

그래서 다음과 같이

```vim
function! s:Sur() 
    let l:temp = getreg('"')
    execute "normal! ciw< \<C-R>\" >" 
    call setreg('"', l:temp)
endfunction
``` 

레지스터를 `getreg`, `setreg`로 복구시켜줍니다.

# Visual Mode1
```vim
function! s:Sur() 
    let l:temp = getreg('"')
    execute "normal! gvs< \<C-R>\" >" 
    call setreg('"', l:temp)
endfunction

vnoremap <leader>G :<C-U>call <SID>Sur()<CR>
```

Visual mode인 경우에는 위와 같이 구현할 수 있습니다.

`gv`에 대해 이해하고 싶다면 Visual mode로 셀렉트 해보고 `gv`를 눌러보세요.

# Normal Mode2
위 구현 방법은 하나같이 레지스터를 썼다가 복구시켜줍니다.

사실은 같은 목적이라면 문서를 덜 조작하는 방향으로 플러그인을 만드는 게 맞습니다.

그래서

```vim
function! s:NSur() 
    execute "normal! bi<\<ESC>ea>"
endfunction
```

위 방법을 쓰면 레지스터를 건드리지 않고 목적을 달성할 수 있게 됩니다.

# Visual Mode2

알아둬야 할 내용:

마지막 선택 영역을 복구하는 명령어는 `gv`

선택 영역에서 앞뒤로 이동하는 명령어는 `o`

위치를 마크하는 것은 `m[아무키]`

마크한 위치로 가는 것은 `` `[아무키]``

```vim
function! s:Sur()
  exe "normal gvmboma\<Esc>"
  normal `a
  let l:lineA = line(".")
  let l:columnA = col(".")
  let l:apos = l:lineA * 100000 + l:columnA
  normal `b
  let l:lineB = line(".")
  let l:columnB = col(".")
  let l:bpos = l:lineB * 100000 + l:columnB
  " 마크 교환
  if l:apos > l:bpos
    normal mc
    normal `amb
    normal `cma
  endif
  exe "normal `ba>\<Esc>`ai<\<Esc>"
endfunction

vnoremap <leader>h :<C-U>call <SID>Sur()<CR>
```

현재 위치를 반환하는 `line`과 `col` 내장 함수를 통해 구현할 수는 있지만, 모양이 좋지 않습니다.

게다가 사용자 마크를 건드리고 있습니다.

# Visual Mode3

Vim에는 마지막 선택된 영역의 시작과 끝으로 갈 수 있는 명령어가 존재합니다.

`` `<`` 과 `` `> ``인데 이를 이용하여 위 함수를 좀 더 간단히 하면

```vim
function! s:Sur()
  exe "normal `>a>\<ESC>`<i<"
endfunction
```

# vim-surround의 방법

```vim
function! s:opfunc(type,...) 
  let char = s:inputreplacement()
  if char == ""
    return s:beep()
  endif
  let reg = '"'
  let sel_save = &selection
  let &selection = "inclusive"
  let cb_save  = &clipboard
  set clipboard-=unnamed clipboard-=unnamedplus
  let reg_save = getreg(reg)
  let reg_type = getregtype(reg)
  let type = a:type
  if a:type == "char"
    silent exe 'norm! v`[o`]"'.reg.'y'
    let type = 'v'
  elseif a:type == "line"
    silent exe 'norm! `[V`]"'.reg.'y'
    let type = 'V'
  elseif a:type ==# "v" || a:type ==# "V" || a:type ==# "\<C-V>"
    let &selection = sel_save
    let ve = &virtualedit
    if !(a:0 && a:1)
      set virtualedit=
    endif
    silent exe 'norm! gv"'.reg.'y'
    let &virtualedit = ve
  elseif a:type =~ '^\d\+$'
    let type = 'v'
    silent exe 'norm! ^v'.a:type.'$h"'.reg.'y'
    if mode() ==# 'v'
      norm! v
      return s:beep()
    endif
  else
    let &selection = sel_save
    let &clipboard = cb_save
    return s:beep()
  endif
  let keeper = getreg(reg)
  if type ==# "v" && a:type !=# "v"
    let append = matchstr(keeper,'\_s\@<!\s*$')
    let keeper = substitute(keeper,'\_s\@<!\s*$','','')
  endif
  call setreg(reg,keeper,type)
  call s:wrapreg(reg,char,"",a:0 && a:1)
  if type ==# "v" && a:type !=# "v" && append != ""
    call setreg(reg,append,"ac")
  endif
  silent exe 'norm! gv'.(reg == '"' ? '' : '"' . reg).'p`['
  if type ==# 'V' || (getreg(reg) =~ '\n' && type ==# 'v')
    call s:reindent()
  endif
  call setreg(reg,reg_save,reg_type)
  let &selection = sel_save
  let &clipboard = cb_save
  if a:type =~ '^\d\+$'
    silent! call repeat#set("\<Plug>Y".(a:0 && a:1 ? "S" : "s")."surround".char.s:input,a:type)
  else
    silent! call repeat#set("\<Plug>SurroundRepeat".char.s:input)
  endif
endfunction
```

상당히 긴데 여기서 사용자 레지스터를 복구시켜주는 것과 예외 처리를 제외하고 간단히 하면

```vim
function! s:opfunc(type,...) 
  let char = s:inputreplacement()
  let reg = '"'
  let type = a:type

  " gv""y
  silent exe 'norm! gv"'.reg.'y' 

  let keeper = getreg(reg)

  call s:wrapreg(reg,char,"",a:0 && a:1)
  " gv""p`[
  silent exe 'norm! gv'.(reg == '"' ? '' : '"' . reg).'p`['
endfunction
```

시나리오상 어떤 `abc`라는 문자열을 `]`로 감싼다고 하자.

`abc`에서 `viw`를 통해 문자열을 선택하고

`S]`를 누르면

`s:inputreplacement()`는 `]`를 반환합니다.

`let reg = '"'`에서 임시로 쓸 레지스터를 지정해줍니다. 그리고 아래 줄에서 `gv""y`를 함으로써 `abc`가 `"` 레지스터에 들어갑니다.

추후 서술할 `s:wrapreg`를 통해 `"` 레지스터 내용이 `char(']')`로 감싸진 문자열이 `reg`에 담기게 됩니다.

그 내용을 `gv""p`를 통해 surround를 구현하고 있습니다. (` `[ `는 마지막으로 붙여넣기 한 내용의 처음 부분으로 가기.)

# s:wrapreg에 대해서

```vim
function! s:wrapreg(reg,char,removed,special)
  let orig = getreg(a:reg)
  let type = substitute(getregtype(a:reg),'\d\+$','','')
  let new = s:wrap(orig,a:char,type,a:removed,a:special)
  call setreg(a:reg,new,type)
endfunction
```

`s:wrapreg`의 실체는 `s:wrap`에 있습니다. `s:wrap`은

```vim
function! s:wrap(string,char,type,removed,special)
```

`string`을 `char`로 감싸고 그 결과를 반환해주는 함수입니다.

이 안을 들여다보면 `char`에 따라 wrapping 작업을 유연하게 처리한 모습을 볼 수 있습니다.

이 부분은 상당히 길어 설명하기가 힘드므로 직접 열어서 구경하기 바랍니다.

# 요약

지금까지 surround를 어떻게 Vim script로 구현할 수 있는지 실제로 해봤고, 유명 플러그인 vim-surround에서 어떻게 하는지 본 결과 우리의 방법과 크게 다르지 않음을 알 수 있었습니다.