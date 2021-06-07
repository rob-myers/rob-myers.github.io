self.addEventListener('install', function (event) {
	self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

self.addEventListener('fetch', async function(event) {
  if (event.request.method === 'GET' && event.request.url.includes('/src/')){
    console.log({event});
    event.respondWith(new Response(`{ "foo": "bar" }`));
  } else {
    return; // Let the browser handle it
  }
});
