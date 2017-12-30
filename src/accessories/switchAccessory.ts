"use strict";

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

  updateCharacteristics(message) {
    this.setFromOpenHAB = true;

    this.otherService
      .getCharacteristic(this.hapCharacteristic.On)
      .setValue(message === 'ON', () => {
          this.setFromOpenHAB = false;
        }
      );
  };

  getItemState(callback) {
    this.platform.log("iOS - request power state from " + this.name);
    this.platform.openHAB2Client.getDeviceProperties(this.name)
      .then((device: OpenHAB2DeviceInterface) => {
        this.platform.log("OpenHAB HTTP - response from " + device.label + ": " + device.state);
        callback(undefined, device.state === "ON");
      })
      .catch((err) => {
        this.platform.log("OpenHAB HTTP - error from " + this.name, err);
      });
  };

  setItemState(value, callback) {
    if (this.setInitialState) {
      this.setInitialState = false;
      callback();
      return;
    }

    if (this.setFromOpenHAB) {
      callback();
      return;
    }

    this.platform.log("iOS - send message to " + this.name + ": " + value);
    const command = value ? 'ON' : 'OFF';

    this.platform.openHAB2Client.executeDeviceAction(this.name, command)
      .then((response) => {
        this.platform.log("OpenHAB HTTP - response from " + this.name + ": completed.");
      })
      .catch((err) => {
        this.platform.log("OpenHAB HTTP - error from " + this.name, err);
      })
      .then(() => callback());
  };
}