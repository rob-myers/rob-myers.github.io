/**
 * https://github.com/webpack/webpack/issues/7378
 * https://github.com/webpack/webpack/issues/7378#issuecomment-431305861
 * https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-390889335
 */
import ModuleDependencyWarning from "webpack/lib/ModuleDependencyWarning";

export class IgnoreNotFoundExportPlugin {
  private readonly messageRegExp = /export '.*'( \(reexported as '.*'\))? was not found in/;

  public apply(compiler: any) {
    if (compiler.hooks) {
      compiler.hooks.done.tap("IgnoreNotFoundExportPlugin", this.doneHook);
    } else {
      compiler.plugin("done", this.doneHook);
    }
  }

  private doneHook = (stats: any) => {
    stats.compilation.warnings = stats.compilation.warnings.filter(
      (warn: any) => {
        if (
          warn instanceof ModuleDependencyWarning &&
          this.messageRegExp.test(warn.message)
        ) {
          return false;
        }
        return true;
      }
    );
  };
}
