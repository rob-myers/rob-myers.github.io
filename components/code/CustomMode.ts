import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";

const {HtmlHighlightRules} = (window as any).ace.acequire("ace/mode/html_highlight_rules");
const {JavaScriptHighlightRules} = (window as any).ace.acequire("ace/mode/javascript_highlight_rules");
const { Mode: JavaScriptMode} = (window as any).ace.acequire("ace/mode/javascript");

/**
 * https://ace.c9.io/#nav=higlighter
 * https://ace.c9.io/tool/mode_creator.html
 * https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript_highlight_rules.js
 */
export class CustomHighlightRules extends JavaScriptHighlightRules {
  constructor() {
    super({ jsx: false });

    // Use html highlighting inside html`...`
    for (const rule of Object.values(this.$rules)) {
      (rule as any[]).unshift({
          token: "keyword",
          regex: /html`/,
          next: "html-start"
      });
    }
    const jsRulesCount = Object.keys(this.$rules).length;
    this.embedRules(HtmlHighlightRules, "html-", [
      {
          token: "keyword",
          regex: "`",
          next: "start"
      },
    ]);

    // Inside html`...`, use js highlighting inside ${...}
    const htmlRules = Object.values(this.$rules).slice(jsRulesCount);
    for (const rule of htmlRules) {
      (rule as any[]).unshift({
        token: "keyword",
        regex: /\${/,
        next: "js-html-start"
      });
    }
    this.embedRules(JavaScriptHighlightRules, "js-html-", [
      {
        token: "keyword",
        regex: "}",
        next: "html-start"
      },
    ]);

    // NOTE we currently do not support highlighting for nested html`...`

  }
}

export default class CustomJavascriptMode extends JavaScriptMode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
