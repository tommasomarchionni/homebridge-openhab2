'use strict';

import { SwitchAccessory } from './switchAccessory';

export class LightbulbAccessory extends SwitchAccessory {

  setOtherServices() {
    this.otherService = this.getService(this.hapService.Lightbulb, this.displayName);

    this.getCharacteristic(this.hapCharacteristic.On, this.getOtherService())
      .on('set', this.setItemPowerState.bind(this))
      .on('get', this.getItemPowerState.bind(this))
      .setValue(this.state === 'ON', () => {}, 'init');
  };

  static isValid(device) {
    return device.tags.indexOf('Lighting') > -1 && ['Switch', 'Color', 'Dimmer'].indexOf(device.type) > -1
  }
}