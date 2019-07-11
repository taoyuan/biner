import {expect, spy, noop} from "../support";
import {array} from '../../src/types/array';
import {BinaryStream} from "../../src";

describe('types/array', () => {
  const rstream = new BinaryStream();

  describe('fixed length', () => {
    describe('length is the number of items', () => {
      it('encode', () => {
        const itemBytes = 7;
        const items = [10, 20];
        const wstream = new BinaryStream();

        const itemType = {
          decode() {
          },
          encode: spy(() => itemBytes),
        };

        const type = array(itemType, items.length);
        const count = type.encode(items, wstream);

        expect(itemType.encode).to.have.been.called.exactly(items.length);
        expect(count).to.eql(itemBytes * items.length);
      });

      it('throws when length != items.length', () => {
        const items = [10, 20];
        const wstream = new BinaryStream();

        const itemType = {
          decode() {
          },
          encode: spy(),
        };

        const requiredSize = items.length + 1;
        const type = array(itemType, requiredSize);

        expect(() => type.encode(items, wstream)).throw(
          `Argument #1 required length ${requiredSize} instead of ${items.length}`
        );
      });

      it('decode', () => {
        const length = 2;
        const bytes = 10;

        const first = 1;
        const second = 2;
        const items = [first, second];

        const itemType = {
          decode: () => [items.shift(), bytes],
          encode() {
          },
        };

        const type = array(itemType, length);
        const [result, count] = type.decode(rstream);

        expect(result).to.eql([first, second]);
        expect(count).to.eql(bytes * length);
      });

      it('encodingLength', () => {
        const items = [10, 20];
        const bytes = 3;

        const itemType = {
          encode() {
          },
          decode() {
          },
          encodingLength: () => bytes,
        };

        const type = array(itemType, items.length);

        expect(type.encodingLength(items)).to.eql(items.length * bytes);
      });
    });

    describe('length is the number of bytes', () => {
      it('encode', () => {
        const bytes = 7;
        const items = [10, 20];
        const length = bytes * items.length;
        const wstream = new BinaryStream();

        const itemType = {
          encode: spy(() => bytes),
          decode() {
          },
          encodingLength() {
            return bytes;
          },
        };

        const type = array(itemType, length, 'bytes');
        const count = type.encode(items, wstream);

        expect(itemType.encode).to.have.been.called.exactly(items.length);
        expect(count).to.eql(length);
      });

      it('decode', () => {
        const first = 1;
        const second = 2;
        const items = [first, second];

        const bytes = 3;
        const length = bytes * items.length;

        const itemType = {
          decode: () => [items.shift(), bytes],
          encode: noop,
        };

        const type = array(itemType, length, 'bytes');
        const [result, count] = type.decode(rstream);

        expect(result).to.eql([first, second]);
        expect(count).to.eql(length);
      });

      it('encodingLength', () => {
        const items = [10, 20];
        const bytes = 3;
        const length = items.length * bytes;

        const itemType = {
          encode: noop,
          decode: noop,
          encodingLength: () => bytes,
        };

        const type = array(itemType, length, 'bytes');

        expect(type.encodingLength(items)).to.eql(length);
      });
    });
  });

  describe('length is type', () => {
    describe('length is the number of items', () => {
      it('encode', () => {
        const items = [100, 200, 300];
        const wstream = new BinaryStream();
        const bytes1 = 2;
        const bytes2 = 3;

        const lengthType = {
          decode() {
          },
          encode: spy(() => bytes1),
        };

        const itemType = {
          decode: noop,
          encode: spy(() => bytes2),
        };

        const type = array(itemType, lengthType);
        const count = type.encode(items, wstream);

        expect(lengthType.encode).to.have.been.called.exactly(1);
        expect(lengthType.encode).to.have.been.called.with(items.length, wstream);
        expect(itemType.encode).to.have.been.called.exactly(items.length);
        expect(count).to.eql(bytes2 * items.length + bytes1);
      });

      it('decode', () => {
        const first = 1;
        const second = 2;
        const items = [first, second];

        const {length} = items;
        const itemBytes = 3;
        const lengthBytes = 3;

        const itemType = {
          decode: () => [items.shift(), itemBytes],
          encode: noop,
        };

        const lengthType = {
          decode: () => [length, lengthBytes],
          encode: noop,
        };

        const type = array(itemType, lengthType);
        const [result, count] = type.decode(rstream);

        expect(result).to.eql([first, second]);
        expect(count).to.eql(itemBytes * length + lengthBytes);
      });

      it('encodingLength', () => {
        const items = [10, 20];
        const itemBytes = 3;
        const lengthBytes = 5;

        const lengthType = {
          encode: noop,
          decode: noop,
          encodingLength: () => lengthBytes,
        };

        const itemType = {
          encode: noop,
          decode: noop,
          encodingLength: () => itemBytes,
        };

        const type = array(itemType, lengthType);

        expect(type.encodingLength(items)).to.eql(items.length * itemBytes + lengthBytes);
      });
    });

    describe('length is the number of bytes', () => {
      it('encode', () => {
        const items = [100, 200, 300];
        const itemBytes = 4;
        const wstream = new BinaryStream();

        const lengthType = {
          decode: noop,
          encode: spy(() => 2),
        };

        const itemType = {
          decode: noop,
          encode: spy(() => itemBytes),
          encodingLength: () => itemBytes,
        };

        const type = array(itemType, lengthType, 'bytes');
        const count = type.encode(items, wstream);

        expect(lengthType.encode).to.have.been.called.exactly(1);
        expect(lengthType.encode).to.have.been.called.with(
          items.length * itemBytes,
          wstream
        );
        expect(itemType.encode).to.have.been.called.exactly(items.length);
        expect(count).to.eql(itemBytes * items.length + 2);
      });

      it('decode', () => {
        const first = 1;
        const second = 2;
        const items = [first, second];

        const {length} = items;
        const itemBytes = 3;
        const lengthBytes = 3;

        const itemType = {
          decode: () => [items.shift(), itemBytes],
          encode: noop,
        };

        const lengthType = {
          decode: () => [length * itemBytes, lengthBytes],
          encode: noop,
        };

        const type = array(itemType, lengthType, 'bytes');
        const [result, count] = type.decode(rstream);

        expect(result).to.eql([first, second]);
        expect(count).to.eql(itemBytes * length + lengthBytes);
      });

      it('encodingLength', () => {
        const items = [10, 20];
        const itemBytes = 3;
        const lengthBytes = 5;

        const lengthType = {
          encode: noop,
          decode: noop,
          encodingLength: () => lengthBytes,
        };

        const itemType = {
          encode: noop,
          decode: noop,
          encodingLength: () => itemBytes,
        };

        const type = array(itemType, lengthType, 'bytes');

        expect(type.encodingLength(items)).to.eql(items.length * itemBytes + lengthBytes);
      });
    });
  });

  describe('item is an user defined type', () => {
    it('encode', () => {
      const wstream = new BinaryStream();
      const items = [{a: 100}, {a: 200}, {a: 300}];
      const itemBytes = 4;

      const schema = {
        a: {
          encode: spy(() => itemBytes),
          decode: noop,
        },
      };

      const type = array(schema, items.length);
      const count = type.encode(items, wstream);

      expect(schema.a.encode).to.have.been.called.exactly(items.length);
      expect(count).to.eql(itemBytes * items.length);
    });

    it('decode', () => {
      const firstItem = 1;
      const secondItem = 2;
      const items = [firstItem, secondItem];

      const {length} = items;
      const itemBytes = 2;

      const itemType = {
        decode: () => [items.shift(), itemBytes],
        encode: noop,
      };

      const schema = {
        a: itemType,
      };

      const type = array(schema, length);
      const [result, count] = type.decode(rstream);

      expect(result).to.eql([
        {a: firstItem},
        {a: secondItem},
      ]);
      expect(count).to.eql(itemBytes * length);
    });

    it('encodingLength', () => {
      const itemBytes = 3;
      const items = [{a: 100}, {a: 200}, {a: 300}];

      const schema = {
        a: {
          encode: noop,
          decode: noop,
          encodingLength: () => itemBytes,
        },
      };

      const type = array(schema, items.length);

      expect(type.encodingLength(items)).to.eql(itemBytes * items.length);
    });
  });

  describe('length is function', () => {
    describe('length is the number of items', () => {
      it('decode', () => {
        const first = 1;
        const second = 2;
        const items = [first, second];

        const {length} = items;
        const bytes = 3;

        const itemType = {
          decode: () => [items.shift(), bytes],
          encode: noop,
        };

        const callback = spy(() => length);

        const type = array(itemType, callback);

        const [result, count] = type.decode(rstream);
        expect(result).to.eql([first, second]);
        expect(callback).to.have.been.called.exactly(1);
        expect(count).to.eql(bytes * length);
      });

      it('encode', () => {
        const wstream = new BinaryStream();
        const items = [100, 200, 300];
        const {length} = items;
        const bytes = 4;

        const itemType = {
          decode: noop,
          encode: spy(() => bytes),
        };

        const callback = spy(() => length);

        const type = array(itemType, callback);
        const count = type.encode(items, wstream);

        expect(callback).to.have.been.called.exactly(1);
        expect(itemType.encode).to.have.been.called.exactly(items.length);
        expect(count).to.eql(bytes * items.length);
      });

      it('encodingLength', () => {
        const items = [10, 20];
        const bytes = 3;

        const itemType = {
          encode: noop,
          decode: noop,
          encodingLength: () => bytes,
        };

        const type = array(itemType, noop);

        expect(type.encodingLength(items)).to.eql(items.length * bytes);
      });
    });

    describe('length is the number of bytes', () => {
      it('decode', () => {
        const first = 1;
        const second = 2;
        const items = [first, second];

        const bytes = 3;
        const {length} = items;

        const itemType = {
          decode: () => [items.shift(), bytes],
          encode: noop,
        };

        const callback = spy(() => length * bytes);

        const type = array(itemType, callback, 'bytes');
        const [result, count] = type.decode(rstream);

        expect(result).to.eql([first, second]);
        expect(callback).to.have.been.called.exactly(1);
        expect(count).to.eql(length * bytes);
      });

      it('encode', () => {
        const wstream = new BinaryStream();
        const items = [100, 200, 300];

        const bytes = 4;
        const {length} = items;

        const callback = spy(() => length * bytes);

        const itemType = {
          decode: noop,
          encode: spy(() => bytes),
          encodingLength: () => bytes,
        };

        const type = array(itemType, callback, 'bytes');
        const count = type.encode(items, wstream);

        expect(callback).to.have.been.called.exactly(1);
        expect(itemType.encode).to.have.been.called.exactly(length);
        expect(count).to.eql(bytes * length);
      });

      it('encodingLength', () => {
        const items = [10, 20];
        const bytes = 3;
        const length = items.length * bytes;

        const itemType = {
          encode: noop,
          decode: noop,
          encodingLength: () => bytes,
        };

        const schema = array(itemType, noop, 'bytes');

        expect(schema.encodingLength(items)).to.eql(length);
      });
    });
  });
});
