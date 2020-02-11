// Post data to parent thread
self.postMessage({ fromWorker: 'fromWorker' });
// Respond to message from parent thread
self.addEventListener('message', (event) => console.log({ receivedFromHost: event }));
