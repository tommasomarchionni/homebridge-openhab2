# homebridge-openHAB2 [TESTING]

[![npm package](https://nodei.co/npm-dl/homebridge-openhab2.png?months=2)](https://nodei.co/npm/homebridge-openhab2/)

[Homebridge](https://www.npmjs.com/package/homebridge) plugin for [openHAB2](http://www.openhab.org).

## Prerequisites
* [openHAB](http://www.openhab.org)
* [node.js](https://nodejs.org)

## Installation
* Install the mdns and avahi library:

  `sudo apt-get install libnss-mdns libavahi-compat-libdnssd-dev`
  
* Install [homebridge](https://www.npmjs.com/package/homebridge):

  `npm install -g homebridge`
  
* This plugin is published through [NPM](https://www.npmjs.com/package/homebridge-openhab2) and should be installed "globally" by typing:
 
  `npm install -g homebridge-openhab2`

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

Now are enabled only switch items.