'use strict';

import {decodeCommon} from '../decode';
import {encodeCommon} from '../encode';
import {encodingLengthCommon} from '../encoding-length';
import {isType, isFunction} from '../util';
import * as symbols from '../internal/symbols';
import {Metadata} from '../internal/meta';
import {Codec} from "../codec";
import {BinaryStream} from "../binary-stream";

/**
 * Type for reserved data.
 * @param {Object} type Any builtin type or schema.
 * @param {number} size The number of reserved items.
 * @returns {Object}
 */
export function reserved(type, size: number | ((context) => number) = 1): Codec<any> {
  if (!isType(type)) {
    throw new TypeError('Invalid data type.');
  }

  if (!Number.isInteger(<number>size) && !isFunction(size)) {
    throw new TypeError('Argument #2 should be a valid integer or function.');
  }

  return {
    [symbols.skip]: true,
    encodingLength,
    decode,
    encode,
  };

  /**
   * Get the number of bytes to encode value.
   * @param {any} value
   * @returns {number}
   */
  function encodingLength(value) {
    // eslint-disable-next-line no-invalid-this
    const context = Metadata.clone(this);

    const count = isFunction(size) ? size(context) : size;

    encodingLengthCommon(value, type, context);
    Metadata.clean(context);

    return context.bytes * count;
  }

  /**
   * Silently decode items.
   * @param {DecodeStream} rstream
   */
  function decode(rstream: BinaryStream): [any, number] {
    // eslint-disable-next-line no-invalid-this
    const context = Metadata.clone(this);
    let bytes = 0;

    const count = isFunction(size) ? size(context) : size;

    if (count === 0) {
      Metadata.clean(context);
      return [undefined, bytes];
    }

    for (let i = count; i > 0; i -= 1) {
      decodeCommon(rstream, type, context);
    }

    bytes = context.bytes;
    Metadata.clean(context);
    return [undefined, bytes];
  }

  /**
   * Encode reserved data.
   * Fill with zeros the number of required bytes.
   * @param {any} value
   * @param {EncodeStream} wstream
   */
  function encode(value: any, wstream: BinaryStream) {
    let bytes = 0;

    // eslint-disable-next-line no-invalid-this
    const context = Metadata.clone(this);

    const count = isFunction(size) ? size(context) : size;

    if (count === 0) {
      Metadata.clean(context);
      return bytes;
    }

    for (let i = count; i > 0; i -= 1) {
      encodeCommon(0, wstream, type, context);
    }

    bytes = context.bytes;
    Metadata.clean(context);
    return bytes;
  }
}
