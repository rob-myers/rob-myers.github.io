import debounce from 'debounce';

/**
 * A promise which resolves when:
 * - scrolling stops for ≥ 100ms
 * - we've scrolled to `min(targetScrollY, maxScrollHeight)`.
 */
export async function scrollFinish(targetScrollY: number){
  if (
    Math.abs(window.pageYOffset - targetScrollY) <= 2
    || window.pageYOffset >= maxScrollHeight() - 2
    && targetScrollY >= maxScrollHeight()
  ) {// Already there, or end of page and cannot scroll further
    return;
  }

  return new Promise<void>((resolve, reject) => {
    const onScroll = debounce(() => {
      if (
        Math.abs(window.pageYOffset - targetScrollY) >= 2
        && window.pageYOffset <= maxScrollHeight() - 2
      ) {// Missed target and not at max scroll
        reject(new Error('Scroll failed'));
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
