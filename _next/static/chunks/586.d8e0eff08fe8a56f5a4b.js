(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[586],{17586:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return u}});var r=n(52209),i=n(88823),o=n(59748),a=n(12320),s=n(12617);function l(){var e=(0,r.Z)(["\n  height: inherit;\n\n  > div {\n    width: 100%;\n    padding: 4px;\n  }\n"]);return l=function(){return e},e}function u(e){var t=e.options,n=e.onMount,r=(0,o.useRef)(null),l=(0,o.useRef)();return(0,o.useEffect)((function(){var e=new a.Terminal(t);l.current=e;var i=new s.FitAddon;e.loadAddon(i);var o=function(){try{i.fit()}catch(e){}};return window.addEventListener("resize",o),e.open(r.current),e.focus(),o(),n(e),function(){window.removeEventListener("resize",o),e.dispose()}}),[]),(0,i.tZ)(d,{ref:r,className:"scrollable",onKeyDown:p})}var d=(0,n(88269).zo)("section",o.default.forwardRef)(l());function p(e){e.stopPropagation()}},12617:function(e){self,e.exports=(()=>{"use strict";var e={775:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.FitAddon=void 0;var n=function(){function e(){}return e.prototype.activate=function(e){this._terminal=e},e.prototype.dispose=function(){},e.prototype.fit=function(){var e=this.proposeDimensions();if(e&&this._terminal){var t=this._terminal._core;this._terminal.rows===e.rows&&this._terminal.cols===e.cols||(t._renderService.clear(),this._terminal.resize(e.cols,e.rows))}},e.prototype.proposeDimensions=function(){if(this._terminal&&this._terminal.element&&this._terminal.element.parentElement){var e=this._terminal._core;if(0!==e._renderService.dimensions.actualCellWidth&&0!==e._renderService.dimensions.actualCellHeight){var t=window.getComputedStyle(this._terminal.element.parentElement),n=parseInt(t.getPropertyValue("height")),r=Math.max(0,parseInt(t.getPropertyValue("width"))),i=window.getComputedStyle(this._terminal.element),o=n-(parseInt(i.getPropertyValue("padding-top"))+parseInt(i.getPropertyValue("padding-bottom"))),a=r-(parseInt(i.getPropertyValue("padding-right"))+parseInt(i.getPropertyValue("padding-left")))-e.viewport.scrollBarWidth;return{cols:Math.max(2,Math.floor(a/e._renderService.dimensions.actualCellWidth)),rows:Math.max(1,Math.floor(o/e._renderService.dimensions.actualCellHeight))}}}},e}();t.FitAddon=n}},t={};return function n(r){if(t[r])return t[r].exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}(775)})()}}]);