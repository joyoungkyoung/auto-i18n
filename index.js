// place in translate/index.js
require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const {
  spreadSheetDocId,
  sheetId,
  credentials,
  getLanguageColumns,
  getLanguages,
} = require("./config");

const creds = require(`./${credentials}`);
const rePluralPostfix = new RegExp(/_plural|_[\d]/g);
const NOT_AVAILABLE_CELL = "_N/A";

/**
 * getting started from https://theoephraim.github.io/node-google-spreadsheet
 */
async function loadSpreadsheet() {
  // eslint-disable-next-line no-console
  console.info(
    "\u001B[32m",
    "=====================================================================================================================\n",
    "# i18next auto-sync using Spreadsheet\n\n",
    "  * Download translation resources from Spreadsheet and make /assets/locales/{{lng}}/{{ns}}.json\n",
    "  * Upload translation resources to Spreadsheet.\n\n",
    `The Spreadsheet for translation is here (\u001B[34mhttps://docs.google.com/spreadsheets/d/${spreadSheetDocId}/#gid=${sheetId}\u001B[0m)\n`,
    "=====================================================================================================================",
    "\u001B[0m"
  );

  // spreadsheet key is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(spreadSheetDocId);

  // load directly from json file if not in secure environment
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo(); // loads document properties and worksheets

  return doc;
}

function getPureKey(key = "") {
  return key.replace(rePluralPostfix, "");
}

const getColumnKeyToHeader = () => {
  const header = { key: "키" };
  const columns = getLanguageColumns();
  getLanguages().map((lang, index) => (header[lang] = columns[index]));

  return header;
};

module.exports = {
  loadSpreadsheet,
  getPureKey,
  getColumnKeyToHeader,
  NOT_AVAILABLE_CELL,
};
