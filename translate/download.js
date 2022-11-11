const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
// const { resource, fileName, getLanguages, sheetId } = require("../config");
const {
  loadSpreadsheet,
  NOT_AVAILABLE_CELL,
  getColumnKeyToHeader,
} = require("../index");

/**
 * fetch translations from google spread sheet and transform to json
 * @param {GoogleSpreadsheet} doc GoogleSpreadsheet document
 * @returns [object] translation map
 * {
 *   "ko-KR": {
 *     "key": "value"
 *   },
 *   "en-US": {
 *     "key": "value"
 *   },
 *   "ja-JP": {
 *     "key": "value"
 *   },
 *   "zh-CN": {
 *     "key": "value"
 *   },
 * }
 */
async function fetchTranslationsFromSheetToJson(doc, _config) {
  const {getLanguages, sheetId} = _config;
  const sheet = doc.sheetsById[sheetId];
  if (!sheet) {
    return {};
  }

  const columnKeyToHeader = getColumnKeyToHeader(_config); // 헤더별 컬럼정보
  const lngsMap = {};
  const rows = await sheet.getRows();

  rows.forEach((row) => {
    const key = row[columnKeyToHeader.key];
    getLanguages().forEach((lng) => {
      const translation = row[columnKeyToHeader[lng]];
      // NOT_AVAILABLE_CELL("_N/A") means no related language
      if (translation === NOT_AVAILABLE_CELL) {
        return;
      }

      if (!lngsMap[lng]) {
        lngsMap[lng] = {};
      }

      lngsMap[lng][key] = translation || ""; // prevent to remove undefined value like ({"key": undefined})
    });
  });

  return lngsMap;
}

function checkAndMakeLocaleDir(dirPath, subDirs) {
  return new Promise((resolve, reject) => {
    subDirs.forEach((subDir, index) => {
      mkdirp(`${dirPath}/${subDir}`)
        .then(() => {
          if (index === subDirs.length - 1) {
            resolve();
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  });
}

exports.updateJsonFromSheet = async (_config) => {
  const {resource, fileName, getLanguages, sheetId} = _config
  const languages = getLanguages();
  await checkAndMakeLocaleDir(resource.loadPath, languages);

  const doc = await loadSpreadsheet(_config);
  const lngsMap = await fetchTranslationsFromSheetToJson(doc, _config);

  const loadPath = path.join(process.cwd(), resource.loadPath)
  fs.readdir(loadPath, (error, dirNames) => {
    if (error) {
      throw error;
    }

    dirNames.forEach((lng) => {
      const localeJsonFilePath = `${loadPath}/${lng}/${fileName}.json`;

      const jsonString = JSON.stringify(lngsMap[lng], null, 2);

      fs.writeFile(localeJsonFilePath, jsonString, "utf8", (err) => {
        if (err) {
          throw err;
        }
      });
    });
  });
}

// run
// updateJsonFromSheet();
