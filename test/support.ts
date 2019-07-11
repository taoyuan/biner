import chai = require("chai");
import spies = require("chai-spies");

chai.use(spies);

const {expect, spy} = chai;

function noop() {
}

export {
  expect,
  spy,
  noop
}
