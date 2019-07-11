'use strict';

import {isType, isUserType, isDecodeType} from './util';
import {BinaryStream} from './binary-stream';
import * as symbols from './internal/symbols';
import {Metadata} from './internal/meta';
import {BufioReader} from "./bufio";

/**
 * Decode any data from provided stream using schema.
 * @param {BinaryStream} rstream Read stream to decode.
 * @param {Object} typeOrSchema Builtin data type or schema.
 * @returns {*}
 */
export function decode(rstream: BufioReader | Buffer, typeOrSchema): [any, number] {
  let decodeStream: BufioReader;

  if (Buffer.isBuffer(rstream)) {
    const bs = new BinaryStream();
    bs.append(rstream);
    decodeStream = bs;
  } else {
    decodeStream = rstream;
  }

  const meta = new Metadata();
  const value = decodeCommon(decodeStream, typeOrSchema, meta);

  Metadata.clean(meta);

  return [value, meta.bytes];
}

/**
 * @private
 * @param {BinaryStream|Buffer} rstream
 * @param {Object} typeOrSchema
 * @param {Metadata} meta
 * @returns {*}
 */
export function decodeCommon(rstream: BufioReader, typeOrSchema, meta) {
  if (isType(typeOrSchema)) {
    const [value, bytes] = typeOrSchema.decode.call(meta, rstream);
    meta[symbols.bytes] += bytes;
    return value;
  }

  return decodeSchema(rstream, typeOrSchema, meta);
}

/**
 * @private
 * @param {BinaryStream} rstream
 * @param {Object} schema
 * @param {Metadata} meta
 * @returns {Object}
 */
function decodeSchema(rstream, schema, meta) {
  assertSchema(schema);

  const node = Object.create(null);

  if (meta.node === undefined) {
    meta.node = node;
    meta.current = node;
  } else {
    meta.current = node;
  }

  const keys = Object.keys(schema);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const type = schema[key];

    if (!isDecodeType(type)) {
      node[key] = decodeSchema(rstream, type, meta);
      meta.current = node;
      continue; // eslint-disable-line no-continue
    }

    const [value, bytes] = type.decode.call(meta, rstream);
    meta[symbols.bytes] += bytes;

    if (type[symbols.skip] === true) {
      continue; // eslint-disable-line no-continue
    }

    node[key] = value;
  }

  return node;
}

/**
 * Check if argument is schema.
 * @param {Object} schema
 * @private
 */
function assertSchema(schema) {
  if (!isUserType(schema)) {
    throw new TypeError('Argument #2 should be a plain object.');
  }
}
