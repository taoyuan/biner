import {expect} from "../support";
import {BufferList} from '../../src/bl';

describe("BufferList", () => {

  it('append(Buffer)', () => {
    const bl = new BufferList();
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9]);

    bl.append(buf1);
    expect(bl.length).to.eql(buf1.length);

    bl.append([buf1, buf2]);
    expect(bl.length).to.eql(buf1.length * 2 + buf2.length);
  });

  it('append(BufferList)', () => {
    const bl = new BufferList();
    const src = new BufferList();
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9]);

    src.append([buf1, buf2]);

    bl.append(src);
    expect(bl.length).to.eql(buf1.length + buf2.length);

    bl.append(buf1);
    bl.append(src);
    expect(bl.length).to.eql(buf1.length * 3 + buf2.length * 2);
  });

  it('consume(bytes)', () => {
    const bl = new BufferList();
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9]);

    bl.append([buf1, buf2]);
    bl.consume(2);

    expect(bl.length).to.eql(buf1.length + buf2.length - 2);
    expect(bl.offset).to.eql(2);

    bl.consume(3);
    expect(bl.offset).to.eql(0);
    expect(bl.length).to.eql(buf2.length);
  });

  it('append() after consume()', () => {
    const bl = new BufferList();
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9]);

    bl.append(buf1);
    bl.consume(2);
    bl.append(buf2);

    expect(bl.offset).to.eql(0);
    expect(bl.length).to.eql(buf1.length + buf2.length - 2);
  });

  it('append(BufferList) after consume()', () => {
    const bl = new BufferList();

    const src1 = new BufferList();
    src1.append(Buffer.from([1, 2, 3, 4, 5]));

    const src2 = new BufferList();
    src2.append(Buffer.from([6, 7, 8, 9]));

    bl.append(src1);
    bl.consume(2);
    bl.append(src2);

    expect(bl.offset).to.eql(0);
    expect(bl.slice()).to.eql(Buffer.from([3, 4, 5, 6, 7, 8, 9]));
  });

  it('append consumed BufferList', () => {
    const bl = new BufferList();

    const src1 = new BufferList();
    src1.append(Buffer.from([1, 2, 3, 4, 5]));

    const src2 = new BufferList();
    src2.append(Buffer.from([6, 7, 8, 9]));
    src2.consume(2);

    bl.append(src1);
    bl.append(src2);

    expect(bl.offset).to.eql(0);
    expect(bl.slice()).to.eql(Buffer.from([1, 2, 3, 4, 5, 8, 9]));
  });

  it('get(i)', () => {
    const bl = new BufferList();
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9]);

    bl.append([buf1, buf2]);

    expect(bl.get(0)).to.eql(buf1[0]);
    expect(bl.get(bl.length - 1)).to.eql(buf2[3]);
    expect(bl.get(-1)).to.eql(buf2[3]);
    expect(bl.get(bl.length + 1)).to.eql(buf1[1]);

    bl.consume(2);

    expect(bl.get(0)).to.eql(buf1[2]);
    expect(bl.get(bl.length - 1)).to.eql(buf2[3]);
    expect(bl.get(-1)).to.eql(buf2[3]);
    expect(bl.get(bl.length + 1)).to.eql(buf1[3]);
  });

  it('indexOf(i)', () => {
    const bl = new BufferList();
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 0]);

    bl.append([buf1, buf2]);

    expect(bl.indexOf(1)).to.eql(0);
    expect(bl.indexOf(3)).to.eql(2);
    expect(bl.indexOf(5)).to.eql(4);
    expect(bl.indexOf(8)).to.eql(7);
    expect(bl.indexOf(0)).to.eql(8);

    bl.consume(2);
    expect(bl.indexOf(5)).to.eql(2);
    expect(bl.indexOf(8)).to.eql(5);
    expect(bl.indexOf(0)).to.eql(6);

    expect(() => bl.indexOf(-1)).throw('Invalid argument 1');
    expect(() => bl.indexOf(300)).throw('Invalid argument 1');
    expect(() => bl.indexOf(null)).throw('Invalid argument 1');
  });

  it('indexOf(i, offset)', () => {
    const bl = new BufferList();
    const buf1 = Buffer.from([1, 2, 3, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 9]);

    bl.append([buf1, buf2]);

    expect(bl.indexOf(3, 2)).to.eql(2);
    expect(bl.indexOf(8, 2)).to.eql(7);
    expect(bl.indexOf(8, 6)).to.eql(7);
    expect(bl.indexOf(9, 2)).to.eql(8);
    expect(bl.indexOf(9, 6)).to.eql(8);

    bl.consume(2);
    expect(bl.indexOf(8, 2)).to.eql(5);
    expect(bl.indexOf(8, 4)).to.eql(5);
  });

  it('indexOf(i, offset) multiple', () => {
    const bl = new BufferList();
    const buf1 = Buffer.from([1, 2, 0, 4, 5]);
    const buf2 = Buffer.from([6, 7, 8, 0]);

    bl.append([buf1, buf2]);

    expect(bl.indexOf(0, 2)).to.eql(2);
    expect(bl.indexOf(0, 6)).to.eql(8);

    bl.consume(2);
    expect(bl.indexOf(0, 0)).to.eql(0);
    expect(bl.indexOf(0, 4)).to.eql(6);
  });

  it('indexOf() index - offset = -1', () => {
    const buf = Buffer.from([1, 2, 3, 4, 5, 6, 0, 7, 8, 9, 10, 64, 21, 0]);
    const bl = new BufferList();

    bl.append(buf);

    expect(bl.indexOf(0)).to.eql(6);
    bl.consume(7);
    expect(bl.indexOf(0)).to.eql(6);
  });

});
