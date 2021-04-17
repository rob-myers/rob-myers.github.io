import { last } from "model/generic.model";
import useSessionStore from "store/session.store";
import { Device, ReadResult, isDataChunk } from "./io.model";

export type VarDeviceMode = 'array' | 'last';
export class VarDevice implements Device {

  public key: string;
  private buffer: null | any[];

  constructor(
    private sessionKey: string,
    private varName: string,
    private mode: VarDeviceMode,
  ) {
    this.key = `${varName}@${sessionKey}`;
    this.buffer = null;
  }

  public async writeData(data: any) {
    if (this.mode === 'array') {
      if (!this.buffer) {
        this.buffer = [];
        useSessionStore.api.setVar(this.sessionKey, this.varName, this.buffer);
      }
      if (data === undefined) {
        return; 
      } else if (isDataChunk(data)) {
        this.buffer!.push(...data.items);
      } else {
        this.buffer!.push(data);
      }
    } else {
      if (data === undefined) {
        return; 
      } else if (isDataChunk(data)) {
        useSessionStore.api.setVar(this.sessionKey, this.varName, last(data.items));
      } else {
        useSessionStore.api.setVar(this.sessionKey, this.varName, data);
      }
    }
  }

  public async readData(): Promise<ReadResult> {
    return { eof: true };
  }

  public finishedReading() {
    // NOOP
  }
  public finishedWriting() {
    // NOOP
  }
}
