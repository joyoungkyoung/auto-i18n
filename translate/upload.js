// place in translate/upload.js
const fs = require("fs");
const {
  getLanguages,
  getLanguageColumns,
  fileName,
  resource,
  sheetId,
} = require("../config");
const {
  loadSpreadsheet,
  getPureKey,
  NOT_AVAILABLE_CELL,
  getColumnKeyToHeader,
} = require("../index");

const headerValues = ["키", ...getLanguageColumns()];

async function addNewSheet(doc, title, sheetId) {
  const sheet = await doc.addSheet({
    sheetId,
    title,
    headerValues,
  });

  return sheet;
}

/**
 * 스프레드 시트 업데이트
 * @param {*} doc 스프레드 시트 객체
 * @param {*} keyMap json파일 키맵
 */
async function updateTranslationsFromKeyMapToSheet(doc, keyMap) {
  const title = `i18n`; // 스프레드 시트 내 시트명
  let sheet = doc.sheetsById[sheetId];
  if (!sheet) {
    sheet = await addNewSheet(doc, title, sheetId);
  }

  const columnKeyToHeader = getColumnKeyToHeader(); // 헤더별 컬럼정보
  const existKeys = {}; // 기존에 업로드 된 데이터
  const addedRows = []; // 신규 추가할 데이터

  // find exsit keys
  const rows = await sheet.getRows();
  rows.forEach((row) => {
    const key = row[columnKeyToHeader.key];
    if (keyMap[key]) {
      existKeys[key] = true;
    }
  });

  // existKeys 목록에 없는 데이터 신규추가
  for (const [key, translations] of Object.entries(keyMap)) {
    if (!existKeys[key]) {
      const row = {
        [columnKeyToHeader.key]: key,
        ...Object.keys(translations).reduce((result, lng) => {
          const header = columnKeyToHeader[lng];
          result[header] = translations[lng];

          return result;
        }, {}),
      };

      addedRows.push(row);
    }
  }

  // upload new keys
  await sheet.addRows(addedRows);
}

function toJson(keyMap) {
  const json = {};

  Object.entries(keyMap).forEach(([__, keysByPlural]) => {
    for (const [keyWithPostfix, translations] of Object.entries(keysByPlural)) {
      json[keyWithPostfix] = {
        ...translations,
      };
    }
  });

  return json;
}

function gatherKeyMap(keyMap, lng, json) {
  for (const [keyWithPostfix, translated] of Object.entries(json)) {
    const key = getPureKey(keyWithPostfix);

    if (!keyMap[key]) {
      keyMap[key] = {};
    }

    const keyMapWithLng = keyMap[key];
    if (!keyMapWithLng[keyWithPostfix]) {
      keyMapWithLng[keyWithPostfix] = getLanguages().reduce((initObj, lng) => {
        initObj[lng] = NOT_AVAILABLE_CELL;

        return initObj;
      }, {});
    }

    keyMapWithLng[keyWithPostfix][lng] = translated;
  }
}

async function updateSheetFromJson() {
  const doc = await loadSpreadsheet();

  // 파일 목록 불러오기
  fs.readdir(resource.loadPath, (error, dirNames) => {
    if (error) {
      throw error;
    }

    const keyMap = {};

    dirNames.forEach((lng) => {
      const localeJsonFilePath = `${resource.loadPath}/${lng}/${fileName}.json`;

      const json = fs.readFileSync(localeJsonFilePath, "utf8");

      gatherKeyMap(keyMap, lng, JSON.parse(json));
    });

    updateTranslationsFromKeyMapToSheet(doc, toJson(keyMap));
  });
}

// run
updateSheetFromJson();
