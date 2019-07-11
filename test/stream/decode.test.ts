import {expect} from "../support";
import {BinaryStream, NotEnoughDataError}  from '../../src';

describe('stream/decode', () => {
  it('readBuffer', () => {
    const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6]);
    const stream = new BinaryStream();
    stream.append(buf);
    expect(stream.length).to.eql(buf.length);

    const wantRead = 2;

    const result = stream.readBuffer(wantRead);
    expect(stream.length).to.eql(buf.length - wantRead);
    expect(result).to.eql(Buffer.from([0x1, 0x2]));
  });

  it('readBuffer # out of bounds', () => {
    const buf = Buffer.from([0x1, 0x2]);
    const stream = new BinaryStream();
    stream.append(buf);
    const requestedBytes = buf.length + 1;

    expect(() => stream.readBuffer(requestedBytes)).throw(NotEnoughDataError);
  });

  it('default numbers', () => {
    const suites: [string, number, number][] = [
      /* Type, size, it value */
      ['DoubleBE', 8, Number.MAX_SAFE_INTEGER / 2],
      ['DoubleLE', 8, Number.MAX_SAFE_INTEGER / 2],

      ['FloatBE', 4, 0.5],
      ['FloatLE', 4, 0.5],

      ['Int8', 1, 127],
      ['UInt8', 1, 255],

      ['Int16BE', 2, 0x7fff - 1],
      ['Int16LE', 2, 0x7fff - 1],

      ['UInt16BE', 2, 0xffff - 1],
      ['UInt16LE', 2, 0xffff - 1],

      ['Int32BE', 4, 0x7fffffff - 1],
      ['Int32LE', 4, 0x7fffffff - 1],

      ['UInt32BE', 4, 0xffffffff - 1],
      ['UInt32LE', 4, 0xffffffff - 1],
    ];

    const buf = Buffer.allocUnsafe(10);

    for (const suite of suites) {
      const read = `read${suite[0]}`;
      const write = `write${suite[0]}`;

      buf.fill(0);
      buf[write](suite[2], 0);
      const stream = new BinaryStream();
      stream.append(buf);

      expect(stream[read]()).to.eql(suite[2]);
      expect(stream.length).to.eql(buf.length - suite[1]);
    }
  });

  describe('custom numbers', () => {
    const suites: [string, number, number][] = [
      /* Type, size, it value */
      ['IntBE', 3, 0x7fffff - 1],
      ['UIntBE', 3, 0xffffff - 1],

      ['IntLE', 3, 0x7fffff - 1],
      ['UIntLE', 3, 0xffffff - 1],
    ];

    const buf = Buffer.allocUnsafe(5);

    for (const suite of suites) {
      const read = `read${suite[0]}`;
      const write = `write${suite[0]}`;

      it(read, () => {
        buf.fill(0);
        buf[write](suite[2], 0, suite[1]);
        const stream = new BinaryStream();
        stream.append(buf);

        expect(stream[read](suite[1])).to.eql(suite[2]);
        expect(stream.length).to.eql(buf.length - suite[1]);
      });
    }
  });
});
