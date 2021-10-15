import debounce from 'debounce';

/**
 * A promise which resolves when scrolling finishes at `targetScrollY`.
 */
export async function scrollFinish(targetScrollY: number){
  return new Promise<void>((resolve, reject) => {
    const onScroll = debounce((e: Event) => {
      if (
        Math.abs(window.pageYOffset - targetScrollY) >= 2
        && Math.abs(maxScrollHeight() - window.pageYOffset) >= 5
      ) {// Missed target and not at max scroll
        reject(new Error('Scroll cancelled'));
      } else {
        resolve();
      }
      window.removeEventListener('scroll', onScroll);
    }, 100);
    window.addEventListener('scroll', onScroll);
  });
}

/** https://stackoverflow.com/a/17698713/2917822 */
export function maxScrollHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  ) - window.innerHeight;
}
