import {LinkedList} from './ll';

/**
 * An optimised partial implementation of Buffer list from `bl`.
 */
export class BufferList {

  queue: LinkedList = new LinkedList();
  offset: number = 0;

  /**
   * The number of bytes in list.
   * @returns {number}
   */
  get length() {
    return this.queue.length - this.offset;
  }

  /**
   * Adds an additional buffer or BufferList to the internal list.
   * @param {Buffer|Buffer[]|BufferList|BufferList[]} buf
   */
  append(buf) {
    if (Buffer.isBuffer(buf)) {
      if (this.offset > 0) {
        const head = this.queue.shift();
        if (!head) throw new Error("queue is empty but offset is greater than 0");
        this.queue.unshift(head.slice(this.offset));
        this.offset = 0;
      }

      this.queue.push(buf);
    } else if (Array.isArray(buf)) {
      for (let i = 0; i < buf.length; i += 1) {
        this.append(buf[i]);
      }
    } else if (buf instanceof BufferList) {
      if (this.offset > 0) {
        const head = this.queue.shift();
        if (!head) throw new Error("queue is empty but offset is greater than 0");
        this.queue.unshift(head.slice(this.offset));

        this.offset = 0;
      }

      if (buf.offset > 0) {
        const head = buf.queue.shift();
        if (!head) throw new Error("queue is empty but offset is greater than 0");
        buf.queue.unshift(head.slice(buf.offset));

        buf.offset = 0;
      }

      let leaf = buf.queue.head;

      while (leaf) {
        this.queue.push(leaf.buffer);
        leaf = leaf.next;
      }
    }
  }

  /* eslint-disable consistent-return */
  /**
   * Return the byte at the specified index.
   * @param {number} index Index of the byte in the Buffer list.
   * @returns {number}
   */
  get(index) {
    let i = index;

    while (i >= this.length) {
      i -= this.length;
    }

    while (i < 0) {
      i += this.length;
    }

    let leaf = this.queue.head;
    let {offset} = this;

    while (leaf) {
      if (leaf.buffer.length - offset > i) {
        return leaf.buffer[i + offset];
      }

      i -= leaf.buffer.length - offset;
      offset = 0;
      leaf = leaf.next;
    }
  }

  /* eslint-enable consistent-return */

  /**
   * Returns a new Buffer object containing the bytes within the range specified.
   * @param {number} start
   * @param {number} end
   * @returns {Buffer}
   */
  slice(start?: number, end?: number): Buffer {
    /* eslint-disable no-param-reassign */
    if (typeof start !== 'number') {
      start = 0;
    }

    if (typeof end !== 'number') {
      end = this.length;
    }

    while (start < 0) {
      start += this.length;
    }

    while (end < 0) {
      end += this.length;
    }

    end = Math.min(end, this.length);

    if (start >= this.length || end === 0) {
      return Buffer.alloc(0);
    }

    const tmpStart = start;
    start = Math.min(tmpStart, end);
    end = Math.max(tmpStart, end);

    const subset = this.queue.slice(start + this.offset, end + this.offset);

    // Buffer.concat() doesn't have optimization for count == 1
    if (subset.count === 1) {
      return <Buffer>subset.first;
    }

    let leaf = subset.head;
    const target = Buffer.allocUnsafe(subset.length);
    let offset = 0;

    for (let i = 0; i < subset.count; i += 1) if (leaf) {
      target.set(leaf.buffer, offset);
      offset += leaf.buffer.length;
      leaf = leaf.next;
    }

    return target;
    /* eslint-enable no-param-reassign */
  }

  /**
   * Return a string representation of the buffer.
   * @param {string} encoding
   * @param {number} start
   * @param {number} end
   * @returns {string}
   */
  toString(encoding, start, end) {
    return this.slice(start, end).toString(encoding);
  }

  /**
   * Shift bytes off the start of the list.
   * @param {number} bytes
   */
  consume(bytes) {
    let remainder = bytes;

    while (this.length > 0 && this.queue.first) {
      const firstLength = this.queue.first.length - this.offset;

      if (remainder >= firstLength) {
        this.queue.shift();

        remainder -= firstLength;
        this.offset = 0;
      } else {
        this.offset += remainder;
        break;
      }
    }
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
    /* eslint-disable no-param-reassign */
    if (!Number.isInteger(byte)) {
      throw new TypeError('Invalid argument 1');
    }

    if (byte < 0 || byte > 0xff) {
      throw new Error('Invalid argument 1');
    }

    if (!Number.isInteger(offset)) {
      offset = 0;
    }

    while (offset >= this.length) {
      offset -= this.length;
    }

    while (offset < 0) {
      offset += this.length;
    }

    let leaf = this.queue.head;
    let bias = 0;

    const next = () => {
      if (leaf) {
        bias += leaf.buffer.length;
        leaf = leaf.next;
      }
    };

    while (leaf) {
      let byteOffset = 0;

      if (leaf === this.queue.head) {
        byteOffset += this.offset;
      }

      // `offset` is point to next chunk
      if (offset >= leaf.buffer.length - byteOffset) {
        offset -= leaf.buffer.length - byteOffset;
        next();
        continue; // eslint-disable-line no-continue
      }

      // `offset` is point to current chunk
      if (offset < leaf.buffer.length) {
        byteOffset += offset;
      }

      const index = leaf.buffer.indexOf(byte, byteOffset);

      if (index > -1) {
        return index + bias - this.offset;
      }

      next();

      if (byteOffset > this.offset) {
        offset = 0;
      }
    }

    return -1;
    /* eslint-enable no-param-reassign */
  }

