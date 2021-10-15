import debounce from 'debounce';

export async function scrollFinish(targetScrollY?: number){
  return new Promise<void>((resolve, reject) => {
    const onScroll = debounce((e: Event) => {
      if (targetScrollY !== undefined && Math.abs(window.scrollY - targetScrollY) >= 1) {
        reject(new Error('Scroll cancelled'));
      } else {
        resolve();
      }
      window.removeEventListener('scroll', onScroll);
    }, 100);
    window.addEventListener('scroll', onScroll);
  });
}
