import { ParseShService } from './parse-sh.service';
import { TranspileShService } from './transpile-sh.service';
import { ProcessVarService } from './process-var.service';
import { FilesystemService } from './filesystem.service';
import { TermService } from './term.service';

export default function createServices() {
  return {
    parseSh: new ParseShService,
    transpileSh: new TranspileShService,
    processVar: new ProcessVarService,
    term: new TermService,
    filesystem: new FilesystemService,
  };
}

export type Service = ReturnType<typeof createServices>;
