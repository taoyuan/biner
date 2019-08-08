/**
 * A Leaf in a linked list.
 */
class Chunk {
  next?: Chunk;
  buffer: Buffer;

  constructor(buffer: Buffer, next?: Chunk) {
    this.buffer = buffer;
    this.next = next;
  }
}

/**
 * Linked list for buffers.
 */
export class LinkedList {

  head?: Chunk;
  tail?: Chunk;
  length: number = 0;
  count: number = 0;

  /**
   * Add a buffer to the end of the list.
   * @param {Buffer} buf
   */
  push(buf) {
    const entry = new Chunk(buf);

    // if (this.length > 0) {
    if (this.tail) {
      this.tail.next = entry;
    } else {
      this.head = entry;
    }

    this.tail = entry;
    this.length += buf.length;
    this.count += 1;
  }

  /**
   * Add a buffer to the start of the list.
   * @param {Buffer} buf
   */
  unshift(buf) {
    const entry = new Chunk(buf, this.head);

    if (this.isEmpty()) {
      this.tail = entry;
    }

    this.head = entry;
    this.length += buf.length;
    this.count += 1;
  }

  /**
   * Remove and return first element's buffer.
   */
  shift(): Buffer | undefined {
    if (this.isEmpty()) {
      return;
    }

    const ret = this.head && this.head.buffer;

    if (this.head === this.tail) {
      this.head = undefined;
      this.tail = undefined;
    } else if (this.head) {
      this.head = this.head.next;
    }

    if (ret) {
      this.length -= ret.length;
      this.length = Math.max(this.length, 0);
      this.count -= 1;
    }

    return ret;
  }

  /**
   * Get buffer of first element or null.
   * @returns {Buffer|null}
   */
  get first() {
    if (this.isEmpty()) {
      return null;
    }

    return this.head && this.head.buffer;
  }

  /**
   * Get buffer of last element or null.
   * @returns {Buffer|null}
   */
  get last() {
    if (this.isEmpty()) {
      return null;
    }

    return this.tail && this.tail.buffer;
  }

  /**
   * Check if a list is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.length === 0;
  }

  /**
   * Remove all elements from a list.
   */
  clear() {
    this.head = undefined;
    this.tail = undefined;
    this.length = 0;
    this.count = 0;
  }

  /**
   * Return a subset of linked list.
   * @param {number} start Offset bytes from start.
   * @param {number} end Bytes count.
   * @returns {LinkedList}
   */
  slice(start, end) {
    if (start < 0 || start >= this.length) {
      return new LinkedList();
    }

    if (end < 0 || end > this.length || end < start) {
      return new LinkedList();
    }

    const list = new LinkedList();

    let leaf = this.head;
    let offsetStart = start;
    let offsetEnd = end;

    // Find head of slice.
    while (leaf) {
      if (leaf.buffer.length > offsetStart) {
        if (offsetStart === 0 && leaf.buffer.length <= offsetEnd) {
          list.push(leaf.buffer);
        } else if (leaf.buffer.length >= offsetEnd) {
          list.push(leaf.buffer.slice(offsetStart, offsetEnd));
        } else {
          list.push(leaf.buffer.slice(offsetStart));
        }

        break;
      }

      offsetStart -= leaf.buffer.length;
      offsetEnd -= leaf.buffer.length;
      leaf = leaf.next;
    }

    // Find tail of slice
    if (leaf && (leaf.buffer.length < offsetEnd)) {
      while (leaf) {
        if (leaf.buffer.length === offsetEnd) {
          list.push(leaf.buffer);
          break;
        } else if (leaf.buffer.length > offsetEnd) {
          list.push(leaf.buffer.slice(0, offsetEnd));
          break;
        } else if (offsetStart < 0 && leaf.buffer.length < offsetEnd) {
          list.push(leaf.buffer);
        }

        offsetStart -= leaf.buffer.length;
        offsetEnd -= leaf.buffer.length;
        leaf = leaf.next;
      }
    }

    return list;
  }
}
