'use strict';

import { SwitchAccessory } from '../accessories/switchAccessory';
import { LightbulbAccessory } from '../accessories/lightbulbAccessory';
import { DimmerAccessory } from '../accessories/dimmerAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { OpenHAB2Platform } from '../platform/openHAB2Platform';

export class AccessoryFactory {

  static accessoryTypes = {
    Switchable: SwitchAccessory,
    Lighting: LightbulbAccessory,
    Dimmable: DimmerAccessory
  };

  static isValid(device: OpenHAB2DeviceInterface): boolean {
    for (let tag of device.tags) {
      if (typeof(this.accessoryTypes[tag]) !== 'undefined') {
        return this.accessoryTypes[tag].isValid(device);
      }
    }
    return false;
  }

  // Create accessory based on tag
  static createAccessory(device: OpenHAB2DeviceInterface, hapAccessory, hapService, hapCharacteristic, platform: OpenHAB2Platform) {
    // Checks every tag of item until finds valid type
    for (let tag of device.tags) {
      if (typeof(this.accessoryTypes[tag]) !== 'undefined') {
        return new this.accessoryTypes[tag](device, hapAccessory, hapService, hapCharacteristic, platform);
      }
    }
    throw new Error('Device not supported!');
  }
}