import {expect, spy, noop} from "../support";
import {BinaryStream} from "../../src";
import {string} from '../../src/types/string';

describe('types/string', () => {
  describe('null string', () => {
    it('encode', () => {
      const str = 'qwerty';
      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');
      // @ts-ignore
      spy.on(wstream, 'writeInt8');

      const type = string(null);

      const count = type.encode(str, wstream);

      expect(count).to.eql(str.length + 1);
      expect(wstream.writeBuffer).to.have.been.called.with(Buffer.from(str, 'ascii'));
      expect(wstream.writeInt8).to.have.been.called.with(0);
    });

    it('decode', () => {
      const expectedValue = 'qwerty';
      const expectedLength = expectedValue.length + 1;

      const values = [1, 2, 3, 4, 5, 6, 0];

      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', () => Buffer.from(`${expectedValue}\0`));
      // @ts-ignore
      // spy.on(rstream, 'length', () => expectedLength);
      // @ts-ignore
      spy.on(rstream, 'indexOf', i => values.indexOf(i));

      const type = string(null);
      const [result, count] = type.decode(rstream);

      expect(result).to.eql(expectedValue);
      expect(count).to.eql(expectedLength);
      expect(rstream.readBuffer).to.have.been.called.with(expectedLength);
    });

    it('encodingLength', () => {
      const value = 'qwerty';
      const type = string(null);

      expect(type.encodingLength(value)).to.eql(value.length + 1);
    });
  });

  describe('fixed length', () => {
    it('encode', () => {
      const length = 3;
      const str = 'qwe';

      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');

      const type = string(length);
      const count = type.encode(str, wstream);

      expect(count).to.eql(length);
      expect(wstream.writeBuffer).to.have.been.called.with(Buffer.from(str, 'ascii'));
    });

    it('decode', () => {
      const str = 'qwe';
      const length = 3;
      const type = string(length);

      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', () => Buffer.from(str));

      const [result, count] = type.decode(rstream);

      expect(result).to.eql(str);
      expect(count).to.eql(length);
    });

    it('encodingLength', () => {
      const length = 3;
      const value = 'qw';
      const type = string(length);

      expect(type.encodingLength(value)).to.eql(length);
    });
  });

  describe('length is type', () => {
    it('encode', () => {
      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');

      const str = 'qwe';
      const lengthBytes = 3;
      const buf = Buffer.from(str, 'ascii');

      const lengthType = {
        decode: noop,
        encode: spy(() => lengthBytes),
      };

      const type = string(lengthType);
      const count = type.encode(str, wstream);

      expect(lengthType.encode).to.have.been.called.exactly(1);
      expect(lengthType.encode).to.have.been.called.with(str.length, wstream);
      expect(wstream.writeBuffer).to.have.been.called.exactly(1);
      expect(wstream.writeBuffer).to.have.been.called.with(buf);
      expect(count).to.eql(str.length + lengthBytes);
    });

    it('decode', () => {
      const str = 'qwe';
      const length = 3;
      const lengthBytes = 3;
      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', () => Buffer.from(str));

      const lengthType = {
        encode: noop,
        decode: () => [length, lengthBytes],
      };

      const type = string(lengthType);
      const [result, count] = type.decode(rstream);

      expect(result).to.eql(str);
      expect(count).to.eql(length + lengthBytes);
    });

    it('encodingLength', () => {
      const typeLength = 2;
      const str = 'qwe';

      const lengthType = {
        encode: noop,
        decode: noop,
        encodingLength: () => typeLength,
      };

      const type = string(lengthType);

      expect(type.encodingLength(str)).to.eql(typeLength + str.length);
    });
  });

  describe('length is callback', () => {
    it('encode', () => {
      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, 'writeBuffer');

      const str = 'qwe';
      const lengthBytes = 3;
      const buf = Buffer.from(str, 'ascii');

      const callback = spy(() => lengthBytes);

      const type = string(callback);
      const count = type.encode(str, wstream);

      expect(callback).to.have.been.called.exactly(1);
      expect(wstream.writeBuffer).to.have.been.called.exactly(1);
      expect(wstream.writeBuffer).to.have.been.called.with(buf);
      expect(count).to.eql(str.length);
    });

    it('decode', () => {
      const str = 'qwe';
      const buf = Buffer.from(str);
      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, 'readBuffer', () => str);


      const callback = spy(() => str.length);
      const type = string(callback);
      const [result, count] = type.decode(rstream);

      expect(result).to.eql(str);
      expect(rstream.readBuffer).to.have.been.called.exactly(1);
      expect(rstream.readBuffer).to.have.been.called.with(str.length);
      expect(callback).to.have.been.called.exactly(1);
      expect(count).to.eql(str.length);
    });

    it('encodingLength', () => {
      const str = 'qwe';

      const type = string(() => str.length * 2);
      expect(type.encodingLength(str)).to.eql(str.length);
    });
  });
});
