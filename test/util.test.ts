import {expect} from "chai";

import { isType } from '../src/util';

describe("util", () => {
  it('isType', () => {
    expect(
      isType({
        encode() {},
        decode() {},
      })
    ).be.be.true;

    expect(isType({})).to.be.false;
    expect(isType(null)).to.be.false;
    expect(isType({ encode() {} })).to.be.false;
    expect(isType({ decode() {} })).to.be.false;
  });

});
