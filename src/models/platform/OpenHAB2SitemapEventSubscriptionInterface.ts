export interface OpenHAB2SitemapEventSubscriptionInterface {
  status: string,       // "CREATED"
  context: OpenHAB2SitemapEventSubscriptionContextInterface
}

export interface OpenHAB2SitemapEventSubscriptionContextInterface {
  headers: { Location: string[] },
  committingOutputStream: OpenHAB2SitemapEventSubscriptionContextStreamInterface,
  entityAnnotations: string[],
  entityStream: OpenHAB2SitemapEventSubscriptionContextStreamInterface
}

export interface OpenHAB2SitemapEventSubscriptionContextStreamInterface {
  bufferSize: number,   // 0
  directWrite: boolean, // true
  isCommitted: boolean, // false
  isClosed: boolean     // false
}