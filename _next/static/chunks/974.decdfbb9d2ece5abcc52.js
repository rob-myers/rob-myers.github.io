"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[974],{37974:function(t,e,r){r.r(e),r.d(e,{default:function(){return h}});var n,o=r(52209),i=r(92809),c=(r(59748),r(88269)),a=r(35490),s=r(91441),u=r(83159),d=r(28645),p=r(8311);function l(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function f(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?l(Object(r),!0).forEach((function(e){(0,i.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function h(t){var e=(0,d.U)(t.layoutKey).data;return(0,p.tZ)(u.Z,{gridBounds:a.l,initViewBox:a.r,maxZoom:8,className:g,children:e&&(0,p.BX)(p.HY,{children:[(0,p.tZ)("image",f(f({},e.pngRect),{},{className:"geomorph",href:(0,s.qX)(t.layoutKey)})),(0,p.tZ)(b,{json:e})]})})}function b(t){var e=t.json;return(0,p.tZ)("foreignObject",f(f({},e.pngRect),{},{xmlns:"http://www.w3.org/1999/xhtml",children:(0,p.tZ)("div",{onPointerUp:function(t){var r=t.target,n=[r.clientWidth,Number(r.getAttribute("data-index"))],o=n[1],i=n[0]<=10?e.doors[o].rect.width:10;r.style.width="".concat(i,"px")},children:e.doors.map((function(t,r){var n=t.rect,o=t.angle;return(0,p.tZ)("div",{className:"door","data-index":r,style:{left:n.x-e.pngRect.x,top:n.y-e.pngRect.y,width:n.width,height:n.height,transformOrigin:"top left",transform:"rotate(".concat(o,"rad)")}})}))})}))}var g=(0,c.iv)(n||(n=(0,o.Z)(["\n  foreignObject {\n    div.door {\n      position: absolute;\n      cursor: pointer;\n      background: white;\n      border: 1px solid black;\n\n      transition: width 500ms ease;\n      &.open {\n        width: 0;\n      }\n    }\n  }\n"])))}}]);