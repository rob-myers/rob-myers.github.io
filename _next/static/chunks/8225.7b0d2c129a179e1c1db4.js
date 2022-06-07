"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8225],{28225:function(n,e,t){t.r(e),t.d(e,{default:function(){return w}});var r,a=t(52209),i=t(30266),o=t(92809),l=t(79056),u=t(809),c=t.n(u),s=t(59748),d=t(88767),p=t(88269),m=t(84175),f=t(91441),v=t(48103),h=t(35490),g=t(83159),x=t(8311);function b(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function y(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?b(Object(t),!0).forEach((function(e){(0,o.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):b(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function w(n){var e=s.default.useState((function(){return{maxArea:{disabled:!0,value:2e3,min:10,max:4e3},minAngle:{disabled:!0,value:14,min:0,max:28},maxSteiner:{disabled:!0,value:300,min:0,max:600},onChangeMaxArea:function(n){var e=n.target.value;a((function(n){return n.maxArea.value=Number(e),y({},n)}))},onChangeMinAngle:function(n){var e=n.target.value;a((function(n){return n.minAngle.value=Number(e),y({},n)}))},onChangeMaxSteiner:function(n){var e=n.target.value;a((function(n){return n.maxSteiner.value=Number(e),y({},n)}))}}})),t=(0,l.Z)(e,2),r=t[0],a=t[1],o=(0,d.useQuery)("gm-aux-".concat(n.layoutKey),(0,i.Z)(c().mark((function e(){var t,r;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch((0,f.tU)(n.layoutKey)).then((function(n){return n.json()}));case 2:return t=e.sent,r=t.navPoly.map((function(n){return v.LA.from(n)})).slice(0,1),e.abrupt("return",{navPoly:r,pngRect:t.items[0].pngRect});case 5:case"end":return e.stop()}}),e)})))).data,u=(0,d.useQuery)("tri-dev-".concat(n.layoutKey,"-").concat(!!o,"-").concat(JSON.stringify(r)),(0,i.Z)(c().mark((function n(){var e,t,a,i,l;return c().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,fetch("/api/dev/triangle",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({polys:(0,m.Nh)(o).navPoly.map((function(n){return n.geoJson})),maxArea:r.maxArea.disabled?null:r.maxArea.value,minAngle:r.minAngle.disabled?null:r.minAngle.value,maxSteiner:r.maxSteiner.disabled?null:r.maxSteiner.value})}).then((function(n){return n.json()}));case 2:return e=n.sent,t=e.vs,a=e.tris,i=t.map(v.dl.from),l=a.map((function(n){return n.map((function(n){return i[n]}))})),n.abrupt("return",{tris:l});case 8:case"end":return n.stop()}}),n)}))),{staleTime:1/0,enabled:!!o}).data;return(0,x.BX)(g.Z,{gridBounds:h.l,initViewBox:A,maxZoom:6,children:[o&&(0,x.tZ)("image",y(y({},o.pngRect),{},{className:"geomorph",href:(0,f.qX)(n.layoutKey)})),null===u||void 0===u?void 0:u.tris.map((function(n){return(0,x.tZ)("polygon",{stroke:"red",fill:"none",strokeWidth:1,className:"navtri",points:"".concat(n)})})),(0,x.BX)(S,{xmlns:"http://www.w3.org/1999/xhtml",children:[(0,x.BX)("div",{children:["#tri ",null===u||void 0===u?void 0:u.tris.length]}),(0,x.BX)("div",{className:"max-area",children:[(0,x.tZ)("input",{type:"range",id:"max-area-range",min:r.maxArea.min,max:r.maxArea.max,defaultValue:r.maxArea.value,disabled:r.maxArea.disabled,ref:function(n){return null===n||void 0===n?void 0:n.addEventListener("change",r.onChangeMaxArea)},title:String(r.maxArea.value)}),(0,x.tZ)("label",{htmlFor:"max-area-range",onClick:function(){return a((function(n){return n.maxArea.disabled=!n.maxArea.disabled,y({},n)}))},children:"max area"})]}),(0,x.BX)("div",{className:"min-angle",children:[(0,x.tZ)("input",{type:"range",id:"min-angle-range",min:r.minAngle.min,max:r.minAngle.max,defaultValue:r.minAngle.value,disabled:r.minAngle.disabled,ref:function(n){return null===n||void 0===n?void 0:n.addEventListener("change",r.onChangeMinAngle)},title:String(r.minAngle.value)}),(0,x.tZ)("label",{htmlFor:"min-angle-range",onClick:function(){return a((function(n){return n.minAngle.disabled=!n.minAngle.disabled,y({},n)}))},children:"min angle"})]}),(0,x.BX)("div",{className:"max-steiner",children:[(0,x.tZ)("input",{type:"range",id:"max-steiner",min:r.maxSteiner.min,max:r.maxSteiner.max,defaultValue:r.maxSteiner.value,disabled:r.maxSteiner.disabled,ref:function(n){return null===n||void 0===n?void 0:n.addEventListener("change",r.onChangeMaxSteiner)},title:String(r.maxSteiner.value)}),(0,x.tZ)("label",{htmlFor:"max-steiner",onClick:function(){return a((function(n){return n.maxSteiner.disabled=!n.maxSteiner.disabled,y({},n)}))},children:"max steiner"})]})]})]})}var A=new v.UL(0,-170,600,600),S=(0,p.zo)("foreignObject")(r||(r=(0,a.Z)(["\n  background: #eee;\n  border: 1px solid #aaa;\n  font-size: 1rem;\n  padding: 8px;\n  width: 220px;\n  height: ","px;\n  x: -6px;\n  y: -",'px;\n\n  div { display: flex; }\n  label { cursor: pointer; user-select: none; }\n  input[type="range"] { width: 80px; margin-right: 8px; }\n'])),170,176)},35490:function(n,e,t){t.d(e,{l:function(){return a},r:function(){return i}});var r=t(48103),a=new r.UL(-5e3,-5e3,10001,10001),i=new r.UL(0,0,1200,600)},83159:function(n,e,t){t.d(e,{Z:function(){return m}});var r,a=t(52209),i=t(79056),o=t(59748),l=t(88269),u=t(94184),c=t.n(u),s=t(48103),d=t(50269),p=t(8311);function m(n){var e=o.useState((function(){var e=n.initViewBox.clone(),i=n.minZoom||.5,o=n.maxZoom||2;return{viewBox:e,panFrom:null,zoom:n.initZoom||1,ptrs:[],ptrDiff:null,root:{},rootCss:(0,l.iv)(r||(r=(0,a.Z)(["\n        width: 100%;\n        height: 100%;\n\n        touch-action: pan-x pan-y pinch-zoom;\n        background-color: ",";\n\n        > g.content {\n          /** TODO justification? */\n          shape-rendering: ",";\n        }\n        > .grid {\n          pointer-events: none;\n        }\n      "])),n.dark?"#000":"none",(0,d.us)()?"optimizeSpeed":"auto"),onPointerDown:function(n){(0,d.af)(n)&&t.ptrs.length<2&&(t.panFrom=(new s.dl).copy((0,d.zk)((0,d.Xs)(n))),t.ptrs.push((0,d.Xs)(n)))},onPointerMove:function(r){if(t.ptrs=t.ptrs.map((function(n){return n.pointerId===r.pointerId?(0,d.Xs)(r):n})),2===t.ptrs.length){var a=Math.abs(t.ptrs[1].clientX-t.ptrs[0].clientX);if(null!==t.ptrDiff){var i,o=(0,d._Y)(t.ptrs);t.zoomTo(o,.02*(a-t.ptrDiff)),t.root.setAttribute("viewBox","".concat(t.viewBox)),null===(i=n.onUpdate)||void 0===i||i.call(n,t.root)}t.ptrDiff=a}else if(t.panFrom){var l,u=(0,d.zk)((0,d.Xs)(r));e.delta(t.panFrom.x-u.x,t.panFrom.y-u.y),t.root.setAttribute("viewBox","".concat(t.viewBox)),null===(l=n.onUpdate)||void 0===l||l.call(n,t.root)}},onPointerUp:function(n){t.panFrom=null,t.ptrs=t.ptrs.filter((function(e){return n.pointerId!==e.pointerId})),t.ptrs.length<2&&(t.ptrDiff=null),1===t.ptrs.length&&(t.panFrom=(new s.dl).copy((0,d.zk)(t.ptrs[0])))},onTouchStart:function(n){n.preventDefault()},onWheel:function(e){if(e.preventDefault(),(0,d.af)(e)){var r,a=(0,d.zk)((0,d.Xs)(e));t.zoomTo(a,-.003*e.deltaY),t.root.setAttribute("viewBox","".concat(t.viewBox)),null===(r=n.onUpdate)||void 0===r||r.call(n,t.root)}},rootRef:function(n){n&&(t.root=n,n.addEventListener("wheel",t.onWheel,{passive:!1}),n.addEventListener("pointerdown",t.onPointerDown,{passive:!0}),n.addEventListener("pointermove",t.onPointerMove,{passive:!0}),n.addEventListener("pointerup",t.onPointerUp,{passive:!0}),n.addEventListener("pointercancel",t.onPointerUp,{passive:!0}),n.addEventListener("pointerleave",t.onPointerUp,{passive:!0}),n.addEventListener("touchstart",t.onTouchStart,{passive:!1}))},zoomTo:function(r,a){var l=Math.min(Math.max(t.zoom+a,i),o);e.x=t.zoom/l*(e.x-r.x)+r.x,e.y=t.zoom/l*(e.y-r.y)+r.y,e.width=1/l*n.initViewBox.width,e.height=1/l*n.initViewBox.height,t.zoom=l}}})),t=(0,i.Z)(e,1)[0];return(0,p.BX)("svg",{ref:t.rootRef,className:t.rootCss,preserveAspectRatio:"xMinYMin slice",viewBox:"".concat(t.viewBox),children:[(0,p.tZ)("g",{className:c()("content",n.className),children:n.children}),(0,p.tZ)(f,{bounds:n.gridBounds,dark:n.dark})]})}function f(n){var e=o.useMemo((function(){return v++}),[]);return(0,p.tZ)(p.HY,{children:[10,60].flatMap((function(t){return[(0,p.tZ)("defs",{children:(0,p.tZ)("pattern",{id:"pattern-grid-".concat(t,"x").concat(t,"--").concat(e),width:t,height:t,patternUnits:"userSpaceOnUse",children:(0,p.tZ)("path",{d:"M ".concat(t," 0 L 0 0 0 ").concat(t),fill:"none",stroke:n.dark?"rgba(200,200,200,0.2)":"rgba(0,0,0,0.5)",strokeWidth:"0.3"})})}),(0,p.tZ)("rect",{className:"grid",x:n.bounds.x,y:n.bounds.y,width:n.bounds.width,height:n.bounds.height,fill:"url(#pattern-grid-".concat(t,"x").concat(t,"--").concat(e,")")})]}))})}var v=0}}]);