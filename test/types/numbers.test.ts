import {expect, spy, noop} from "../support";
import {BinaryStream} from "../../src";
import {numbers} from '../../src/types/numbers';

const cases = [
    {name: "DoubleBE", size: 8},
    {name: "DoubleLE", size: 8},
    {name: "FloatBE", size: 4},
    {name: "FloatLE", size: 4},
    {name: "UInt8", size: 1},
    {name: "Int8", size: 1},
    {name: "UInt16BE", size: 2},
    {name: "UInt16LE", size: 2},
    {name: "Int16BE", size: 2},
    {name: "Int16LE", size: 2},
    {name: "UInt32BE", size: 4},
    {name: "UInt32LE", size: 4},
    {name: "Int32BE", size: 4},
    {name: "Int32LE", size: 4},
    {name: "UInt24BE", size: 3, method: 'UIntBE'},
    {name: "UInt24LE", size: 3, method: 'UIntLE'},
    {name: "Int24BE", size: 3, method: 'IntBE'},
    {name: "Int24LE", size: 3, method: 'IntLE'},
    {name: "UInt40BE", size: 5, method: 'UIntBE'},
    {name: "UInt40LE", size: 5, method: 'UIntLE'},
    {name: "Int40BE", size: 5, method: 'IntBE'},
    {name: "Int40LE", size: 5, method: 'IntLE'},
    {name: "UInt48BE", size: 6, method: 'UIntBE'},
    {name: "UInt48LE", size: 6, method: 'UIntLE'},
    {name: "Int48BE", size: 6, method: 'IntBE'},
    {name: "Int48LE", size: 6, method: 'IntLE'},
];

function itSpec({name, size, method}) {
  describe(name.toLowerCase(), () => {
    const numberType = numbers[name.toLowerCase()];
    const wfn: string = `write${method || name}`;
    const rfn: string = `read${method || name}`;

    it(wfn, () => {
      const value = 1;

      const wstream = new BinaryStream();
      // @ts-ignore
      spy.on(wstream, wfn);

      const count = numberType.encode(value, wstream);

      expect(wstream[wfn]).to.have.been.called.exactly(1);
      expect(count).to.eql(size);
    });

    it(rfn, () => {
      const value = 1;
      const rstream = new BinaryStream();
      // @ts-ignore
      spy.on(rstream, rfn, () => value);

      const [result, count] = numberType.decode(rstream);
      expect(result).to.eql(value);
      expect(rstream[rfn]).to.have.been.called.exactly(1);
      expect(count).to.eql(size);
    });

    it('size', () => {
      expect(numberType.encodingLength()).to.eql(size);
    });
  });
}

describe('types/numbers', () => cases.forEach(itSpec));
