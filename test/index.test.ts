import {expect} from "chai";
import binary = require('../src');

describe('createDecodeStream', () => {
  it('should accept buffer as first argument', () => {
    const length = 2;
    const buf = Buffer.allocUnsafe(length);

    const rstream = binary.createDecodeStream(buf);
    expect(rstream.length).to.equal(length);
    expect(rstream.readBuffer(length)).to.equal(buf);
  });

  it('should not accept buffer as first argument', () => {
    expect(binary.createDecodeStream().length).to.equal(0);
    expect(binary.createDecodeStream({}).length).to.equal(0);
  });
});
