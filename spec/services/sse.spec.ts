import { HomebridgeMock } from '../mocks/homebridgeMock';
import { OpenHAB2Mock } from '../mocks/openHAB2Mock';
import { setTimeout } from 'timers';
const request = require('request');

// Set up test environment
const chai = require('chai');
//Chai Things adds support to Chai for assertions on array elements.
chai.use(require('chai-things'));
const expect = chai.expect;

// Get config
let config = require('../../config.json');


// Get mocked homebridge
const homebridge = new HomebridgeMock(config.platforms[0]);

// Start Plugin
const plugin = require('../../src/index');
plugin(homebridge);

describe("openHAB2 Services", () => {
  describe("Sse", () => {
    it("should update accessory state", () => {
      homebridge.platform.didFinishLaunching()
        .then(() => {
//           let device = homebridge.platform.accessories.get('Kitchen_Light').openHABAccessory.device;
//           expect(device.state).to.equal('ON');
//
//
//           console.log(mockedOpenHAB2);
//
//           setTimeout(() => {
//             request.put({
//               headers: {'content-type' : 'text/plain'},
//               url:     `http://localhost:${mockedOpenHAB2.port}/rest/items/Kitchen_Light`,
//               body:    'OFF'
//             }, (error, response, body) => {
//               setTimeout(() => {
//                 let device = homebridge.platform.accessories.get('Kitchen_Light').openHABAccessory.device;
//                 expect(device.state).to.equal('OFF');
//                 mockedOpenHAB2.server.close()
//               }, 1000)
//             });
//           }, 1000)
//         }).catch((err) =>{
//         console.log(err);
        })
    });
  });
});