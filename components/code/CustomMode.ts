import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-scss";

const {ScssHighlightRules} = (window as any).ace.acequire("ace/mode/scss_highlight_rules");
const {JavaScriptHighlightRules} = (window as any).ace.acequire("ace/mode/javascript_highlight_rules");
const { Mode: JavaScriptMode} = (window as any).ace.acequire("ace/mode/javascript");

/**
 * https://ace.c9.io/#nav=higlighter
 * https://ace.c9.io/tool/mode_creator.html
 * https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript_highlight_rules.js
 */
export class CustomHighlightRules extends JavaScriptHighlightRules {
  constructor() {
    super();
    
    // Use scss highlighting inside css`...`
    this.$rules.start.unshift(
      {
        token: "keyword",
        regex: /(?:css`|styled\.[a-z]`)/,
        next: "scss-start",
      },
      {
        token: "keyword",
        regex: /styled\([A-Z].*\)`/,
        next: "scss-start",
      },
    );
    this.embedRules(ScssHighlightRules, "scss-", [
      {
        token: "keyword",
        // Strict ending mostly prevents inner backticks from breaking things
        regex: "^`;$",
        next: "start",
      },
    ]);
  }
}

export default class CustomJavascriptMode extends JavaScriptMode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
