import { HomebridgeMock } from '../mocks/homebridgeMock';
import { OpenHAB2Client } from '../../src/services/openHAB2Client';
import { Sse } from '../../src/services/sse';

// Set up test environment
const chai = require('chai');

// Chai Things adds support to Chai for assertions on array elements.
chai.use(require('chai-things'));

// Chai as Promised extends Chai with a fluent language for asserting facts about promises.
chai.use(require('chai-as-promised'));

const expect = chai.expect;

// Get config
let config = require('../../config.json');

// Get mocked homebridge
const homebridge = new HomebridgeMock(config.platforms[0]);

// Get mocked accessory
const mockedAccessory = homebridge.getMockedPlatformAccessory();

// Start Plugin
const plugin = require('../../src/index');
plugin(homebridge);

describe("openHAB2 Platform", () => {
  describe("constructor", () => {
    it("should have a log", () => {
      expect(homebridge.platform.log).to.equal(HomebridgeMock.fakeConsole);
    });

    it("should have a config", () => {
      expect(homebridge.platform.config).to.equal(config.platforms[0]);
    });

    it("should have 0 accessories", () => {
      expect(homebridge.platform.accessories.size).to.equal(0);
      // console.dir(homebridge.platform.accessories, { depth: 3 });
    });

    it("should have a valid openHAB2Client instance", () => {
      expect(homebridge.platform.openHAB2Client).to.be.an.instanceof(OpenHAB2Client);
    });

    it("should have a valid sse instance", () => {
      expect(homebridge.platform.sse).to.be.an.instanceof(Sse);
    });
  });

  describe("configureAccessory", () => {
    it("should have 0 accessories with wrong accessory (without context)", () => {
      homebridge.platform.configureAccessory(homebridge.getMockedPlatformAccessoryWithoutContext());
      expect(homebridge.platform.accessories.size).to.equal(0);
    });

    it("should have 1 accessory", () => {
      homebridge.platform.configureAccessory(mockedAccessory);
      expect(homebridge.platform.accessories.size).to.equal(1);
    });
  });

  describe("removeAccessory", () => {
    it("should have 0 accessories", () => {
      homebridge.platform.removeAccessory(mockedAccessory);
      expect(homebridge.platform.accessories.size).to.equal(0);
    });
  });

  describe("didFinishLaunching", () => {

    it("should run correctly", () => {
      return expect(homebridge.platform.didFinishLaunching()).be.fulfilled;
    });

    it("should have 1 accessory", () => {
      expect(homebridge.platform.accessories.size).to.equal(1);
    });
  });

// Try to load accessories from server
//   homebridge.platform.didFinishLaunching();

  // describe("constructor", function() {
  //   it("should have a name", function() {
  //     expect(my.name).to.equal("Test Accessory");
  //   });
  //
  //   it("should have Characteristics", function() {
  //     expect(services).to.include.something.that.has.property('characteristics').that.includes.something;  // jshint ignore:line
  //   });
  //
  //   it("should have Characteristic 'On'", function() {
  //     expect(services[0].characteristics).to.include.something.with.property('displayName', 'On');
  //   });
  //
  //   it("should have Characteristic 'Brightness'", function() {
  //     expect(services[0].characteristics).to.include.something.with.property('displayName', 'Brightness');
  //   });
  //
  //   it("should have Characteristic 'Hue'", function() {
  //     expect(services[0].characteristics).to.include.something.with.property('displayName', 'Hue');
  //   });
  //
  //   it("should have Characteristic 'Saturation'", function() {
  //     expect(services[0].characteristics).to.include.something.with.property('displayName', 'Saturation');
  //   });
  // });
  //
  // describe("switch", function() {
  //   it("getPowerState", function(done) {
  //     my.getPowerState(function(err, val) { expect(val).to.equal(false); done(); });
  //   });
  //
  //   it("setPowerState: true", function(done) {
  //     my.setPowerState(true, function(err, val) { expect(err).to.equal(undefined); expect(val).to.equal("1"); done(); });
  //   });
  //
  //   it("setPowerState: false", function(done) {
  //     my.setPowerState(false, function(err, val) { expect(err).to.equal(undefined); expect(val).to.equal("0"); done(); });
  //   });
  // });
});