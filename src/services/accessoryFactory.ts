'use strict';

import { SwitchAccessory } from '../accessories/switchAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { OpenHAB2Platform } from '../platform/openHAB2Platform';

export class AccessoryFactory {
  // TODO filter accessory based on tag
  static isValid(device: OpenHAB2DeviceInterface): boolean {
    return device.type  === 'Switch';
  }

  // TODO create accessory based on tag
  static createAccessory(device: OpenHAB2DeviceInterface, hapAccessory, hapService, hapCharacteristic, platform: OpenHAB2Platform) {
    switch(device.type) {
      case "Switch":
        return new SwitchAccessory(device, hapAccessory, hapService, hapCharacteristic, platform);
      default:
        throw new Error('Device not supported!');
    }
  }
}