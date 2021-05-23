// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    console.log(config);
    const originalExternal = config.external;
    config.external = function (id) {
      if (id.startsWith(`unist-util-`)) {
        return false;
      }
      return originalExternal(id);
    };
    return config;
  },
};
