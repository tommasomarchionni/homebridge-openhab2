import { PlatformAccessoryInterface } from './platformAccessoryInterface';
import hap = HAPNodeJS.HAPNodeJS;

export interface HomebridgeInterface {
  version: string;
  hap: hap;
  platformAccessory: PlatformAccessoryInterface;
  Accessory: any;
  Service: any;
  Characteristic: any;
  on(...any)
  unregisterPlatformAccessories(...any)
  registerPlatform(pluginName: string, platformName: string, constructor: any, dynamic: boolean);
}