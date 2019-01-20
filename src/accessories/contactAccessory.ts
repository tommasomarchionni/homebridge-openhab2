'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';

export class ContactAccessory extends AbstractAccessory {
  
   setOtherServices() {
    this.otherService = this.getService(this.hapService.ContactSensor, this.displayName);
    
    this.getCharacteristic(this.hapCharacteristic.ContactSensorState, this.getOtherService())
      .on('get', this.getContactDetectedState.bind(this))
      .setValue(this.state === 'ON', () => {}, 'init');
  };

  static isValid(device) {
    return device.tags.indexOf('ContactSensor') > -1 && ['Contact'].indexOf(device.type) > -1
  }

  updateCharacteristics(message: string) {
    this.platform.log("updateCharacteristics", this.name, message)

    let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
    let characteristicsUpdated : [Promise<string>] = [characteristicOnDeferred.promise];

    this.getCharacteristic(this.hapCharacteristic.ContactSensorState, this.getOtherService())
      .setValue(message === 'OPEN', () => {
        this.state = message;
        characteristicOnDeferred.resolve(message);
      }, 'remote');

    return Promise.all<string>(characteristicsUpdated);
  };

  getContactDetectedState(callback) {
    this.platform.log(`iOS - request contact detected state from <${this.name}>`);
    this.platform.openHAB2Client.getDeviceProperties(this.name)
      .then((device: OpenHAB2DeviceInterface) => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}>: ${device.state}`);

        // Handles Color item casted to Leakable (ex. 347.154924,92.558087,100)
        if (device.state.split(',').length === 3) {
          if (parseInt(device.state.split(',')[2]) > 0) {
            device.state = 'OPEN';
          }
        // Handles Dimmer item casted to Leakable (ex. 100)
        } else if (parseInt(device.state) > 0) {
          device.state = 'OPEN';
        }
        callback(undefined, device.state === 'OPEN');
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>`, err);
        callback('');
      });
  };
}
