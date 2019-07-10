import * as symbols from './symbols';

/**
 * Store extended info between encode/decode calls.
 */
export class Metadata {
  // Root node.
  node: any;

  // Current node.
  current: any;

  // The number of bytes are processed.
  [symbols.bytes]: number = 0;

  /**
   * The number of bytes are processed.
   * @returns {number}
   */
  get bytes() {
    return this[symbols.bytes];
  }

  /**
   * Clone provided metadata.
   * @param {Metadata} metadata
   * @returns {Metadata}
   */
  static clone(metadata) {
    const meta = new Metadata();

    if (metadata instanceof Metadata) {
      meta.node = metadata.node;
      meta.current = metadata.current;
    }

    return meta;
  }

  /**
   * Remove internal references to processed nodes.
   * @param {Metadata} metadata
   */
  static clean(metadata) {
    if (metadata instanceof Metadata) {
      metadata.node = undefined;
      metadata.current = undefined;
    }
  }
}
