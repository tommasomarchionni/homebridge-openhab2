import { HomebridgeMock } from '../mocks/homebridgeMock';
import { OpenHAB2Mock } from '../mocks/openHAB2Mock';
import { setTimeout } from 'timers';
import { Sse } from '../../src/services/sse';
import * as EventSource from 'eventsource'
import { SwitchAccessory } from '../../src/accessories/switchAccessory';
const request = require('request');

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

describe("openHAB2 Services", () => {

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

  describe("Sse", () => {
    it("should update accessory state", (done) => {
      homebridge.platform.didFinishLaunching()
        .then(() => {
          let device = homebridge.platform.accessories.get('Kitchen_Light').openHABAccessory;
          expect(device.state).to.equal('ON');
          request.put({
            headers: {'content-type' : 'text/plain'},
            url:     `http://localhost:${mockedOpenHAB2.port}/rest/items/Kitchen_Light`,
            body:    'OFF'
          }, (error, response, body) => {
            setTimeout(() => {
              device = homebridge.platform.accessories.get('Kitchen_Light').openHABAccessory;
              expect(device.state).to.equal('OFF');
              done()
            }, 500)
          });
        })
    });
    it("should correctly add event listener", (done) => {
      const sse = new Sse(homebridge.platform, homebridge.platform.service, homebridge.platform.characteristic);
      homebridge.platform.openHAB2Client
        .getSitemapEventsUrl()
        .then((url) => {
          sse.addEventListener(url);
          expect(sse.es).to.be.an.instanceof(EventSource);
          done()
        })
    });
    it("should correctly manage value", (done) => {
      homebridge.platform.didFinishLaunching()
        .then(() => {
          const sse = new Sse(homebridge.platform, homebridge.platform.service, homebridge.platform.characteristic);
          let device = {
            state: 'OFF',
            type: 'Switch',
            name: 'Kitchen_Light',
            label: 'Kitchen Light',
            category: 'light',
            tags: [ 'Lighting' ],
            groupNames: [ 'Kitchen', 'Lights' ]
          };
          sse.manageValue(device).then(() => {
            let accessory = <SwitchAccessory>homebridge.platform.accessories.get(device.name).openHABAccessory;
            expect(accessory.state).to.equal(device.state);
            device.state = "ON";
            sse.manageValue(device).then(() => {
              accessory = <SwitchAccessory>homebridge.platform.accessories.get(device.name).openHABAccessory;
              expect(accessory.state).to.equal(device.state);
              done();
            });
          })
        });
    })
  });

  afterEach(function(done){
    mockedOpenHAB2.server.close(done());
  });
});