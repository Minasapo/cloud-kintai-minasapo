/**
 * Jest custom transformer for YAML files.
 * Parses .yaml/.yml files and exports them as JS objects.
 */
const yaml = require("yaml");

module.exports = {
  process(sourceText) {
    const parsed = yaml.parse(sourceText);
    return {
      code: `module.exports = ${JSON.stringify(parsed)};`,
    };
  },
};
