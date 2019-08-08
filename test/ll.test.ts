import {expect} from "./support";
import {LinkedList}  from '..';

describe("LinkedList", () => {

  it('push(buf)', () => {
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9, 10]);
    const list = new LinkedList();

    list.push(buf1);
    list.push(buf2);

    expect(list.length).to.eql(buf1.length + buf2.length);
    expect(list.count).to.eql(2);
    expect(list.first).to.eql(buf1);
    expect(list.last).to.eql(buf2);
    expect(list.head && list.head.next).to.eql(list.tail);
  });

  it('unshift(buf)', () => {
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9, 10]);
    const list = new LinkedList();

    list.unshift(buf1);
    list.unshift(buf2);

    expect(list.length).to.eql(buf1.length + buf2.length);
    expect(list.count).to.eql(2);
    expect(list.first).to.eql(buf2);
    expect(list.last).to.eql(buf1);
    expect(list.head && list.head.next).to.eql(list.tail);
  });

  it('shift(buf)', () => {
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9, 10]);
    const list = new LinkedList();

    list.push(buf1);
    list.push(buf2);

    expect(list.shift()).to.eql(buf1);
    expect(list.count).to.eql(1);
    expect(list.length).to.eql(buf2.length);
    expect(list.first).to.eql(buf2);
    expect(list.last).to.eql(buf2);

    expect(list.shift()).to.eql(buf2);
    expect(list.count).to.eql(0);
    expect(list.length).to.eql(0);
    expect(list.first).to.eql(null);
    expect(list.last).to. eql(null);
  });

  it('slice() the whole chunk', () => {
    const list = new LinkedList();
    const buf1 = Buffer.from([1, 2, 3, 4]);
    const buf2 = Buffer.from([5, 6, 7, 8]);
    const buf3 = Buffer.from([9, 10, 11, 12]);

    list.push(buf1);
    list.push(buf2);
    list.push(buf3);

    const sublist = list.slice(0, buf1.length);
    expect(sublist.length).to.eql(buf1.length);
    expect(sublist.count).to.eql(1);
    expect(sublist.first).to.eql(buf1);
    expect(sublist.last).to.eql(buf1);
  });

  it('slice() first subset of a chunk', () => {
    const list = new LinkedList();
    const buf1 = Buffer.from([1, 2, 3, 4]);
    const buf2 = Buffer.from([5, 6, 7, 8]);
    const buf3 = Buffer.from([9, 10, 11, 12]);

    list.push(buf1);
    list.push(buf2);
    list.push(buf3);

    const length = buf2.length - 1;
    const sublist = list.slice(buf1.length, buf1.length + length);

    expect(sublist.length).to.eql(length);
    expect(sublist.count).to.eql(1);
    expect(sublist.first).to.eql(buf2.slice(0, length));
    expect(sublist.last).to.eql(buf2.slice(0, length));
  });

  it('slice() last subset of a chunk', () => {
    const list = new LinkedList();
    const buf1 = Buffer.from([1, 2, 3, 4]);
    const buf2 = Buffer.from([5, 6, 7, 8]);
    const buf3 = Buffer.from([9, 10, 11, 12]);

    list.push(buf1);
    list.push(buf2);
    list.push(buf3);

    const length = buf2.length - 1;
    const start = buf1.length + 1;
    const sublist = list.slice(start, start + length);

    expect(sublist.length).to.eql(length);
    expect(sublist.count).to.eql(1);
    expect(sublist.first).to.eql(buf2.slice(1, buf2.length));
    expect(sublist.last).to.eql(buf2.slice(1, buf2.length));
  });

  it('slice() multiple chunks by borders', () => {
    const list = new LinkedList();
    const buf1 = Buffer.from([1, 2, 3, 4]);
    const buf2 = Buffer.from([5, 6, 7, 8]);
    const buf3 = Buffer.from([9, 10, 11, 12]);

    list.push(buf1);
    list.push(buf2);
    list.push(buf3);

    const length = buf1.length + buf2.length;
    const sublist = list.slice(0, length);

    expect(sublist.length).to.eql(length);
    expect(sublist.count).to.eql(2);
    expect(sublist.first).to.eql(buf1);
    expect(sublist.last).to.eql(buf2);
  });

  it('slice() subset of multiple chunks', () => {
    const list = new LinkedList();
    const buf1 = Buffer.from([1, 2, 3, 4]);
    const buf2 = Buffer.from([5, 6, 7, 8]);
    const buf3 = Buffer.from([9, 10, 11, 12]);

    list.push(buf1);
    list.push(buf2);
    list.push(buf3);

    const length = 4;
    const start = 2;
    const sublist = list.slice(start, start + length);

    expect(sublist.length).to.eql(length);
    expect(sublist.count).to.eql(2);
    expect(sublist.first).to.eql(buf1.slice(2));
    expect(sublist.last).to.eql(buf2.slice(0, 2));
  });

  it('slice() subset of multiple chunks with the whole chunk', () => {
    const list = new LinkedList();
    const buf1 = Buffer.from([1, 2, 3, 4]);
    const buf2 = Buffer.from([5, 6, 7, 8]);
    const buf3 = Buffer.from([9, 10, 11, 12]);

    list.push(buf1);
    list.push(buf2);
    list.push(buf3);

    const length = 8;
    const start = 2;
    const sublist = list.slice(start, start + length);

    expect(sublist.length).to.eql(length);
    expect(sublist.count).to.eql(3);
    expect(sublist.first).to.eql(buf1.slice(2));
    expect(sublist.head && sublist.head.next && sublist.head.next.buffer).to.eql(buf2);
    expect(sublist.last).to.eql(buf3.slice(0, 2));
  });

  it('slice() duplicate', () => {
    const list = new LinkedList();
    const buf1 = Buffer.from([1, 2]);
    const buf2 = Buffer.from([5, 6, 7]);
    const buf3 = Buffer.from([9, 10, 11, 12]);

    list.push(buf1);
    list.push(buf2);
    list.push(buf3);

    const length = buf1.length + buf2.length + buf3.length;
    const sublist = list.slice(0, length);

    expect(sublist.length).to.eql(list.length);
    expect(sublist.count).to.eql(list.count);
    expect(sublist.first).to.eql(list.first);
    expect(sublist.head && sublist.head.next && sublist.head.next.buffer).to.eql(buf2);
    expect(sublist.last).to.eql(list.last);
  });

});
