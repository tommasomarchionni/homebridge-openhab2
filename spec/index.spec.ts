import { HomebridgeMock } from './mocks/homebridgeMock';

// Set up test environment
const chai = require('chai');
//Chai Things adds support to Chai for assertions on array elements.
chai.use(require('chai-things'));
const expect = chai.expect;

// Get config
let config = require('../config.json');

// Get mocked homebridge
const homebridge = new HomebridgeMock(config.platforms[0]);

// Start Plugin
const plugin = require('../src/index');
plugin(homebridge);

describe("platform should init", () => {

  it("should pass correct log", () => {
    expect(homebridge.platform.log).to.equal(HomebridgeMock.fakeConsole);
  });

  it("should pass correct config", () => {
    expect(homebridge.platform.config).to.equal(config.platforms[0]);
  });
});
