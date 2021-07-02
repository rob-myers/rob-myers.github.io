import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/mode-scss";
declare global {
  interface Window { ace: { acequire(path: string): any } }
}

const { ScssHighlightRules } = window.ace.acequire("ace/mode/scss_highlight_rules");
const { JsxHighlightRules } = window.ace.acequire("ace/mode/jsx_highlight_rules");
const { Mode: JsxMode } = window.ace.acequire("ace/mode/jsx");

/**
 * https://ace.c9.io/#nav=higlighter
 * https://ace.c9.io/tool/mode_creator.html
 * https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript_highlight_rules.js
 */
class CustomHighlightRules extends JsxHighlightRules {
  constructor() {
    super();
    
    this.$rules.start.unshift(
      // Use scss highlighting inside css`...` and e.g. styled.div`...`
      {
        regex: /(?:css`|styled\.[a-z]+`)/,
        token: "constant.language",
        next: "scss-start",
      },
      // Use scss highlighting inside e.g. styled(Foo)`...`
      {
        regex: /styled\((?:[A-Z].*)?\)`/,
        token: "constant.language",
        next: "scss-start",
      },
    );
    this.embedRules(ScssHighlightRules, "scss-", [
      // Strict ending mostly prevents inner backticks from breaking things
      {
        regex: "^`;$",
        token: "keyword",
        next: "start",
      },
    ]);
  }
}

export default class CustomJavascriptMode extends JsxMode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
