"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[605],{68605:function(e,n,r){r.r(n),r.d(n,{default:function(){return A}});var t=r(52209),a=r(30266),i=r(92809),o=r(79056),u=r(809),l=r.n(u),c=r(59748),d=r(88767),m=r(88269);function s(e,n){if(void 0===e)throw new Error("Encountered unexpected undefined value".concat(n?" for '".concat(n,"'"):""));return e}var f,p=r(91441),g=r(48103),x=r(35490),v=r(83159),h=r(8311);function b(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function y(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?b(Object(r),!0).forEach((function(n){(0,i.Z)(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):b(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function A(e){var n=c.default.useState((function(){return{maxArea:{disabled:!0,value:2e3,min:10,max:4e3},minAngle:{disabled:!0,value:14,min:0,max:28},maxSteiner:{disabled:!0,value:300,min:0,max:600},onChangeMaxArea:function(e){var n=e.target.value;i((function(e){return e.maxArea.value=Number(n),y({},e)}))},onChangeMinAngle:function(e){var n=e.target.value;i((function(e){return e.minAngle.value=Number(n),y({},e)}))},onChangeMaxSteiner:function(e){var n=e.target.value;i((function(e){return e.maxSteiner.value=Number(n),y({},e)}))}}})),r=(0,o.Z)(n,2),t=r[0],i=r[1],u=(0,d.useQuery)("gm-aux-".concat(e.layoutKey),(0,a.Z)(l().mark((function n(){var r,t;return l().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,fetch((0,p.tU)(e.layoutKey)).then((function(e){return e.json()}));case 2:return r=n.sent,t=r.navPoly.map((function(e){return g.LA.from(e)})).slice(0,1),n.abrupt("return",{navPoly:t,pngRect:r.pngRect});case 5:case"end":return n.stop()}}),n)})))).data,m=(0,d.useQuery)("tri-dev-".concat(e.layoutKey,"-").concat(!!u,"-").concat(JSON.stringify(t)),(0,a.Z)(l().mark((function e(){var n,r,a,i,o;return l().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("/api/dev/triangle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({polys:s(u).navPoly.map((function(e){return e.geoJson})),minArea:t.maxArea.disabled?null:t.maxArea.value,minAngle:t.minAngle.disabled?null:t.minAngle.value,maxSteiner:t.maxSteiner.disabled?null:t.maxSteiner.value})}).then((function(e){return e.json()}));case 2:return n=e.sent,r=n.vs,a=n.tris,i=r.map(g.dl.from),o=a.map((function(e){return e.map((function(e){return i[e]}))})),e.abrupt("return",{tris:o});case 8:case"end":return e.stop()}}),e)}))),{staleTime:1/0,enabled:!!u}).data;return(0,h.BX)(v.Z,{gridBounds:x.l,initViewBox:w,maxZoom:6,children:[u&&(0,h.tZ)("image",y(y({},u.pngRect),{},{className:"geomorph",href:(0,p.qX)(e.layoutKey)})),null===m||void 0===m?void 0:m.tris.map((function(e){return(0,h.tZ)("polygon",{stroke:"red",fill:"none",strokeWidth:1,className:"navtri",points:"".concat(e)})})),(0,h.BX)(O,{xmlns:"http://www.w3.org/1999/xhtml",children:[(0,h.BX)("div",{children:["#tri ",null===m||void 0===m?void 0:m.tris.length]}),(0,h.BX)("div",{className:"max-area",children:[(0,h.tZ)("input",{type:"range",id:"max-area-range",min:t.maxArea.min,max:t.maxArea.max,defaultValue:t.maxArea.value,disabled:t.maxArea.disabled,ref:function(e){return null===e||void 0===e?void 0:e.addEventListener("change",t.onChangeMaxArea)}}),(0,h.tZ)("label",{htmlFor:"max-area-range",onClick:function(){return i((function(e){return e.maxArea.disabled=!e.maxArea.disabled,y({},e)}))},children:"max area"})]}),(0,h.BX)("div",{className:"min-angle",children:[(0,h.tZ)("input",{type:"range",id:"min-angle-range",min:t.minAngle.min,max:t.minAngle.max,defaultValue:t.minAngle.value,disabled:t.minAngle.disabled,ref:function(e){return null===e||void 0===e?void 0:e.addEventListener("change",t.onChangeMinAngle)}}),(0,h.tZ)("label",{htmlFor:"min-angle-range",onClick:function(){return i((function(e){return e.minAngle.disabled=!e.minAngle.disabled,y({},e)}))},children:"min angle"})]}),(0,h.BX)("div",{className:"max-steiner",children:[(0,h.tZ)("input",{type:"range",id:"max-steiner",min:t.maxSteiner.min,max:t.maxSteiner.max,defaultValue:t.maxSteiner.value,disabled:t.maxSteiner.disabled,ref:function(e){return null===e||void 0===e?void 0:e.addEventListener("change",t.onChangeMaxSteiner)}}),(0,h.tZ)("label",{htmlFor:"max-steiner",onClick:function(){return i((function(e){return e.maxSteiner.disabled=!e.maxSteiner.disabled,y({},e)}))},children:"max steiner"})]})]})]})}var w=new g.UL(0,-170,600,600),O=(0,m.zo)("foreignObject")(f||(f=(0,t.Z)(["\n  background: #eee;\n  border: 1px solid #aaa;\n  font-size: 1rem;\n  padding: 8px;\n  width: 220px;\n  height: ","px;\n  x: -6px;\n  y: -",'px;\n\n  div { display: flex; }\n  label { cursor: pointer; user-select: none; }\n  input[type="range"] { width: 80px; margin-right: 8px; }\n'])),170,176)},91441:function(e,n,r){r.d(n,{Dv:function(){return t},tU:function(){return a},qX:function(){return i}});var t={sizePx:11,noTailPx:10,font:"".concat(11,"px sans-serif"),padX:4,padY:2};function a(e){return"/geomorph/".concat(e,".json")}function i(e){return"/geomorph/".concat(e,".png")}}}]);