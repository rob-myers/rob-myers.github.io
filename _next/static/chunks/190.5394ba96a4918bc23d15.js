(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[190],{35209:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return m}});var r=n(52209),o=n(92809),i=n(59748),a=n(88269),u=n(4631),c=n.n(u);n(82801),n(4328),n(23412),n(88657),n(86808),n(89700),n(81201),n(96876),n(62494);function l(e,t){var n="undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(!e)return;if("string"===typeof e)return s(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return s(e,t)}(e))||t&&e&&"number"===typeof e.length){n&&(e=n);var r=0,o=function(){};return{s:o,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,u=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return a=e.done,e},e:function(e){u=!0,i=e},f:function(){try{a||null==n.return||n.return()}finally{if(u)throw i}}}}function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}Object.assign(c().commands,{noOp:function(){},customToggleComment:function(e){if("jsx-styled"===e.getMode().name){var t,n=e.doc,r=n.listSelections(),o=n.children[0].lines,i=l(r);try{for(i.s();!(t=i.n()).done;){var a=t.value,u=[a.from(),a.to()],c=u[0],s=u[1];o.slice(c.line,s.line+1).every((function(e){return e.styles.every((function(e){return"string"!==typeof e||"comment"===e}))}))}}catch(d){i.e(d)}finally{i.f()}}}});var d,f=n(8311);function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function h(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){(0,o.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function m(e){var t=e.code,n=e.lineNumbers,r=e.height,o=e.readOnly,a=e.folds,u=e.wrap,l=(0,i.useRef)(null);return(0,i.useEffect)((function(){if(l.current){var e=c()(l.current,h(h({autoCloseBrackets:!0,keyMap:"sublime",theme:"vscode-dark",lineNumbers:n,matchBrackets:!0,mode:"jsx-styled",tabSize:2,value:(t||"").trim(),extraKeys:{"Cmd-Ctrl-Up":"noOp","Cmd-Ctrl-Down":"noOp","Ctrl-Alt-Up":"swapLineUp","Ctrl-Alt-Down":"swapLineDown","Cmd-/":"customToggleComment","Ctrl-Q":function(e){e.foldCode(e.getCursor())}},addModeClass:!0,readOnly:!!o&&(!window.matchMedia("(max-width: 400px)").matches||"nocursor")},n&&{foldOptions:{rangeFinder:c().fold.indent},foldGutter:!0,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"]}),{},{lineWrapping:!!u}));a&&(e.refresh(),a.forEach((function(t){return e.foldCode(t)})))}return function(){var e;null===(e=l.current)||void 0===e||e.childNodes.forEach((function(e){return e.remove()}))}}),[]),(0,f.tZ)(v,{ref:l,height:r,padding:n?12:24})}var v=(0,a.zo)("div",i.default.forwardRef)(d||(d=(0,r.Z)(["\n  width: 100%;\n  height: 100%;\n  font-size: 0.8rem;\n\n  .CodeMirror {\n    ::selection {\n      background: rgb(40, 73, 105);\n    }\n\n    height: ",";\n    .CodeMirror-lines {\n      margin: ","px 0;\n    }\n    .CodeMirror-line {\n      /* margin: 0 ","px; */\n      padding: 0 ","px;\n    }\n    .CodeMirror-scrollbar-filler {\n      background: none;\n    }\n  }\n"])),(function(e){return e.height||""}),(function(e){return e.padding}),(function(e){return e.padding}),(function(e){return e.padding}))},62494:function(e,t,n){!function(e,t,n,r){"use strict";var o=n.TemplateTokenizer,i=r.markLocals;function a(e,t,n,r){this.state=e,this.mode=t,this.depth=n,this.prev=r}function u(t){return new a(e.copyState(t.mode,t.state),t.mode,t.depth,t.prev&&u(t.prev))}var c=["Block","FunctionDef","ArrowFunc","ForStatement"];e.defineMode("jsx-styled",(function(t,n){var r=e.getMode(t,"jsx"),l=new o({},e);return{startState:function(){return{context:new a(e.startState(r),r),embeddedParserState:l.startState()}},copyState:function(e){return{context:u(e.context),embeddedParserState:l.copyState(e.embeddedParserState)}},token:function(e,t){var n=t.embeddedParserState;if(l.shouldInterceptTokenizing(n)){var o=l.interceptTokenizing(e,n),a=o.handled,u=o.style;if(a)return u}var s=r.token(e,t.context.state);return l.trackState(s,e,n),i(s,c,e,t)},indent:function(e,t,n){return e.context.mode.indent(e.context.state,t,n)},innerMode:function(e){return e.context}}}),"jsx")}(n(4631),n(71548),n(96139),n(76509))},76509:function(e,t,n){"use strict";function r(e,t){for(var n=e;n;n=n.parent)if(t.indexOf(n.name)>-1)return n}n.r(t),n.d(t,{markLocals:function(){return i},markTypeLocals:function(){return u}});var o=/(^|\s)variable($|\s)/;function i(e,t,n,i){if("def"==e){var a=r(i.context,t),u=n.current();if(a&&(a.locals||(a.locals=[]),-1==a.locals.indexOf(u)&&a.locals.push(u),"funcName"!=i.context.name))return"def local"}else o.test(e)&&!/qualified/.test(e)&&function(e,t){for(var n=e;n;n=n.parent)if(n.locals&&n.locals.indexOf(t)>-1)return!0;return!1}(i.context,n.current())&&(e=e.replace(o,"$1variable-2$2"));return e}var a=/(^|\s)type($|\s)/;function u(e,t,n,o){if("type def"==e){var i=r(o.context,t);i&&(i.localTypes||(i.localTypes=[]),i.localTypes.push(n.current()))}else a.test(e)&&!/qualifie[rd]/.test(e)&&function(e,t){for(var n=e;n;n=n.parent)if(n.localTypes&&n.localTypes.indexOf(t)>-1)return!0;return!1}(o.context,n.current())&&(e+=" local");return e}},96139:function(e,t,n){"use strict";n.r(t),n.d(t,{TemplateTokenizer:function(){return a}});var r,o=n(68216),i=n(25997),a=function(){function e(t,n){(0,o.Z)(this,e),this.config=t,r=n}return(0,i.Z)(e,[{key:"startState",value:function(){return new u}},{key:"copyState",value:function(e){return e.copy()}},{key:"shouldInterceptTokenizing",value:function(e){var t=e.currentTemplateState;return void 0!==t&&null!==t.mode}},{key:"interceptTokenizing",value:function(e,t){if(e.match("${")&&(e.backUp(2),!this.isEscaped(e,e.pos-2)))return{handled:!1};if("`"===e.peek()&&!this.isEscaped(e,e.pos))return{handled:!1};var n=t.currentTemplateState,r=n.mode,o=n.state,i=r.token(e,o);return this.backupIfEmbeddedTokenizerOvershot(e),{handled:!0,style:i}}},{key:"trackState",value:function(e,t,n){if(e){var r=n.currentTemplateState;r&&"inline-expression"!==r.kind?this.trackStateInTemplate(e,t,n,r):this.trackStateNotInTemplate(e,t,n,r),"variable"===e?(n.previousVariable=t.current(),n.styled=n.prevStyled?n.previousVariable:null,n.prevStyled="styled"===n.previousVariable):"property"===e&&n.prevStyled?(n.previousVariable=n.prevStyled=null,n.styled=t.current()):n.previousVariable=n.prevStyled=n.styled=null}}},{key:"trackStateNotInTemplate",value:function(e,t,n,o){if(o&&"string-2"===e&&t.current().startsWith("}"))return n.templateStack.pop(),void t.backUp(t.current().length-1);if("string-2"===e&&t.current().startsWith("`")){var i=this.getModeForTemplateTag(n),a="template";i?(t.backUp(t.current().length-1),n.templateStack.push(new c(a,i,r.startState(i)))):n.templateStack.push(new c(a,null,null))}}},{key:"trackStateInTemplate",value:function(e,t,n,r){"string-2"!==e||!t.current().endsWith("`")||this.isEscaped(t.pos-1)?"string-2"!==e||!t.current().endsWith("${")||this.isEscaped(t.pos-2)||n.templateStack.push(new c("inline-expression",null,null)):n.templateStack.pop()}},{key:"backupIfEmbeddedTokenizerOvershot",value:function(e){for(var t=e.current(),n=0;;){var r=t.slice(n).search(/`|\$\{/);if(-1===r)return;r+=n;var o=t.length-r,i=e.pos-o;if(!this.isEscaped(e,i))return void e.backUp(t.length-r);n=r+1}}},{key:"isEscaped",value:function(e,t){for(var n=!1,r=t;r>0&&"\\"===e.string[r-1];)n=!n,r--;return n}},{key:"getModeForTemplateTag",value:function(e){return"css"===e.previousVariable||e.styled?r.getMode(this.config,{name:"text/x-scss",inline:!0}):null}}]),e}(),u=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;(0,o.Z)(this,e),this.templateStack=t,this.previousVariable=n,this.prevStyled=null,this.styled=null}return(0,i.Z)(e,[{key:"copy",value:function(){return new e(this.templateStack.map((function(e){return e.copy()})),this.previousVariable)}},{key:"currentTemplateState",get:function(){return this.templateStack[this.templateStack.length-1]}}]),e}(),c=function(){function e(t,n,r){(0,o.Z)(this,e),this.kind=t,this.mode=n,this.state=r}return(0,i.Z)(e,[{key:"copy",value:function(){return this.mode?new e(this.kind,this.mode,r.copyState(this.mode,this.state)):new e(this.kind,null,null)}}]),e}()}}]);