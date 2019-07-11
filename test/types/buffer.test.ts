import {expect, spy, noop} from "../support";
import {BinaryStream} from "../../src";
import {buffer} from '../../src/types/buffer';

describe('types/buffer', () => {
  describe('argument `length` is number', () => {
    it('encode', () => {
      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');

      const length = 2;
      const buf = Buffer.allocUnsafe(length);

      const type = buffer(length);

      const count = type.encode(buf, wstream);

      expect(wstream.writeBuffer).to.have.been.called.exactly(1);
      expect(wstream.writeBuffer).to.have.been.called.with(buf);
      expect(count).to.eql(length);
    });

    it('should not encode large buffer', () => {
      const length = 2;

      const wstream = new BinaryStream();

      const buf = Buffer.allocUnsafe(length + 1);
      const type = buffer(length);

      expect(() => type.encode(buf, wstream)).throw(
        `Buffer required length ${length} instead of ${buf.length}`
      );
    });

    it('decode', () => {
      const length = 2;
      const buf = Buffer.allocUnsafe(length);

      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', () => buf);

      const type = buffer(length);

      const [result, count] = type.decode(rstream);
      expect(result).to.eql(buf);
      expect(rstream.readBuffer).to.have.been.called.exactly(1);
      expect(rstream.readBuffer).to.have.been.called.with(length);
      expect(count).to.eql(length);
    });

    it('encodingLength', () => {
      const length = 2;

      const type = buffer(length);
      expect(type.encodingLength(Buffer.alloc(0))).to.eql(length);
    });
  });

  describe('argument `length` is type', () => {
    it('encode', () => {
      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');

      const length = 2;
      const lengthBytes = 3;
      const buf = Buffer.allocUnsafe(length);

      const lengthType = {
        decode: noop,
        encode: spy(() => lengthBytes),
      };

      const type = buffer(lengthType);
      const count = type.encode(buf, wstream);

      expect(lengthType.encode).to.have.been.called.exactly(1);
      expect(lengthType.encode).to.have.been.called.with(length, wstream);
      expect(wstream.writeBuffer).to.have.been.called.exactly(1);
      expect(wstream.writeBuffer).to.have.been.called.with(buf);
      expect(count).to.eql(length + lengthBytes);
    });

    it('decode', () => {
      const length = 2;
      const buf = Buffer.allocUnsafe(length);

      const lengthBytes = 5;

      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', () => buf);
      const lengthType = {
        decode: () => [length, lengthBytes],
        encode: noop,
      };

      const type = buffer(lengthType);
      const [result, count] = type.decode(rstream);

      expect(result).to.eql(buf);
      expect(rstream.readBuffer).to.have.been.called.exactly(1);
      expect(rstream.readBuffer).to.have.been.called.with(length);
      expect(count).to.eql(buf.length + lengthBytes);
    });

    it('encodingLength', () => {
      const length = 5;
      const typeLength = 2;
      const buf = Buffer.allocUnsafe(length);

      const lengthType = {
        encode: noop,
        decode: noop,
        encodingLength() {
          return typeLength;
        },
      };

      const type = buffer(lengthType);

      expect(type.encodingLength(buf)).to.eql(typeLength + length);
    });
  });

  describe('argument `length` is function', () => {
    it('decode', () => {
      const length = 2;
      const buf = Buffer.allocUnsafe(length);

      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', () => buf);

      const callback = spy(() => length);
      const type = buffer(callback);

      const [result, count] = type.decode(rstream);

      expect(result).to.eql(buf);
      expect(rstream.readBuffer).to.have.been.called.exactly(1);
      expect(rstream.readBuffer).to.have.been.called.with(length);
      expect(callback).to.have.been.called.exactly(1);
      expect(count).to.eql(length);
    });

    it('encode', () => {
      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');

      const length = 2;
      const buf = Buffer.allocUnsafe(length);

      const callback = spy(() => length);
      const type = buffer(callback);

      const count = type.encode(buf, wstream);

      expect(wstream.writeBuffer).to.have.been.called.exactly(1);
      expect(wstream.writeBuffer).to.have.been.called.with(buf);
      expect(callback).to.have.been.called.exactly(1);
      expect(count).to.eql(length);
    });

    it('encodingLength', () => {
      const length = 5;

      const type = buffer(() => length * 2);
      expect(type.encodingLength(Buffer.alloc(length))).to.eql(length);
    });
  });

  describe('argument `length` is null', () => {
    it('decode', () => {
      const buf = Buffer.from([1, 2, 3, 4, 5, 0, 5, 6, 7, 8]);
      const length = buf.indexOf(0);
      const expected = buf.slice(0, length);

      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', size => buf.slice(0, size));
      // @ts-ignore
      spy.on(rstream, 'indexOf', byte => buf.indexOf(byte));
      // @ts-ignore
      spy.on(rstream, 'consume');

      const type = buffer(null);
      const [result, count] = type.decode(rstream);

      expect(result).to.eql(expected);
      expect(count).to.eql(length + 1);
    });

    it('encode', () => {
      const buf = Buffer.from([1, 2, 3, 4, 5]);

      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');
      // @ts-ignore
      spy.on(wstream, 'writeUInt8');

      const type = buffer(null);

      const count = type.encode(buf, wstream);

      expect(wstream.writeBuffer).to.have.been.called.exactly(1);
      expect(wstream.writeBuffer).to.have.been.called.with(buf);
      expect(wstream.writeUInt8).to.have.been.called.exactly(1);
      expect(wstream.writeUInt8).to.have.been.called.with(0);
      expect(count).to.eql(buf.length + 1);
    });

    it('encodingLength', () => {
      const buf = Buffer.from([1, 2, 3, 4, 5]);
      const type = buffer(null);

      expect(type.encodingLength(buf)).to.eql(buf.length + 1);
    });
  });

  it('should be able to encode BinaryStream', () => {
    const buf = new BinaryStream();
    buf.writeBuffer(Buffer.from([1, 2]));
    buf.writeBuffer(Buffer.from([3, 4]));

    const wstream = new BinaryStream();
    const type = buffer(null);

    const count = type.encode(buf, wstream);

    expect(wstream.slice()).to.eql(Buffer.from([1, 2, 3, 4, 0]));
    expect(count).to.eql(buf.length + 1);
  });
});
