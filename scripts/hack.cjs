#!/usr/bin/env node

const fs = require('fs');
const json = require(`${__dirname}/../src/protos/bundle.json`);

fs.writeFileSync(
  `${__dirname}/../src/protos/bundle.js`,
  `export default ${JSON.stringify(json, null, 2)}`,
);
