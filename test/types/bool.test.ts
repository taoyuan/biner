import {expect, spy, noop} from "../support";
import {BinaryStream} from "../../src";
import {bool} from '../../src/types/bool';

describe('types/bool', () => {
  it('encode positive', () => {
    const wstream = new BinaryStream();
    const itemBytes = 5;

    const itemType = {
      decode: noop,
      encode: spy(() => itemBytes),
    };

    const type = bool(itemType);
    const count = type.encode(true, wstream);

    expect(itemType.encode).to.have.been.called.exactly(1);
    expect(itemType.encode).to.have.been.called.with(1, wstream);
    expect(count).to.eql(itemBytes);
  });

  it('encode negative', () => {
    const wstream = new BinaryStream();
    const itemBytes = 5;

    const itemType = {
      decode: noop,
      encode: spy(() => itemBytes),
    };

    const type = bool(itemType);
    const count = type.encode(false, wstream);

    expect(itemType.encode).to.have.been.called.exactly(1);
    expect(itemType.encode).to.have.been.called.with(0, wstream);
    expect(count).to.eql(itemBytes);
  });

  it('decode positive', () => {
    const rstream = new BinaryStream();
    const itemBytes = 10;

    const itemType = {
      decode: () => [1, itemBytes],
      encode: noop,
    };

    const type = bool(itemType);
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(true);
    expect(count).to.eql(itemBytes);
  });

  it('decode negative', () => {
    const rstream = new BinaryStream();
    const itemBytes = 10;

    const itemType = {
      decode: () => [0, itemBytes],
      encode: noop,
    };

    const type = bool(itemType);
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(false);
    expect(count).to.eql(itemBytes);
  });

  it('encodingLength', () => {
    const expectedLength = 4;
    const value = true;

    const itemType = {
      encode: noop,
      decode: noop,
      encodingLength: () => expectedLength,
    };

    const type = bool(itemType);
    expect(type.encodingLength(value)).to.eql(expectedLength);
  });
});
