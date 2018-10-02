'use strict';

import request = require('request');
import { OpenHAB2DeviceInterface } from '../models/platform/openHAB2DeviceInterface';
import { OpenHAB2SitemapEventSubscriptionInterface } from '../models/platform/openHAB2SitemapEventSubscriptionInterface';

export class OpenHAB2Client {

  host: string;
  port: string;
  // TODO handle username and password
  // username: string;
  // password: string;
  sitemap: string;
  log: (...string) => void;

  // TODO handle username and password
  constructor(host, port, username, password, sitemap, log: (...string) => void) {
    this.host = host;
    this.port = port;
    this.sitemap = sitemap;
    this.log = log;
  }

  getSitemapEventsUrl(): Promise<string>  {
    return this.createSitemapEventSubscrition()
      .then((response: OpenHAB2SitemapEventSubscriptionInterface) => {
        return `${response.context.headers.Location[0]}?sitemap=${this.sitemap}&pageid=${this.sitemap}`;
      })
  }

  createSitemapEventSubscrition(): Promise<OpenHAB2SitemapEventSubscriptionInterface> {
    return new Promise((resolve, reject) => {
      const url = `http://${this.host}:${this.port}/rest/sitemaps/events/subscribe`;
      request.post({
        url: url,
        json: true,
        headers : { Accept: 'application/json'},
      }, function(err, response, json) {
        if (!err && response.statusCode == 200)
          resolve(json);
        else
          reject(err);
      });
    });
  }

  getDevices(): Promise<OpenHAB2DeviceInterface[]> {
    return new Promise((resolve, reject) => {
      const url = `http://${this.host}:${this.port}/rest/items?recursive=false`;
      request.get({
        url: url,
        headers : { Accept: 'application/json'},
        json: true
      }, function(err, response, json) {
        if (!err && response.statusCode == 200)
          resolve(json);
        else
          reject(err);
      });
    });
  }

  getDeviceProperties(id): Promise<OpenHAB2DeviceInterface> {
    return new Promise((resolve, reject) => {
      const url = `http://${this.host}:${this.port}/rest/items/${id}`;
      request.get({
        url: url,
        headers : { Accept: 'application/json'},
        json: true
      }, function(err, response, json) {
        if (!err && response.statusCode == 200)
          resolve(json);
        else
          reject(err);
      });
    });
  }

  // TODO handle param
  executeDeviceAction(ID: string, action: string, param?: any) {
    return new Promise((resolve, reject) => {
      const url = `http://${this.host}:${this.port}/rest/items/${ID}`;
      request({
        headers: {'Content-Type': 'text/plain'},
        url: url,
        body: action,
        method: 'post'
      }, function(err, response) {
        if (!err && (response.statusCode == 200 || response.statusCode == 202))
          resolve(response);
        else
          reject(response.body ? response.body : err);
      });
    });
  }
}