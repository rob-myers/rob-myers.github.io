self.addEventListener('install', function(event) {
	event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

const customRouteRegex = /\/src\//;

self.addEventListener('fetch',
  /** @param {import('../model/service-worker').FetchEvent} event */
  async function(event) {
    if (event.request.method === 'GET' && customRouteRegex.test(event.request.url)){
      console.log({ url: event.request.url, event});

      if (event.request.url.endsWith('/src/module.js')) {
        event.respondWith(new Response([
          `const foo = "bar";`,
          `console.log({ foo, epochMs: ${Date.now()} });`,
          ``,
        ].join('\n'), { headers: { 'content-type': 'application/javascript' }}));
      } else {
        event.respondWith(new Response(`{ "foo": "bar" }`, { headers: { 'content-type': 'application/json' } }));
      }
    }
    // Otherwise let the browser handle it
  },
);
