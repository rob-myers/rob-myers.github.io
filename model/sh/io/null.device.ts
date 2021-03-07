import { Device, ReadResult } from "./io.model";

export class NullDevice implements Device {

  constructor(public key: string) {}

  public async writeData(_data: any) {
    // NOOP
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
