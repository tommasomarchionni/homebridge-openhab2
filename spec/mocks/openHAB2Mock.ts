const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const SSE = require('express-sse');
const sse = new SSE();

export class OpenHAB2Mock {

  private _server: any;
  private _itemState = "ON";
  private _sitemap = "home";
  private _pageId = "home";
  private _port = "32124";

  getItem(withLink?: boolean) {
    const item = {
      state: this._itemState,
      type: "Switch",
      name: "Kitchen_Light",
      label: "Kitchen Light",
      category: "light",
      tags: [
        "Lighting"
      ],
      groupNames: [
        "Kitchen",
        "Lights"
      ]
    };

    if (withLink) {
      item['link'] = `http://localhost:${this.port}/rest/items/Kitchen_Light`
    }
    return item;
  }

  getEventItem(sitemap, pageId) {
    return {
      "widgetId":"0000",
      "label":"Kitchen Light",
      "visibility":true,
      "item":this.getItem(),
      "sitemapName":sitemap,
      "pageId":pageId
    }
  }

  getEventId() {
    return {
      status: "CREATED",
      context: {
        headers: {
          Location: [
            `http://localhost:${this.port}/rest/sitemaps/events/27ba1bfe-906d-4116-a54b-4c5c4e253651`
          ]
        },
        committingOutputStream: {
          bufferSize: 0,
          directWrite: true,
          isCommitted: false,
          isClosed: false
        },
        entityAnnotations: [],
        entityStream: {
          bufferSize: 0,
          directWrite: true,
          isCommitted: false,
          isClosed: false
        }
      }
    }
  }

  constructor() {
    // Fire up fake API server

    // app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.text());

    // All items
    app.get("/rest/items", (req, res) => {
      res.send([this.getItem(true)]);
    });

    // Single item
    app.get("/rest/items/Kitchen_Light", (req, res) => {
      res.send(this.getItem(true));
    });

    // Update state
    app.put("/rest/items/Kitchen_Light", (req, res) => {
      this._itemState = req.body;
      sse.send(this.getEventItem(this._sitemap, this._pageId), 'event');
      res.status(201).end();
    });

    // Create event id to subscribe
    app.post("/rest/sitemaps/events/subscribe", (req, res) => {
      if (req.query) {
        this._sitemap = req.query.sitemap ? req.query.sitemap : this._sitemap;
        this._pageId = req.query.sitemap ? req.query.pageId : this._pageId;
      }
      res.send(this.getEventId());
      res.status(201).end();
    });

    // Test stream with curl
    // curl -X GET --header "Accept: text/event-stream" "http://localhost:{port}/rest/sitemaps/events/27ba1bfe-906d-4116-a54b-4c5c4e253651"
    // Stream event
    app.get('/rest/sitemaps/events/27ba1bfe-906d-4116-a54b-4c5c4e253651', sse.init);

    this._server = app.listen(this._port);
  }

  get server() {
    return this._server;
  }

  get port() {
    return this._port;
  }
}