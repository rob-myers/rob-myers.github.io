"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[974],{37974:function(t,n,e){e.r(n),e.d(n,{default:function(){return w}});var r,o=e(52209),c=e(92809),i=e(30266),a=e(809),u=e.n(a),s=(e(59748),e(88269)),p=e(88767),f=e(35490),d=e(91441),l=e(83159),h=e(8311);function g(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function b(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?g(Object(e),!0).forEach((function(n){(0,c.Z)(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):g(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function w(t){var n=(0,p.useQuery)((0,d.tU)(t.layoutKey),(0,i.Z)(u().mark((function n(){return u().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.abrupt("return",fetch((0,d.tU)(t.layoutKey)).then((function(t){return t.json()})));case 1:case"end":return n.stop()}}),n)})))).data;return(0,h.tZ)(l.Z,{gridBounds:f.l,initViewBox:f.r,maxZoom:8,className:m,children:n&&(0,h.BX)(h.HY,{children:[(0,h.tZ)("image",b(b({},n.pngRect),{},{className:"geomorph",href:(0,d.qX)(t.layoutKey)})),(0,h.tZ)(y,{json:n})]})})}function y(t){var n=t.json;return(0,h.tZ)("foreignObject",b(b({},n.pngRect),{},{xmlns:"http://www.w3.org/1999/xhtml",children:(0,h.tZ)("div",{onPointerUp:function(t){var e=t.target,r=[e.clientWidth,Number(e.getAttribute("data-index"))],o=r[1],c=r[0]<=10?n.doors[o].rect.width:10;e.style.width="".concat(c,"px")},children:n.doors.map((function(t,e){var r=t.rect,o=t.angle;return(0,h.tZ)("div",{className:"door","data-index":e,style:{left:r.x-n.pngRect.x,top:r.y-n.pngRect.y,width:r.width,height:r.height,transformOrigin:"top left",transform:"rotate(".concat(o,"rad)")}})}))})}))}var m=(0,s.iv)(r||(r=(0,o.Z)(["\n  foreignObject {\n    div.door {\n      position: absolute;\n      cursor: pointer;\n      background: white;\n      border: 1px solid black;\n\n      transition: width 500ms ease;\n      &.open {\n        width: 0;\n      }\n    }\n  }\n"])))},91441:function(t,n,e){e.d(n,{Dv:function(){return r},tU:function(){return o},qX:function(){return c}});var r={sizePx:11,noTailPx:10,font:"".concat(11,"px sans-serif"),padX:4,padY:2};function o(t){return"/geomorph/".concat(t,".json")}function c(t){return"/geomorph/".concat(t,".png")}}}]);