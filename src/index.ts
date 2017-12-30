'use strict';

import { OpenHAB2Platform } from './platform/openHAB2Platform';
import { PLATFORM_NAME, PLUGIN_NAME } from './config';
import { HomebridgeInterface } from './models/homebridge/homebridgeInterface';

export = (homebridge: HomebridgeInterface) => {
  console.log('homebridge API version: ' + homebridge.version);
  // TODO check old homebridge version
  // if (homebridge.version < 2) openHAB2Platform.init(homebridge);

  // For platform plugin to be considered as dynamic platform plugin,
  // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
  homebridge.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, OpenHAB2Platform, true);
};