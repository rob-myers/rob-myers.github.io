"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8039],{30245:function(t,e,n){n.d(e,{Z:function(){return b}});var r,o=n(52209),i=n(92809),a=n(59748),c=n(88269),l=n(94184),s=n.n(l),p=n(84175),u=n(50269),d=n(35650),f=n(27375),v=n(8311);function g(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function h(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?g(Object(n),!0).forEach((function(e){(0,i.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):g(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function b(t){var e=t.gm,n=(0,f.Z)(),r=(0,d.Z)((function(){return{api:{getOpen:function(){return Object.keys(r.open).map(Number)},setObservableDoors:function(t){r.observable=t.reduce((function(t,e){return h(h({},t),{},(0,i.Z)({},e,!0))}),{}),r.renderUnobservables(),n()}},canvas:{},open:{},observable:{},rootEl:{},onToggleDoor:function(e){var n=Number(e.target.getAttribute("data-index"));r.observable[n]&&(r.open[n]?delete r.open[n]:r.open[n]=!0,t.wire.next({key:r.open[n]?"opened-door":"closed-door",index:n}),r.renderUnobservables())},renderUnobservables:function(){var t=(0,p.Cq)(r.canvas.getContext("2d"));t.clearRect(0,0,r.canvas.width,r.canvas.height),t.fillStyle="#444",t.strokeStyle="#00204b",e.doors.filter((function(t,e){return!r.observable[e]})).forEach((function(e){var n=e.poly;(0,u.Fx)(t,[n]),t.stroke()}))}}}));return a.default.useLayoutEffect((function(){var e;null===(e=t.onLoad)||void 0===e||e.call(t,r.api)}),[]),a.default.useEffect((function(){return r.renderUnobservables(),r.rootEl.addEventListener("pointerup",r.onToggleDoor),function(){r.rootEl.removeEventListener("pointerup",r.onToggleDoor)}}),[]),(0,v.BX)("div",{className:m,ref:function(t){return t&&(r.rootEl=t)},children:[e.doors.map((function(t,e){var n=t.rect,o=t.angle,i=t.tags;return r.observable[e]&&(0,v.tZ)("div",{"data-index":e,className:s()("door",{open:r.open[e],iris:i.includes("iris")}),style:{left:n.x,top:n.y,width:n.width,height:n.height,transform:"rotate(".concat(o,"rad)"),transformOrigin:"top left"}},e)})),(0,v.tZ)("canvas",{ref:function(t){return t&&(r.canvas=t)},width:e.d.pngRect.width,height:e.d.pngRect.height})]})}var m=(0,c.iv)(r||(r=(0,o.Z)(["\n  canvas {\n    position: absolute;\n    pointer-events: none;\n  }\n\n  div.door {\n    position: absolute;\n\n    &:not(.iris) {\n      cursor: pointer;\n      background: #fff;\n      border: 1px solid #555;\n\n      transition: width 300ms ease-in;\n      &.open {\n        width: 10px !important;\n      }\n    }\n\n    &.iris {\n      cursor: pointer;\n      background-image: linear-gradient(45deg, #888 33.33%, #333 33.33%, #333 50%, #888 50%, #888 83.33%, #333 83.33%, #333 100%);\n      background-size: 4.24px 4.24px;\n      border: 1px solid #fff;\n      \n      opacity: 1;\n      transition: opacity 300ms ease;\n      &.open {\n        opacity: 0.1;\n      }\n    }\n  }\n"])))},35650:function(t,e,n){n.d(e,{Z:function(){return a}});var r=n(79056),o=n(59748),i=n(84175);function a(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=o.default.useState(t),c=(0,r.Z)(a,1),l=c[0];return o.default.useEffect((function(){var e,o=t.toString()!==l._prevFn;if(l._prevFn)if(o){for(var a=t(),c=0,s=Object.entries(a);c<s.length;c++){var p,u,d,f=(0,r.Z)(s[c],2),v=f[0],g=f[1],h=v;if("function"===typeof g)l[h]=g;else if(null!==(p=Object.getOwnPropertyDescriptor(l,h))&&void 0!==p&&p.get||null!==(u=Object.getOwnPropertyDescriptor(l,h))&&void 0!==u&&u.set){var b,m;Object.defineProperty(l,h,{get:null===(b=Object.getOwnPropertyDescriptor(a,h))||void 0===b?void 0:b.get,set:null===(m=Object.getOwnPropertyDescriptor(a,h))||void 0===m?void 0:m.set})}else v in l?l._prevInit&&null!==(d=n.equality)&&void 0!==d&&d[h]&&!(0,i.fS)(l._prevInit[h],a[h])&&(l[h]=a[h]):l[h]=g}for(var y=0,x=Object.entries(l);y<x.length;y++){var w=(0,r.Z)(x[y],2),O=w[0];w[1];O in a||delete l[O]}l._prevFn=t.toString(),l._prevInit=a}else for(var j=t(),P=0,E=Object.entries(j);P<E.length;P++){var S,Z,k=(0,r.Z)(E[P],2),D=k[0],X=k[1];if("function"===typeof X)l[D]=X;else if(null!==(S=Object.getOwnPropertyDescriptor(l,D))&&void 0!==S&&S.get||null!==(Z=Object.getOwnPropertyDescriptor(l,D))&&void 0!==Z&&Z.set){var _,Y;Object.defineProperty(l,D,{get:null===(_=Object.getOwnPropertyDescriptor(j,D))||void 0===_?void 0:_.get,set:null===(Y=Object.getOwnPropertyDescriptor(j,D))||void 0===Y?void 0:Y.set})}}else l._prevFn=t.toString(),l._prevInit=t();var M=null===(e=l.onChangeDeps)||void 0===e?void 0:e.call(l);if("function"===typeof M)return M}),e),l}},77277:function(t,e,n){n.d(e,{Z:function(){return a},l:function(){return c}});var r=n(88767),o=n(95090),i=n(29120);function a(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"stage-default";return(0,r.useQuery)(t,(function(){return{key:t,keyEvent:new o.x,ptrEvent:new o.x}}),{keepPreviousData:!0,staleTime:1/0})}function c(t){return(0,i.q9)(t)}},87079:function(t,e,n){n.d(e,{Z:function(){return v}});var r,o=n(52209),i=(n(59748),n(94184)),a=n.n(i),c=n(88269),l=n(48103),s=n(35650),p=n(77277),u=n(8311);function d(t,e){var n="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"===typeof t)return f(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return f(t,e)}(t))||e&&t&&"number"===typeof t.length){n&&(t=n);var r=0,o=function(){};return{s:o,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,c=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return a=t.done,t},e:function(t){c=!0,i=t},f:function(){try{a||null==n.return||n.return()}finally{if(c)throw i}}}}function f(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function v(t){var e=(0,s.Z)((function(){return{root:{},parent:{},opts:{minScale:.2,maxScale:8,step:.1},pointers:[],isPanning:!1,x:0,y:0,scale:1,origin:void 0,start:{clientX:0,clientY:0,scale:1,distance:0},evt:{wheel:function(t){e.zoomWithWheel(t)},pointerdown:function(t){h(e.pointers,t),e.isPanning=!0,e.origin=new l.dl(e.x,e.y);var n=b(e.pointers);e.start={clientX:n.clientX,clientY:n.clientY,scale:e.scale,distance:m(e.pointers)}},pointermove:function(t){if(void 0!==e.origin&&void 0!==e.start.clientX&&void 0!==e.start.clientY){h(e.pointers,t);var n=b(e.pointers);if(e.pointers.length>1){0===e.start.distance&&(e.start.distance=m(e.pointers));var r=m(e.pointers)-e.start.distance,o=3*e.opts.step,i=Math.min(Math.max(r*o/80+e.start.scale,e.opts.minScale),e.opts.maxScale);e.zoomToPoint(i,n)}else e.pan(e.origin.x+(n.clientX-e.start.clientX)/e.scale,e.origin.y+(n.clientY-e.start.clientY)/e.scale)}},pointerup:function(n){if(function(t,e){if(e.touches){for(;t.length;)t.pop();return}var n=t.findIndex((function(t){return t.pointerId===e.pointerId}));n>-1&&t.splice(n,1)}(e.pointers,n),e.isPanning){if(t.stageKey){var r=y(e.root),o=new DOMMatrixReadOnly(window.getComputedStyle(e.root).transform).inverse(),i=o.transformPoint({x:n.clientX-r.parent.left,y:n.clientY-r.parent.top}),a=e.root.children[0].getBoundingClientRect(),c=a.x,l=a.y,s=o.transformPoint({x:c-r.parent.left,y:l-r.parent.top}),u=(0,p.l)(t.stageKey);null===u||void 0===u||u.ptrEvent.next({key:"pointerup",point:{x:i.x-s.x,y:i.y-s.y}})}e.isPanning=!1,e.origin=e.start.clientX=e.start.clientY=void 0}}},pan:function(t,n){e.x===t&&e.y===n||(e.x=t,e.y=n,e.root.style.transform="scale(".concat(e.scale,") translate(").concat(e.x,"px, ").concat(e.y,"px)"))},rootRef:function(t){t&&(e.root=t,e.parent=t.parentElement,e.parent.addEventListener("wheel",e.evt.wheel),e.parent.addEventListener("pointerdown",e.evt.pointerdown),e.parent.addEventListener("pointermove",e.evt.pointermove),e.parent.addEventListener("pointerup",e.evt.pointerup),e.parent.addEventListener("pointerleave",e.evt.pointerup),e.parent.addEventListener("pointercancel",e.evt.pointerup))},zoom:function(t,n){t=Math.min(Math.max(t,e.opts.minScale),e.opts.maxScale);var r=e.x,o=e.y;if(n.focal){var i=n.focal;r=(i.x/t-i.x/e.scale+e.x*t)/t,o=(i.y/t-i.y/e.scale+e.y*t)/t}e.x=r,e.y=o,e.scale=t,e.root.style.transform="scale(".concat(e.scale,") translate(").concat(e.x,"px, ").concat(e.y,"px)")},zoomToPoint:function(t,n){var r=y(e.root),o=r.parent.width-r.parent.padding.left-r.parent.padding.right-r.parent.border.left-r.parent.border.right,i=r.parent.height-r.parent.padding.top-r.parent.padding.bottom-r.parent.border.top-r.parent.border.bottom,a=n.clientX-r.parent.left-r.parent.padding.left-r.parent.border.left-r.elem.margin.left,c=n.clientY-r.parent.top-r.parent.padding.top-r.parent.border.top-r.elem.margin.top,l={x:(a-=r.elem.width/e.scale/2)/o*(o*t),y:(c-=r.elem.height/e.scale/2)/i*(i*t)};return e.zoom(t,{focal:l})},zoomWithWheel:function(t){t.preventDefault();var n=(0===t.deltaY&&t.deltaX?t.deltaX:t.deltaY)<0?1:-1,r=Math.min(Math.max(e.scale*Math.exp(n*e.opts.step/3),e.opts.minScale),e.opts.maxScale);return e.zoomToPoint(r,t)}}}));return(0,p.Z)(t.stageKey),(0,u.tZ)("div",{className:a()("panzoom-parent",g(t)),children:(0,u.BX)("div",{ref:e.rootRef,className:a()("panzoom-root",t.className),children:[(0,u.tZ)("div",{className:"origin"}),(0,u.tZ)("div",{className:"small-grid"}),t.children,(0,u.tZ)("div",{className:"large-grid"})]})})}var g=function(t){return(0,c.iv)(r||(r=(0,o.Z)(["\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  user-select: none;\n  /** This is important for mobile to prevent scrolling while panning */\n  touch-action: none;\n  cursor: auto;\n\n  background-color: ",";\n  \n  .panzoom-root {\n    width: 100%;\n    height: 100%;\n    user-select: none;\n    touch-action: none;\n    transform-origin: 50% 50%;\n    \n    .small-grid, .large-grid {\n      position: absolute;\n      pointer-events: none;\n      left: ","px;\n      top: ","px;\n      width: ","px;\n      height: ","px;\n      background-image:\n        linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),\n        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);\n    }\n    .small-grid {\n      background-size: 10px 10px;\n    }\n    .large-grid {\n      background-size: 60px 60px;\n    }\n    .origin {\n      position: absolute;\n    }\n  }\n"])),t.dark?"#000":"#fff",-1800,-1800,3600,3600)};function h(t,e){var n;if(e.touches){n=0;var r,o=d(e.touches);try{for(o.s();!(r=o.n()).done;){var i=r.value;i.pointerId=n++,h(t,i)}}catch(a){o.e(a)}finally{o.f()}}else(n=t.findIndex((function(t){return t.pointerId===e.pointerId})))>-1&&t.splice(n,1),t.push(e)}function b(t){for(var e,n=(t=t.slice(0)).pop();e=t.pop();)n={clientX:(e.clientX-n.clientX)/2+n.clientX,clientY:(e.clientY-n.clientY)/2+n.clientY};return n}function m(t){if(t.length<2)return 0;var e=t[0],n=t[1];return Math.sqrt(Math.pow(Math.abs(n.clientX-e.clientX),2)+Math.pow(Math.abs(n.clientY-e.clientY),2))}function y(t){var e=t.parentNode,n=window.getComputedStyle(t),r=window.getComputedStyle(e),o=t.getBoundingClientRect(),i=e.getBoundingClientRect();return{elem:{style:n,width:o.width,height:o.height,top:o.top,bottom:o.bottom,left:o.left,right:o.right,margin:x(t,"margin",n),border:x(t,"border",n)},parent:{style:r,width:i.width,height:i.height,top:i.top,bottom:i.bottom,left:i.left,right:i.right,padding:x(e,"padding",r),border:x(e,"border",r)}}}function x(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:window.getComputedStyle(t),r="border"===e?"Width":"";return{left:w("".concat(e,"Left").concat(r),n),right:w("".concat(e,"Right").concat(r),n),top:w("".concat(e,"Top").concat(r),n),bottom:w("".concat(e,"Bottom").concat(r),n)}}function w(t,e){return parseFloat(e[t])||0}},36694:function(t,e,n){n.d(e,{h:function(){return c}});var r=n(58474);function o(t){return function(e){if(function(t){return(0,r.m)(null===t||void 0===t?void 0:t.lift)}(e))return e.lift((function(e){try{return t(e,this)}catch(n){this.error(n)}}));throw new TypeError("Unable to lift unknown Observable type")}}var i=n(70655),a=function(t){function e(e,n,r,o,i){var a=t.call(this,e)||this;return a.onUnsubscribe=i,a._next=n?function(t){try{n(t)}catch(e){this.destination.error(e)}}:t.prototype._next,a._error=r?function(t){try{r(t)}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._error,a._complete=o?function(){try{o()}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._complete,a}return(0,i.ZT)(e,t),e.prototype.unsubscribe=function(){var e;!this.closed&&(null===(e=this.onUnsubscribe)||void 0===e||e.call(this)),t.prototype.unsubscribe.call(this)},e}(n(7038).Lv);function c(t,e){return o((function(n,r){var o=0;n.subscribe(new a(r,(function(n){return t.call(e,n,o++)&&r.next(n)})))}))}}}]);