'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';

export class SwitchAccessory extends AbstractAccessory {

  setOtherServices() {
    this.otherService = this.getService(this.hapService.Switch, this.displayName);

    this.otherService.getCharacteristic(this.hapCharacteristic.On)
      .on('set', this.setItemState.bind(this))
      .on('get', this.getItemState.bind(this))
      .setValue(this.state === 'ON');
  };

  updateCharacteristics(message: string) {
    return new Promise((resolve, reject) => {
      this.setFromOpenHAB2 = true;
      this.platform.log(`OpenHAB2 SSE - message '${message}' from ${this.displayName}`);
      this.otherService
        .getCharacteristic(this.hapCharacteristic.On)
        .setValue(message === 'ON', () => {
          this.state = message;
            this.setFromOpenHAB2 = false;
            resolve(message);
          }
        );
    });

  };

  getItemState(callback) {
    this.platform.log(`iOS - request power state from ${this.displayName}`);
    this.platform.openHAB2Client.getDeviceProperties(this.name)
      .then((device: OpenHAB2DeviceInterface) => {
        this.platform.log(`OpenHAB2 HTTP - response from ${this.displayName}: ${device.state}`);
        callback(undefined, device.state === 'ON');
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from ${this.displayName}`, err);
        callback('');
      });
  };

  setItemState(value, callback) {
    if (this.setInitialState) {
      this.setInitialState = false;
      callback();
      return;
    }

    if (this.setFromOpenHAB2) {
      callback();
      return;
    }

    this.platform.log(`iOS - send message to ${this.displayName}: ${value}`);
    const command = value ? 'ON' : 'OFF';

    this.platform.openHAB2Client.executeDeviceAction(this.name, command)
      .then(() => {
        this.platform.log(`OpenHAB2 HTTP - response from ${this.displayName}: completed.`);
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from ${this.displayName}`, err);
      })
      .then(() => callback());
  };
}