---
toc: true
tags: [aws, serverless, telegram, bot, lambda, web-development]
---


# Serverless Telegram Bot 만들기

최근 서버 설계의 한 축을 담당하고 있는 핫한 serverless 기반으로 텔레그램 봇을 만들어보자.

# Serverless 란?

서버리스하면 __서버가 없다__ 는 것인가? 생각을 할 수 있는데, 서버는 있다. 전통적인 서버-클라이언트 구조에서는 서버는 __하나의 물리적 장비__ 를 쓰거나 대여하여 24시간 돌아가는 데몬을 기반으로 서버-클라이언트 구조를 구현했다. 서버리스는 이러한 전통적인 구조를 완전 깼다. 하나의 서비스를 제공하기 위해 굳이 하나의 서버를 잡고 데몬이 돌아가는 것이 아니고, __함수 단위__ 로 잘게 나눠서 임의의 서버에서 이 작업을 수행하는 것을 뜻한다. 주로 유명한 서버리스 프레임워크는 firebase, aws.lambda 가 있다. 여러가지 많지만 저는 꼬꼬마라 다 알지는 못함.

# 써야 하는 aws 서비스들

aws.lambda, aws.cloudwatch, aws.dynamodb, aws.apigateway

# 비용은?

비용이 또 ㅁㅊㄸ.

