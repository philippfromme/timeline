'use strict';

const fs = require('fs');

const moment = require('moment');

const runs = fs.readFileSync('src/runs.json');

const parsed = JSON.parse(runs);

function compare(a, b) {
  return moment(a.date).unix() > moment(b.date).unix() ? 1 : -1;
}

parsed.sort(compare);
 
const stringified = JSON.stringify(parsed, null, 2);

fs.writeFileSync('src/runs.json', stringified);