  protected doRead(method: string, size: number, offset: number = 0) {
    const start = offset + this.offset;
    const head = this.queue.first;
    if (!head) {
      throw new RangeError();
    }
    return head.length - start >= size ?
      head[method](start, size) : this.slice(offset, offset + size)[method](0, size);
  }

  protected doWrite(method: string, value: number, size: number) {
    const buf = Buffer.allocUnsafe(size);
    const ret = buf[method](value, 0, size);
    this.append(buf);
    return ret;
  }

  readDoubleBE(offset: number): number {
    return this.doRead('readDoubleBE', 8, offset);
  }

  readDoubleLE(offset: number): number {
    return this.doRead('readDoubleLE', 8, offset);
  }

  readFloatBE(offset: number): number {
    return this.doRead('readFloatBE', 4, offset);
  }

  readFloatLE(offset: number): number {
    return this.doRead('readFloatLE', 4, offset);
  }

  readInt16BE(offset: number): number {
    return this.doRead('readInt16BE', 2, offset);
  }

  readInt16LE(offset: number): number {
    return this.doRead('readInt16LE', 2, offset);
  }

  readInt32BE(offset: number): number {
    return this.doRead('readInt32BE', 4, offset);
  }

  readInt32LE(offset: number): number {
    return this.doRead('readInt32LE', 4, offset);
  }

  readInt8(offset: number): number {
    return this.doRead('readInt8', 1, offset);
  }

  readIntBE(offset: number, byteLength: number): number {
    return this.doRead('readIntBE', byteLength, offset);
  }

  readIntLE(offset: number, byteLength: number): number {
    return this.doRead('readIntLE', byteLength, offset);
  }

  readUInt16BE(offset: number): number {
    return this.doRead('readUInt16BE', 2, offset);
  }

  readUInt16LE(offset: number): number {
    return this.doRead('readUInt16LE', 2, offset);
  }

  readUInt32BE(offset: number): number {
    return this.doRead('readUInt32BE', 4, offset);
  }

  readUInt32LE(offset: number): number {
    return this.doRead('readUInt32LE', 4, offset);
  }

  readUInt8(offset: number): number {
    return this.doRead('readUInt8', 1, offset);
  }

  readUIntBE(offset: number, byteLength: number): number {
    return this.doRead('readUIntBE', byteLength, offset);
  }

  readUIntLE(offset: number, byteLength: number): number {
    return this.doRead('readUIntLE', byteLength, offset);
  }

  writeDoubleBE(value: number): number {
    return this.doWrite('writeDoubleBE', value, 8)
  }

  writeDoubleLE(value: number): number {
    return this.doWrite('writeDoubleLE', value, 8)
  }

  writeFloatBE(value: number): number {
    return this.doWrite('writeFloatBE', value, 4)
  }

  writeFloatLE(value: number): number {
    return this.doWrite('writeFloatLE', value, 4)
  }

  writeInt16BE(value: number): number {
    return this.doWrite('writeInt16BE', value, 2)
  }

  writeInt16LE(value: number): number {
    return this.doWrite('writeInt16LE', value, 2);
  }

  writeInt32BE(value: number): number {
    return this.doWrite('writeInt32BE', value, 4)
  }

  writeInt32LE(value: number): number {
    return this.doWrite('writeInt32LE', value, 4)
  }

  writeInt8(value: number): number {
    return this.doWrite('writeInt8', value, 1)
  }

  writeIntBE(value: number, byteLength: number): number {
    return this.doWrite('writeIntBE', value, byteLength);
  }

  writeIntLE(value: number, byteLength: number): number {
    return this.doWrite('writeIntLE', value, byteLength);
  }

  writeUInt16BE(value: number): number {
    return this.doWrite('writeUInt16BE', value, 2)
  }

  writeUInt16LE(value: number): number {
    return this.doWrite('writeUInt16LE', value, 2)
  }

  writeUInt32BE(value: number): number {
    return this.doWrite('writeUInt32BE', value, 4)
  }

  writeUInt32LE(value: number): number {
    return this.doWrite('writeUInt32LE', value, 4)
  }

  writeUInt8(value: number): number {
    return this.doWrite('writeUInt8', value, 1)
  }

  writeUIntBE(value: number, byteLength: number): number {
    return this.doWrite('writeUIntBE', value, byteLength);
  }

  writeUIntLE(value: number, byteLength: number): number {
    return this.doWrite('writeUIntLE', value, byteLength);
  }
}
