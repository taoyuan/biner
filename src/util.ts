'use strict';

import {DataType} from "./common";

export function isObject(val) {
  return val != null && typeof val === 'object' && !Array.isArray(val);
}

function isObjectObject(o) {
  return isObject(o) === true && Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  let ctor, prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

export const isUserType: (o: any) => boolean = isPlainObject;

export function isNull(value): value is null {
  return value == null;
}

export function isNumber(value): value is number {
  return typeof value === 'number';
}

/**
 * Check if argument is data type.
 * @param {*} type
 * @returns {boolean}
 */
export function isType(type): type is DataType {
  return isObject(type) && isFunction(type.encode) && isFunction(type.decode);
}

/**
 * Check if argument is function.
 * @param {*} value
 * @returns {boolean}
 export */
export function isFunction(value): value is Function {
  return typeof value === 'function';
}

// /**
//  * Check if argument is object.
//  * @param {*} value
//  * @returns {boolean}
//  */
// export function isObject(value) {
//   return typeof value === 'object' && value !== null;
// }

/**
 * Check if argument is data type and able to decode data.
 * @param {*} type
 * @returns {boolean}
 */
export function isDecodeType(type) {
  return isObject(type) && isFunction(type.decode);
}

/**
 * Check if argument is data type and able to encode data.
 * @param {*} type
 * @returns {boolean}
 */
export function isEncodeType(type) {
  return isObject(type) && isFunction(type.encode);
}
