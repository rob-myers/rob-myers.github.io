"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6876],{56876:function(n,e,r){r.r(e),r.d(e,{default:function(){return m}});var t,o=r(52209),i=r(92809),c=(r(59748),r(88269)),a=r(35490),u=r(91441),s=r(48103),l=r(83159),p=r(21225),f=r(21416),d=r(8311);function v(n,e){var r=Object.keys(n);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(n);e&&(t=t.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),r.push.apply(r,t)}return r}function y(n){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?v(Object(r),!0).forEach((function(e){(0,i.Z)(n,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(r)):v(Object(r)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(r,e))}))}return n}function m(n){var e=(0,p.Z)(n.layoutKey).data,r=(0,f.Z)(n.layoutKey,null===e||void 0===e?void 0:e.navDecomp,n.disabled).data;return(0,d.BX)(l.Z,{gridBounds:a.l,initViewBox:b,maxZoom:6,className:g,dark:!0,children:[e&&(0,d.tZ)("image",y(y({},e.pngRect),{},{className:"geomorph",href:(0,u.qX)(n.layoutKey)})),r&&!n.disabled&&(0,d.BX)(d.HY,{children:[r.zone.groups.map((function(n){return n.map((function(e){var r=e.id,t=e.centroid,o=e.neighbours;return(0,d.tZ)("g",{children:o.map((function(e){return(0,d.tZ)("line",{className:"edge",x1:t.x,y1:t.y,x2:n[e].centroid.x,y2:n[e].centroid.y})}))},r)}))})),r.zone.groups.map((function(n){return n.map((function(n){var e=n.vertexIds;return(0,d.tZ)("polygon",{className:"navtri",points:"".concat(e.map((function(n){var e;return null===(e=r.zone)||void 0===e?void 0:e.vertices[n]})))})}))})),r.zone.groups.map((function(n){return n.map((function(n){var e=n.id,r=n.centroid;return(0,d.tZ)("circle",{className:"node",cx:r.x,cy:r.y,r:2},e)}))}))]})]})}var g=(0,c.iv)(t||(t=(0,o.Z)(["\n  image.geomorph {\n    /* filter: invert(); */\n  }\n  circle.node {\n    fill: red;\n    pointer-events: none;\n  }\n  line.edge {\n    stroke: #900;\n    stroke-width: 1;\n    pointer-events: none;\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    transition: fill 2s;\n    &:hover, &:active, &:focus {\n      fill: #8080ff37;\n      stroke-width: 6;\n    }\n  }  \n"]))),b=new s.UL(0,0,600,600)}}]);