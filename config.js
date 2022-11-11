require("dotenv").config();

const projectPath = process.env.PROJECT_PATH;
const spreadSheetDocId = process.env.SPREAD_SHEET_DOC_ID;
const sheetId = process.env.SHEET_ID;
const credentials = ".credentials/toastcanvas-a4c2e5fb4c15.json";

const languages = [
  { key: "ko-KR", column: "한글" },
  { key: "en-US", column: "영어" },
  { key: "vi-VN", column: "베트남어" },
];
const extensions = [".js", ".jsx", ".ts", ".tsx", ".vue", ".html"];
const resource = {
  loadPath: "assets/locales",
  savePath: "assets/locales",
};
const fileName = "translation";

module.exports = {
  projectPath,
  credentials,
  extensions,
  resource,
  fileName,
  spreadSheetDocId,
  sheetId,
  getDefaultLang: () => languages[0].key,
  getLanguages: () => languages.map((lang) => lang.key),
  getLanguageColumns: () => languages.map((lang) => lang.column),
};
