const path = require("path");
const {
  resource,
  getLanguages,
  projectPath,
  extensions,
  getDefaultLang,
} = require("./bin/cli");
require("dotenv").config();

const COMMON_EXTENSIONS = `/**/*.{${extensions
  .map((ext) => ext.slice(1))
  .join(",")}}`;

module.exports = {
  input: [`${projectPath}${COMMON_EXTENSIONS}`],
  options: {
    defaultLng: getDefaultLang(),
    lngs: getLanguages(),
    func: {
      list: ["i18next.t", "i18n.t", "$i18n.t"],
      extensions: extensions,
    },
    resource: {
      loadPath: path.join(
        __dirname,
        resource.loadPath + "/{{lng}}/{{ns}}.json"
      ),
      savePath: path.join(
        __dirname,
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
  },
};
