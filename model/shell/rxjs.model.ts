import { Observable } from 'rxjs';

export async function awaitEnd<T>(observable: Observable<T>) {
  await new Promise((resolve, reject) => {
    observable.subscribe({
      complete: resolve,
      error: (e) => {
        // console.error('awaitEnd saw error', e);
        reject(e);
      }
    });
  });
}
