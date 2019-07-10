'use strict';

import {BinaryStream}  from './binary-stream';
import {array}  from './types/array';
import {buffer}  from './types/buffer';
import {bool}  from './types/bool';
import {reserved}  from './types/reserved';
import {string}  from './types/string';
import {numbers}  from './types/numbers';
import {when}  from './types/when';
import {select}  from './types/select';
import { encode }  from './encode';
import { decode }  from './decode';
import { encodingLength }  from './encoding-length';
import {Transaction}  from './transaction';
import {NotEnoughDataError}  from './not-enough-data-error';

const types = {
  array,
  bool,
  buffer,
  reserved,
  string,
  when,
  select,
};

for (const type of Object.keys(numbers)) {
  types[type] = numbers[type]; // eslint-disable-line security/detect-object-injection
}

const kschema = Symbol('schema');

/**
 * Create transform stream to encode objects into Buffer.
 * @param {Object} [schema]
 * @returns {EncodeStream}
 */
export function createEncodeStream(schema) {
  const stream = new BinaryStream({
    readableObjectMode: false,
    writableObjectMode: true,
    transform: transformEncode,
  });

  stream[kschema] = schema;
  return stream;
}

/**
 * Create transform stream to decode binary data into object.
 * @param {Buffer|Object} [bufOrSchema]
 * @returns {DecodeStream}
 */
export function createDecodeStream(bufOrSchema) {
  let schema = null;
  const isBuffer = Buffer.isBuffer(bufOrSchema);

  if (!isBuffer) {
    schema = bufOrSchema;
  }

  const stream = new BinaryStream({
    transform: transformDecode,
    readableObjectMode: true,
    writableObjectMode: false,
  });

  stream[kschema] = schema;

  if (isBuffer) {
    stream.append(bufOrSchema);
  }

  return stream;
}

/**
 * The `transform` function for transform stream.
 * @param {*} chunk Any valid js data type.
 * @param {string} encoding
 * @param {Function} cb
 */
function transformEncode(chunk, encoding, cb) {
  try {
    encode(chunk, this[kschema], this);

    const buf = this.slice();
    this.consume(buf.length);

    cb(null, buf);
  } catch (error) {
    cb(error);
  }
}

/**
 * The `transform` function for transform stream.
 * @param {*} chunk Any valid js data type.
 * @param {string} encoding
 * @param {Function} cb
 */
function transformDecode(chunk, encoding, cb) {
  this.append(chunk);

  try {
    while (this.length > 0) {
      const transaction = new Transaction(this);
      const data = decode(transaction, this[kschema]);

      transaction.commit();
      this.push(data);
    }

    cb();
  } catch (error) {
    if (error instanceof NotEnoughDataError) {
      cb();
    } else {
      cb(error);
    }
  }
}

export const createEncode = createEncodeStream;
export const createDecode = createDecodeStream;

export {
  /* Main api */
  encode,
  decode,
  encodingLength,

  /* Data types */
  types,

  /* Re-export utils */
  BinaryStream,
  NotEnoughDataError,
}
