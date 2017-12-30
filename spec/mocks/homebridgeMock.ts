/**
 * A mock homebridge object to simulate all the parts needed to load the plugin
 */
export class HomebridgeMock {
  private _api: any;
  private _platform: any;
  private _config: any;

  constructor(config) {
    const API = require("homebridge").API;
    this._api = new API();
    this._config = config;
  }

  static fakeConsole(...params) {}

  registerPlatform(pluginName, platformName, constructor, dynamic) {
    this._platform = new constructor(HomebridgeMock.fakeConsole, this._config, this._api);
  }

  get platformAccessory() {
    return this._api.platformAccessory;
  }

  get hap() {
    return {
      Service: require("hap-nodejs").Service,
      Characteristic: require("hap-nodejs").Characteristic,
      uuid: require("hap-nodejs").uuid,
    }
  }

  get version () {
    return this._api.version;
  }

  get platform () {
    return this._platform;
  }

  getMockedPlatformAccessory() {
    const openHABAccessoryName = 'Kitchen_Light';
    const uniqueSeed = openHABAccessoryName;
    const uuid = this.hap.uuid.generate(uniqueSeed);
    const p = new this.platformAccessory(openHABAccessoryName, uuid);
    p.context = { uniqueSeed: uniqueSeed };
    return p;
  }

  getMockedPlatformAccessoryWithoutContext() {
    const openHABAccessoryName = 'Kitchen_Light';
    const uniqueSeed = openHABAccessoryName;
    const uuid = this.hap.uuid.generate(uniqueSeed);
    return new this.platformAccessory(openHABAccessoryName, uuid);
  }
}