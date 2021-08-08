//@ts-nocheck
/**
 * `jsx-styled` : syntax highlighting for JSX and CSS-in-JS.
 * Based on:
 * - https://github.com/codemirror/CodeMirror/blob/master/mode/jsx/jsx.js
 * - https://github.com/codemirror/google-modes/blob/64397a294a54e4b3324c81082e7d7d20ee015278/src/javascript.js
 * - https://github.com/codemirror/google-modes/blob/64397a294a54e4b3324c81082e7d7d20ee015278/src/template_string_inline_language.js
 */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    // CommonJS (NextJS)
    mod(
      require("codemirror/lib/codemirror"),
      require("codemirror/mode/jsx/jsx"),
      // require("./custom-jsx-mode"),
      require("./template_string_inline_language"),
      require("./locals"),
    );
  else if (typeof define == "function" && define.amd) // AMD
    define([
      "codemirror/lib/codemirror",
      "codemirror/mode/jsx",
      // "./custom-jsx-mode",
      "./template_string_inline_language",
      "./locals",
    ], mod);
  else // Plain browser env
    throw Error('This module must be loaded via CommonJS or AMD');
})(function(CodeMirror, _, TemplateTokenizerModule, LocalsModule) {
  "use strict"

  const { TemplateTokenizer } = TemplateTokenizerModule;
  const { markLocals } = LocalsModule;

  // Depth means the amount of open braces in JS context, in XML
  // context 0 means not in tag, 1 means in tag, and 2 means in tag
  // and js block comment.
  function Context(state, mode, depth, prev) {
    this.state = state;
    this.mode = mode;
    this.depth = depth;
    this.prev = prev;
  }

  function copyContext(context) {
    return new Context(CodeMirror.copyState(context.mode, context.state),
      context.mode,
      context.depth,
      context.prev && copyContext(context.prev))
  }
  
  const scopes = ["Block", "FunctionDef", "ArrowFunc", "ForStatement"]

  CodeMirror.defineMode("jsx-styled", function(config, modeConfig) {
    const jsxMode = CodeMirror.getMode(config, "jsx");
    const embeddedParser = new TemplateTokenizer({}, CodeMirror);

    return {
      startState: function() {
        return {
          context: new Context(CodeMirror.startState(jsxMode), jsxMode),
          embeddedParserState: embeddedParser.startState(),
        };
      },

      copyState: function(state) {
        return {
          context: copyContext(state.context),
          embeddedParserState: embeddedParser.copyState(state.embeddedParserState),
        };
      },

      token: function (stream, state) {
        const embeddedParserState = state.embeddedParserState;
        if (embeddedParser.shouldInterceptTokenizing(embeddedParserState)) {
          const {handled, style} = embeddedParser.interceptTokenizing(stream, embeddedParserState);
          if (handled) {
            return style;
          }
        }
        const style = jsxMode.token(stream, state.context.state)
        embeddedParser.trackState(style, stream, embeddedParserState);
        return markLocals(style, scopes, stream, state);
      },

      indent: function(state, textAfter, fullLine) {
        return state.context.mode.indent(state.context.state, textAfter, fullLine);
      },

      innerMode: function(state) {
        return state.context;
      },
    }
  }, "jsx")

});
