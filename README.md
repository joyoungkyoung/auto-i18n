# i18n-management
i18n국제화 파일 관리용 프로젝트

# 필요한 파일, 폴더
* assets/locals/ko-KR
* assets/locals/en-US
* assets/locals/ja-JP
* assets/locals/zh-CN

# .env
* SPREAD_SHEET_DOC_ID = "i18n을 구글 스프레드시트로 관리하기 위한 도큐먼트 ID"
* SHEET_ID = 0 구글 스프레드시트 도큐먼트 내 시트 아이디 (gid)
* PROJECT_PATH = "i18n데이터를 추출할 프로젝트 경로"

# 명령어
## [scan:i18n]
+ 소스 코드에서 key를 추출하여 key, value로 구성된 언어별 json파일을 만들어 낸다.  

## [upload:i18n]
+ 생성된 여러 개의 언어별 json파일을 하나의 테이블로 만들어 구글 스프레드 시트에 업로드하며, 
 
## [download:i18n]
+ 반대로 동작하여 번역된 값을 각 언어별 json파일에 반영한다. 
+ 로컬에서 개발할 때나 프러덕션 빌드하기 전에 수행하여 번역 파일이 빌드에 포함할 수 있도록 npm 스크립트에 추가한다.
