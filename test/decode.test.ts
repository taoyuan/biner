import {expect} from "./support";
import {reserved}  from '../src/types/reserved';
import {when}  from '../src/types/when';
import {BinaryStream, decode} from '../src';

describe('decode', () => {
  it('should use schema', () => {
    const rstream = new BinaryStream();
    const bytes = 10;

    const res1 = 100;
    const res2 = 200;

    const schema = {
      a: {
        decode: () => [res1, bytes],
      },
      b: {
        decode: () => [res2, bytes],
      },
    };

    const expectedResult = {
      a: res1,
      b: res2,
    };

    const [result, count] = decode(rstream, schema);
    expect(result).to.eql(expectedResult);
    expect(count).to.eql(bytes * 2);
  });

  it('should skip reserved field', () => {
    const rstream = new BinaryStream();
    const bytes = 10;
    const res1 = 100;
    const res2 = 200;

    const type1 = {
      decode: () => [res1, bytes],
    };

    const type2 = {
      decode: () => [res2, bytes],
      encode() {},
    };

    const schema = {
      a: type1,
      b: reserved(type2, 1),
    };

    const expectedResult = {
      a: res1,
    };

    const [result, count] = decode(rstream, schema);
    expect(result).to.eql(expectedResult);
    expect(count).to.eql(bytes * 2);
  });

  it('should set context', () => {
    const rstream = new BinaryStream();
    let called = false;

    const schema = {
      a: {
        decode: xdecode,
      },
    };

    function xdecode(rstream_) {
      expect(rstream_).to.eql(rstream);
      // eslint-disable-next-line no-invalid-this
      const context = this;

      expect(context).to.have.deep.property('node', {});
      expect(context).to.have.deep.property('current', {});
      called = true;
      return [undefined, 0];
    }

    decode(rstream, schema);
    expect(called).to.be.true;
  });

  it('schema should be a plain object', () => {
    const rstream = new BinaryStream();
    const expectedError = 'Argument #2 should be a plain object.';

    expect(() => decode(rstream, 123)).throw(expectedError);
    expect(() => decode(rstream, '123')).throw(expectedError);
    expect(() => decode(rstream, /.+/)).throw(expectedError);
  });

  it('each field should have a valid type', () => {
    const rstream = new BinaryStream();

    const schema = {
      a: null,
    };

    const expectedError = `Argument #2 should be a plain object.`;

    expect(() => decode(rstream, schema)).throw(expectedError);
  });

  it('should decode nested types', () => {
    const rstream = new BinaryStream();
    const res1 = 100;
    const bytes = 10;

    const schema = {
      a: {
        b: {
          decode: () => [res1, bytes],
        },
      },
      c: {
        decode: () => [res1, bytes],
      },
    };

    const expectedResult = {
      a: {
        b: res1,
      },
      c: res1,
    };

    const [result, count] = decode(rstream, schema);
    expect(result).to.eql(expectedResult);
    expect(count).to.eql(bytes * 2);
  });

  it('should decode buffers', () => {
    const buffer = Buffer.alloc(1);
    const bytes = 10;
    const res1 = 100;

    const schema = {
      a: {
        decode: () => [res1, bytes],
      },
    };

    const expectedResult = {
      a: res1,
    };

    const [result, count] = decode(buffer, schema);

    expect(result).to.eql(expectedResult);
    expect(count).to.eql(bytes);
  });

  it('should decode positive conditions', () => {
    const rstream = new BinaryStream();
    const bytes = 10;

    const res1 = 100;
    const res2 = 200;

    const type1 = {
      decode: () => [res1, bytes],
    };

    const type2 = {
      decode: () => [res2, bytes],
      encode() {},
    };

    const schema = {
      a: type1,
      b: when(() => true, type2),
    };

    const expectedResult = {
      a: res1,
      b: res2,
    };

    const [result, count] = decode(rstream, schema);

    expect(result).to.eql(expectedResult);
    expect(count).to.eql(bytes * 2);
  });

  it('should skip negative conditions', () => {
    const rstream = new BinaryStream();
    const bytes = 10;

    const res1 = 100;
    const res2 = 200;

    const type1 = {
      decode: () => [res1, bytes],
    };

    const type2 = {
      decode: () => [res2, bytes],
      encode() {},
    };

    const schema = {
      a: type1,
      b: when(() => false, type2),
    };

    const expectedResult = {
      a: res1,
    };

    const [result, count] = decode(rstream, schema);

    expect(result).to.eql(expectedResult);
    expect(count).to.eql(bytes);
  });
});
