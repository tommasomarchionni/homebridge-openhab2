'use strict';

import 'hap-nodejs';
import * as EventSource from 'eventsource'
import { OpenHAB2EventInterface } from '../models/platform/openHAB2EventInterface';
import { OpenHAB2Platform } from '../platform/openHAB2Platform';
import Service = HAPNodeJS.Service;
import Characteristic = HAPNodeJS.Characteristic;
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';

export class Sse {
  platform: OpenHAB2Platform;
  isSubscribed: boolean;
  hapService: Service;
  hapCharacteristic: Characteristic;

  constructor(
    platform: OpenHAB2Platform,
    hapService: Service,
    hapCharacteristic: Characteristic
  ) {
    this.platform = platform;
    this.isSubscribed = false;
    this.hapService = hapService;
    this.hapCharacteristic = hapCharacteristic;
  }

  // Subscribe to event
  subscribe(): Promise<string> {
    return new Promise((resolve, reject) => {
      if(!this.isSubscribed) {
        this.isSubscribed = true;
        this.platform.openHAB2Client
          .getSitemapEventsUrl()
          .then(this.addEventListener.bind(this))
          .catch(() => {
            reject('Error fetching event url');
          })
      }
    });
  }

  // Add event listener
  addEventListener(url: string) {
    const es = new EventSource(url);
    es.addEventListener('event', (e) => {
      try {
        const change = <OpenHAB2EventInterface>JSON.parse(e.data);
        this.manageValue(change.item);
      } catch (e) {
        es.onerror(e);
      }
    });

    es.onerror = (err) => {
      if (err) {
        this.platform.log('Error fetching updates: ', err);
      }
    };
  }

  // Update value
  manageValue(device: OpenHAB2DeviceInterface) {
    const accessory:any = this.platform.accessories.get(device.name);
    if (accessory && accessory.openHABAccessory) {
      accessory.openHABAccessory.updateCharacteristics(device.state)
    }
  }
}