import { Observable } from "rxjs";

export async function awaitEnd<T>(observable: Observable<T>) {
  await new Promise((resolve, reject) => {
    observable.subscribe({
      complete: resolve,
      error: reject,
    });
  });
}
