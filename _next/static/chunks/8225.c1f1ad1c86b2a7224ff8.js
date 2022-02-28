"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8225],{28225:function(e,n,t){t.r(n),t.d(n,{default:function(){return A}});var r,a=t(52209),i=t(30266),u=t(92809),l=t(79056),o=t(809),c=t.n(o),d=t(59748),s=t(88767),m=t(88269),f=t(84175),g=t(91441),p=t(48103),v=t(35490),x=t(83159),h=t(8311);function b(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function y(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?b(Object(t),!0).forEach((function(n){(0,u.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):b(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function A(e){var n=d.default.useState((function(){return{maxArea:{disabled:!0,value:2e3,min:10,max:4e3},minAngle:{disabled:!0,value:14,min:0,max:28},maxSteiner:{disabled:!0,value:300,min:0,max:600},onChangeMaxArea:function(e){var n=e.target.value;a((function(e){return e.maxArea.value=Number(n),y({},e)}))},onChangeMinAngle:function(e){var n=e.target.value;a((function(e){return e.minAngle.value=Number(n),y({},e)}))},onChangeMaxSteiner:function(e){var n=e.target.value;a((function(e){return e.maxSteiner.value=Number(n),y({},e)}))}}})),t=(0,l.Z)(n,2),r=t[0],a=t[1],u=(0,s.useQuery)("gm-aux-".concat(e.layoutKey),(0,i.Z)(c().mark((function n(){var t,r;return c().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,fetch((0,g.tU)(e.layoutKey)).then((function(e){return e.json()}));case 2:return t=n.sent,r=t.navPoly.map((function(e){return p.LA.from(e)})).slice(0,1),n.abrupt("return",{navPoly:r,pngRect:t.items[0].pngRect});case 5:case"end":return n.stop()}}),n)})))).data,o=(0,s.useQuery)("tri-dev-".concat(e.layoutKey,"-").concat(!!u,"-").concat(JSON.stringify(r)),(0,i.Z)(c().mark((function e(){var n,t,a,i,l;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("/api/dev/triangle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({polys:(0,f.Nh)(u).navPoly.map((function(e){return e.geoJson})),maxArea:r.maxArea.disabled?null:r.maxArea.value,minAngle:r.minAngle.disabled?null:r.minAngle.value,maxSteiner:r.maxSteiner.disabled?null:r.maxSteiner.value})}).then((function(e){return e.json()}));case 2:return n=e.sent,t=n.vs,a=n.tris,i=t.map(p.dl.from),l=a.map((function(e){return e.map((function(e){return i[e]}))})),e.abrupt("return",{tris:l});case 8:case"end":return e.stop()}}),e)}))),{staleTime:1/0,enabled:!!u}).data;return(0,h.BX)(x.Z,{gridBounds:v.l,initViewBox:O,maxZoom:6,children:[u&&(0,h.tZ)("image",y(y({},u.pngRect),{},{className:"geomorph",href:(0,g.qX)(e.layoutKey)})),null===o||void 0===o?void 0:o.tris.map((function(e){return(0,h.tZ)("polygon",{stroke:"red",fill:"none",strokeWidth:1,className:"navtri",points:"".concat(e)})})),(0,h.BX)(S,{xmlns:"http://www.w3.org/1999/xhtml",children:[(0,h.BX)("div",{children:["#tri ",null===o||void 0===o?void 0:o.tris.length]}),(0,h.BX)("div",{className:"max-area",children:[(0,h.tZ)("input",{type:"range",id:"max-area-range",min:r.maxArea.min,max:r.maxArea.max,defaultValue:r.maxArea.value,disabled:r.maxArea.disabled,ref:function(e){return null===e||void 0===e?void 0:e.addEventListener("change",r.onChangeMaxArea)},title:String(r.maxArea.value)}),(0,h.tZ)("label",{htmlFor:"max-area-range",onClick:function(){return a((function(e){return e.maxArea.disabled=!e.maxArea.disabled,y({},e)}))},children:"max area"})]}),(0,h.BX)("div",{className:"min-angle",children:[(0,h.tZ)("input",{type:"range",id:"min-angle-range",min:r.minAngle.min,max:r.minAngle.max,defaultValue:r.minAngle.value,disabled:r.minAngle.disabled,ref:function(e){return null===e||void 0===e?void 0:e.addEventListener("change",r.onChangeMinAngle)},title:String(r.minAngle.value)}),(0,h.tZ)("label",{htmlFor:"min-angle-range",onClick:function(){return a((function(e){return e.minAngle.disabled=!e.minAngle.disabled,y({},e)}))},children:"min angle"})]}),(0,h.BX)("div",{className:"max-steiner",children:[(0,h.tZ)("input",{type:"range",id:"max-steiner",min:r.maxSteiner.min,max:r.maxSteiner.max,defaultValue:r.maxSteiner.value,disabled:r.maxSteiner.disabled,ref:function(e){return null===e||void 0===e?void 0:e.addEventListener("change",r.onChangeMaxSteiner)},title:String(r.maxSteiner.value)}),(0,h.tZ)("label",{htmlFor:"max-steiner",onClick:function(){return a((function(e){return e.maxSteiner.disabled=!e.maxSteiner.disabled,y({},e)}))},children:"max steiner"})]})]})]})}var O=new p.UL(0,-170,600,600),S=(0,m.zo)("foreignObject")(r||(r=(0,a.Z)(["\n  background: #eee;\n  border: 1px solid #aaa;\n  font-size: 1rem;\n  padding: 8px;\n  width: 220px;\n  height: ","px;\n  x: -6px;\n  y: -",'px;\n\n  div { display: flex; }\n  label { cursor: pointer; user-select: none; }\n  input[type="range"] { width: 80px; margin-right: 8px; }\n'])),170,176)},84175:function(e,n,t){function r(e,n){if(void 0===e)throw new Error("Encountered unexpected undefined value".concat(n?" for '".concat(n,"'"):""));return e}function a(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(t>10)throw Error("equals: recursive depth exceeded 10");return(void 0===e||void 0!==n)&&("function"===typeof(null===e||void 0===e?void 0:e.equals)?!0===e.equals(n):Array.isArray(e)?e.every((function(e,t){return a(e,n[t])}),t+1)&&e.length===n.length:i(e)?Object.keys(e).every((function(t){return a(e[t],n[t])}),t+1)&&Object.keys(e).length===Object.keys(n).length:e===n)}function i(e){if("[object Object]"!==Object.prototype.toString.call(e))return!1;var n=Object.getPrototypeOf(e);return null===n||n===Object.prototype}t.d(n,{Nh:function(){return r},fS:function(){return a}})}}]);