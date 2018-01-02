import { HomebridgeMock } from '../mocks/homebridgeMock';
import { OpenHAB2Client } from '../../src/services/openHAB2Client';
import { Sse } from '../../src/services/sse';
import { OpenHAB2Mock } from '../mocks/openHAB2Mock';
import { AccessoryFactory } from '../../src/services/accessoryFactory';
import { OpenHAB2DeviceInterface } from '../../src/models/platform/openHAB2DeviceInterface';

// Set up test environment
const chai = require('chai');

// Chai Things adds support to Chai for assertions on array elements.
chai.use(require('chai-things'));

const expect = chai.expect;

// Get config
let config = require('../../config.json');

// Get mocked openHAB
const mockedOpenHAB2 = new OpenHAB2Mock(config.platforms[0].port, config.platforms[0].sitemap, config.platforms[0].sitemap);

// Vars for mocked homebridge and accessory
let homebridge, mockedAccessory;

describe("openHAB2 Platform", () => {

  beforeEach(function(){
    mockedOpenHAB2.reset();

    mockedOpenHAB2.listen();

    // Set mocked homebridge
    homebridge = new HomebridgeMock(config.platforms[0]);

    // Set mocked accessory
    mockedAccessory = homebridge.getMockedPlatformAccessory();

    // Start Plugin
    const plugin = require('../../src/index');
    plugin(homebridge);
  });

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
      expect(homebridge.platform.accessories.size).to.equal(0);
      homebridge.platform.configureAccessory(mockedAccessory);
      expect(homebridge.platform.accessories.size).to.equal(1);
      homebridge.platform.removeAccessory(mockedAccessory);
      expect(homebridge.platform.accessories.size).to.equal(0);
    });
  });

  describe("didFinishLaunching", () => {

    it("should have 1 accessory", (done) => {
      homebridge.platform.didFinishLaunching().then(() => {
        expect(homebridge.platform.accessories.size).to.equal(1);
        done();
      })
    });
  });

  describe("addAccessory", () => {
    it("should have 1 accessory", (done) => {
      const openHAB2Client = new OpenHAB2Client(
        config.platforms[0].host,
        config.platforms[0].port,
        config.platforms[0].username,
        config.platforms[0].password,
        config.platforms[0].sitemap,
        HomebridgeMock.fakeConsole
      );
      openHAB2Client.getDevices()
        .then((devices: OpenHAB2DeviceInterface[]) => {
          if (devices.length > 0) {
            expect(homebridge.platform.accessories.size).to.equal(0);
            const openHAB2Accessory = AccessoryFactory.createAccessory(
              devices[0], homebridge.platform.constructor.accessory, homebridge.platform.constructor.service, homebridge.platform.constructor.characteristic, this
            );
            homebridge.platform.addAccessory(openHAB2Accessory);
            expect(homebridge.platform.accessories.size).to.equal(1);
            done();
          }
        });
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

  afterEach(function(){
    mockedOpenHAB2.close();
  });
});