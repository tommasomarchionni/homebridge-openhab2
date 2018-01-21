# homebridge-openHAB2

[![npm package](https://nodei.co/npm-dl/homebridge-openhab2.png?months=2)](https://nodei.co/npm/homebridge-openhab2/)

[Homebridge](https://www.npmjs.com/package/homebridge) plugin for [openHAB2](http://www.openhab.org).

## Prerequisites
* [openHAB2](http://www.openhab.org)
* [node.js](https://nodejs.org)

## Installation
* Install the mdns and avahi library:

  `sudo apt-get install libnss-mdns libavahi-compat-libdnssd-dev`
  
* Install [homebridge](https://www.npmjs.com/package/homebridge):

  `npm install -g homebridge`
  
* This plugin is published through [NPM](https://www.npmjs.com/package/homebridge-openhab2) and should be installed "globally" by typing:
 
  `npm install -g homebridge-openhab2` or if you have issues `npm install -g --unsafe-perm homebridge-openhab2`

* Update your config.json file (usually is in your home/.homebridge/ directory, if you can't find, follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge)). See config.json in this repository for a sample.

## Configuration (config.json)
```
{
  "bridge": {
    "name": "openHAB2",
    "username": "CC:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-154"
  },

  "description": "This is an example configuration file with one fake accessory and one fake platform. You can use this as a template for creating your own configuration file containing devices you actually own.",

  "accessories": [
  ],

  "platforms": [
    {
      "platform": "openHAB2",
      "name": "openHAB2",
      "host": "192.168.0.100",
      "port": "8080",
      "sitemap": "home"
    }
  ]
}
```

Fields:

* "platform" - Must be set to openHAB2
* "name" - Name that you see in homekit
* "host" - IP address/host of the openHAB2 server
* "port" - Port of the openHAB2 server
* "sitemap" - Sitemap name of your openHAB2 server

## Item Configuration (home.items)

This plugins uses the same logic for items configuration of [HomeKit Add-on for openHAB2](https://github.com/openhab/openhab2-addons/tree/master/addons/io/org.openhab.io.homekit#item-configuration).

You will need to tag your openHAB items in order to view in HomeKit.

A full list of supported accessory types can be found in the table below.

<table>
 <tr>
  <td><b>Tag</b></td>
  <td><b>Supported Types</b></td>
  <td><b>Description</b></td>
 </tr>
 <tr>
  <td>Switchable</td>
  <td>Switch, Dimmer, Color</td>
  <td>An accessory that can be turned off and on. (mapped to Switch HomeKit type)</td>
 </tr>
 <tr>
   <td>Lighting</td>
   <td>Switch, Dimmer, Color</td>
   <td>An accessory that can be turned off and on. (mapped to Lightbulb HomeKit type)</td>
 </tr>
 <tr>
    <td>Dimmable</td>
    <td>Dimmer, Color</td>
    <td>An accessory that can be dimmable. (mapped to Lightbulb HomeKit type)</td>
  </tr>
  <tr>
    <td>WindowCovering</td>
    <td>Rollershutter</td>
    <td>A roller shutter. (mapped to WindowCovering HomeKit type)</td>
  </tr>
  <tr>
    <td>ReverseWindowCovering</td>
    <td>Rollershutter</td>
    <td>A reverse roller shutter. (mapped to WindowCovering HomeKit type)</td>
  </tr>
</table>

See the sample below for example items:

```
Switch KitchenLight "Kitchen Light" <light> (groupKitchen) [ "Switchable" ]
Color KitchenRGB "Kitchen RGB" <light> (groupKitchen) [ "Switchable" ]
Dimmer KitchenDimmer "Kitchen Dim" <light> (groupKitchen) [ "Switchable" ]

Switch KitchenLight "Kitchen Light" <light> (groupKitchen) [ "Lighting" ]
Color KitchenRGB "Kitchen RGB" <light> (groupKitchen) [ "Lighting" ]
Dimmer KitchenDimmer "Kitchen Dim" <light> (groupKitchen) [ "Lighting" ]

Color KitchenRGB "Kitchen RGB" <light> (groupKitchen) [ "Dimmable" ]
Dimmer KitchenDimmer "Kitchen Dim" <light> (groupKitchen) [ "Dimmable" ]

```

## Release notes
Version 0.0.1
+ First release with only switch items.

Version 0.0.2
+ Refactor and update README.

Version 0.0.3
+ Update Tests.

Version 0.0.4
+ Update Tests.
+ Changed logic to include accessory, now you should tag items according to the table of supported items above.

Version 0.0.5
+ Added Lighting tag mapped to Lightbulb HomeKit type.
+ Updated README.
+ Added automatic deploy to npm for tagged version.

Version 0.0.6
+ Added Dimmable tag mapped to Lightbulb HomeKit type.
+ Updated README.
+ Refactor contexts in accessories.

Version 0.0.8
+ Updated deploy to npm.

Version 0.0.9
+ Added WindowCovering tag mapped to Window Covering HomeKit type.
+ Added ReverseWindowCovering tag mapped to Window Covering HomeKit type.
