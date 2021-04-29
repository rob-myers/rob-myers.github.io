import { Device, ReadResult } from "./io.model";

export class SinkDevice implements Device {
  public items: any[] = [];
  
  constructor(public key: string) {}

  public async writeData(data: any) {
    this.items.push(data);
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
