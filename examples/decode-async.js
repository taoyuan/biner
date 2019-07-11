'use strict';

const { Readable } = require('stream');
const {
  types: { string },
  createDecodeStream,
} = require('..');

const NetworkPacket = string(null);

const input = createDecodeStream(NetworkPacket);
const source = new Readable({
  read() {},
});

source.pipe(input).on('data', line => console.log(line));

source.push('hello, ');
process.nextTick(() => {
  source.push('world!\0');
});

setTimeout(() => {
  source.push('biner ');

  setImmediate(() => {
    source.push('works!\0');
  });
}, 0);
