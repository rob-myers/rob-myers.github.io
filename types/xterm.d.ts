
declare module 'xterm' {
  export * from 'xterm';

  export interface Terminal {
    // Plugins
    fit(): void;
    webLinksInit(): void;
  }
  
}
