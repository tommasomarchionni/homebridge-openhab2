import 'hap-nodejs';
import Service = HAPNodeJS.Service;

export interface PlatformAccessoryInterface {
  displayName: string;
  UUID: string;
  category: HAPNodeJS.Accessory.Categories;
  services: Object[];     //
  reachable: boolean;
  context: any;
  addService(serviceType: Service, serviceName: string);
  on(eventName: string, Function);
  new (displayName: string, UUID: string): PlatformAccessoryInterface;
}