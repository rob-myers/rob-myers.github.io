import getopts from 'getopts';
import { BuiltinType } from '../builtin.model';
import { DeclareBuiltinType, CompositeType, Term } from '@model/os/term.model';
import { BaseCompositeTerm } from '../composite/base-composite';
import { simplifyGetOpts } from '@os-service/filesystem.service';
import { GetOpts } from '@model/os/os.model';
import { BaseTermDef } from '../base-term';

/**
 * base builtin
 */
export abstract class BaseBuiltinComposite<
  ExactKey extends BuiltinType | DeclareBuiltinType,
  SpecOpts extends { string: string[]; boolean: string[] } = {
    string: never[];
    boolean: never[];
  }
> extends BaseCompositeTerm<CompositeType.builtin> {

  public builtinKey: ExactKey;
  /**
   * Computed via npm module getopts.
   */
  public opts: GetOpts<SpecOpts['string'][0], SpecOpts['boolean'][0]>;
  /**
   * Shortcut to {this.opts._}.
   */
  public operands: string[];

  constructor(
    public def: BaseBuiltinCompositeDef<ExactKey>,
  ) {
    super(def);

    this.builtinKey = def.builtinKey;
    this.opts = getopts(def.args, this.specOpts()) as GetOpts<SpecOpts['string'][0], SpecOpts['boolean'][0]>;
    simplifyGetOpts(this.opts);
    this.operands = this.opts._;
  }

  /**
   * Static get opts specification.
   */
  public abstract specOpts(): SpecOpts;

  public get children() {
    return [] as Term[];
  }
}

export interface BaseBuiltinCompositeDef<ExactKey extends BuiltinType> extends BaseTermDef<CompositeType.builtin>, BaseBuiltinDef<ExactKey> {}

interface BaseBuiltinDef<ExactKey extends BuiltinType> {
  builtinKey: ExactKey;
  args: string[];
}