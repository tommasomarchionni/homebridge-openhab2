'use strict';

import 'hap-nodejs';
import Service = HAPNodeJS.Service;
import Characteristic = HAPNodeJS.Characteristic;
import { PLATFORM_NAME, PLUGIN_NAME } from '../../config';
import { OpenHAB2DeviceInterface } from '../../models/platform/openHAB2DeviceInterface';

export abstract class AbstractAccessory {
  displayName: string;
  context: any;
  name: string;
  accessory: any;
  hapAccessory: any;
  hapService: any;
  hapCharacteristic: any;
  platform: any;
  isSecuritySystem: boolean;
  manufacturer = 'openHAB2';
  model = 'openHAB2BridgedAccessory';
  serialNumber = '<unknown>';
  informationService?: Service;
  otherService?: Service;
  device: OpenHAB2DeviceInterface;
  setInitialState = false;
  state: string;

  constructor(
    device: OpenHAB2DeviceInterface,
    hapAccessory: any,
    hapService: any,
    hapCharacteristic: any,
    platform,
    isSecuritySystem?: boolean
  ) {
    this.name = device.name;
    this.displayName = device.label;
    this.device = device;
    this.state = device.state;
    this.accessory = null;
    this.hapAccessory = hapAccessory;
    this.hapService = hapService;
    this.hapCharacteristic = hapCharacteristic;
    this.platform = platform;
    this.isSecuritySystem = isSecuritySystem ? isSecuritySystem : false;
  }

  // TODO handle identify for accessory
  //newAccessory.on('identify', (paired, callback) => {
  //     this.log(newAccessory.displayName, 'Identify!!!');
  //     callback();
  //   });

  getOtherService(): Service {
    if (this.otherService)
      return this.otherService
    else
      throw "getOtherService accessed too early; accessory not yet initialized"
  }

  initAccessory() {
    this.setInitialState = true;
    this.setInformationServices();
    this.setOtherServices();
  }

  abstract setOtherServices(): void;

  static isValid(device): boolean {
    return false;
  }

  getService(homebridgeService: Service, accessoryName?: string): Service {
    return this.accessory.getService(homebridgeService) ?
      this.accessory.getService(homebridgeService) :
      this.accessory.addService(homebridgeService, accessoryName);
  }

  getCharacteristic(homebridgeCharacteristic: Characteristic, homebridgeService: Service): Characteristic {
    return homebridgeService.getCharacteristic(homebridgeCharacteristic) ?
      homebridgeService.getCharacteristic(homebridgeCharacteristic) :
      homebridgeService.addCharacteristic(homebridgeCharacteristic);
  }

  setInformationServices(): void {
    this.informationService = this.getService(this.hapService.AccessoryInformation)
      .setCharacteristic(this.hapCharacteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(this.hapCharacteristic.Model, this.model)
      .setCharacteristic(this.hapCharacteristic.SerialNumber, this.serialNumber);
  };

  clearExistingServices() {
    for (let t = 0; t < this.accessory.services.length; t++) {
        this.accessory.removeService(this.accessory.services[t]);
    }
  }

  registerUpdateAccessory(isNewAccessory, api) {
    if (isNewAccessory)
      api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [this.accessory]);
    else
      api.updatePlatformAccessories([this.accessory]);
    // Mark accessory as reviewed in order to remove the not reviewed ones
    this.accessory.reviewed = true;

    // Set the accessory to reachable
    this.accessory.updateReachability(true);
  }

  setAccessory(accessory) {
    this.accessory = accessory;
  }
}