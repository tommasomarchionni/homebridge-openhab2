'use strict';

import { OpenHAB2DeviceInterface } from './openHAB2DeviceInterface';

export interface OpenHAB2EventInterface {
  widgetId: string;             // "0000"
  label: string;                // "Kitchen_Light"
  visibility: boolean;          // true
  item: OpenHAB2DeviceInterface;
  sitemapName: string;          // "home"
  pageId: string;               // "home"
}