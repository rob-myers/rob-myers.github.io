"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[345],{43350:function(n,t,e){e.d(t,{l:function(){return i},r:function(){return o}});var r=e(48103),i=new r.UL(-5e3,-5e3,10001,10001),o=new r.UL(0,0,1200,600)},48103:function(n,t,e){e.d(t,{UL:function(){return r.U},dl:function(){return i.d},LA:function(){return o.L},_3:function(){return u._}});var r=e(72328),i=e(49345),o=e(18264),u=e(63143)},63143:function(n,t,e){e.d(t,{_:function(){return u}});var r=e(79056),i=e(68216),o=e(25997),u=function(){function n(t){return(0,i.Z)(this,n),this.a=1,this.b=0,this.c=0,this.d=1,this.e=0,this.f=0,this.setMatrixValue(t)}return(0,o.Z)(n,[{key:"isIdentity",get:function(){return 1===this.a&&0===this.b&&0===this.c&&1===this.d&&0===this.e&&0===this.f}},{key:"setIdentity",value:function(){this.a=1,this.b=0,this.c=0,this.d=1,this.e=0,this.f=0}},{key:"setMatrixValue",value:function(n){if("string"===typeof n){var t=n.slice("matrix(".length,-")".length).split(",").map(Number);return this.feedFromArray(t)}return n?Array.isArray(n)?this.feedFromArray([this.a,this.b,this.c,this.d,this.e,this.f]):this.feedFromArray([n.a,n.b,n.c,n.d,n.e,n.f]):this}},{key:"setRotation",value:function(n){return this.feedFromArray([Math.cos(n),Math.sin(n),-Math.sin(n),Math.cos(n),0,0])}},{key:"transformPoint",value:function(n){var t=this.a*n.x+this.c*n.y+this.e,e=this.b*n.x+this.d*n.y+this.f;return n.x=t,n.y=e,n}},{key:"feedFromArray",value:function(n){var t=(0,r.Z)(n,6),e=t[0],i=t[1],o=t[2],u=t[3],a=t[4],c=t[5];return this.a=e,this.b=i,this.c=o,this.d=u,this.e=a,this.f=c,this}}]),n}()},18264:function(n,t,e){e.d(t,{L:function(){return m}});var r=e(79056),i=e(17120),o=e(92809),u=e(97131),a=e(68216),c=e(25997),s=e(90831),l=e(32676),f=e(9187),h=e.n(f),y=e(72328),v=e(49345),p=e(63143),d=e(84273);function g(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}var m=function(){function n(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];(0,a.Z)(this,n),this.outline=t,this.holes=e}return(0,c.Z)(n,[{key:"allPoints",get:function(){var n;return(n=this.outline).concat.apply(n,(0,u.Z)(this.holes))}},{key:"center",get:function(){return v.d.average(this.allPoints)}},{key:"geoJson",get:function(){return function(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?g(Object(e),!0).forEach((function(t){(0,o.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):g(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}({type:"Polygon",coordinates:[this.outline.map((function(n){return[n.x,n.y]}))].concat(this.holes.map((function(n){return n.map((function(n){return[n.x,n.y]}))})))},this.meta&&{meta:this.meta})}},{key:"lineSegs",get:function(){return[this.outline].concat((0,u.Z)(this.holes)).reduce((function(n,t){return n.concat(t.map((function(n,e){return[n.clone(),t[(e+1)%t.length].clone()]})))}),[])}},{key:"rect",get:function(){return y.U.from.apply(y.U,(0,u.Z)(this.outline))}},{key:"svgPath",get:function(){return[this.outline].concat((0,u.Z)(this.holes)).map((function(n){return"M".concat(n,"Z")})).join(" ")}},{key:"tangents",get:function(){var n=[this.outline].concat((0,u.Z)(this.holes)).map((function(n){return n.concat(n[0]).reduce((function(n,t,e,r){if(e){var i=t.clone().sub(r[e-1]).length;i<.01&&console.log("saw point length",i)}return e>0?n.concat(t.clone().sub(r[e-1]).normalize()):[]}),[])})),t=(0,i.Z)(n);return{outer:t[0],inner:t.slice(1)}}},{key:"add",value:function(n){return this.translate(n.x,n.y)}},{key:"addMeta",value:function(n){return this.meta=Object.assign(this.meta||{},n),this}},{key:"anticlockwise",value:function(){this.outline.push(this.outline[0]);var n=this.outline.reduce((function(n,t,e,r){return n+(e<r.length-1?(r[e+1].x-t.x)*(r[e+1].y+t.y):0)}),0);return this.outline.pop(),n>0}},{key:"applyMatrix",value:function(n){return n.isIdentity||(this.outline=this.outline.map((function(t){return n.transformPoint(t)})),this.holes.forEach((function(t){return t.map((function(t){return n.transformPoint(t)}))}))),this}},{key:"cleanFinalReps",value:function(){for(var n=0,t=[this.outline].concat((0,u.Z)(this.holes));n<t.length;n++){var e=t[n],r=e.pop();r&&!r.equals(e[0])&&e.push(r)}return this}},{key:"clone",value:function(){return new n(this.outline.map((function(n){return n.clone()})),this.holes.map((function(n){return n.map((function(n){return n.clone()}))})))}},{key:"createInset",value:function(t){if(0===t)return[this.clone()];this.cleanFinalReps();var e,r=[{ring:this.outline,inset:n.insetRing(this.outline,t)}].concat((0,u.Z)(this.holes.map((function(e){return{ring:e,inset:n.insetRing(e,t)}})))).map((function(t){var e=t.ring,r=t.inset;return e.map((function(t,i){return new n([e[i].clone(),r[i],r[(i+1)%e.length],e[(i+1)%e.length].clone()])}))})),o=(0,i.Z)(r),a=o[0],c=o.slice(1);return t>0?n.cutOut(a.concat.apply(a,(0,u.Z)(c)),[this.clone()]):n.union((e=[this.clone()]).concat.apply(e,[a].concat((0,u.Z)(c))))}},{key:"createOutset",value:function(n){return this.createInset(-n)}},{key:"fastTriangulate",value:function(){var n=this.geoJson.coordinates,t=h().flatten(n),e=h()(t.vertices,t.holes,2),r=e.reduce((function(n,t,r){return r%3===2?n.concat([[e[r-2],e[r-1],t]]):n}),[]);return{vs:this.allPoints,tris:r}}},{key:"fixOrientation",value:function(){return this.anticlockwise()&&this.reverse(),this}},{key:"qualityTriangulate",value:function(){try{var n=this.outline.map((function(n,t){return{x:n.x,y:n.y,id:t}})),t=n.length,e=this.holes.map((function(n){return n.map((function(n){return{x:n.x,y:n.y,id:t++}}))})),i=new s.SweepContext(n).addHoles(e).triangulate().getTriangles().map((function(n){return[n.getPoint(0),n.getPoint(1),n.getPoint(2)]})).map((function(n){var t=(0,r.Z)(n,3),e=t[0],i=t[1],o=t[2];return[e.id,i.id,o.id]}));return{vs:this.allPoints,tris:i}}catch(o){return console.error("Quality triangulation failed, falling back to earcut"),console.error(o),this.fastTriangulate()}}},{key:"precision",value:function(n){return this.outline.forEach((function(t){return t.precision(n)})),this.holes.forEach((function(t){return t.forEach((function(t){return t.precision(n)}))})),this}},{key:"removeHoles",value:function(){return this.holes=[],this}},{key:"reverse",value:function(){return this.outline.reverse(),this.holes.forEach((function(n){return n.reverse()})),this}},{key:"round",value:function(){return this.outline.forEach((function(n){return n.round()})),this.holes.forEach((function(n){return n.forEach((function(n){return n.round()}))})),this}},{key:"scale",value:function(n){return this.outline.forEach((function(t){return t.scale(n)})),this.holes.forEach((function(t){return t.forEach((function(t){return t.scale(n)}))})),this}},{key:"translate",value:function(n,t){return this.outline.forEach((function(e){return e.translate(n,t)})),this.holes.forEach((function(e){return e.forEach((function(e){return e.translate(n,t)}))})),this}}],[{key:"cutOut",value:function(t,e){return l.difference.apply(l,[e.map((function(n){return n.geoJson.coordinates}))].concat((0,u.Z)(t.map((function(n){return n.geoJson.coordinates}))))).map((function(t){return n.from(t)}))}},{key:"from",value:function(t){return t instanceof Array?new n(t[0].map((function(n){var t=(0,r.Z)(n,2),e=t[0],i=t[1];return new v.d(e,i)})),t.slice(1).map((function(n){return n.map((function(n){var t=(0,r.Z)(n,2),e=t[0],i=t[1];return new v.d(e,i)}))}))):new n(t.coordinates[0].map((function(n){var t=(0,r.Z)(n,2),e=t[0],i=t[1];return new v.d(e,i)})),t.coordinates.slice(1).map((function(n){return n.map((function(n){var t=(0,r.Z)(n,2),e=t[0],i=t[1];return new v.d(e,i)}))})))}},{key:"fromRect",value:function(t){return new n(t.points)}},{key:"fromAngledRect",value:function(t){var e=n.fromRect(new y.U(0,0,t.rect.width,t.rect.height));return e.applyMatrix((new p._).setRotation(t.angle)),e.translate(t.rect.x,t.rect.y),e}},{key:"insetRing",value:function(t,e){var r=new n(t).tangents.outer,i=t.map((function(n,i){return[n.clone().translate(e*-r[i].y,e*r[i].x),t[(i+1)%t.length].clone().translate(e*-r[i].y,e*r[i].x)]}));return i.map((function(n,t){var e=(t+1)%i.length,o=i[e],u=d.J7.getLinesIntersect(n[1],r[t],o[0],r[e]);return u?n[1].translate(u*r[t].x,u*r[t].y):v.d.average([n[1],o[0]])}))}},{key:"pointInTriangle",value:function(t,e,r,i){var o=n.sign(t,e,r),u=n.sign(t,r,i),a=n.sign(t,i,e);return!((o<0||u<0||a<0)&&(o>0||u>0||a>0))}},{key:"sign",value:function(n,t,e){return(n.x-e.x)*(t.y-e.y)-(t.x-e.x)*(n.y-e.y)}},{key:"union",value:function(t){return l.union.apply(l,[[]].concat((0,u.Z)(t.map((function(n){return n.geoJson.coordinates}))))).map((function(t){return n.from(t)}))}}]),n}();new v.d},83159:function(n,t,e){e.d(t,{Z:function(){return y}});var r,i=e(52209),o=e(79056),u=e(59748),a=e(88269),c=e(94184),s=e.n(c),l=e(48103),f=e(84273),h=e(8311);function y(n){var t=u.useState((function(){var t=n.initViewBox.clone(),o=n.minZoom||.5,u=n.maxZoom||2;return{viewBox:t,panFrom:null,zoom:n.initZoom||1,ptrs:[],ptrDiff:null,zoomTo:function(r,i){var a=Math.min(Math.max(e.zoom+i,o),u);t.x=e.zoom/a*(t.x-r.x)+r.x,t.y=e.zoom/a*(t.y-r.y)+r.y,t.width=1/a*n.initViewBox.width,t.height=1/a*n.initViewBox.height,e.zoom=a},onWheel:function(n){if(n.preventDefault(),"ownerSVGElement"in(n.target||{})){var t=(0,f.zk)((0,f.Xs)(n));e.zoomTo(t,-.003*n.deltaY),e.root.setAttribute("viewBox","".concat(e.viewBox))}},onPointerDown:function(n){"ownerSVGElement"in(n.target||{})&&(e.panFrom=(new l.dl).copy((0,f.zk)((0,f.Xs)(n))),e.ptrs.push((0,f.Xs)(n)))},onPointerMove:function(n){if(e.ptrs=e.ptrs.map((function(t){return t.pointerId===n.pointerId?(0,f.Xs)(n):t})),2===e.ptrs.length){var r=Math.abs(e.ptrs[1].clientX-e.ptrs[0].clientX);if(null!==e.ptrDiff){var i=(0,f._Y)(e.ptrs);e.zoomTo(i,.02*(r-e.ptrDiff)),e.root.setAttribute("viewBox","".concat(e.viewBox))}e.ptrDiff=r}else if(e.panFrom){var o=(0,f.zk)((0,f.Xs)(n));t.delta(e.panFrom.x-o.x,e.panFrom.y-o.y),e.root.setAttribute("viewBox","".concat(e.viewBox))}},onPointerUp:function(n){e.panFrom=null,e.ptrs=e.ptrs.filter((function(t){return n.pointerId!==t.pointerId})),e.ptrs.length<2&&(e.ptrDiff=null)},rootRef:function(n){n&&(e.root=n,n.addEventListener("wheel",e.onWheel,{passive:!1}),n.addEventListener("pointerdown",e.onPointerDown,{passive:!0}),n.addEventListener("pointermove",e.onPointerMove,{passive:!0}),n.addEventListener("pointerup",e.onPointerUp,{passive:!0}),n.addEventListener("pointercancel",e.onPointerUp,{passive:!0}),n.addEventListener("pointerleave",e.onPointerUp,{passive:!0}),n.addEventListener("touchstart",(function(n){return n.preventDefault()}),{passive:!1}))},root:{},rootCss:(0,a.iv)(r||(r=(0,i.Z)(["\n        width: 100%;\n        height: 100%;\n        touch-action: pan-x pan-y pinch-zoom;\n        > g.content {\n          shape-rendering: ",";\n        }\n        > .grid {\n          pointer-events: none;\n        }\n      "])),f.us?"optimizeSpeed":"auto")}})),e=(0,o.Z)(t,1)[0];return(0,h.BX)("svg",{ref:e.rootRef,className:e.rootCss,preserveAspectRatio:"xMinYMin",viewBox:"".concat(e.viewBox),children:[(0,h.tZ)("g",{className:s()("content",n.className),children:n.children}),(0,h.tZ)(v,{bounds:n.gridBounds})]})}function v(n){var t=u.useMemo((function(){return p++}),[]);return(0,h.tZ)(h.HY,{children:[10,60].flatMap((function(e){return[(0,h.tZ)("defs",{children:(0,h.tZ)("pattern",{id:"pattern-grid-".concat(e,"x").concat(e,"--").concat(t),width:e,height:e,patternUnits:"userSpaceOnUse",children:(0,h.tZ)("path",{d:"M ".concat(e," 0 L 0 0 0 ").concat(e),fill:"none",stroke:"rgba(0,0,0,0.5)",strokeWidth:"0.3"})})}),(0,h.tZ)("rect",{className:"grid",x:n.bounds.x,y:n.bounds.y,width:n.bounds.width,height:n.bounds.height,fill:"url(#pattern-grid-".concat(e,"x").concat(e,"--").concat(t,")")})]}))})}var p=0},84273:function(n,t,e){e.d(t,{us:function(){return s},pS:function(){return h},w5:function(){return v},Fx:function(){return f},C1:function(){return l},J7:function(){return M},_Y:function(){return c},zk:function(){return a},po:function(){return p},Xs:function(){return u},A_:function(){return y}});var r;e(70956),e(18264);function i(n,t){var e="undefined"!==typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(!e){if(Array.isArray(n)||(e=function(n,t){if(!n)return;if("string"===typeof n)return o(n,t);var e=Object.prototype.toString.call(n).slice(8,-1);"Object"===e&&n.constructor&&(e=n.constructor.name);if("Map"===e||"Set"===e)return Array.from(n);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return o(n,t)}(n))||t&&n&&"number"===typeof n.length){e&&(n=e);var r=0,i=function(){};return{s:i,n:function(){return r>=n.length?{done:!0}:{done:!1,value:n[r++]}},e:function(n){throw n},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var u,a=!0,c=!1;return{s:function(){e=e.call(n)},n:function(){var n=e.next();return a=n.done,n},e:function(n){c=!0,u=n},f:function(){try{a||null==e.return||e.return()}finally{if(c)throw u}}}}function o(n,t){(null==t||t>n.length)&&(t=n.length);for(var e=0,r=new Array(t);e<t;e++)r[e]=n[e];return r}function u(n){var t;return{pointerId:n instanceof PointerEvent?n.pointerId:null,clientX:n.clientX,clientY:n.clientY,ownerSvg:(null===(t=n.currentTarget)||void 0===t?void 0:t.ownerSVGElement)||n.currentTarget}}function a(n){var t;return(r=r||n.ownerSvg.createSVGPoint()).x=n.clientX,r.y=n.clientY,r.matrixTransform(null===(t=n.ownerSvg.getScreenCTM())||void 0===t?void 0:t.inverse())}function c(n){var t;return(r=r||n[0].ownerSvg.createSVGPoint()).x=r.y=0,n.forEach((function(n){r.x+=n.clientX,r.y+=n.clientY})),r.x/=n.length||1,r.y/=n.length||1,r.matrixTransform(null===(t=n[0].ownerSvg.getScreenCTM())||void 0===t?void 0:t.inverse())}var s="ontouchstart"in window||navigator.maxTouchPoints>0;function l(n,t){var e=!(arguments.length>2&&void 0!==arguments[2])||arguments[2];t.length&&(n.moveTo(t[0].x,t[0].y),t.forEach((function(t){return n.lineTo(t.x,t.y)})),e&&n.fill(),n.closePath())}function f(n,t){var e,r=i(t);try{for(r.s();!(e=r.n()).done;){var o=e.value;n.beginPath(),l(n,o.outline,!1);var u,a=i(o.holes);try{for(a.s();!(u=a.n()).done;){l(n,u.value,!1)}}catch(c){a.e(c)}finally{a.f()}n.fill()}}catch(c){r.e(c)}finally{r.f()}}function h(n,t,e){n.beginPath(),n.moveTo(t.x,t.y),n.lineTo(e.x,e.y),n.stroke()}function y(n,t,e,r){n.fillStyle=t,e&&(n.strokeStyle=e),void 0!==r&&(n.lineWidth=r)}function v(n,t){var e,r=i(t.tris);try{for(r.s();!(e=r.n()).done;){var o=e.value;n.beginPath(),l(n,o.map((function(n){return t.vs[n]})),!1),n.stroke()}}catch(u){r.e(u)}finally{r.f()}}function p(n){return new Promise((function(t,e){var r=new Image;r.onload=function(){return t(r)},r.src=n}))}var d=e(79056),g=e(97131),m=e(68216),x=e(25997),w=e(48103);function b(n,t){var e="undefined"!==typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(!e){if(Array.isArray(n)||(e=function(n,t){if(!n)return;if("string"===typeof n)return k(n,t);var e=Object.prototype.toString.call(n).slice(8,-1);"Object"===e&&n.constructor&&(e=n.constructor.name);if("Map"===e||"Set"===e)return Array.from(n);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return k(n,t)}(n))||t&&n&&"number"===typeof n.length){e&&(n=e);var r=0,i=function(){};return{s:i,n:function(){return r>=n.length?{done:!0}:{done:!1,value:n[r++]}},e:function(n){throw n},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,u=!0,a=!1;return{s:function(){e=e.call(n)},n:function(){var n=e.next();return u=n.done,n},e:function(n){a=!0,o=n},f:function(){try{u||null==e.return||e.return()}finally{if(a)throw o}}}}function k(n,t){(null==t||t>n.length)&&(t=n.length);for(var e=0,r=new Array(t);e<t;e++)r[e]=n[e];return r}var Z=function(){function n(){(0,m.Z)(this,n)}return(0,x.Z)(n,[{key:"getAngledRectSeg",value:function(n){var t=n.angle,e=n.rect,r=P.set(Math.cos(t),Math.sin(t)),i=S.set(-Math.sin(t),Math.cos(t)),o=e.topLeft.addScaledVector(i,.5*e.height);return[o,o.clone().addScaledVector(r,e.width)]}},{key:"getLinesIntersect",value:function(n,t,e,r){return Math.abs(-t.y*r.x+t.x*r.y)<1e-4?null:(r.x*(e.y-n.y)-r.y*(e.x-n.x))/(t.y*r.x-r.y*t.x)}},{key:"getLineLineSegIntersect",value:function(n,t,e,r){var i,o,u,a,c,s=t.x,l=t.y,f=n.x,h=n.y,y=(e.x-f)*-l+(e.y-h)*s,v=(r.x-f)*-l+(r.y-h)*s;return 0===y&&0===v?(a=(e.x-f)*s+(e.y-h)*l,c=(r.x-f)*s+(r.y-h)*l,Math.abs(a)<Math.abs(c)?a:c):y*v<=0?(i=r.x-e.x,0===(u=s*(o=r.y-e.y)-l*i)?null:(h*i+f*-o+(e.x*r.y-e.y*r.x))/u):null}},{key:"getLineSegsIntersection",value:function(n,t,e,r){var i,o,u=t.x-n.x,a=t.y-n.y,c=r.x-e.x,s=r.y-e.y,l=-c*a+u*s;if(0===l){if(n.x*-a+n.y*u===e.x*-a+e.y*u){if(o=c*c+s*s,0<=(i=(n.x-e.x)*c+(n.y-e.y)*s)&&i<=o)return i/o;if(0<=(i=(t.x-e.x)*c+(t.y-e.y)*s)&&i<=o)return i/o}return null}return i=(-a*(n.x-e.x)+u*(n.y-e.y))/l,o=(c*(n.y-e.y)-s*(n.x-e.x))/l,i>=0&&i<=1&&o>=0&&o<=1?o:null}},{key:"joinTriangulations",value:function(n){if(1===n.length)return n[0];var t,e=[],r=[],i=0,o=b(n);try{for(o.s();!(t=o.n()).done;){var u=t.value;e.push.apply(e,(0,g.Z)(u.vs)),r.push.apply(r,(0,g.Z)(u.tris.map((function(n){return n.map((function(n){return n+i}))})))),i+=u.vs.length}}catch(a){o.e(a)}finally{o.f()}return{vs:e,tris:r}}},{key:"lightPolygon",value:function(n,t,e){var r,i,o,u,a=this,c=new w.UL(n.x-t,n.y-t,2*t,2*t),s=e.filter((function(n){var t=n.rect;return c.intersects(t)})),l=new Set(s.reduce((function(n,t){var e=t.outline;return n.concat(e)}),[])),f=s.reduce((function(n,t){var e=(0,d.Z)(t.outline,3),r=e[0],i=e[1],o=e[2];return n.concat([[r,i],[i,o],[o,r]])}),[]),h=w.dl.zero,y=w.dl.zero,v=w.dl.zero,p=null,g=[],m=b(l);try{for(m.s();!(u=m.n()).done;){var x=u.value;y.copy(x).sub(n).normalize(),h.copy(y).rotate(-.001),v.copy(y).rotate(.001),r=i=o=t,f.forEach((function(t){var e=(0,d.Z)(t,2),u=e[0],c=e[1];null!==(p=a.getLineLineSegIntersect(n,h,u,c))&&p>=0&&p<r&&(r=p),null!==(p=a.getLineLineSegIntersect(n,y,u,c))&&p>=0&&p<i&&(i=p),null!==(p=a.getLineLineSegIntersect(n,v,u,c))&&p>=0&&p<o&&(o=p)})),g.push(h.clone().scale(r),y.clone().scale(i),v.clone().scale(o))}}catch(k){m.e(k)}finally{m.f()}return g.sort((function(n,t){return a.radRange(Math.atan2(t.y,t.x))-a.radRange(Math.atan2(n.y,n.x))})),new w.LA(g.map((function(t){return t.add(n)})))}},{key:"polysToTriangulation",value:function(n){var t=n.map((function(n){return n.qualityTriangulate()}));return this.joinTriangulations(t)}},{key:"polyToAngledRect",value:function(n){var t=n.outline,e=P.copy(t[1]).sub(t[0]).length,r=S.copy(t[2]).sub(t[1]).length;return e>=r?{rect:new w.UL(t[0].x,t[0].y,e,r),angle:Math.atan2(P.y,P.x)}:{rect:new w.UL(t[1].x,t[1].y,r,e),angle:Math.atan2(S.y,S.x)}}},{key:"radRange",value:function(n){return(n%=2*Math.PI)>=0?n:2*Math.PI+n}},{key:"removePathReps",value:function(n){var t;return n.reduce((function(n,e){return t&&e.x===t.x&&e.y===t.y||n.push(t=e),n}),[])}},{key:"triangulationToPolys",value:function(n){return n.tris.map((function(t){var e=(0,d.Z)(t,3),r=e[0],i=e[1],o=e[2];return new w.LA([n.vs[r],n.vs[i],n.vs[o]])}))}}]),n}(),P=new w.dl,S=new w.dl,M=new Z}}]);