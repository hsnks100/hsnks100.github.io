## 로컬 실행 (Mac M1/M2/M3)

아래 명령만 순서대로 실행하세요.

```bash
# 1) 필요한 도구 설치 (Homebrew가 있어야 합니다)
brew install rbenv ruby-build

# 2) 셸에 rbenv 초기화 추가 후 반영
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
source ~/.zshrc

# 3) Ruby 설치 및 프로젝트에 적용
cd hsnks100.github.io
rbenv install 3.3.6
rbenv local 3.3.6

# 4) 의존성 설치
gem install bundler
bundle install

# 5) 로컬 서버 실행 (라이브 리로드 포함)
bundle exec jekyll serve --livereload
```

브라우저에서 `http://127.0.0.1:4000` 접속.
