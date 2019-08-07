import {isUserType, isEncodeType, isType} from './util';

import * as symbols from './internal/symbols';
import {Metadata} from './internal/meta';
import {BinaryStream} from './binary-stream';


/**
 * @param {any} obj
 * @param {any} type
 * @param {BinaryStream} [target]
 * @returns {BinaryStream}
 */
export function encode(obj, type, target?: BinaryStream): [BinaryStream, number] {
  const meta = new Metadata();
  target = target || new BinaryStream(); // eslint-disable-line no-param-reassign

  encodeCommon(obj, target, type, meta);

  Metadata.clean(meta);

  return [target, meta.bytes];
}

/**
 * @param {any} object
 * @param {EncodeStream} wstream
 * @param {any} typeOrSchema
 * @param {Metadata} context
 */
export function encodeCommon(object, wstream, typeOrSchema, context) {
  if (isType(typeOrSchema)) {
    const bytes = typeOrSchema.encode.call(context, object, wstream);
    context[symbols.bytes] += bytes;
  } else {
    encodeSchema(object, wstream, typeOrSchema, context);
  }
}

/**
 * @param {any} object
 * @param {EncodeStream} wstream
 * @param {any} schema
 * @param {Metadata} context
 */
function encodeSchema(object, wstream, schema, context) {
  assertSchema(schema);

  if (context.node === undefined) {
    context.node = object;
    context.current = object;
  } else {
    context.current = object;
  }

  const keys = Object.keys(schema);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const type = schema[key];
    const value = object[key];

    if (!isEncodeType(type)) {
      encodeSchema(value, wstream, type, context);
      context.current = object;

      continue; // eslint-disable-line no-continue
    }

    const bytes = type.encode.call(context, value, wstream);
    context[symbols.bytes] += bytes;
  }
}

/**
 * Check if argument is schema.
 * @param {Object} schema
 * @private
 */
function assertSchema(schema) {
  if (!isUserType(schema)) {
    throw new TypeError('Argument `schema` should be a plain object.');
  }
}
