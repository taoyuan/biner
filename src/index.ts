import {BinaryStream} from './bs';
import {array} from './types/array';
import {buffer} from './types/buffer';
import {bool} from './types/bool';
import {reserved} from './types/reserved';
import {string} from './types/string';
import {numbers} from './types/numbers';
import {when} from './types/when';
import {select} from './types/select';
import {encode} from './encode';
import {decode} from './decode';
import {encodingLength} from './encoding-length';
import {Transaction} from './transaction';
import {NotEnoughDataError} from './errors';

const types = {
  ...numbers,
  array,
  bool,
  buffer,
  reserved,
  string,
  when,
  select,
};

export interface Schema {
  [name: string]: any;
}

/**
 * Create transform stream to encode objects into Buffer.
 * @param {Object} [schema]
 * @returns {BinaryStream}
 */
export function createEncodeStream(schema?: Schema): BinaryStream {
  return new BinaryStream({
    readableObjectMode: false,
    writableObjectMode: true,
    transform: createTransformEncode(schema),
  });
}

/**
 * Create transform stream to decode binary data into object.
 * @param {Buffer|Object} [bufOrSchema]
 * @returns {BinaryStream}
 */
export function createDecodeStream(bufOrSchema?: Buffer | Schema) {
  let schema: Schema | undefined = undefined;
  const isBuffer = Buffer.isBuffer(bufOrSchema);

  if (bufOrSchema && !isBuffer) {
    schema = bufOrSchema;
  }

  const stream = new BinaryStream({
    transform: createTransformDecode(schema),
    readableObjectMode: true,
    writableObjectMode: false,
  });

  if (isBuffer) {
    stream.append(bufOrSchema);
  }

  return stream;
}

/**
 * The `transform` function for transform stream.
 */
function createTransformEncode(schema?: Schema) {
  return function transformEncode(this: BinaryStream, chunk, encoding, cb) {
    try {
      encode(chunk, schema, this);

      const buf = this.slice();
      this.consume(buf.length);

      cb(null, buf);
    } catch (error) {
      cb(error);
    }
  }
}


/**
 * The `transform` function for transform stream.
 */
function createTransformDecode(schema?: Schema) {
  return function (this: BinaryStream, chunk, encoding, cb) {
    this.append(chunk);

    try {
      while (this.length > 0) {
        const transaction = new Transaction(this);
        const data = decode(transaction, schema);

        transaction.commit();
        this.push(data);
      }

      cb();
    } catch (error) {
      if (error instanceof NotEnoughDataError) {
        cb();
      } else {
        cb(error);
      }
    }
  }
}

export * from './errors';
export * from './binio';
export * from './transaction';
export * from './bl';
export * from './ll';
export * from './bs';

export const createEncode = createEncodeStream;
export const createDecode = createDecodeStream;

export {
  /* Main api */
  encode,
  decode,
  encodingLength,

  /* Data types */
  types,
}
