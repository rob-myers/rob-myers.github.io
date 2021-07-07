(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror/lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror/lib/codemirror"]);
  else // Plain browser env
    throw Error('Module must be loaded with CommonJS or AMD');
})(function(CodeMirror) {
  "use strict";

  var cmds = CodeMirror.commands;
  var Pos = CodeMirror.Pos;

  cmds.swapLineUp = function(cm) {
    if (cm.isReadOnly()) return CodeMirror.Pass
    var ranges = cm.listSelections(), linesToMove = [], at = cm.firstLine() - 1, newSels = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i], from = range.from().line - 1, to = range.to().line;
      newSels.push({anchor: Pos(range.anchor.line - 1, range.anchor.ch),
                    head: Pos(range.head.line - 1, range.head.ch)});
      if (range.to().ch == 0 && !range.empty()) --to;
      if (from > at) linesToMove.push(from, to);
      else if (linesToMove.length) linesToMove[linesToMove.length - 1] = to;
      at = to;
    }
    cm.operation(function() {
      for (var i = 0; i < linesToMove.length; i += 2) {
        var from = linesToMove[i], to = linesToMove[i + 1];
        var line = cm.getLine(from);
        cm.replaceRange("", Pos(from, 0), Pos(from + 1, 0), "+swapLine");
        if (to > cm.lastLine())
          cm.replaceRange("\n" + line, Pos(cm.lastLine()), null, "+swapLine");
        else
          cm.replaceRange(line + "\n", Pos(to, 0), null, "+swapLine");
      }
      cm.setSelections(newSels);
      cm.scrollIntoView();
    });
  };

  cmds.swapLineDown = function(cm) {
    if (cm.isReadOnly()) return CodeMirror.Pass
    var ranges = cm.listSelections(), linesToMove = [], at = cm.lastLine() + 1;
    for (var i = ranges.length - 1; i >= 0; i--) {
      var range = ranges[i], from = range.to().line + 1, to = range.from().line;
      if (range.to().ch == 0 && !range.empty()) from--;
      if (from < at) linesToMove.push(from, to);
      else if (linesToMove.length) linesToMove[linesToMove.length - 1] = to;
      at = to;
    }
    cm.operation(function() {
      for (var i = linesToMove.length - 2; i >= 0; i -= 2) {
        var from = linesToMove[i], to = linesToMove[i + 1];
        var line = cm.getLine(from);
        if (from == cm.lastLine())
          cm.replaceRange("", Pos(from - 1), Pos(from), "+swapLine");
        else
          cm.replaceRange("", Pos(from, 0), Pos(from + 1, 0), "+swapLine");
        cm.replaceRange(line + "\n", Pos(to, 0), null, "+swapLine");
      }
      cm.scrollIntoView();
    });
  };

  cmds.toggleCommentIndented = function(cm) {
    cm.toggleComment({ indent: true });
  }

  var keyMap = CodeMirror.keyMap;
  keyMap.macSublime = {
    "Shift-Alt-Up": "swapLineUp",
    "Shift-Alt-Down": "swapLineDown",
    "Cmd-/": "toggleCommentIndented",
    "Cmd-K Cmd-1": "foldAll",
    "Cmd-K Cmd-0": "unfoldAll",
    "Cmd-K Cmd-J": "unfoldAll",
    "Shift-Cmd-[": "fold",
    "Shift-Cmd-]": "unfold",
  };
  CodeMirror.normalizeKeyMap(keyMap.macSublime);

  keyMap.pcSublime = {
    "Shift-Ctrl-Up": "swapLineUp",
    "Shift-Ctrl-Down": "swapLineDown",
    "Ctrl-/": "toggleCommentIndented",
    "Ctrl-K Ctrl-1": "foldAll",
    "Ctrl-K Ctrl-0": "unfoldAll",
    "Ctrl-K Ctrl-J": "unfoldAll",
    "Shift-Ctrl-[": "fold",
    "Shift-Ctrl-]": "unfold",
  };
  CodeMirror.normalizeKeyMap(keyMap.pcSublime);

  var mac = keyMap.default == keyMap.macDefault;
  keyMap.custom = mac ? keyMap.macSublime : keyMap.pcSublime;
});
