'use strict';

import {NotEnoughDataError} from './not-enough-data-error';
import {BinaryStream} from "./binary-stream";
import {BufioReader} from "./bufio";

/**
 * Helps to read the whole data chunk.
 */
export class Transaction implements BufioReader {
  stream: BinaryStream;
  index: number;

  /**
   * @class Transaction
   * @param {DecodeStream} stream
   */
  constructor(stream: BinaryStream) {
    this.stream = stream;
    this.index = 0;
  }

  /**
   * @param {Buffer} buf
   */
  append(buf) {
    this.stream.append(buf);
  }

  /**
   * Confirm reading and removes data from stream.
   */
  commit() {
    this.stream.consume(this.index);
  }

  /**
   * Get byte from stream by index.
   * @param {number} i
   * @returns {number}
   */
  get(i = 0) {
    return this.stream.get(this.index + i);
  }

  /**
   * Get the number of bytes in stream.
   * @returns {number}
   */
  get length() {
    return this.stream.length;
  }

  /**
   * @param {number} [start]
   * @param {number} [end]
   * @returns {Buffer}
   */
  slice(start, end) {
    return this.stream.slice(start, end);
  }

  /**
   * @param {string} encoding
   * @param {number} [start]
   * @param {number} [end]
   * @returns {string}
   */
  toString(encoding, start, end) {
    return this.stream.toString(encoding, start, end);
  }

  /**
   * Read provided amount of bytes from stream.
   * @param {number} size
   * @returns {Buffer}
   */
  readBuffer(size) {
    assertSize(this.index + size, this.length);

    const buf = this.stream.slice(this.index, this.index + size);
    this.index += size;

    return buf;
  }

  /**
   * @param {number} byte
   * @param {number} [offset]
   * @returns {number}
   */
  indexOf(byte, offset = 0) {
    return this.stream.indexOf(byte, this.index + offset) - this.index;
  }


  protected __read(method: string, size: number) {
    assertSize(this.index + size, this.length);
    const value = this.stream.buffer[method](this.index, size);
    this.index += size;
    return value;
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
