"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[876],{56876:function(n,e,r){r.r(e),r.d(e,{default:function(){return w}});var t,o=r(52209),c=r(92809),i=r(30266),u=r(809),a=r.n(u),s=r(59748),p=r(88767),l=r(88269),f=r(35490),y=r(91441),m=r(48103),d=r(68451),v=r(83159),g=r(96005),b=r(8311);function h(n,e){var r=Object.keys(n);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(n);e&&(t=t.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),r.push.apply(r,t)}return r}function O(n){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?h(Object(r),!0).forEach((function(e){(0,c.Z)(n,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(r)):h(Object(r)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(r,e))}))}return n}function w(n){var e=(0,p.useQuery)("".concat(n.layoutKey,"-json"),(0,i.Z)(a().mark((function e(){return a().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch((0,y.tU)(n.layoutKey)).then((function(n){return n.json()})));case 1:case"end":return e.stop()}}),e)})))).data,r=s.default.useMemo((function(){return new g.B}),[]),t=s.default.useMemo((function(){var n=((null===e||void 0===e?void 0:e.navPoly)||[]).map((function(n){return m.LA.from(n)})),t=d.J.polysToTriangulation(n),o=g.B.createZone(t);return r.setZoneData(Z,o),{zone:o}}),[e]).zone;return e?(0,b.BX)(v.Z,{gridBounds:f.l,initViewBox:x,maxZoom:6,className:j,children:[(0,b.tZ)("image",O(O({},e.pngRect),{},{className:"geomorph",href:(0,y.qX)(n.layoutKey)})),t.groups.map((function(n){return n.map((function(e){var r=e.id,t=e.centroid,o=e.neighbours;return(0,b.tZ)("g",{children:o.map((function(e){return(0,b.tZ)("line",{className:"edge",x1:t.x,y1:t.y,x2:n[e].centroid.x,y2:n[e].centroid.y})}))},r)}))})),t.groups.map((function(n){return n.map((function(n){var e=n.vertexIds;return(0,b.tZ)("polygon",{className:"navtri",points:"".concat(e.map((function(n){return t.vertices[n]})))})}))})),t.groups.map((function(n){return n.map((function(n){var e=n.id,r=n.centroid;return(0,b.tZ)("circle",{className:"node",cx:r.x,cy:r.y,r:2},e)}))}))]}):null}var j=(0,l.iv)(t||(t=(0,o.Z)(["\n  image.geomorph {\n    /* opacity: 0.8; */\n    filter: invert();\n  }\n  circle.node {\n    fill: red;\n    pointer-events: none;\n  }\n  line.edge {\n    stroke: #900;\n    stroke-width: 3;\n    pointer-events: none;\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      fill: rgba(200, 200, 200, 0.4);\n      stroke: blue;\n    }\n  }  \n"]))),Z="NavGraphDemoZone",x=new m.UL(0,0,600,600)}}]);