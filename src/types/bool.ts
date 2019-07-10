'use strict';

import {BinaryStream} from "../binary-stream";
import {Codec} from "../codec";

const { isType } = require('src/util');

/**
 * Boolean type.
 * @param {Object} type Any builtin type or schema.
 * @returns {Object}
 */
export function bool(type): Codec<boolean>  {
  if (!isType(type)) {
    throw new TypeError('Argument #1 should be valid type.');
  }

  /**
   * Decode element as boolean.
   * @param {DecodeStream} rstream
   * @returns {bool}
   */
  function decode(rstream: BinaryStream): [boolean, number] {
    // eslint-disable-next-line no-invalid-this
    const context = this;

    const value = type.decode.call(context, rstream);
    // decode.bytes = type.decode.bytes;

    return [Boolean(value), type.decode.bytes];
  }

  /**
   * Encode boolean item.
   * @param {bool} value
   * @param {EncodeStream} wstream
   */
  function encode(value: boolean, wstream: BinaryStream): number {
    // eslint-disable-next-line no-invalid-this
    const context = this;

    type.encode.call(context, value ? 1 : 0, wstream);
    // encode.bytes = type.encode.bytes;
    return type.encode.bytes;
  }

  return {
    encode,
    decode,
    encodingLength: type.encodingLength,
  };
}
