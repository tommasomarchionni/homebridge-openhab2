"use strict";

import { AbstractAccessory } from './abstracts/abstractAccessory';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { Deferred } from 'ts-deferred';

export class RollershutterAccessory extends AbstractAccessory {

  positionState = this.hapCharacteristic.PositionState.STOPPED;
  currentPosition = 0;
  targetPosition = 0;
  startedPosition = 0;
  reverse = false;
  setItemTargetPositionCalled = false;

  static isValid(device) {
    return device.tags.indexOf('WindowCovering') > -1 && ['Rollershutter'].indexOf(device.type) > -1
  }

  calculatePosition(position: number) {
    if (!this.reverse) {
      position = 100 - position;
    }
    return position;
  }

  setOtherServices() {
    this.otherService = this.getService(this.hapService.WindowCovering, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.CurrentPosition, this.getOtherService())
      .on('get', this.getItemCurrentPosition.bind(this))
      .setValue(this.currentPosition);

    this.getCharacteristic(this.hapCharacteristic.TargetPosition, this.getOtherService())
      .on('set', this.setItemTargetPosition.bind(this))
      .on('get', this.getItemTargetPosition.bind(this))
      .setValue(this.currentPosition, () => {}, 'init');

    this.getCharacteristic(this.hapCharacteristic.PositionState, this.getOtherService())
      .on('get', this.getItemPositionState.bind(this))
      .setValue(this.positionState);

  };

  updateCharacteristics(message: string) {

    let characteristicCurrentPositionDeferred: Deferred<string> = new Deferred<string>();
    let characteristicPositionStateDeferred: Deferred<string> = new Deferred<string>();
    let characteristicsUpdated : [Promise<string>,Promise<string>] = [characteristicCurrentPositionDeferred.promise, characteristicPositionStateDeferred.promise];

    const currentPosition = this.calculatePosition(+message);

    this.platform.log(`OpenHAB2 SSE - message from <${this.name}>: ${currentPosition}`);

    // Update current position in homekit
    this.getCharacteristic(this.hapCharacteristic.CurrentPosition, this.getOtherService())
      .setValue(currentPosition, () => {
        this.currentPosition = currentPosition;
        characteristicCurrentPositionDeferred.resolve(message);
      });

    // Update position state in homekit
    if(this.targetPosition > this.currentPosition) {

      this.getCharacteristic(this.hapCharacteristic.PositionState, this.getOtherService())
        .setValue(this.hapCharacteristic.PositionState.DECREASING, () => {
          this.positionState = this.hapCharacteristic.PositionState.DECREASING;
          characteristicPositionStateDeferred.resolve(this.hapCharacteristic.PositionState.DECREASING);
        });

    } else if(this.targetPosition < this.currentPosition) {

      this.getCharacteristic(this.hapCharacteristic.PositionState, this.getOtherService())
        .setValue(this.hapCharacteristic.PositionState.INCREASING, () => {
          this.positionState = this.hapCharacteristic.PositionState.INCREASING;
          characteristicPositionStateDeferred.resolve(this.hapCharacteristic.PositionState.INCREASING);
        });

    } else if(this.targetPosition === this.currentPosition) {

      this.getCharacteristic(this.hapCharacteristic.PositionState, this.getOtherService())
        .setValue(this.hapCharacteristic.PositionState.STOPPED, () => {
          this.positionState = this.hapCharacteristic.PositionState.STOPPED;
          characteristicPositionStateDeferred.resolve(this.hapCharacteristic.PositionState.STOPPED);
        });

      // Reset target position to current position
      this.getCharacteristic(this.hapCharacteristic.TargetPosition, this.getOtherService())
        .setValue(this.currentPosition, ()=> {}, 'remote');

    }

    return Promise.all<string, string>(characteristicsUpdated);
  };

  setItemTargetPosition(value, callback, context) {
    if (context === 'remote' || context === 'init') {
      callback(null);
      return;
    }

    this.setItemTargetPositionCalled = true;

    this.platform.log(`iOS - send message to <${this.name}>: ${value}`);

    this.targetPosition = +value;

    if(this.targetPosition > this.currentPosition) {
      this.getCharacteristic(this.hapCharacteristic.PositionState, this.getOtherService())
        .setValue(this.hapCharacteristic.PositionState.DECREASING);
    } else if(this.targetPosition < this.currentPosition) {
      this.getCharacteristic(this.hapCharacteristic.PositionState, this.getOtherService())
        .setValue(this.hapCharacteristic.PositionState.INCREASING);

    } else if(this.targetPosition === this.currentPosition) {
      this.getCharacteristic(this.hapCharacteristic.PositionState, this.getOtherService())
        .setValue(this.hapCharacteristic.PositionState.STOPPED);
    }

    const command = this.calculatePosition(+value).toString();

    this.platform.openHAB2Client.executeDeviceAction(this.name, command)
      .then(() => {
        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}>: completed.`);
        // TODO check if is already in target position
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
      })
      .then(() => callback(null));
  }

  getItemPositionState(callback) {
    this.platform.log(`iOS - request position state from <${this.name}>`);
    this.platform.log(`Platform - response from <${this.name}> for position state: ${this.positionState}`);

    callback(undefined, this.positionState);
  };

  getItemTargetPosition(callback) {
    this.platform.log(`iOS - request target position state from <${this.name}>`);

    if (this.setItemTargetPositionCalled) {
      this.platform.log(`Platform - response from <${this.name}> for target position: ${this.targetPosition}`);
      callback(undefined, this.targetPosition);
    } else {
      this.getItemPosition()
        .then((position: number) => {

          this.platform.log(`OpenHAB2 HTTP - response from <${this.name}> for target position: ${position}`);

          // Set current position
          this.currentPosition = position;

          // Reset target position to current position
          this.targetPosition = this.currentPosition;

          callback(undefined, this.targetPosition);

        }).catch((err) => {
          this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
          callback()
        });
    }
  };

  getItemPosition() {
    return this.platform.openHAB2Client.getDeviceProperties(this.name)
      .then((device: OpenHAB2DeviceInterface) => {
        return this.calculatePosition(+device.state);
      })
      .catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
        return Promise.reject(err)
      })
  }

  getItemCurrentPosition(callback) {

    this.platform.log(`iOS - request current position state from <${this.name}>`);

    this.getItemPosition()
      .then((position: number) => {

        this.platform.log(`OpenHAB2 HTTP - response from <${this.name}> for current position: ${position}`);
        this.currentPosition = position;

        if (this.positionState === this.hapCharacteristic.PositionState.STOPPED) {

          // Reset target position to current position
          this.targetPosition = this.currentPosition;
          this.getCharacteristic(this.hapCharacteristic.TargetPosition, this.getOtherService())
            .setValue(this.targetPosition, ()=> {}, 'remote');
        }

        callback(undefined, this.currentPosition);

      }).catch((err) => {
        this.platform.log(`OpenHAB2 HTTP - error from <${this.name}>:`, err);
        callback()
      });
  };
}