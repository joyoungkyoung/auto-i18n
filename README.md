# i18n-management
* i18n국제화 파일 관리용 프로젝트
* i18n 모듈을 사용한 다국어 기능을 지원하는 프로젝트를 개발 중, 지속적인 번역 자료가 갱신될 필요가 있었다.
* 그러나 json 파일에 있는 값을 언어별로 일일이 수정할 때 휴먼에러가 발생할 우려가 있고, 기존에 번역된 텍스트를 관리하기도 어렵다.
* 이 프로젝트를 통해 i18n문서를 구글 스프레드 시트를 통해 자동화한다.

# 선행작업
## 구글 스프레드 시트의 권한 설정
```
https://docs.google.com/spreadsheets/d/{{spreadSheetDocId}}/edit#gid={{sheetId}}
```
spreadSheetDocId 와 sheetId값을 알고있어야한다.
위의 스프레드시트에 대한 인증을 획득하기 위해 서비스 계정을 생성한다.
*  https://console.cloud.google.com/   
구글 클라우드 콘솔에서 임의의 프로젝트를 생성한 후 API 및 서비스 > 사용자 인증 정보 화면으로 이동한다.   
사용자 인증 정보 만들기 버튼을 누른 후 서비스 계정을 생성한다.
* {{serviceName}}@{{projectId}}.iam.gserviceaccount.com   
위와 같은 서비스 계정(봇)을 사용할 스프레드 시트에 편집권한을 부여한다.

## credentials 키 생성
서비스 계정을 생성한 후 다시 API 및 서비스 > 사용자 인증 정보 화면으로 이동한다.   
생성된 서비스 계정을 클릭하고, 키 탭으로 이동한다.   
키 추가 > 새 키 만들기 를 클릭한다.   
JSON 형식으로 만든 키를 다운로드한다.   
* client_email   
* private_key   
json 파일에 있는 이 두개의 정보를 사용해 서비스 계정을 인증받을 수 있다.   
파일로 관리하는것보다 이 정보를 ```.env``` 파일에 따로 관리할 수 있다.   

# 필요한 모듈, 파일, 폴더
## Modules
```
yarn add i18next // 자바스크립트 국제화 라이브러리
yarn add -d i18next-scanner // 지정된 국제화 패턴의 함수를 스캔
yarn add -d google-spreadsheet // 구글 스프레드시트 API 
```

## .env
```
SPREAD_SHEET_DOC_ID = i18n을 구글 스프레드시트로 관리하기 위한 도큐먼트 ID
SHEET_ID = 구글 스프레드시트 도큐먼트 내 시트 아이디 (gid)
PROJECT_PATH = i18n데이터를 추출할 프로젝트 경로
GOOGLE_SERVICE_ACCOUNT_EMAIL = 서비스계정 아이디 (client_email)
GOOGLE_PRIVATE_KEY = 서비스계정의 키 파일에 있는 private_key
```

# 명령어
## 사용순서
```
// .env 파일의 내용과 config.js 파일의 내용을 채운 후 아래 명령어들을 실행한다.
yarn scan:i18n
yarn upload:i18n

// 업로드된 시트의 내용을 확인하고, 언어별로 변환할 값을 입력한다.
// 이후 이 시트에서 계속 작업을 하고 다운로드 받아 사용한다.
yarn download:i18n
```
## yarn scan:i18n
* 소스 코드에서 key를 추출하여 key, value로 구성된 언어별 json파일을 만들어 낸다.  

## yarn upload:i18n
* ```scan:i18n``` 액션을 선행한다.
* 생성된 여러 개의 언어별 json파일을 하나의 테이블로 만들어 구글 스프레드 시트에 업로드한다. 
 
## yarn download:i18n
* 번역된 값을 각 언어별 json파일에 반영한다. 
* 로컬에서 개발할 때나 프러덕션 빌드하기 전에 수행하여 번역 파일이 빌드에 포함할 수 있도록 npm 스크립트에 추가하는것을 추천.


