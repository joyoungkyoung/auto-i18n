const fs = require("fs");
const path = require("path");

const {
  loadSpreadsheet,
  getPureKey,
  NOT_AVAILABLE_CELL,
  getColumnKeyToHeader,
} = require("../index");

async function addNewSheet(doc, title, _config) {
  const { sheetId, getLanguageColumns } = _config;
  const headerValues = ["Key", ...getLanguageColumns()];
  const sheet = await doc.addSheet({
    sheetId,
    title,
    headerValues,
  });

  return sheet;
}

/**
 * Update spreadsheet
 * @param {*} doc Spreadsheet Object
 * @param {*} keyMap json file keymap
 */
async function updateTranslationsFromKeyMapToSheet(doc, keyMap, _config) {
  const { sheetId } = _config;
  const title = `i18n`; // Sheet name in spreadsheet
  let sheet = doc.sheetsById[sheetId];
  if (!sheet) {
    sheet = await addNewSheet(doc, title, _config);
  }

  const columnKeyToHeader = getColumnKeyToHeader(_config);
  const existKeys = {};
  const addedRows = [];

  // find exsit keys
  const rows = await sheet.getRows();
  rows.forEach((row) => {
    const key = row[columnKeyToHeader.key];
    if (keyMap[key]) {
      existKeys[key] = true;
    }
  });

  // Add new data that is not in the expistKeys list
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

function gatherKeyMap(keyMap, lng, json, languages) {
  for (const [keyWithPostfix, translated] of Object.entries(json)) {
    const key = getPureKey(keyWithPostfix);

    if (!keyMap[key]) {
      keyMap[key] = {};
    }

    const keyMapWithLng = keyMap[key];
    if (!keyMapWithLng[keyWithPostfix]) {
      keyMapWithLng[keyWithPostfix] = languages.reduce((initObj, lng) => {
        initObj[lng] = NOT_AVAILABLE_CELL;

        return initObj;
      }, {});
    }

    keyMapWithLng[keyWithPostfix][lng] = translated;
  }
}

// start
exports.updateSheetFromJson = async (_config) => {
  const { resource, fileName, getLanguages } = _config;
  const doc = await loadSpreadsheet(_config);
  const loadPath = path.join(process.cwd(), resource.loadPath);

  fs.readdir(loadPath, (error, dirNames) => {
    if (error) {
      throw error;
    }

    const keyMap = {};

    dirNames.forEach((lng) => {
      const localeJsonFilePath = `${loadPath}/${lng}/${fileName}.json`;

      const json = fs.readFileSync(localeJsonFilePath, "utf8");

      gatherKeyMap(keyMap, lng, JSON.parse(json), getLanguages());
    });

    updateTranslationsFromKeyMapToSheet(doc, toJson(keyMap), _config);
  });
};
