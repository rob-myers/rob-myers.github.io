import debounce from 'debounce';

/**
 * A promise which resolves a boolean if scrolling stops for ≥ 100ms.
 * It resolves `true` iff we've scrolled to the target.
 */
export async function scrollFinished(targetScrollY: number){
  if (
    Math.abs(window.pageYOffset - targetScrollY) <= 2
    || window.pageYOffset >= maxScrollHeight() - 2
    && targetScrollY >= maxScrollHeight()
  ) {// Already there, or end of page and cannot scroll further
    return true;
  }

  return new Promise<boolean>((resolve, _reject) => {
    const onScroll = debounce(() => {
      window.removeEventListener('scroll', onScroll);
      if (
        Math.abs(window.pageYOffset - targetScrollY) >= 2
        && window.pageYOffset <= maxScrollHeight() - 2
      ) {// Missed target and not at max scroll
        resolve(false);
      } else {
        resolve(true);
      }
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
