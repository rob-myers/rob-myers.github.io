self.addEventListener('install', function (event) {
	self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

const customRouteRegex = /\/(?:src)|(?:npm)\//

self.addEventListener('fetch', async function(event) {
  if (event.request.method === 'GET' && customRouteRegex.test(event.request.url)){
    console.log({event});
    event.respondWith(new Response(`{ "foo": "bar" }`));
  } else {
    return; // Let the browser handle it
  }
});
