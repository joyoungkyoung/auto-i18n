const vfs = require('vinyl-fs');
const path = require('path')
const mkdirp = require("mkdirp");
const scanner = require('i18next-scanner');



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

exports.scanStart = async (_config) => {
    const {getDefaultLang, getLanguages, projectPath, resource, extensions} = _config;
    
    const COMMON_EXTENSIONS = `/**/*.{${extensions
        .map((ext) => ext.slice(1))
        .join(",")}}`;
        
    const loadPath = path.join(process.cwd(), resource.savePath)
    const languages = getLanguages();
    await checkAndMakeLocaleDir(loadPath, languages);

    const options= {
        defaultLng: getDefaultLang(),
        lngs: getLanguages(),
        func: {
          list: ["i18next.t", "i18n.t", "$i18n.t"],
          extensions: extensions,
        },
        resource: {
          loadPath: path.join(
            process.cwd(),
            resource.loadPath + "/{{lng}}/{{ns}}.json"
          ),
          savePath: path.join(
            process.cwd(),
            resource.savePath + "/{{lng}}/{{ns}}.json"
          ),
        },
        defaultValue(lng, ns, key) {
          const keyAsDefaultValue = [getDefaultLang()];
          if (keyAsDefaultValue.includes(lng)) {
            const separator = "~~";
            const value = key.includes(separator) ? key.split(separator)[1] : key;
    
            return value;
          }
    
          return "";
        },
        keySeparator: false,
        nsSeparator: false,
        prefix: "%{",
        suffix: "}",
      };

    vfs.src([`${projectPath}${COMMON_EXTENSIONS}`])
    .pipe(scanner(options))
    .pipe(vfs.dest('.'));
}
