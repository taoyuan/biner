import {NotEnoughDataError} from './errors';
import {BinaryStream} from "./binary-stream";
import {BinReader} from "./binio";

/**
 * Helps to read the whole data chunk.
 */
export class Transaction implements BinReader {
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
  slice(start?: number, end?: number) {
    return this.stream.slice(start, end);
  }

  /**
   * @param {string} encoding
   * @param {number} [start]
   * @param {number} [end]
   * @returns {string}
   */
  toString(encoding?: string, start?: number, end?: number) {
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

  protected doRead(method: string, size: number) {
    assertSize(this.index + size, this.length);
    const value = this.stream.buffer[method](this.index, size);
    this.index += size;
    return value;
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
