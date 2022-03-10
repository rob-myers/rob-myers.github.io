"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{10177:function(t,n,e){e.r(n),e.d(n,{default:function(){return j}});var r=e(52209),o=e(59748),i=e(88269),a=e(95090),c=e(58474);function s(t){return function(n){if(function(t){return(0,c.m)(null===t||void 0===t?void 0:t.lift)}(n))return n.lift((function(n){try{return t(n,this)}catch(e){this.error(e)}}));throw new TypeError("Unable to lift unknown Observable type")}}var l=e(70655),p=function(t){function n(n,e,r,o,i){var a=t.call(this,n)||this;return a.onUnsubscribe=i,a._next=e?function(t){try{e(t)}catch(n){this.destination.error(n)}}:t.prototype._next,a._error=r?function(t){try{r(t)}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._error,a._complete=o?function(){try{o()}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._complete,a}return(0,l.ZT)(n,t),n.prototype.unsubscribe=function(){var n;!this.closed&&(null===(n=this.onUnsubscribe)||void 0===n||n.call(this)),t.prototype.unsubscribe.call(this)},n}(e(7038).Lv);var d,u=e(48103),f=e(91441),g=e(2074),h=e(35650),v=e(27375),b=e(87079),m=e(92809),y=e(94184),x=e.n(y),w=e(8311);function k(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function O(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?k(Object(e),!0).forEach((function(n){(0,m.Z)(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):k(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function Z(t){var n=t.gm,e=(0,v.Z)(),r=(0,h.Z)((function(){return{api:{getOpen:function(){return O({},r.open)},setObservableDoors:function(t){r.observable=t.reduce((function(t,n){return O(O({},t),{},(0,m.Z)({},n,!0))}),{}),e()}},open:{},observable:{},onClick:function(n){var e=n.target,o=Number(e.getAttribute("data-index"));r.observable[o]&&(r.open[o]?delete r.open[o]:r.open[o]=!0,t.wire.next({key:r.open[o]?"opened-door":"closed-door",index:o}))}}}));return o.default.useLayoutEffect((function(){var n;return null===(n=t.onLoad)||void 0===n?void 0:n.call(t,r.api)}),[]),(0,w.tZ)("div",{className:S,onPointerUp:r.onClick,children:n.doors.map((function(t,n){var e=t.rect,o=t.angle,i=t.tags;return(0,w.tZ)("div",{"data-index":n,className:x()("door",{open:r.open[n],iris:i.includes("iris"),observable:r.observable[n]}),style:{left:e.x,top:e.y,width:e.width,height:e.height,transform:"rotate(".concat(o,"rad)"),transformOrigin:"top left"}},n)}))})}var M,S=(0,i.iv)(d||(d=(0,r.Z)(["\n  div.door {\n    position: absolute;\n\n    &:not(.observable) {\n      background: #444;\n      border: 1px solid #00204b;\n    }\n\n    &.observable:not(.iris) {\n      cursor: pointer;\n      background: #fff;\n      border: 1px solid #555;\n\n      transition: width 300ms ease-in;\n      &.open {\n        width: 10px !important;\n      }\n    }\n\n    &.observable.iris {\n      cursor: pointer;\n      background-image: linear-gradient(45deg, #888 33.33%, #333 33.33%, #333 50%, #888 50%, #888 83.33%, #333 83.33%, #333 100%);\n      background-size: 4.24px 4.24px;\n      border: 1px solid #fff;\n      \n      opacity: 1;\n      transition: opacity 300ms ease;\n      &.open {\n        opacity: 0.1;\n      }\n    }\n  }\n"])));function j(t){var n=(0,g.Z)(P).data,e=(0,v.Z)(),r=(0,h.Z)((function(){return{clipPath:"none",doorApi:{},isHoleMasked:{},wire:new a.x,handleDotClick:function(t){var e=t.target;if(n){var o=Number(e.getAttribute("data-index"));o in r.isHoleMasked?delete r.isHoleMasked[o]:r.isHoleMasked[o]=!0,r.updateMask()}},updateMask:function(){if(n){var t=n.d.roomGraph,o=Object.keys(r.isHoleMasked).map(Number),i=Object.keys(r.doorApi.getOpen()).map(Number),a=o.flatMap((function(n){return t.getEnterableRooms(t.nodesArray[n],i).map((function(t){return t.holeIndex}))})),c=Array.from(new Set(o.concat(a))).map((function(t){return n.d.holesWithDoors[t]})),s=t.getAdjacentDoors(o.map((function(n){return t.nodesArray[n]})));this.doorApi.setObservableDoors(s.map((function(t){return t.doorIndex})));var l=u.LA.cutOut(c,[n.d.hullOutline]).map((function(t){return t.translate(-n.d.pngRect.x,-n.d.pngRect.y)})).map((function(t){return"".concat(t.svgPath)})).join(" ");r.clipPath="path('".concat(l,"')"),e()}}}}),[n]);return o.default.useEffect((function(){if(n){r.updateMask();var t=r.wire.pipe((e=function(t){return"closed-door"===t.key||"opened-door"===t.key},s((function(t,n){var r=0;t.subscribe(new p(n,(function(t){return e.call(o,t,r++)&&n.next(t)})))})))).subscribe((function(t){return r.updateMask()}));return function(){return t.unsubscribe()}}var e,o}),[n]),(0,w.tZ)(b.Z,{dark:!0,className:X,children:n&&(0,w.BX)(w.HY,{children:[(0,w.tZ)("img",{className:"geomorph",src:(0,f.qX)(P),draggable:!1,style:{left:n.d.pngRect.x,top:n.d.pngRect.y,width:n.d.pngRect.width,height:n.d.pngRect.height}}),(0,w.tZ)("img",{className:"geomorph-dark",src:(0,f.qX)(P),draggable:!1,style:{left:n.d.pngRect.x,top:n.d.pngRect.y,width:n.d.pngRect.width,height:n.d.pngRect.height,clipPath:r.clipPath}}),(0,w.tZ)("div",{className:"light-toggles",onClick:r.handleDotClick,children:n.d.holeSwitches.map((function(t,n){return(0,w.tZ)("div",{"data-index":n,className:"toggle",style:{left:t.x-5,top:t.y-5,borderColor:r.isHoleMasked[n]?"#5f5":"rgba(200, 0, 0, 0.3)",outline:r.isHoleMasked[n]?"1px solid black":"1px solid rgba(255, 255, 255, 0.5)"}},n)}))}),(0,w.tZ)(Z,{gm:n,wire:r.wire,onLoad:function(t){return r.doorApi=t}})]})})}var P="g-303--passenger-deck",X=(0,i.iv)(M||(M=(0,r.Z)(["\n  img.geomorph-dark {\n    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);\n    position: absolute;\n  }\n  img.geomorph {\n    filter: brightness(80%);\n    position: absolute;\n  }\n  /* img.geomorph-light {\n    filter:  brightness(75%);\n    position: absolute;\n  } */\n  div.light-toggles {\n    position: absolute;\n\n    div.toggle {\n      border-radius: 5px;\n      border: 5px solid white;\n      position: absolute;\n      cursor: pointer;\n    }\n  }\n  svg.room-graph {\n    position: absolute;\n    pointer-events: none;\n    circle, line {\n      pointer-events: none;\n    }\n  }\n"])))},35650:function(t,n,e){e.d(n,{Z:function(){return i}});var r=e(79056),o=e(59748);function i(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=o.default.useState(t),a=(0,r.Z)(i,1),c=a[0];return o.default.useEffect((function(){var n=t.toString()!==c._prevFn;if(c._prevFn)if(n){for(var o=t(),i=0,a=Object.entries(o);i<a.length;i++){var s,l,p=(0,r.Z)(a[i],2),d=p[0],u=p[1],f=d;"function"===typeof u?c[f]=u:d in c?c._prevInit&&!1===(null===(s=e.equality)||void 0===s||null===(l=s[f])||void 0===l?void 0:l.call(s,c._prevInit[f],o[f]))&&(c[f]=o[f]):c[f]=u}for(var g=0,h=Object.entries(c);g<h.length;g++){var v=(0,r.Z)(h[g],2),b=v[0];v[1];b in o||delete c[b]}c._prevFn=t.toString(),c._prevInit=o}else for(var m=t(),y=0,x=Object.entries(m);y<x.length;y++){var w=(0,r.Z)(x[y],2),k=w[0],O=w[1];"function"===typeof O&&(c[k]=O)}else c._prevFn=t.toString(),c._prevInit=t()}),n),c}},87079:function(t,n,e){e.d(n,{Z:function(){return f}});var r,o=e(52209),i=(e(59748),e(94184)),a=e.n(i),c=e(88269),s=e(48103),l=e(35650),p=e(8311);function d(t,n){var e="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!e){if(Array.isArray(t)||(e=function(t,n){if(!t)return;if("string"===typeof t)return u(t,n);var e=Object.prototype.toString.call(t).slice(8,-1);"Object"===e&&t.constructor&&(e=t.constructor.name);if("Map"===e||"Set"===e)return Array.from(t);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return u(t,n)}(t))||n&&t&&"number"===typeof t.length){e&&(t=e);var r=0,o=function(){};return{s:o,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,c=!1;return{s:function(){e=e.call(t)},n:function(){var t=e.next();return a=t.done,t},e:function(t){c=!0,i=t},f:function(){try{a||null==e.return||e.return()}finally{if(c)throw i}}}}function u(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}function f(t){var n=(0,l.Z)((function(){return{root:{},parent:{},opts:{minScale:.2,maxScale:8,step:.1},pointers:[],isPanning:!1,x:0,y:0,scale:1,origin:void 0,start:{clientX:0,clientY:0,scale:1,distance:0},evt:{wheel:function(t){n.zoomWithWheel(t)},pointerdown:function(t){h(n.pointers,t),n.isPanning=!0,n.origin=new s.dl(n.x,n.y);var e=v(n.pointers);n.start={clientX:e.clientX,clientY:e.clientY,scale:n.scale,distance:b(n.pointers)}},pointermove:function(t){if(void 0!==n.origin&&void 0!==n.start.clientX&&void 0!==n.start.clientY){h(n.pointers,t);var e=v(n.pointers);if(n.pointers.length>1){0===n.start.distance&&(n.start.distance=b(n.pointers));var r=b(n.pointers)-n.start.distance,o=3*n.opts.step,i=Math.min(Math.max(r*o/80+n.start.scale,n.opts.minScale),n.opts.maxScale);n.zoomToPoint(i,e)}else n.pan(n.origin.x+(e.clientX-n.start.clientX)/n.scale,n.origin.y+(e.clientY-n.start.clientY)/n.scale)}},pointerup:function(t){!function(t,n){if(n.touches){for(;t.length;)t.pop();return}var e=t.findIndex((function(t){return t.pointerId===n.pointerId}));e>-1&&t.splice(e,1)}(n.pointers,t),n.isPanning&&(n.isPanning=!1,n.origin=n.start.clientX=n.start.clientY=void 0)}},pan:function(t,e){n.x===t&&n.y===e||(n.x=t,n.y=e,n.root.style.transform="scale(".concat(n.scale,") translate(").concat(n.x,"px, ").concat(n.y,"px)"))},rootRef:function(t){t&&(n.root=t,n.parent=t.parentElement,n.parent.addEventListener("wheel",n.evt.wheel),n.parent.addEventListener("pointerdown",n.evt.pointerdown),n.parent.addEventListener("pointermove",n.evt.pointermove),n.parent.addEventListener("pointerup",n.evt.pointerup),n.parent.addEventListener("pointerleave",n.evt.pointerup),n.parent.addEventListener("pointercancel",n.evt.pointerup))},zoom:function(t,e){t=Math.min(Math.max(t,n.opts.minScale),n.opts.maxScale);var r=n.x,o=n.y;if(e.focal){var i=e.focal;r=(i.x/t-i.x/n.scale+n.x*t)/t,o=(i.y/t-i.y/n.scale+n.y*t)/t}n.x=r,n.y=o,n.scale=t,n.root.style.transform="scale(".concat(n.scale,") translate(").concat(n.x,"px, ").concat(n.y,"px)")},zoomToPoint:function(t,e){var r=function(t){var n=t.parentNode,e=window.getComputedStyle(t),r=window.getComputedStyle(n),o=t.getBoundingClientRect(),i=n.getBoundingClientRect();return{elem:{style:e,width:o.width,height:o.height,top:o.top,bottom:o.bottom,left:o.left,right:o.right,margin:m(t,"margin",e),border:m(t,"border",e)},parent:{style:r,width:i.width,height:i.height,top:i.top,bottom:i.bottom,left:i.left,right:i.right,padding:m(n,"padding",r),border:m(n,"border",r)}}}(n.root),o=r.parent.width-r.parent.padding.left-r.parent.padding.right-r.parent.border.left-r.parent.border.right,i=r.parent.height-r.parent.padding.top-r.parent.padding.bottom-r.parent.border.top-r.parent.border.bottom,a=e.clientX-r.parent.left-r.parent.padding.left-r.parent.border.left-r.elem.margin.left,c=e.clientY-r.parent.top-r.parent.padding.top-r.parent.border.top-r.elem.margin.top,s={x:(a-=r.elem.width/n.scale/2)/o*(o*t),y:(c-=r.elem.height/n.scale/2)/i*(i*t)};return n.zoom(t,{focal:s})},zoomWithWheel:function(t){t.preventDefault();var e=(0===t.deltaY&&t.deltaX?t.deltaX:t.deltaY)<0?1:-1,r=Math.min(Math.max(n.scale*Math.exp(e*n.opts.step/3),n.opts.minScale),n.opts.maxScale);return n.zoomToPoint(r,t)}}}));return(0,p.tZ)("div",{className:a()("panzoom-parent",g(t)),children:(0,p.BX)("div",{ref:n.rootRef,className:a()("panzoom-root",t.className),children:[t.children,(0,p.tZ)("div",{className:"small-grid"}),(0,p.tZ)("div",{className:"large-grid"})]})})}var g=function(t){return(0,c.iv)(r||(r=(0,o.Z)(["\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  user-select: none;\n  /** This is important for mobile to prevent scrolling while panning */\n  touch-action: none;\n  cursor: auto;\n\n  background-color: ",";\n  \n  .panzoom-root {\n    width: 100%;\n    height: 100%;\n    user-select: none;\n    touch-action: none;\n    transform-origin: 50% 50%;\n    \n    .small-grid, .large-grid {\n      position: absolute;\n      pointer-events: none;\n      left: ","px;\n      top: ","px;\n      width: ","px;\n      height: ","px;\n      background-image:\n        linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),\n        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);\n    }\n    .small-grid {\n      background-size: 10px 10px;\n    }\n    .large-grid {\n      background-size: 60px 60px;\n    }\n  }\n"])),t.dark?"#000":"#fff",-1800,-1800,3600,3600)};function h(t,n){var e;if(n.touches){e=0;var r,o=d(n.touches);try{for(o.s();!(r=o.n()).done;){var i=r.value;i.pointerId=e++,h(t,i)}}catch(a){o.e(a)}finally{o.f()}}else(e=t.findIndex((function(t){return t.pointerId===n.pointerId})))>-1&&t.splice(e,1),t.push(n)}function v(t){for(var n,e=(t=t.slice(0)).pop();n=t.pop();)e={clientX:(n.clientX-e.clientX)/2+e.clientX,clientY:(n.clientY-e.clientY)/2+e.clientY};return e}function b(t){if(t.length<2)return 0;var n=t[0],e=t[1];return Math.sqrt(Math.pow(Math.abs(e.clientX-n.clientX),2)+Math.pow(Math.abs(e.clientY-n.clientY),2))}function m(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:window.getComputedStyle(t),r="border"===n?"Width":"";return{left:y("".concat(n,"Left").concat(r),e),right:y("".concat(n,"Right").concat(r),e),top:y("".concat(n,"Top").concat(r),e),bottom:y("".concat(n,"Bottom").concat(r),e)}}function y(t,n){return parseFloat(n[t])||0}}}]);