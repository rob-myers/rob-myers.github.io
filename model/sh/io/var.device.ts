import useSessionStore from "store/session.store";
import { Device, ReadResult, isDataChunk } from "./io.model";

export class VarDevice implements Device {

  public key: string;
  private buffer: null | any[];

  constructor(
    private sessionKey: string,
    private varName: string,
  ) {
    this.key = `${varName}@${sessionKey}`;
    this.buffer = null;
  }

  public async writeData(data: any) {
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
