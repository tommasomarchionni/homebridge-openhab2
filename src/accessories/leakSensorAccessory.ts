'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';

export class LeakSensorAccessory extends AbstractAccessory {

  setOtherServices() {
    this.otherService = this.getService(this.hapService.LeakSensor, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.LeakDetected, this.getOtherService())
      .on('get', this.getLeakDetectedState.bind(this))
      .setValue(this.state === 'ON', () => {}, 'init');
  };

  static isValid(device) {
    return device.tags.indexOf('LeakSensor') > -1
  }

  updateCharacteristics(message: string) {
    this.platform.log("updateCharacteristics", this.name, message)

    let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
    let characteristicsUpdated : [Promise<string>] = [characteristicOnDeferred.promise];

    this.getCharacteristic(this.hapCharacteristic.LeakDetected, this.getOtherService())
      .setValue(message === 'ON', () => {
        this.state = message;
        characteristicOnDeferred.resolve(message);
      }, 'remote');

    return Promise.all<string>(characteristicsUpdated);
  };

  getLeakDetectedState(callback) {
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
}
