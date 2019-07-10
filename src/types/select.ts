'use strict';

import * as symbols from '../internal/symbols';
import {decodeCommon} from '../decode';
import {Metadata} from '../internal/meta';
import {Codec} from "../codec";

/**
 * Type for multiple conditions.
 * Works almost like `switch` operator.
 * @param {...any} whenTypes The `when` type.
 * @returns {Object}
 */
export function select(...whenTypes): Codec<any> {
  if (whenTypes.length === 0) {
    throw new TypeError('You should set at least one condition type.');
  }

  const result: Codec<any> = {
    encodingLength: (() => 0),
    decode,
    encode: (() => 0),
    [symbols.skip]: true,
  };

  return result;

  /* eslint-disable consistent-return */
  /**
   * Decode data using a first success contifion.
   * @param {DecodeStream} rstream
   */
  function decode(rstream): [any, number] {
    let bytes = 0;
    const context = Metadata.clone(this); // eslint-disable-line no-invalid-this

    for (const when of whenTypes) {
      // eslint-disable-next-line no-invalid-this
      const probalyValue = decodeCommon(rstream, when, context);

      if (when[symbols.skip] === true) {
        continue; // eslint-disable-line no-continue
      }

      bytes = context.bytes;
      Metadata.clean(context);

      result[symbols.skip] = false;
      return [probalyValue, bytes];
    }

    result[symbols.skip] = true;
    return [undefined, bytes];
  }

  /* eslint-enable consistent-return */
}
