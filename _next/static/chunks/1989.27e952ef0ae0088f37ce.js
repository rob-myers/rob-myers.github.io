"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1989],{61989:function(t,e,n){n.r(e),n.d(e,{default:function(){return b}});var r,o=n(52209),i=n(88269),a=n(48103),c=n(24790),l=n(91441),p=n(95814),s=n(35650),u=n(87079),d=n(84175),f=(n(59748),n(94184)),h=n.n(f),g=n(8311);function v(t){var e=t.json,n=(0,s.Z)((function(){return{api:{evt:new c.x},open:{},onClick:function(e){var r=e.target,o=Number(r.getAttribute("data-index")),i=r.classList.toggle("open");n.open[o]=i,t.wire.next({key:i?"opened-door":"closed-door",index:o})}}}));return(0,g.tZ)("div",{className:y,onPointerUp:n.onClick,children:e.doors.map((function(t,e){var r=t.rect,o=t.angle;return(0,g.tZ)("div",{"data-index":e,className:h()("door",{open:n.open[e]}),style:{left:r.x,top:r.y,width:r.width,height:r.height,transform:"rotate(".concat(o,"rad)"),transformOrigin:"top left"}},e)}))})}var m,y=(0,i.iv)(r||(r=(0,o.Z)(["\n  div.door {\n    position: absolute;\n    cursor: pointer;\n    background: white;\n    opacity: 1;\n    transition: opacity 100ms linear;\n    &.open {\n      opacity: 0.2;\n    }\n  }\n"])));function b(t){var e=(0,p.Z)(w).data,n=(0,s.Z)((function(){return{lightDefs:[{key:"light-def",def:[new a.dl(205,385),130,.7,0]},{key:"light-def",def:[new a.dl(740,430),80,.6,0]},{key:"light-def",def:[new a.dl(420,400),80,.8,1]},{key:"light-def",def:[new a.dl(600,315),250,1,1]}],wire:new c.x}}),{lightDefs:function(t,e){return(0,d.fS)(t,e)}});return(0,g.tZ)(u.Z,{dark:!0,className:x,children:e&&(0,g.BX)(g.HY,{children:[(0,g.tZ)("img",{className:"geomorph",src:(0,l.qX)(w),draggable:!1,style:{left:e.pngRect.x,top:e.pngRect.y,width:e.pngRect.width,height:e.pngRect.height}}),(0,g.tZ)(v,{json:e,wire:n.wire})]})})}var w="g-301--bridge",x=(0,i.iv)(m||(m=(0,o.Z)(["\n  img.geomorph {\n    filter: invert(100%) brightness(70%);\n    position: absolute;\n  }\n  img.geomorph-light {\n    filter: brightness(80%);\n    position: absolute;\n  }\n  canvas {\n    position: absolute;\n  }\n"])))},95814:function(t,e,n){n.d(e,{Z:function(){return f}});var r=n(92809),o=n(79056),i=n(30266),a=n(809),c=n.n(a),l=n(88767),p=n(18264),s=n(91441);function u(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function d(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?u(Object(n),!0).forEach((function(e){(0,r.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function f(t){return(0,l.useQuery)((0,s.tU)(t),(0,i.Z)(c().mark((function e(){var n,r,i,a,l;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Promise.all([fetch((0,s.tU)(t)).then((function(t){return t.json()})),new Promise((function(e,n){var r=new Image;r.onload=function(){return e(r)},r.onerror=n,r.src=(0,s.qX)(t)}))]);case 2:return n=e.sent,r=(0,o.Z)(n,2),i=r[0],a=r[1],l=d(d({},i),{},{image:a,d:{navPoly:i.navPoly.map(p.L.from),hullOutine:p.L.from(i.hull.poly[0]).removeHoles()}}),e.abrupt("return",l);case 8:case"end":return e.stop()}}),e)}))),{keepPreviousData:!0,cacheTime:1/0})}},35650:function(t,e,n){n.d(e,{Z:function(){return i}});var r=n(79056),o=n(59748);function i(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=o.default.useState(t),i=(0,r.Z)(n,1),a=i[0];return o.default.useEffect((function(){var n=t.toString()!==a._prevFn;if(a._prevFn){if(n){for(var o=t(),i=0,c=Object.entries(o);i<c.length;i++){var l,p=(0,r.Z)(c[i],2),s=p[0],u=p[1];"function"===typeof u?a[s]=u:s in a?a._prevInit&&!1===(null===(l=e[s])||void 0===l?void 0:l.call(e,a._prevInit[s],o[s]))&&(a[s]=o[s]):a[s]=u}for(var d=0,f=Object.entries(a);d<f.length;d++){var h=(0,r.Z)(f[d],2),g=h[0];h[1];g in o||delete a[g]}a._prevFn=t.toString(),a._prevInit=o}}else a._prevFn=t.toString(),a._prevInit=t()}),[]),a}},87079:function(t,e,n){n.d(e,{Z:function(){return f}});var r,o=n(52209),i=(n(59748),n(94184)),a=n.n(i),c=n(88269),l=n(48103),p=n(35650),s=n(8311);function u(t,e){var n="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"===typeof t)return d(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return d(t,e)}(t))||e&&t&&"number"===typeof t.length){n&&(t=n);var r=0,o=function(){};return{s:o,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,c=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return a=t.done,t},e:function(t){c=!0,i=t},f:function(){try{a||null==n.return||n.return()}finally{if(c)throw i}}}}function d(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function f(t){var e=(0,p.Z)((function(){return{root:{},parent:{},opts:{minScale:.2,maxScale:8,step:.1},pointers:[],isPanning:!1,x:0,y:0,scale:1,origin:void 0,start:{clientX:0,clientY:0,scale:1,distance:0},evt:{wheel:function(t){e.zoomWithWheel(t)},pointerdown:function(t){g(e.pointers,t),e.isPanning=!0,e.origin=new l.dl(e.x,e.y);var n=v(e.pointers);e.start={clientX:n.clientX,clientY:n.clientY,scale:e.scale,distance:m(e.pointers)}},pointermove:function(t){if(void 0!==e.origin&&void 0!==e.start.clientX&&void 0!==e.start.clientY){g(e.pointers,t);var n=v(e.pointers);if(e.pointers.length>1){0===e.start.distance&&(e.start.distance=m(e.pointers));var r=m(e.pointers)-e.start.distance,o=3*e.opts.step,i=Math.min(Math.max(r*o/80+e.start.scale,e.opts.minScale),e.opts.maxScale);e.zoomToPoint(i,n)}else e.pan(e.origin.x+(n.clientX-e.start.clientX)/e.scale,e.origin.y+(n.clientY-e.start.clientY)/e.scale)}},pointerup:function(t){!function(t,e){if(e.touches){for(;t.length;)t.pop();return}var n=t.findIndex((function(t){return t.pointerId===e.pointerId}));n>-1&&t.splice(n,1)}(e.pointers,t),e.isPanning&&(e.isPanning=!1,e.origin=e.start.clientX=e.start.clientY=void 0)}},pan:function(t,n){e.x===t&&e.y===n||(e.x=t,e.y=n,e.root.style.transform="scale(".concat(e.scale,") translate(").concat(e.x,"px, ").concat(e.y,"px)"))},rootRef:function(t){t&&(e.root=t,e.parent=t.parentElement,e.parent.addEventListener("wheel",e.evt.wheel),e.parent.addEventListener("pointerdown",e.evt.pointerdown),e.parent.addEventListener("pointermove",e.evt.pointermove),e.parent.addEventListener("pointerup",e.evt.pointerup),e.parent.addEventListener("pointerleave",e.evt.pointerup),e.parent.addEventListener("pointercancel",e.evt.pointerup))},zoom:function(t,n){t=Math.min(Math.max(t,e.opts.minScale),e.opts.maxScale);var r=e.x,o=e.y;if(n.focal){var i=n.focal;r=(i.x/t-i.x/e.scale+e.x*t)/t,o=(i.y/t-i.y/e.scale+e.y*t)/t}e.x=r,e.y=o,e.scale=t,e.root.style.transform="scale(".concat(e.scale,") translate(").concat(e.x,"px, ").concat(e.y,"px)")},zoomToPoint:function(t,n){var r=function(t){var e=t.parentNode,n=window.getComputedStyle(t),r=window.getComputedStyle(e),o=t.getBoundingClientRect(),i=e.getBoundingClientRect();return{elem:{style:n,width:o.width,height:o.height,top:o.top,bottom:o.bottom,left:o.left,right:o.right,margin:y(t,"margin",n),border:y(t,"border",n)},parent:{style:r,width:i.width,height:i.height,top:i.top,bottom:i.bottom,left:i.left,right:i.right,padding:y(e,"padding",r),border:y(e,"border",r)}}}(e.root),o=r.parent.width-r.parent.padding.left-r.parent.padding.right-r.parent.border.left-r.parent.border.right,i=r.parent.height-r.parent.padding.top-r.parent.padding.bottom-r.parent.border.top-r.parent.border.bottom,a=n.clientX-r.parent.left-r.parent.padding.left-r.parent.border.left-r.elem.margin.left,c=n.clientY-r.parent.top-r.parent.padding.top-r.parent.border.top-r.elem.margin.top,l={x:(a-=r.elem.width/e.scale/2)/o*(o*t),y:(c-=r.elem.height/e.scale/2)/i*(i*t)};return e.zoom(t,{focal:l})},zoomWithWheel:function(t){t.preventDefault();var n=(0===t.deltaY&&t.deltaX?t.deltaX:t.deltaY)<0?1:-1,r=Math.min(Math.max(e.scale*Math.exp(n*e.opts.step/3),e.opts.minScale),e.opts.maxScale);return e.zoomToPoint(r,t)}}}));return(0,s.tZ)("div",{className:a()("panzoom-parent",h(t)),children:(0,s.BX)("div",{ref:e.rootRef,className:a()("panzoom-root",t.className),children:[t.children,(0,s.tZ)("div",{className:"grid"})]})})}var h=function(t){return(0,c.iv)(r||(r=(0,o.Z)(["\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  user-select: none;\n  /** This is important for mobile to prevent scrolling while panning */\n  touch-action: none;\n  cursor: auto;\n\n  background-color: ",";\n  \n  .panzoom-root {\n    width: 100%;\n    height: 100%;\n    user-select: none;\n    touch-action: none;\n    transform-origin: 50% 50%;\n    \n    .grid {\n      position: absolute;\n      pointer-events: none;\n      left: ","px;\n      top: ","px;\n      width: ","px;\n      height: ","px;\n      background-size: 10px 10px;\n      background-image:\n        linear-gradient(to right, rgba(100, 100, 100, 0.1) 1px, transparent 1px),\n        linear-gradient(to bottom, rgba(100, 100, 100, 0.15) 1px, transparent 1px);\n    }\n  }\n"])),t.dark?"#000":"#fff",-2e3,-2e3,4e3,4e3)};function g(t,e){var n;if(e.touches){n=0;var r,o=u(e.touches);try{for(o.s();!(r=o.n()).done;){var i=r.value;i.pointerId=n++,g(t,i)}}catch(a){o.e(a)}finally{o.f()}}else(n=t.findIndex((function(t){return t.pointerId===e.pointerId})))>-1&&t.splice(n,1),t.push(e)}function v(t){for(var e,n=(t=t.slice(0)).pop();e=t.pop();)n={clientX:(e.clientX-n.clientX)/2+n.clientX,clientY:(e.clientY-n.clientY)/2+n.clientY};return n}function m(t){if(t.length<2)return 0;var e=t[0],n=t[1];return Math.sqrt(Math.pow(Math.abs(n.clientX-e.clientX),2)+Math.pow(Math.abs(n.clientY-e.clientY),2))}function y(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:window.getComputedStyle(t),r="border"===e?"Width":"";return{left:b("".concat(e,"Left").concat(r),n),right:b("".concat(e,"Right").concat(r),n),top:b("".concat(e,"Top").concat(r),n),bottom:b("".concat(e,"Bottom").concat(r),n)}}function b(t,e){return parseFloat(e[t])||0}},84175:function(t,e,n){function r(t,e){if(void 0===t)throw new Error("Encountered unexpected undefined value".concat(e?" for '".concat(e,"'"):""));return t}function o(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(n>10)throw Error("equals: recursive depth exceeded 10");return(void 0===t||void 0!==e)&&("function"===typeof(null===t||void 0===t?void 0:t.equals)?!0===t.equals(e):Array.isArray(t)?t.every((function(t,n){return o(t,e[n])}),n+1)&&t.length===e.length:i(t)?Object.keys(t).every((function(n){return o(t[n],e[n])}),n+1)&&Object.keys(t).length===Object.keys(e).length:t===e)}function i(t){if("[object Object]"!==Object.prototype.toString.call(t))return!1;var e=Object.getPrototypeOf(t);return null===e||e===Object.prototype}n.d(e,{Nh:function(){return r},fS:function(){return o}})}}]);