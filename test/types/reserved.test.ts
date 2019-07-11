import {expect, spy, noop} from "../support";
import {BinaryStream} from "../../src";
import {reserved} from '../../src/types/reserved';

describe('types/reserved', () => {
  describe('argument `size` is number', () => {
    it('encode', () => {
      const size = 2;
      const wstream = new BinaryStream();

      const itemType = {
        encode: spy(() => size),
        decode: noop,
      };

      const type = reserved(itemType, size);

      const count = type.encode('qqq', wstream);
      expect(itemType.encode).to.have.been.called.exactly(size);
      expect(count).to.eql(size * size);
    });

    it('decode', () => {
      const size = 2;
      const rstream = new BinaryStream();
      const bytes = 3;

      const itemType = {
        decode: spy(() => [undefined, bytes]),
        encode: noop,
      };

      const type = reserved(itemType, size);
      const [result, count] = type.decode(rstream);

      expect(result).to.be.undefined;
      expect(itemType.decode).to.have.been.called.exactly(size);
      expect(count).to.eql(size * bytes);
    });

    it('encodingLength', () => {
      const size = 4;
      const value = 1;
      const length = 2;

      const itemType = {
        decode: noop,
        encode: noop,
        encodingLength: () => length,
      };

      const type = reserved(itemType, size);

      expect(type.encodingLength(value)).to.eql(size * length);
    });
  });

  describe('argument `size` is function', () => {
    it('decode', () => {
      const bytes = 10;
      const size = 2;
      const rstream = new BinaryStream();

      const callback = spy(() => size);

      const itemType = {
        decode: () => [undefined, bytes],
        encode: noop,
      };

      const type = reserved(itemType, callback);
      const [result, count] = type.decode(rstream);

      expect(result).to.be.undefined;
      expect(callback).to.have.been.called.exactly(1);
      expect(count).to.eql(bytes * size);
    });

    it('encode', () => {
      const size = 2;
      const bytes = 3;
      const wstream = new BinaryStream();
      const callback = spy(() => size);

      const itemType = {
        encode: spy(() => bytes),
        decode: noop,
      };

      const type = reserved(itemType, callback);
      const count = type.encode('qqq', wstream);

      expect(itemType.encode).to.have.been.called.exactly(size);
      expect(callback).to.have.been.called.exactly(1);
      expect(count).to.eql(bytes * size);
    });

    it('encodingLength', () => {
      const size = 2;
      const value = 1;
      const callback = spy(() => size);
      const length = 2;

      const itemType = {
        decode: noop,
        encode: noop,
        encodingLength: () => length,
      };

      const type = reserved(itemType, callback);

      expect(type.encodingLength(value)).to.eql(size * length);
      expect(callback).to.have.been.called.exactly(1);
    });
  });
});
