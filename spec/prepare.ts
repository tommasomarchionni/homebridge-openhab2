import { OpenHAB2Mock } from './mocks/openHAB2Mock';
const prepare = require('mocha-prepare');

// Get mocked openHAB
const mockedOpenHAB2 = new OpenHAB2Mock();

prepare (function (done) {
  // called before loading of test cases

  // Get config
  let config = require('../config.json');

  // Change config port with openHAB mock server port
  config.platforms[0].port = mockedOpenHAB2.port;
  done();
}, function (done) {
  // mockedOpenHAB2.server.close();
  done();
});