'use strict';

import 'hap-nodejs'
import { PluginConfigInterface } from '../models/platform/pluginConfigInterface';
import { HomebridgeInterface } from '../models/homebridge/homebridgeInterface';
import { OpenHAB2Client } from '../services/openHAB2Client';
import { Sse } from '../services/sse';
import { AbstractAccessory } from '../accessories/abstracts/abstractAccessory';
import { PlatformAccessoryInterface } from '../models/homebridge/platformAccessoryInterface';
import { PLATFORM_NAME, PLUGIN_NAME } from '../config';
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { AccessoryFactory } from '../services/accessoryFactory';
import Service = HAPNodeJS.Service;
import Characteristic = HAPNodeJS.Characteristic;
import uuid = HAPNodeJS.uuid;

export class OpenHAB2Platform {
  static accessory: PlatformAccessoryInterface;
  static service: Service;
  static characteristic: Characteristic;
  static uuid: uuid;
  static homebridge: HomebridgeInterface;

  log: (...string) => void;
  config: PluginConfigInterface;
  accessories: Map<string, {platformAccessory: any, openHABAccessory?: AbstractAccessory}>;
  openHAB2Client: OpenHAB2Client;
  sse: Sse;

  static init(homebridge: HomebridgeInterface) {
    this.accessory = homebridge.platformAccessory;
    this.service = homebridge.hap.Service;
    this.characteristic = homebridge.hap.Characteristic;
    this.uuid = homebridge.hap.uuid;
    this.homebridge = homebridge;
  }

  // Platform constructor
  // config may be null
  // api may be null if launched from old homebridge version
  constructor(
    log: (...string) => void,
    config: PluginConfigInterface,
    api: HomebridgeInterface
  ) {

    if (api) {

      log('homebridge API version: ' + api.version);

      // Save the API object as plugin needs to register new accessory via this object.
      OpenHAB2Platform.init(api);

      // Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
      // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
      // Or start discover new accessories
      api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
    }

    this.log = log;
    this.config = config;
    this.accessories = new Map();

    this.openHAB2Client = new OpenHAB2Client(
      this.config.host,
      this.config.port,
      this.config.username,
      this.config.password,
      this.config.sitemap,
      this.log
    );

    this.sse = new Sse(this, OpenHAB2Platform.service, OpenHAB2Platform.characteristic);
  }

  // Register/update accessories
  didFinishLaunching() {
    this.log('DidFinishLaunching');

    return this.openHAB2Client.getDevices()
      .then((devices) => {
        return this.loadAccessories(devices);
      })
      .catch((err) => {
        this.log('Error getting data from openHAB2: ', err);
      });
  }

  // Load accessories from platform
  loadAccessories(devices: OpenHAB2DeviceInterface[]) {
    this.log('Loading accessories', '');
    devices.map((D: OpenHAB2DeviceInterface, i, a) => {
      if (AccessoryFactory.isValid(D)) {
        this.addAccessory(AccessoryFactory.createAccessory(
          D, OpenHAB2Platform.accessory, OpenHAB2Platform.service, OpenHAB2Platform.characteristic, this)
        );
      }
    });

    // Remove not reviewd accessories: cached accessories no more present in openHAB2
    const accessories = this.accessories.values();
    for (let a of accessories) {
      if (!a.platformAccessory.reviewed) {
        this.removeAccessory(a.platformAccessory);
      }
    }

    // Subscribe to stream events
    return this.sse.subscribe()
      .catch((err) => {
        throw new Error(err);
      });
  }

  // Function invoked when homebridge tries to restore cached accessory
  // Developer can configure accessory at here (like setup event handler)
  configureAccessory(platformAccessory: PlatformAccessoryInterface) {
    this.log(platformAccessory.displayName, 'Configure Accessory');
    platformAccessory.reachable = false;

    // If uniqueseed property not exists remove accessory;
    if (platformAccessory.context && !platformAccessory.context.uniqueSeed) {
      this.log(platformAccessory.displayName, 'Accessory not valid');
      return;
    }

    this.accessories.set(platformAccessory.context.uniqueSeed, {platformAccessory: platformAccessory});
    this.log(platformAccessory.displayName, 'Accessory added');
  }

