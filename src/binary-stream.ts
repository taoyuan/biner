'use strict';

import {Transform} from 'stream';
import {BufferList} from './internal/buffer-list';
import {NotEnoughDataError} from './not-enough-data-error';
import {Bufio} from "./bufio";

/**
 * Binary data queue.
 * Also represent a part of BufferList API.
 */
export class BinaryStream extends Transform implements Bufio {
  _bl: BufferList;

  /**
   * @class Binary
   * @param {Object} options
   */
  constructor(options = {}) {
    super(options);

    this._bl = new BufferList();
  }

  /**
   * @returns {BufferList}
   */
  get buffer(): BufferList {
    return this._bl;
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
  slice(start?: number, end?: number) {
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

  protected doRead(method: string, size: number) {
    assertSize(size, this.length);

    let res = this.buffer[method](0, size);

    this.consume(size);

    return res;
  }

  protected doWrite(method: string, value: number, size?: number) {
    return size === undefined ? this.buffer[method](value) : this.buffer[method](value, size);
  }

  readDoubleBE(): number {
    return this.doRead('readDoubleBE', 8);
  }

  readDoubleLE(): number {
    return this.doRead('readDoubleLE', 8);
  }

  readFloatBE(): number {
    return this.doRead('readFloatBE', 4);
  }

  readFloatLE(): number {
    return this.doRead('readFloatLE', 4);
  }

  readInt16BE(): number {
    return this.doRead('readInt16BE', 2);
  }

  readInt16LE(): number {
    return this.doRead('readInt16LE', 2);
  }

  readInt32BE(): number {
    return this.doRead('readInt32BE', 4);
  }

  readInt32LE(): number {
    return this.doRead('readInt32LE', 4);
  }

  readInt8(): number {
    return this.doRead('readInt8', 1);
  }

  readIntBE(byteLength: number): number {
    return this.doRead('readIntBE', byteLength);
  }

  readIntLE(byteLength: number): number {
    return this.doRead('readIntLE', byteLength);
  }

  readUInt16BE(): number {
    return this.doRead('readUInt16BE', 2);
  }

  readUInt16LE(): number {
    return this.doRead('readUInt16LE', 2);
  }

  readUInt32BE(): number {
    return this.doRead('readUInt32BE', 4);
  }

  readUInt32LE(): number {
    return this.doRead('readUInt32LE', 4);
  }

  readUInt8(): number {
    return this.doRead('readUInt8', 1);
  }

  readUIntBE(byteLength: number): number {
    return this.doRead('readUIntBE', byteLength);
  }

  readUIntLE(byteLength: number): number {
    return this.doRead('readUIntLE', byteLength);
  }

  writeDoubleBE(value: number): number {
    return this.doWrite('writeDoubleBE', value)
  }

  writeDoubleLE(value: number): number {
    return this.doWrite('writeDoubleLE', value)
  }

  writeFloatBE(value: number): number {
    return this.doWrite('writeFloatBE', value)
  }

  writeFloatLE(value: number): number {
    return this.doWrite('writeFloatLE', value)
  }

  writeInt16BE(value: number): number {
    return this.doWrite('writeInt16BE', value)
  }

  writeInt16LE(value: number): number {
    return this.doWrite('writeInt16LE', value);
  }

  writeInt32BE(value: number): number {
    return this.doWrite('writeInt32BE', value)
  }

  writeInt32LE(value: number): number {
    return this.doWrite('writeInt32LE', value)
  }

  writeInt8(value: number): number {
    return this.doWrite('writeInt8', value)
  }

  writeIntBE(value: number, byteLength: number): number {
    return this.doWrite('writeIntBE', value, byteLength);
  }

  writeIntLE(value: number, byteLength: number): number {
    return this.doWrite('writeIntLE', value, byteLength);
  }

  writeUInt16BE(value: number): number {
    return this.doWrite('writeUInt16BE', value)
  }

  writeUInt16LE(value: number): number {
    return this.doWrite('writeUInt16LE', value)
  }

  writeUInt32BE(value: number): number {
    return this.doWrite('writeUInt32BE', value)
  }

  writeUInt32LE(value: number): number {
    return this.doWrite('writeUInt32LE', value)
  }

  writeUInt8(value: number): number {
    return this.doWrite('writeUInt8', value)
  }

  writeUIntBE(value: number, byteLength: number): number {
    return this.doWrite('writeUIntBE', value, byteLength);
  }

  writeUIntLE(value: number, byteLength: number): number {
    return this.doWrite('writeUIntLE', value, byteLength);
  }
}

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
