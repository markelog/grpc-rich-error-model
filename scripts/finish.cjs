#!/usr/bin/env node

const fs = require('fs');
const json = require(`${__dirname}/../src/protos/bundle.json`);

fs.writeFileSync(
  `${__dirname}/../lib/esm/protos/bundle.js`,
  `export default ${JSON.stringify(json, null, 2)}`,
);

fs.writeFileSync(
  `${__dirname}/../lib/cjs/protos/bundle.js`,
  `module.exports = ${JSON.stringify(json, null, 2)}`,
);
