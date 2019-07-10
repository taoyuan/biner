'use strict';

import {Transform} from 'stream';
import {BufferList} from './internal/buffer-list';
import {NotEnoughDataError} from './not-enough-data-error';
import {Bufio} from "./bufio";

const kbuffer = Symbol('buffer');

/**
 * Binary data queue.
 * Also represent a part of BufferList API.
 */
export class BinaryStream extends Transform implements Bufio {
  [kbuffer]: BufferList;

  /**
   * @class Binary
   * @param {Object} options
   */
  constructor(options = {}) {
    super(options);

    this[kbuffer] = new BufferList();
  }

  /**
   * @returns {BufferList}
   */
  get buffer(): BufferList {
    return this[kbuffer];
  }

  /**
   * @returns {number}
   */
  get length() {
    return this.buffer.length;
  }

  /**
   * @param {Buffer} buf
   */
  append(buf) {
    this.buffer.append(buf);
  }

  /**
   * @param {number} i
   * @returns {number}
   */
  get(i) {
    return this.buffer.get(i);
  }

  /**
   * @param {number} [start]
   * @param {number} [end]
   * @returns {Buffer}
   */
  slice(start, end) {
    return this.buffer.slice(start, end);
  }

  /**
   * @param {number} bytes
   */
  consume(bytes) {
    this.buffer.consume(bytes);
  }

  /**
   * @param {string} encoding
   * @param {number} [start]
   * @param {number} [end]
   * @returns {string}
   */
  // @ts-ignore
  toString(encoding, start, end) {
    return this.buffer.toString(encoding, start, end);
  }

  /**
   * Returns the first (least) index of an element
   * within the list equal to the specified value,
   * or -1 if none is found.
   * @param {number} byte
   * @param {number} [offset]
   * @returns {number}
   */
  indexOf(byte, offset = 0) {
    return this.buffer.indexOf(byte, offset);
  }

  /**
   * Read provided amount of bytes from stream.
   * @param {number} size
   * @returns {Buffer}
   */
  readBuffer(size) {
    assertSize(size, this.length);

    const buf = this.slice(0, size);
    this.consume(size);

    return buf;
  }

  /**
   * Write provided chunk to the stream.
   * @param {Buffer} chunk
   */
  writeBuffer(chunk) {
    this.append(chunk);
  }

  protected __read(method: string, size: number, offset: number = 0) {
    assertSize(size, this.length);

    let res: number;
    if (this.buffer[method] && this.buffer[method].length > 1) {
      res = this.buffer[method](offset, size);
    } else {
      res = this.buffer[method](offset);
    }

    this.consume(size);

    return res;
  }

  protected __write(method: string, value: number, offset?: number, size?: number) {
    return this.buffer[method](value, offset, size);
  }

  readDoubleBE(offset: number): number {
    return this.__read(arguments.callee.name, 8);
  }

  readDoubleLE(offset: number): number {
    return this.__read(arguments.callee.name, 8);
  }

  readFloatBE(offset: number): number {
    return this.__read(arguments.callee.name, 4);
  }

  readFloatLE(offset: number): number {
    return this.__read(arguments.callee.name, 4);
  }

  readInt16BE(offset: number): number {
    return this.__read(arguments.callee.name, 2);
  }

  readInt16LE(offset: number): number {
    return this.__read(arguments.callee.name, 2);
  }

  readInt32BE(offset: number): number {
    return this.__read(arguments.callee.name, 4);
  }

  readInt32LE(offset: number): number {
    return this.__read(arguments.callee.name, 4);
  }

  readInt8(offset: number): number {
    return this.__read(arguments.callee.name, 1);
  }

  readIntBE(offset: number, byteLength: number): number {
    return this.__read(arguments.callee.name, byteLength);
  }

  readIntLE(offset: number, byteLength: number): number {
    return this.__read(arguments.callee.name, byteLength);
  }

  readUInt16BE(offset: number): number {
    return this.__read(arguments.callee.name, 2);
  }

  readUInt16LE(offset: number): number {
    return this.__read(arguments.callee.name, 2);
  }

  readUInt32BE(offset: number): number {
    return this.__read(arguments.callee.name, 4);
  }

  readUInt32LE(offset: number): number {
    return this.__read(arguments.callee.name, 4);
  }

