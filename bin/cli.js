const { Command } = require('commander');
const figlet = require("figlet");
const path = require('path');
const packageJson = require('../package.json');
const program = new Command();

console.info(figlet.textSync('Auto I 18N'));
program
    .description('국제화(i18n) 문서 자동화 라이브러리입니다.')
    .requiredOption('-c, --config <config path>', 'config file path')
    .option('-d, --download', 'download', false)
    .version(packageJson.version);

program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('   $ @joyk/i18n --config auto-i18n.config.js --download');
    console.log('');
    });

program.parse(process.argv);

const option = program.opts();

if(!option.config) {
    program.help();
    process.exit(1);
}

let _config = {};

try {
    _config = require(path.resolve(program.opts().config));
} catch(err) {
    console.error('@joyk/i18n:', err);
    process.exit(1);
}

const { updateJsonFromSheet } = require('../translate/download');

if(option.download) {
    console.info("업로드 된 국제화 문서를 json 형태로 다운로드 받습니다.")
    // const exec = require("child_process").execSync;
    // exec('npm run download:i18n');
    console.log(_config);
    updateJsonFromSheet(_config);
}
