export interface BinReader {
  readUInt8(): number;

  readUInt16LE(): number;

  readUInt16BE(): number;

  readUInt32LE(): number;

  readUInt32BE(): number;

  readInt8(): number;

  readInt16LE(): number;

  readInt16BE(): number;

  readInt32LE(): number;

  readInt32BE(): number;

  readFloatLE(): number;

  readFloatBE(): number;

  readDoubleLE(): number;

  readDoubleBE(): number;

  readUIntLE(byteLength: number): number;

  readUIntBE(byteLength: number): number;

  readIntLE(byteLength: number): number;

  readIntBE(byteLength: number): number;
}

export interface BinWriter {
  writeUInt8(value: number): number;

  writeUInt16LE(value: number): number;

  writeUInt16BE(value: number): number;

  writeUInt32LE(value: number): number;

  writeUInt32BE(value: number): number;

  writeInt8(value: number): number;

  writeInt16LE(value: number): number;

  writeInt16BE(value: number): number;

  writeInt32LE(value: number): number;

  writeInt32BE(value: number): number;

  writeFloatLE(value: number): number;

  writeFloatBE(value: number): number;

  writeDoubleLE(value: number): number;

  writeDoubleBE(value: number): number;

  writeUIntLE(value: number, byteLength: number): number;

  writeUIntBE(value: number, byteLength: number): number;

  writeIntLE(value: number, byteLength: number): number;

  writeIntBE(value: number, byteLength: number): number;
}

export interface BinReadWriter extends BinReader, BinWriter {

}