  readUInt8(offset: number): number {
    return this.__read(arguments.callee.name, 1);
  }

  readUIntBE(offset: number, byteLength: number): number {
    return this.__read(arguments.callee.name, byteLength);
  }

  readUIntLE(offset: number, byteLength: number): number {
    return this.__read(arguments.callee.name, byteLength);
  }

  writeDoubleBE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeDoubleLE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeFloatBE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeFloatLE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeInt16BE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeInt16LE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset);
  }

  writeInt32BE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeInt32LE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeInt8(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeIntBE(value: number, offset: number, byteLength: number): number {
    return this.__write(arguments.callee.name, value, offset, byteLength);
  }

  writeIntLE(value: number, offset: number, byteLength: number): number {
    return this.__write(arguments.callee.name, value, offset, byteLength);
  }

  writeUInt16BE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeUInt16LE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeUInt32BE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeUInt32LE(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeUInt8(value: number, offset?: number): number {
    return this.__write(arguments.callee.name, value, offset)
  }

  writeUIntBE(value: number, offset: number, byteLength: number): number {
    return this.__write(arguments.callee.name, value, offset, byteLength);
  }

  writeUIntLE(value: number, offset: number, byteLength: number): number {
    return this.__write(arguments.callee.name, value, offset, byteLength);
  }

}

//
// const fixedReadMethods = {
//   readDoubleBE: 8,
//   readDoubleLE: 8,
//   readFloatBE: 4,
//   readFloatLE: 4,
//   readInt32BE: 4,
//   readInt32LE: 4,
//   readUInt32BE: 4,
//   readUInt32LE: 4,
//   readInt16BE: 2,
//   readInt16LE: 2,
//   readUInt16BE: 2,
//   readUInt16LE: 2,
//   readInt8: 1,
//   readUInt8: 1,
// };
//
// const metaReadMethods = ['readIntBE', 'readIntLE', 'readUIntBE', 'readUIntLE'];
//
// Object.keys(fixedReadMethods).forEach(method => {
//   const gen = createFunction();
//
//   gen(`
//     function binary_${method}() {
//       const bytes = ${gen.formats.d(fixedReadMethods[method])};
//       assertSize(bytes, this.length);
//
//       const res = this.buffer.${method}(0);
//       this.consume(bytes);
//
//       return res;
//     }
//   `);
//
//   BinaryStream.prototype[method] = gen.toFunction({assertSize});
// });
//
// metaReadMethods.forEach(method => {
//   const gen = createFunction();
//
//   gen(`
//     function binary_${method}(size) {
//       assertSize(size, this.length);
//
//       const res = this.buffer.${method}(size, 0);
//       this.consume(size);
//       return res;
//     }
//   `);
//
//   BinaryStream.prototype[method] = gen.toFunction({assertSize});
// });
//
// const fixedWriteMethods = [
//   'writeDoubleBE',
//   'writeDoubleLE',
//   'writeFloatBE',
//   'writeFloatLE',
//   'writeInt32BE',
//   'writeInt32LE',
//   'writeUInt32BE',
//   'writeUInt32LE',
//   'writeInt16BE',
//   'writeInt16LE',
//   'writeUInt16BE',
//   'writeUInt16LE',
//   'writeInt8',
//   'writeUInt8',
// ];
//
// fixedWriteMethods.forEach(method => {
//   const gen = createFunction();
//
//   gen(`
//     function binary_${method}(value) {
//       this.buffer.${method}(value);
//     }
//   `);
//
//   BinaryStream.prototype[method] = gen.toFunction();
// });
//
// const metaWriteMethods = [
//   'writeIntBE',
//   'writeIntLE',
//   'writeUIntBE',
//   'writeUIntLE',
// ];
//
// metaWriteMethods.forEach(method => {
//   const gen = createFunction();
//
//   gen(`
//     function binary_${method}(value, size) {
//       this.buffer.${method}(value, size);
//     }
//   `);
//
//   BinaryStream.prototype[method] = gen.toFunction();
// });

/**
 * Check if stream is able to read requested amound of data.
 * @param {number} size Requested data size to read.
 * @param {number} length The number of bytes in stream.
 */
function assertSize(size, length) {
  if (size > length) {
    throw new NotEnoughDataError(size, length);
  }
}
