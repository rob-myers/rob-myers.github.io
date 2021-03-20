import useSession, { ProcessMeta, ProcessStatus } from "store/session.store";
import { BaseMeta } from "../parse/parse.model";
import { ProcessError } from "../sh.util";
import { Device, ReadResult, SigEnum } from "./io.model";

export class ProxyDevice {

  /** We'll track fd changes and re-resolve */
  private readonly resolved: Record<number, Device>;
  private readonly process: ProcessMeta;

  constructor(
    public key: string,
    public sessionKey: string,
    public pid: number,
  ) {
    this.resolved = {};
    this.process = useSession.api.getProcess(pid, sessionKey);
  }

  async read(fd: number): Promise<ReadResult> {
    await this.handleProcessStatus();
    return await this.resolved[fd].readData();
  }

  async write(fd: number, data: any) {
    await this.handleProcessStatus();
    const device = this.resolved[fd];
    if (device.finishedReading(true)) {
      throw new ProcessError(SigEnum.SIGKILL, this.pid, this.sessionKey);
    }
    await device.writeData(data);
  }

  updateResolved(meta: BaseMeta) {
   for (const fd in meta.fd) {
    this.resolved[fd] = useSession.getState().device[meta.fd[fd]];
   }
  }

  private async handleProcessStatus() {
    if (this.process.status === ProcessStatus.Killed) {
      throw new ProcessError(SigEnum.SIGKILL, this.pid, this.sessionKey);
    } else if (this.process.status === ProcessStatus.Suspended) {
      await new Promise<void>(resolve => this.process.onResume = resolve);
    }
  }

}
