import {expect, spy} from "./support";
import {reserved} from '../src/types/reserved';
import {BinaryStream, encode} from '../src';

describe('encode', () => {
  it('should encode objects using schema', () => {
    const wstream = new BinaryStream();

    const bytes1 = 33;
    const bytes2 = 10;

    const schema = {
      a: {
        encode: spy(() => bytes1),
      },
      b: {
        encode: spy(() => bytes2),
      },
    };

    const object = {
      a: 100,
      b: 200,
    };

    const [, count] = encode(object, schema, wstream);

    expect(schema.a.encode).to.have.been.called.exactly(1);
    expect(schema.b.encode).to.have.been.called.exactly(1);
    expect(count).to.eql(bytes1 + bytes2);
  });

  it('should encode reserved fields', () => {
    const wstream = new BinaryStream();

    const bytes1 = 33;
    const bytes2 = 10;

    const itemType = {
      encode: spy(() => bytes1),
      decode() {
      },
    };

    const schema = {
      a: {
        encode: spy(() => bytes2),
      },
      b: reserved(itemType, 1),
    };

    const object = {
      a: 100,
    };

    const [, count] = encode(object, schema, wstream);

    expect(schema.a.encode).to.be.called();
    expect(itemType.encode).to.be.called();
    expect(count).to.eql(bytes1 + bytes2);
  });

  it('each field should be a valid type', () => {
    const wstream = new BinaryStream();

    const schema = {
      a: null,
    };

    const expectedError = 'Argument `schema` should be a plain object.';

    expect(() => encode({}, schema, wstream)).throw(expectedError);
  });

  it('schema should be a plain object', () => {
    const wstream = new BinaryStream();
    const expectedError = 'Argument `schema` should be a plain object.';

    expect(() => encode({}, 123, wstream)).throw(expectedError);
    expect(() => encode({}, '123', wstream)).throw(expectedError);
    expect(() => encode({}, /.+/, wstream)).throw(expectedError);
  });

  it('should encode nexted objects', () => {
    const wstream = new BinaryStream();

    const bytes = 10;
    const encodeFn = spy(() => bytes);

    const schema = {
      a: {
        b: {
          encode: encodeFn,
        },
      },
      c: {
        encode: encodeFn,
      },
    };

    const object = {
      a: {
        b: 100,
      },
      c: 100,
    };

    const [, count] = encode(object, schema, wstream);
    expect(encodeFn).to.have.been.called.exactly(2);
    expect(count).to.eql(bytes * 2);
  });

  it('should create stream', () => {
    const bytes = 10;
    const schema = {
      a: {
        encode: spy(() => bytes),
      },
    };

    const object = {
      a: 100,
    };

    const [, count] = encode(object, schema);

    expect(schema.a.encode).to.have.been.called.exactly(1);
    expect(count).to.eql(bytes);
  });
});
