import useSessionStore from "store/session.store";
import { isDataChunk } from "./fifo.device";
import { Device, ReadResult } from "./io.model";

export class VarDevice implements Device {

  public key: string;
  private buffer: null | any[];

  constructor(
    private sessionKey: string,
    private varName: string,
    private overwrite = false,
    private append = false,
  ) {
    this.key = `${varName}@${sessionKey}`;
    this.buffer = null;
  }

  public async writeData(data: any) {
    if (!this.overwrite) {
      if (!this.buffer) {
        this.buffer = [];
        useSessionStore.api.setVar(this.sessionKey, this.varName, this.buffer);
      }
      isDataChunk(data)
        ? this.buffer!.push(...data.items)
        : this.buffer!.push(data);
    } else {
      useSessionStore.api.setVar(this.sessionKey, this.varName,
        isDataChunk(data) ? data.items : data
      );
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
