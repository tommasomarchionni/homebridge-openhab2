"use strict";

import { RollershutterAccessory } from './rollershutterAccessory';

export class ReverseRollershutterAccessory extends RollershutterAccessory {

  reverse = true;

  static isValid(device) {
    return device.tags.indexOf('ReverseWindowCovering') > -1 && ['Rollershutter'].indexOf(device.type) > -1
  }
}