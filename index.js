// place in translate/index.js
require('dotenv').config();
const {GoogleSpreadsheet} = require('google-spreadsheet');
const creds = require('./.credentials/imgmonster-259707-a74defe2ddc4.json');
const i18nextConfig = require('./i18next-scanner.config');

const spreadsheetDocId = process.env.SPREAD_SHEET_DOC_ID;
const ns = 'translation';
const lngs = i18nextConfig.options.lngs;
const loadPath = i18nextConfig.options.resource.loadPath;
const localesPath = loadPath.replace('/{{lng}}/{{ns}}.json', '');
const rePluralPostfix = new RegExp(/_plural|_[\d]/g);
const sheetId = process.env.SHEET_ID; // your sheet id
const NOT_AVAILABLE_CELL = '_N/A';
const columnKeyToHeader = {
  key: '키',
  'ko-KR': '한글',
  'en-US': '영어',
  'ja-JP': '일본어',
  'zh-CN': '중국어',
};

/**
 * getting started from https://theoephraim.github.io/node-google-spreadsheet
 */
async function loadSpreadsheet() {
  // eslint-disable-next-line no-console
  console.info(
    '\u001B[32m',
    '=====================================================================================================================\n',
    '# i18next auto-sync using Spreadsheet\n\n',
    '  * Download translation resources from Spreadsheet and make /assets/locales/{{lng}}/{{ns}}.json\n',
    '  * Upload translation resources to Spreadsheet.\n\n',
    `The Spreadsheet for translation is here (\u001B[34mhttps://docs.google.com/spreadsheets/d/${spreadsheetDocId}/#gid=${sheetId}\u001B[0m)\n`,
    '=====================================================================================================================',
    '\u001B[0m'
  );

  // spreadsheet key is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(spreadsheetDocId);

  // load directly from json file if not in secure environment
  await doc.useServiceAccountAuth(creds);

  await doc.loadInfo(); // loads document properties and worksheets

  return doc;
}

function getPureKey(key = '') {
  return key.replace(rePluralPostfix, '');
}

module.exports = {
  localesPath,
  loadSpreadsheet,
  getPureKey,
  ns,
  lngs,
  sheetId,
  columnKeyToHeader,
  NOT_AVAILABLE_CELL
};

/**
 * < scan:i18n >
 * 소스 코드에서 key를 추출하여 key, value로 구성된 언어별 json파일을 만들어 낸다. 
 * 
 * < upload:i18n >
 * 생성된 여러 개의 언어별 json파일을 하나의 테이블로 만들어 구글 스프레드 시트에 업로드하며, 
 * 
 * < download:i18n >
 * 반대로 동작하여 번역된 값을 각 언어별 json파일에 반영한다. 
 * 로컬에서 개발할 때나 프러덕션 빌드하기 전에 수행하여 번역 파일이 빌드에 포함할 수 있도록 npm 스크립트에 추가한다.
 */