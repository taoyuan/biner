import {expect} from "chai";
import {BinaryStream} from '../src';
import {Transaction} from '../src/transaction';
import {NotEnoughDataError} from '../src';

describe("transaction", () => {

  it('should work', () => {
    const stream = new BinaryStream();

    stream.buffer.writeUInt8(10);
    stream.buffer.writeUInt16BE(111);
    stream.buffer.writeUInt32BE(1e5);

    const size = stream.length;
    const bytes = 1 + 2 + 4;

    const transaction = new Transaction(stream);
    expect(transaction.length).to.equal(size);

    expect(transaction.readUInt8()).to.equal(10);
    expect(transaction.readUInt16BE()).to.equal(111);
    expect(transaction.readUInt32BE()).to.equal(1e5);

    expect(stream.length).to.equal(size);
    expect(transaction.length).to.equal(size);

    transaction.commit();
    expect(stream.length).to.equal(size - bytes);
  });

  it('should read buffer', () => {
    const stream = new BinaryStream();
    const transaction = new Transaction(stream);

    stream.append(Buffer.from([1, 2, 3, 4]));
    stream.append(Buffer.from([1, 2, 3, 4, 9]));

    const size = stream.length;
    expect(transaction.length).to.equal(size);

    expect(transaction.indexOf(3)).to.equal(2);
    expect(transaction.readBuffer(3)).to.eql(Buffer.from([1, 2, 3]));
    expect(transaction.get(0)).to.equal(4);
    expect(transaction.indexOf(3)).to.equal(3);
    expect(transaction.readBuffer(5)).to.eql(Buffer.from([4, 1, 2, 3, 4]));

    expect(stream.length).to.equal(size);
    expect(transaction.length).to.equal(size);

    transaction.commit();
    expect(stream.length).to.equal(size - 8);
  });

  it('should have `bl` methods', () => {
    const stream = new BinaryStream();
    const transaction = new Transaction(stream);
    const buffer = Buffer.from([1, 2, 3, 4]);

    transaction.append(buffer);
    expect(stream.length).to.equal(buffer.length);

    expect(transaction.slice(0, 2)).to.eql(buffer.slice(0, 2));
    expect(transaction.toString('hex')).to.equal(buffer.toString('hex'));
  });

  it('should emit NotEnoughDataError', () => {
    const stream = new BinaryStream();
    const transaction = new Transaction(stream);

    expect(() => transaction.readUIntBE(2)).to.throw(NotEnoughDataError);

    transaction.append(Buffer.alloc(2));
    expect(() => transaction.readBuffer(3)).to.throw(NotEnoughDataError);
  });

});
