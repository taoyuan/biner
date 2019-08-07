
import {expect, spy, noop} from "../support";
import {BinaryStream} from "../../src";
import {when} from '../../src/types/when';
import * as symbols from '../../src/internal/symbols';

describe('types/when', () => {
  it('encode positive', () => {
    const childBytes = 3;
    const childValue = 12;
    const wstream = new BinaryStream();

    const childType = {
      encode: spy(() => childBytes),
      decode: noop,
    };

    const context = {};

    const type = when(() => true, childType);
    const count = type.encode(childValue, wstream);

    expect(count).to.eql(childBytes);
    expect(type[symbols.skip]).to.eql(false);
    expect(childType.encode).to.have.been.called.exactly(1);
  });

  it('encode negative', () => {
    const childBytes = 3;
    const childValue = 12;
    const wstream = new BinaryStream();

    const childType = {
      encode: spy(() => childBytes),
      decode: noop,
    };

    const context = {};

    const type = when(() => false, childType);

    const count = type.encode(childValue, wstream);

    expect(count).to.eql(0);
    expect(type[symbols.skip]).to.eql(true);
    expect(childType.encode).to.have.been.called.exactly(0);
  });

  it('encodingLength positive', () => {
    const value = 123;
    const bytes = 10;

    const childType = {
      decode: noop,
      encode: noop,
      encodingLength: () => bytes,
    };

    const type = when(() => true, childType);

    expect(type.encodingLength(value)).to.eql(bytes);
  });

  it('encodingLength negative', () => {
    const value = 123;
    const bytes = 10;

    const childType = {
      decode: noop,
      encode: noop,
      encodingLength: () => bytes,
    };

    const type = when(() => false, childType);

    expect(type.encodingLength(value)).to.eql(0);
  });

  it('decode positive', () => {
    const childBytes = 3;
    const childValue = 12;
    const rstream = new BinaryStream();

    const childType = {
      decode: () => [childValue, childBytes],
      encode: noop,
    };

    const type = when(() => true, childType);
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(childValue);
    expect(count).to.eql(childBytes);
    expect(type[symbols.skip]).to.eql(false);
  });

  it('decode negative', () => {
    const childBytes = 3;
    const childValue = 12;
    const rstream = new BinaryStream();

    const childType = {
      decode: () => [childValue, childBytes],
      encode: noop,
    };

    const type = when(() => false, childType);
    const [result, count] = type.decode(rstream);

    expect(result).to.eql(undefined);
    expect(count).to.eql(0);
    expect(type[symbols.skip]).to.eql(true);
  });
});
