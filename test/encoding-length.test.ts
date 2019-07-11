import {spy, expect} from "./support";
import {encodingLength} from '../src';

describe('encodingLength', () => {
  it('should use schema', () => {
    const expectedSize = 5;

    const schema = {
      a: {
        encode() {
        },
        decode() {
        },
        encodingLength: spy(() => expectedSize),
      },
    };

    const obj = {
      a: 1,
    };

    expect(encodingLength(obj, schema)).to.eql(expectedSize);
    expect(schema.a.encodingLength).to.have.been.called();
  });

  it('should support nested schemas', () => {
    const expectedSize = 5;

    const schema = {
      a: {
        encode() {
        },
        decode() {
        },
        encodingLength: spy(() => expectedSize),
      },
      b: {
        c: {
          encode() {
          },
          decode() {
          },
          encodingLength: spy(() => expectedSize),
        },
      },
    };

    const obj = {
      a: 1,
      b: {
        c: 15,
      },
    };

    expect(encodingLength(obj, schema)).to.eql(expectedSize * 2);
    expect(schema.a.encodingLength).to.have.been.called.with(obj.a);
    expect(schema.b.c.encodingLength).to.have.been.called.with(obj.b.c);
  });
});