  //Handler will be invoked when user try to config your plugin
  //Callback can be cached and invoke when nessary
  // configurationRequestHandler(context, request, callback) {
  //   this.log("Context: ", JSON.stringify(context));
  //   this.log("Request: ", JSON.stringify(request));
  //
  //   // Check the request response
  //   if (request && request.response && request.response.inputs && request.response.inputs.name) {
  //     this.addAccessory(request.response.inputs.name);
  //
  //     // Invoke callback with config will let homebridge save the new config into config.json
  //     // Callback = function(response, type, replace, config)
  //     // set "type" to platform if the plugin is trying to modify platforms section
  //     // set "replace" to true will let homebridge replace existing config in config.json
  //     // "config" is the data platform trying to save
  //     callback(null, "platform", true, {"platform":"SamplePlatform", "otherConfig":"SomeData"});
  //     return;
  //   }
  //
  //   // - UI Type: Input
  //   // Can be used to request input from user
  //   // User response can be retrieved from request.response.inputs next time
  //   // when configurationRequestHandler being invoked
  //
  //   const respDict = {
  //     "type": "Interface",
  //     "interface": "input",
  //     "title": "Add Accessory",
  //     "items": [
  //       {
  //         "id": "name",
  //         "title": "Name",
  //         "placeholder": "Fancy Light"
  //       }//,
  //       // {
  //       //   "id": "pw",
  //       //   "title": "Password",
  //       //   "secure": true
  //       // }
  //     ]
  //   };
  //
  //   // - UI Type: List
  //   // Can be used to ask user to select something from the list
  //   // User response can be retrieved from request.response.selections next time
  //   // when configurationRequestHandler being invoked
  //
  //   // const respDict = {
  //   //   "type": "Interface",
  //   //   "interface": "list",
  //   //   "title": "Select Something",
  //   //   "allowMultipleSelection": true,
  //   //   "items": [
  //   //     "A","B","C"
  //   //   ]
  //   // }
  //
  //   // - UI Type: Instruction
  //   // Can be used to ask user to do something (other than text input)
  //   // Hero image is base64 encoded image data. Not really sure the maximum length HomeKit allows.
  //
  //   // const respDict = {
  //   //   "type": "Interface",
  //   //   "interface": "instruction",
  //   //   "title": "Almost There",
  //   //   "detail": "Please press the button on the bridge to finish the setup.",
  //   //   "heroImage": "base64 image data",
  //   //   "showActivityIndicator": true,
  //   // "showNextButton": true,
  //   // "buttonText": "Login in browser",
  //   // "actionURL": "https://google.com"
  //   // }
  //
  //   // Plugin can set context to allow it track setup process
  //   context.ts = "Hello";
  //
  //   //invoke callback to update setup UI
  //   callback(respDict);
  // }

  // Add new accessory
  addAccessory (openHABAccessory: AbstractAccessory) {
    let platformAccessory;
    if (typeof(openHABAccessory) == 'undefined')
      return;
    let uniqueSeed = openHABAccessory.name;
    let isNewAccessory = false;
    let accessory:any = this.accessories.get(uniqueSeed);
    if (accessory == null) {
      isNewAccessory = true;
      let uuid = OpenHAB2Platform.uuid.generate(uniqueSeed);
      platformAccessory = new OpenHAB2Platform.accessory(openHABAccessory.displayName, uuid); // Create the HAP accessory
      platformAccessory.context.uniqueSeed = uniqueSeed;
      this.accessories.set(uniqueSeed, {platformAccessory: platformAccessory, openHABAccessory: openHABAccessory});
    } else {
      if (typeof(accessory.openHABAccessory === 'undefined')) {
        this.accessories.set(uniqueSeed, {platformAccessory: accessory.platformAccessory, openHABAccessory: openHABAccessory});
      }
      platformAccessory = accessory.platformAccessory;
    }

    openHABAccessory.setAccessory(platformAccessory);

    // TODO Remove only services existing in HomeKit and not in Platform
    // Remove all services of this accessory existing in HomeKit
    openHABAccessory.clearExistingServices();

    // Init accessory
    openHABAccessory.initAccessory();

    // TODO Add services present in OpenHAB and not existing in Homekit accessory
    //openHABAccessory.addNewServices(this);

    // Register or update platform accessory
    openHABAccessory.registerUpdateAccessory(isNewAccessory, OpenHAB2Platform.homebridge);
    this.log(`Added/changed accessory ${openHABAccessory.displayName}`);
  }

  // Remove accessory
  removeAccessory(platformAccessory: PlatformAccessoryInterface) {
    this.log(`Remove accessory ${platformAccessory.displayName}`);
    OpenHAB2Platform.homebridge.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [platformAccessory]);
    this.accessories.delete(platformAccessory.context.uniqueSeed);
  }

}