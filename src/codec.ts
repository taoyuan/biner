import {BinaryStream} from "./binary-stream";
import * as symbols from "./internal/symbols";

export interface Codec<T> {
  [symbols.skip]?: boolean;
  encode(value: T, wstream: BinaryStream): number;
  decode(rstream: BinaryStream): [T, number];
  encodingLength(value: T): number;
}