![image](https://user-images.githubusercontent.com/3623889/92875003-85067300-f443-11ea-9e29-079e2f468fc0.png)

월 200만건에 각 실행시간 100ms 에 대해서 월 0.2$ 라고 나온다.

개인이나 스타트업입장의 개발에서는 공짜나 다름없다.

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

1. AWS 메뉴 중, Identity and Access Management(IAM) 들어가서 __사용자 추가__ 를 한다.
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

provider: 항목에 region 을 넣을 수 있는데, 기본 region 은 east 어딘가로 설정이 되는데, 우리는 한국인이니 다음 줄을 추가하자. __region: ap-northeast-2__

그리고 게이트웨이는 직접 세팅할 것이므로

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
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service telegram-echo.zip file to S3 (740 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
...............
Serverless: Stack update finished...
Service Information
service: telegram-echo
stage: dev
region: ap-northeast-2
stack: telegram-echo-dev
resources: 6
api keys:
  None
endpoints:
  None
functions:
  helloWorld: telegram-echo-dev-helloWorld
layers:
  None

***********************************************************************
Serverless: Announcing an enhanced experience for running Express.js apps: https://github.com/serverless-components/express.
***********************************************************************

```

우리의 aws console 들어가서 뭐가 어떻게 됐나 확인해볼까?

![image](https://user-images.githubusercontent.com/3623889/92711123-4c0ec580-f393-11ea-8f24-1b4b79877811.png)


외부 url 를 호출하면 우리 람다를 호출할 http api 가 필요하다. 트리거 추가를 누른다.

1. API Gateway
2. Create an API
3. HTTP API
4. 보안: 열기


아래에 보면 API endpoint 가 있다. 이 url 에 접근을 하게 되면 telegram-echo-dev-helloWorld 함수를 실행한다는 의미다.

함수를 실행하는 방법은 크게 두 가지. api gateway 를 통해 호출하거나 테스트 버튼을 이용해 테스트를 하거나.

handler.js 에 한줄 추가해서 다시 deploy 해보자.

```
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@KSOO@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
```

추가 후, `serverless deploy`

그러고 url 호출해본다. 로그는 어디서 확인하나?

__cloudwatch.loggroup./aws/lambda/telegram-echo-dev-helloWorld__

![image](https://user-images.githubusercontent.com/3623889/92702848-a35d6780-f38c-11ea-9fb3-73a46ee92c47.png)

GET 변수를 넘길 수도 있다.

https://xxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/hello-world?var=KSOOKSOOKSOO

```
..."queryStringParameters":{"var":"KSOOKSOOKSOO"},...
```

# 텔레그램과 연동

먼저 봇을 하나 만들어야 한다.

텔레그램앱에서 BotFather 를 친구 추가한다.


```
/newbot

BotFather, [10.09.20 17:41]
Alright, a new bot. How are we going to call it? Please choose a name for your bot.

input: telegless_bot

BotFather, [10.09.20 17:42]
Good. Now let's choose a username for your bot. It must end in `bot`. Like this, for example: TetrisBot or tetris_bot.

input: teleless_bot

BotFather, [10.09.20 17:42]
Done! Congratulations on your new bot. You will find it at t.me/teleless_bot. You can now add a description, about section and profile picture for your bot, see /help for a list of commands. By the way, when you've finished creating your cool bot, ping our Bot Support if you want a better username for it. Just make sure the bot is fully operational before you do this.

Use this token to access the HTTP API:
1349292513:AAEyIjGis0AHzrEuP4uFkRl4AvgLM*********
Keep your token secure and store it safely, it can be used by anyone to control your bot.

For a description of the Bot API, see this page: https://core.telegram.org/bots/api
```

여기 나온 API 는 잘 기억하거나 기록 해둬야 한다. 만든 봇에 접근할 수 있는 키의 역할을 한다.

__Telegram Webhook__

우리의 목표는 지금 하나다. 텔레그램 봇에 타자를 치면 이 정보를 우리의 aws.lambda 로 전달하는 것.

텔레그램에서는 webhook 를 지원한다. webhook 을 걸게 되면 텔레그램 봇으로 들어오는 정보를 어떤 url 로 포워딩 시켜줄 수가 있다.

https://core.telegram.org/bots/api#setwebhook

문서를 보면

https://api.telegram.org/bot${telegram_token}/setWebhook?url=${callback_url}

이에 맞춰서 웹브라우저에서 호출해보자.

```
https://api.telegram.org/*********/setWebhook?url=https://**************.com/default/telegram-echo-dev-helloWorld
```
이렇게 호출을 하면 웹훅이 등록된다고 되어있다. 등록해보자. Webhook was set. 과 같은 문구가 뜨면 성공. 우리 telegless_bot 을 친구 추가하고 말 걸어보자.

CloudWatch 에 우리가 추가한 로그가 찍혀있는지 확인해보자. @@@@@@@@@@ 가 많아서 확인하기 쉬울 거다.

# Echo Bot

![image](https://user-images.githubusercontent.com/3623889/92715531-8a5ab380-f398-11ea-871c-17607fa286ce.png)

간단하게 에코봇을 만들어보자.

handler.js

```js
'use strict';

const AWS = require('aws-sdk');
const TOKEN = '{telegram_api_token}'; // YOUR TOKEN
const https = require('https');
const util = require('util');

AWS.config.update({region: 'ap-northeast-2'})
const docClient = new AWS.DynamoDB.DocumentClient();
module.exports.helloWorld = async (event, context, callback) => {
    const response = {
	statusCode: 200,
	headers: {
	    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
	},
	body: JSON.stringify({
	    message: 'test message',
	    input: event,
	}),
    };
    callback(null, response);
    let telegramCall = typeof(event.body) !== 'undefined';
    if(telegramCall) {
	const obj = JSON.parse(event.body);
	console.info("telegram obj: ", obj);
	let chatId = (obj.message.chat.id).toString();
	const requestText = obj.message.text;
	console.info("chatId: ", chatId, ", requestText: ", requestText);
	var splits = requestText.split(" ");

	if (splits[0] == "/start") {
	    const postData = {
		"chat_id": chatId,
		"text": "따라쟁이 봇 시작합니다."
	    };
	    sendMessage(context, postData);
	} else {
	    const postData = {
		"chat_id": chatId,
		"text": requestText
	    };
	    sendMessage(context, postData);
	}
    }
};

function sendMessage(context, content) {
    const options = {
	method: 'POST',
	hostname: 'api.telegram.org',
	port: 443,
	headers: {"Content-Type": "application/json"},
	path: "/bot" + TOKEN + "/sendMessage"
    };

    const req = https.request(options, (res) => {
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
	    context.done(null);
	});
    });

    req.on('error', function (e) {
	console.log('problem with request: ' + e.message);
    });

    req.write(util.format("%j", content));
    req.end();
}
```

# dynamodb

따라하는건 된다. 그리고 하나의 의문이 들거다. 만약 문맥(Context)이 있는 봇을 만들고 싶다면? 즉, 입력되는 데이터를 저장하고 싶을 때는?

이 때 사용하는 것이 dynamodb 다. 다이나모디비 이름 참 이쁘다.
