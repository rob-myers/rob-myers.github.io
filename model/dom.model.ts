import debounce from 'debounce';

export async function scrollFinish(){
  return new Promise<void>(resolve => {
    const onScroll = debounce(() => {
      resolve();
      window.removeEventListener('scroll', onScroll);
    }, 100);
    window.addEventListener('scroll', onScroll);
  });
}
