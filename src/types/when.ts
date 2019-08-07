import {isType, isFunction, isUserType} from '../util';
import * as symbols from '../internal/symbols';
import {decodeCommon} from '../decode';
import {encodeCommon} from '../encode';
import {encodingLengthCommon} from '../encoding-length';
import {Metadata} from '../internal/meta';
import {Codec} from "../common";

/**
 * Type for conditions.
 * @param {Function|bool} condition
 * @param {Object} type Any builtin type or schema.
 * @returns {Object}
 */
export function when(condition, type): Codec<any> {
  if (!isType(type) && !isUserType(type)) {
    throw new TypeError('Argument #2 should be a valid type.');
  }

  const result = {
    encode,
    decode,
    encodingLength,
    [symbols.skip]: false,
  };

  return result;

  /**
   * Encode value if condition is truthy.
   * @param {any} value
   * @param {EncodeStream} wstream
   */
  function encode(value, wstream) {
    const context = Metadata.clone(this);
    let bytes: number = 0;

    const status = isFunction(condition)
      ? Boolean(condition(context))
      : Boolean(condition);

    result[symbols.skip] = !status;

    if (!status) {
      Metadata.clean(context);
      return bytes;
    }

    encodeCommon(value, wstream, type, context);
    bytes = context.bytes;

    Metadata.clean(context);
    return bytes;
  }

  /**
   * Decode value if condition is truthy.
   * @param {DecodeStream} rstream
   * @returns {any}
   */
  function decode(rstream): [any, number] {
    const context = Metadata.clone(this);
    let bytes = 0;

    const status = isFunction(condition)
      ? Boolean(condition(context))
      : Boolean(condition);

    result[symbols.skip] = !status;

    if (!status) {
      Metadata.clean(context);
      return [undefined, bytes];
    }

    const value = decodeCommon(rstream, type, context);

    bytes = context.bytes;
    Metadata.clean(context);

    return [value, bytes]; // eslint-disable-line consistent-return
  }

  /**
   * Get the number bytes of an encoded value
   * when condition is truthy or 0.
   * @param {any} value
   * @returns {number}
   */
  function encodingLength(value) {
    const context = Metadata.clone(this);

    const status = isFunction(condition)
      ? Boolean(condition(context))
      : Boolean(condition);

    if (status) {
      encodingLengthCommon(value, type, context);
    }

    Metadata.clean(context);
    return context.bytes;
  }
}
