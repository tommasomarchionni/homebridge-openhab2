'use strict';

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';

export class DimmerAccessory extends AbstractAccessory {

  // Used to check to set item power state to true when setItemBrightnessStateCalled isn't called in 100ms
  setItemBrightnessStateCalled = false;

  static isValid(device) {
    return device.tags.indexOf('Dimmable') > -1 && ['Dimmer'].indexOf(device.type) > -1
  }

  setOtherServices() {
    this.otherService = this.getService(this.hapService.Lightbulb, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.On, this.getOtherService())
      .on('set', this.setItemPowerState.bind(this))
      .on('get', this.getItemPowerState.bind(this))
      .setValue(+this.state > 0, () => {}, 'init');

    this.getCharacteristic(this.hapCharacteristic.Brightness, this.getOtherService())
      .on('set', this.setItemBrightnessState.bind(this))
      .on('get', this.getItemBrightnessState.bind(this))
      .setValue(+this.state, () => {}, 'init');
  };

  updateCharacteristics(message: string) {

      let characteristicBrightnessDeferred: Deferred<string> = new Deferred<string>();
      let characteristicOnDeferred: Deferred<string> = new Deferred<string>();
      let characteristicsUpdated : [Promise<string>,Promise<string>] = [characteristicBrightnessDeferred.promise, characteristicOnDeferred.promise];

      this.platform.log(`OpenHAB2 SSE - message from <${this.name}>: ${message}`);

      const brightness = +message;

      this.getCharacteristic(this.hapCharacteristic.Brightness, this.getOtherService())
        .setValue(brightness, () => {
          this.state = message;
          characteristicBrightnessDeferred.resolve(message);
        }, 'remote');

      this.getCharacteristic(this.hapCharacteristic.On, this.getOtherService())
        .setValue(brightness > 0, () => {
          this.state = message;
          characteristicOnDeferred.resolve(message);
        }, 'remote');

      return Promise.all<string, string>(characteristicsUpdated);
  };

  getItemPowerState(callback) {
    this.platform.log(`iOS - request power state from <${this.name}>`);

    this.getItemState()
      .then(state => callback(null, +state > 0));
  };

  setItemPowerState(value, callback, context) {
    if (value === false) {
      this.updateItemState(value, 'Power', callback, context);
    } else {
      // if setItemBrightnessStateCalled isn't called in 100ms i should call updateItemState
      setTimeout(() => {
        if (!this.setItemBrightnessStateCalled) {
          this.updateItemState(value, 'Power', callback, context);
        } else {
          this.setItemBrightnessStateCalled = false;
          callback();
        }
      }, 100);
    }
  }

  getItemState() {
    return this.platform.openHAB2Client.getDeviceProperties(this.name)
      .then((device: OpenHAB2DeviceInterface) => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}>: ${device.state}`);
        return device.state;
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
        return Promise.reject(err);
      });
  };

  getItemBrightnessState(callback) {
    this.getItemState()
      .then(state => callback(null, +state));
  };

  setItemBrightnessState(value, callback, context) {
    this.setItemBrightnessStateCalled = true;
    this.updateItemState(value, 'Brightness', callback, context);
  };

  updateItemState(value: string, type: string, callback: Function, context: string) {
    if (context === 'remote' || context === 'init') {
      callback(null);
      return;
    }

    let command = '' + value;
    if (type === 'Power') {
      command = value ? 'ON' : 'OFF';
    }

    this.platform.log(`iOS - send message to <${this.name}>: ${command}`);

    this.platform.openHAB2Client.executeDeviceAction(this.name, command)
      .then(() => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}> for type ${type}: completed.`);
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
      })
      .then(() => callback(null));
  };
}