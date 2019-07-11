'use strict';

const fs = require('fs');
const {
  types: { string },
  createDecodeStream,
} = require('..');

const NetworkPacket = string(null);

const input = createDecodeStream(NetworkPacket);
const file = fs.createReadStream('./example.bin', null);

file.pipe(input).on('data', line => console.log(line));
