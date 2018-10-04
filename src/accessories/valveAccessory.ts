'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';

export class ValveAccessory extends AbstractAccessory {

  setOtherServices() {
    this.otherService = this.getService(this.hapService.Valve, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.InUse, this.getOtherService())
      .on('get', this.getActiveState.bind(this))
      .setValue(this.state === 'ON', () => {}, 'init');

    this.getCharacteristic(this.hapCharacteristic.Active, this.getOtherService())
      .on('get', this.getActiveState.bind(this))
      .on('set', this.setActiveState.bind(this))
      .setValue(this.state === 'ON', () => {}, 'init');

    this.getCharacteristic(this.hapCharacteristic.ValveType, this.getOtherService())
      .updateValue(this.hapCharacteristic.ValveType.GENERIC_VALVE);
  };

  static isValid(device) {
    return device.tags.indexOf('Valve') > -1
  }

  updateCharacteristics(message: string) {
    this.platform.log("updateCharacteristics", this.name, message)

    let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
    let characteristicsUpdated : [Promise<string>] = [characteristicOnDeferred.promise];

    [this.hapCharacteristic.Active, this.hapCharacteristic.InUse].forEach((characteristic) => {
      this.getCharacteristic(characteristic, this.getOtherService())
        .setValue(message === 'ON', () => {
          this.state = message;
          characteristicOnDeferred.resolve(message);
        }, 'remote');
    });

    return Promise.all<string>(characteristicsUpdated);
  };

  getActiveState(callback) {
    this.platform.log(`iOS - request leak detected state from <${this.name}>`);
    this.platform.openHAB2Client.getDeviceProperties(this.name)
      .then((device: OpenHAB2DeviceInterface) => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}>: ${device.state}`);

        // Handles Color item casted to Leakable (ex. 347.154924,92.558087,100)
        if (device.state.split(',').length === 3) {
          if (parseInt(device.state.split(',')[2]) > 0) {
            device.state = 'ON';
          }
        // Handles Dimmer item casted to Leakable (ex. 100)
        } else if (parseInt(device.state) > 0) {
          device.state = 'ON';
        }
        callback(undefined, device.state === 'ON');
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>`, err);
        callback('');
      });
  };

  setActiveState(value: string, callback: Function, context: string) {
    if (context === 'remote' || context === 'init') {
      callback(null);
      return;
    }

    let command = value ? 'ON' : 'OFF';

    this.platform.log(`iOS - send message to <${this.name}>: ${command}`);
    this.platform.openHAB2Client.executeDeviceAction(this.name, command)
      .then(() => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}>: completed.`);
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
      })
      .then(() => callback());
  };
}
