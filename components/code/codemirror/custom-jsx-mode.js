// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    // mod(require("../../lib/codemirror"), require("../xml/xml"), require("../javascript/javascript"))
    mod(
      require("codemirror/lib/codemirror"),
      require("codemirror/mode/jsx/jsx"),
      require("./template_string_inline_language"),
      require("./locals"),
  );
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror/lib/codemirror", "codemirror/mode/jsx"], mod)
  else // Plain browser env
    mod(CodeMirror)
})(function(CodeMirror, _, TemplateTokenizerModule, LocalsModule) {
  "use strict"

  const { TemplateTokenizer } = TemplateTokenizerModule;
  const { markLocals } = LocalsModule;

  // Depth means the amount of open braces in JS context, in XML
  // context 0 means not in tag, 1 means in tag, and 2 means in tag
  // and js block comment.
  function Context(state, mode, depth, prev) {
    this.state = state; this.mode = mode; this.depth = depth; this.prev = prev
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

      // token,
      token: function (stream, state) {
        const embeddedParserState = state.embeddedParserState;
        if (embeddedParser.shouldInterceptTokenizing(embeddedParserState)) {
          const {handled, style} = embeddedParser.interceptTokenizing(stream, embeddedParserState);
          if (handled) {
            return style;
          }
        }
        // const style = super.token(stream, state);
        const style = jsxMode.token(stream, state.context.state)
        embeddedParser.trackState(style, stream, embeddedParserState);
        return markLocals(style, scopes, stream, state)
      },

      indent: function(state, textAfter, fullLine) {
        return state.context.mode.indent(state.context.state, textAfter, fullLine)
      },

      innerMode: function(state) {
        return state.context
      }
    }
  }, "jsx")

});