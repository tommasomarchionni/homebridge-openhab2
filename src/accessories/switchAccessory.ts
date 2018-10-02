'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';

export class SwitchAccessory extends AbstractAccessory {

  setOtherServices() {
    this.otherService = this.getService(this.hapService.Switch, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.On, this.getOtherService())
      .on('set', this.setItemPowerState.bind(this))
      .on('get', this.getItemPowerState.bind(this))
      .setValue(this.state === 'ON', () => {}, 'init');
  };

  static isValid(device) {
    return device.tags.indexOf('Switchable') > -1 && ['Switch', 'Color', 'Dimmer'].indexOf(device.type) > -1
  }

  updateCharacteristics(message: string) {
    let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
    let characteristicsUpdated : [Promise<string>] = [characteristicOnDeferred.promise];

    this.getCharacteristic(this.hapCharacteristic.On, this.getOtherService())
      .setValue(message === 'ON', () => {
        this.state = message;
        characteristicOnDeferred.resolve(message);
      }, 'remote');

    return Promise.all<string>(characteristicsUpdated);
  };

  getItemPowerState(callback) {
    this.platform.log(`iOS - request power state from <${this.name}>`);
    this.platform.openHAB2Client.getDeviceProperties(this.name)
      .then((device: OpenHAB2DeviceInterface) => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}>: ${device.state}`);

        // Handles Color item casted to Switchable (ex. 347.154924,92.558087,100)
        if (device.state.split(',').length === 3) {
          if (parseInt(device.state.split(',')[2]) > 0) {
            device.state = 'ON';
          }
        // Handles Dimmer item casted to Switchable (ex. 100)
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

  setItemPowerState(value: string, callback: Function, context: string) {
    if (context === 'remote' || context === 'init') {
      callback(null);
      return;
    }

    let command = value ? 'ON' : 'OFF';

    // Handles Dimmer item casted to Switchable
    if (this.device.type === 'Dimmer') {
      command = value ? '100' : '0';
    }

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