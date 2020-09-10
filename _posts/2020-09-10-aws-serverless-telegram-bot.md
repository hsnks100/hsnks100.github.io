---
toc: true 
--- 


# Serverless Telegram Bot 만들기

최근 서버 설계의 한 축을 담당하고 있는 핫한 serverless 기반으로 텔레그램 봇을 만들어보자.

# Serverless 란?

서버리스하면 __ 서버가 없다 __ 는 것인가? 생각을 할 수 있는데, 서버는 있다. 전통적인 서버-클라이언트 구조에서는 서버는 __ 하나의 물리적 장비 __ 를 쓰거나 대여하여 24시간 돌아가는 데몬을 기반으로 서버-클라이언트 구조를 구현했다. 서버리스는 이러한 전통적인 구조를 완전 깼다. 하나의 서비스를 제공하기 위해 굳이 하나의 서버를 잡고 데몬이 돌아가는 것이 아니고, __ 함수 단위 __ 로 잘게 나눠서 임의의 서버에서 이 작업을 수행하는 것을 뜻한다. 주로 유명한 서버리스 프레임워크는 firebase, aws.lambda 가 있다. 여러가지 많지만 저는 꼬꼬마라 다 알지는 못함.

# 써야 하는 aws 서비스들

aws.lambda, aws.cloudwatch, aws.dynamodb, aws.apigateway

# 비용은?

# 개발 환경 꾸리기
## nodejs & npm 설치
https://nodejs.org/ko/download/package-manager/
## AWS Cli 설치
https://aws.amazon.com/ko/cli/

## Serverless framework 설치하기

```
$ sudo npm install -g serverless
```

## aws IAM 사용자 추가

1. AWS 메뉴 중, Identity and Access Management(IAM) 들어가서 __ 사용자 추가 __ 를 한다.
2. AWS 액세스 유형 선택
액세스 유형: 프로그래밍 방식 액세스
3. 엑세스 그룹
admin: AdministratorAccess

```
$ aws configure
AWS Access Key ID[]: _______
AWS Secret Access Key ID[]: _________
```

# 프로젝트 생성

```
$ mkdir telegram-echo
$ cd telegram-echo
$ serverless create --template hello-world
Serverless: Generating boilerplate...
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.79.0
 -------'

Serverless: Successfully generated boilerplate for template: "hello-world"
Serverless: NOTE: Please update the "service" property in serverless.yml with your service name
╭─dire@dire-81w4 ~/workspace/telegram-echo
╰─$ ls
handler.js  serverless.yml
```

handler.js, serverless.yml 이 생성된 모습이 보인다.

```
╭─dire@dire-81w4 ~/workspace/telegram-echo
╰─$ cat handler.js
'use strict';

module.exports.helloWorld = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);
};

```
╭─dire@dire-81w4 ~/workspace/telegram-echo
╰─$ cat serverless.yml
# Welcome to serverless. Read the docs
# https://serverless.com/framework/docs/

# Serverless.yml is the configuration the CLI
# uses to deploy your code to your provider of choice

# The `service` block is the name of the service
service: telegram-echo

# The `provider` block defines where your service will be deployed
provider:
  name: aws
  runtime: nodejs12.x

# The `functions` block defines what code to deploy
functions:
  helloWorld:
    handler: handler.helloWorld
    # The `events` block defines how to trigger the handler.helloWorld code
    events:
      - http:
          path: hello-world
          method: get
          cors: true

```

별거 없고, helloWorld 를 핸들러로 하는 프로젝트 하나가 세팅된 모습이다.

provider: 항목에 region 을 넣을 수 있는데, 기본 region 은 east 어딘가로 설정이 되는데, 우리는 한국인이니 다음 줄을 추가하자. __ region: ap-northeast-2 __

```
provider:
  name: aws
  runtime: nodejs12.x
  region: ap-northeast-2
```
이런 모양이 될거다.

이제 드디어

```
╭─dire@dire-81w4 ~/workspace/telegram-echo
╰─$ serverless deploy
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service telegram-echo.zip file to S3 (706 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.................................
Serverless: Stack update finished...
Service Information
service: telegram-echo
stage: dev
region: ap-northeast-2
stack: telegram-echo-dev
resources: 12
api keys:
  None
endpoints:
  GET - https://w9hebyk69i.execute-api.ap-northeast-2.amazonaws.com/dev/hello-world
functions:
  helloWorld: telegram-echo-dev-helloWorld
layers:
  None

***********************************************************************
Serverless: Announcing an enhanced experience for running Express.js apps: https://github.com/serverless-components/express.
***********************************************************************

```

우리의 aws console 들어가서 뭐가 어떻게 됐나 확인해볼까?

![image](https://user-images.githubusercontent.com/3623889/92696022-465db380-f384-11ea-95be-044e4fc23d6e.png)

## 아마존 내 권한 설정

## npm serverless 설치

# Telegram Bot

#
