'use strict';

import {isType, isFunction} from '../util';
import {NotEnoughDataError} from '../not-enough-data-error';
import {BinaryStream} from '../binary-stream';
import {Codec} from "../codec";

/**
 * Buffer type.
 * @param {number|Object} length The number of bytes or type for size-prefixed buffers.
 * @returns {Object}
 */
export function buffer(length): Codec<Buffer> {
  const isnum = typeof length === 'number';
  const istype = isType(length);
  const isfunc = isFunction(length);
  const isNull = length === null;

  if (!isnum && !istype && !isfunc && !isNull) {
    throw new TypeError('Unknown type of argument #1.');
  }

  return {
    encode,
    decode,
    encodingLength,
  };

  /**
   * Encode buffer.
   * @param {Buffer} buf
   * @param {EncodeStream} wstream
   */
  function encode(buf: Buffer | BinaryStream, wstream: BinaryStream) {
    checkBuffer(buf);
    let bytes = 0;

    // eslint-disable-next-line no-invalid-this
    const context = this;

    if (isnum) {
      checkLength(length, buf.length);
    }

    if (istype) {
      length.encode.call(context, buf.length, wstream);
      bytes += length.encode.bytes;
    }

    if (isfunc) {
      const expectedLength = length(context);

      checkLengthType(expectedLength);
      checkLength(expectedLength, buf.length);
    }

    wstream.writeBuffer(Buffer.isBuffer(buf) ? buf : buf.buffer);
    bytes += buf.length;

    if (isNull) {
      wstream.writeUInt8(0);
      bytes += 1;
    }
    return bytes;
  }

  /**
   * Read the buffer from the stream.
   * @param {DecodeStream} rstream
   * @returns {Buffer}
   */
  function decode(rstream): [Buffer, number] {
    let size = 0;
    let bytes = 0;

    // eslint-disable-next-line no-invalid-this
    const context = this;

    if (isnum) {
      size = length;
    } else if (istype) {
      size = length.decode.call(context, rstream);
      bytes += length.decode.bytes;
      checkLengthType(size);
    } else if (isfunc) {
      size = length(context);

      checkLengthType(size);
    } else if (isNull) {
      size = rstream.indexOf(0);

      if (size === -1) {
        throw new NotEnoughDataError(rstream.length + 1, rstream.length);
      }
    }

    const buf = rstream.readBuffer(size);
    bytes += size;

    if (isNull) {
      bytes += 1;
      rstream.consume(1);
    }

    return [buf, bytes];
  }

  /**
   * Get the number bytes of an encoded buffer.
   * @param {Buffer} buf
   * @returns {number}
   */
  function encodingLength(buf) {
    checkBuffer(buf);
    let size = 0;

    if (isnum) {
      return length;
    }

    if (isNull) {
      size = 1;
    } else if (istype) {
      size = length.encodingLength(buf.length);
    }

    return size + buf.length;
  }
}

/**
 * Check if item is a Buffer.
 * @param {any} buf
 * @private
 */
function checkBuffer(buf) {
  if (!Buffer.isBuffer(buf) && !(buf instanceof BinaryStream)) {
    throw new TypeError('Argument 1 should be a Buffer or a BinaryStream.');
  }
}

/**
 * Check the length of a Buffer to encode.
 * @param {number} requiredSize
 * @param {number} havingSize
 */
function checkLength(requiredSize, havingSize) {
  if (requiredSize !== havingSize) {
    throw new Error(
      `Buffer required length ${requiredSize} instead of ${havingSize}`
    );
  }
}

/**
 * Check if the length type is a number.
 * @param {any} length
 */
function checkLengthType(length) {
  if (typeof length !== 'number') {
    throw new TypeError('Length of a buffer should be a number.');
  }
}
