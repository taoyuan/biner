import {expect, spy, noop} from "../support";
import {BinaryStream} from "../../src";

import {when} from '../../src/types/when';
import {select} from '../../src/types/select';
import * as symbols from '../../src/internal/symbols';

describe('types/select', () => {
  const defaultValue = 322;
  const defaultBytes = 2;

  const defaultType = {
    decode: () => [defaultValue, defaultBytes],
    encode: noop,
  };

  const firstValue = 111;
  const firstBytes = 3;

  const firstType = {
    decode: () => [firstValue, firstBytes],
    encode: noop,
  };

  const secondValue = 222;
  const secondBytes = 4;

  const secondType = {
    decode: () => [secondValue, secondBytes],
    encode: noop,
  };

  it('decode first option', () => {
    const type = select(
      when(() => true, firstType),
      when(() => false, secondType),
      defaultType
    );

    const rstream = new BinaryStream();
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(firstValue);
    expect(count).to.eql(firstBytes);
    expect(type[symbols.skip]).to.eql(false);
  });

  it('decode second option', () => {
    const type = select(
      when(() => false, firstType),
      when(() => true, secondType),
      defaultType
    );

    const rstream = new BinaryStream();
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(secondValue);
    expect(count).to.eql(secondBytes);
    expect(type[symbols.skip]).to.eql(false);
  });

  it('decode default option', () => {
    const type = select(
      when(() => false, firstType),
      when(() => false, secondType),
      defaultType
    );

    const rstream = new BinaryStream();
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(defaultValue);
    expect(count).to.eql(defaultBytes);
    expect(type[symbols.skip]).to.eql(false);
  });

  it('skip after decode', () => {
    const type = select(
      when(() => false, firstType),
      when(() => false, secondType)
    );
    const rstream = new BinaryStream();
    type.decode(rstream);
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(undefined);
    expect(count).to.eql(0);
    expect(type[symbols.skip]).to.eql(true);
  });
});
