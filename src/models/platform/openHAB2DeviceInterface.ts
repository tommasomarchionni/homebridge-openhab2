export interface OpenHAB2DeviceInterface {
  link?: string;
  state: string;
  type: string;
  name: string;
  label: string;
  category: string;
  tags: string[];
  groupNames: string[];
}