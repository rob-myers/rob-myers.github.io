export interface BaseMessage {
  /** Message uid */
  key: string;
}

export interface Message<Data> extends MessageEvent {
  data: Data;
}
