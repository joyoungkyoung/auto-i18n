#!/usr/bin/env node
const { Command } = require("commander");
const figlet = require("figlet");
const path = require("path");
const packageJson = require("../package.json");
const program = new Command();

console.info(figlet.textSync("Auto I 18N"));
program
  .description("국제화(i18n) 문서 자동화 라이브러리입니다.")
  .requiredOption("-c, --config <config path>", "config file path")
  .option("-d, --download", "download", false)
  .option("-s, --scan", "scan", false)
  .option("-u, --upload", "upload", false)
  .version(packageJson.version);

program.on("--help", () => {
  console.log("");
  console.log("Examples:");
  console.log("");
  console.log("   $ @joyk/i18n --config auto-i18n.config.js --download");
  console.log("   $ @joyk/i18n --config auto-i18n.config.js --scan");
  console.log("   $ @joyk/i18n --config auto-i18n.config.js --upload");
  console.log("");
});

program.parse(process.argv);

const option = program.opts();

if (!option.config) {
  program.help();
  process.exit(1);
}

let _config = {};

try {
  _config = require(path.resolve(program.opts().config));
} catch (err) {
  console.error("@joyk/i18n:", err);
  process.exit(1);
}

const { updateJsonFromSheet } = require("../translate/download");
const { scanStart } = require("../translate/scan");
const { updateSheetFromJson } = require("../translate/upload");

if (option.download) {
  console.info("업로드 된 국제화 문서를 json 형태로 다운로드 받습니다.");
  updateJsonFromSheet(_config);
} else if (option.scan) {
  console.info("설정된 위치를 기준으로 국제화 대상이 되는 키값을 스캔합니다.");
  console.info("스캔 대상 : ", _config.projectPath);
  scanStart(_config);
} else if (option.upload) {
  console.info("스캔한 국제화 파일을 구글 스프레드 시트로 업로드합니다.");
  console.info("업로드 전 선행: ");
  console.info("스캔 대상 : ", _config.projectPath);
  scanStart(_config);
  console.info("업로드 진행 중...");
  updateSheetFromJson(_config);
}
