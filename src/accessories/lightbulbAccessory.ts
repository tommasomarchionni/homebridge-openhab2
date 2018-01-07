'use strict';

import { SwitchAccessory } from './switchAccessory';

export class LightbulbAccessory extends SwitchAccessory {

  setOtherServices() {
    this.otherService = this.getService(this.hapService.Lightbulb, this.displayName);

    this.otherService.getCharacteristic(this.hapCharacteristic.On)
      .on('set', this.setItemState.bind(this))
      .on('get', this.getItemState.bind(this))
      .setValue(this.state === 'ON');
  };

  static isValid(device) {
    return device.tags.indexOf('Lighting') > -1 && ['Switch', 'Color', 'Dimmer'].indexOf(device.type) > -1
  }
}