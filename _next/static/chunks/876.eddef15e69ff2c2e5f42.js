"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[876],{56876:function(e,n,r){r.r(n),r.d(n,{default:function(){return w}});var t,o=r(52209),c=r(92809),i=r(30266),u=r(809),a=r.n(u),s=r(59748),p=r(88767),f=r(88269),l=r(35490),d=r(91441),m=r(48103),y=r(68451),v=r(83159),g=r(96005),h=r(8311);function b(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function O(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?b(Object(r),!0).forEach((function(n){(0,c.Z)(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):b(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function w(e){var n=(0,p.useQuery)("".concat(e.layoutKey,"-json"),(0,i.Z)(a().mark((function n(){return a().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.abrupt("return",fetch((0,d.tU)(e.layoutKey)).then((function(e){return e.json()})));case 1:case"end":return n.stop()}}),n)})))).data,r=s.default.useMemo((function(){return new g.B}),[]),t=s.default.useMemo((function(){var e=((null===n||void 0===n?void 0:n.navPoly)||[]).map((function(e){return m.LA.from(e)})),t=y.J.polysToTriangulation(e),o=g.B.createZone(t);return r.setZoneData(Z,o),{zone:o}}),[n]).zone;return n?(0,h.BX)(v.Z,{gridBounds:l.l,initViewBox:k,maxZoom:6,className:j,children:[(0,h.tZ)("image",O(O({},n.pngRect),{},{className:"geomorph",href:(0,d.qX)(e.layoutKey)})),t.groups.map((function(e){return e.map((function(n){var r=n.id,t=n.centroid,o=n.neighbours;return(0,h.tZ)("g",{children:o.map((function(n){return(0,h.tZ)("line",{className:"edge",x1:t.x,y1:t.y,x2:e[n].centroid.x,y2:e[n].centroid.y})}))},r)}))})),t.groups.map((function(e){return e.map((function(e){var n=e.vertexIds;return(0,h.tZ)("polygon",{className:"navtri",points:"".concat(n.map((function(e){return t.vertices[e]})))})}))})),t.groups.map((function(e){return e.map((function(e){var n=e.id,r=e.centroid;return(0,h.tZ)("circle",{className:"node",cx:r.x,cy:r.y,r:2},n)}))}))]}):null}var j=(0,f.iv)(t||(t=(0,o.Z)(["\n  image.geomorph {\n    filter: invert();\n  }\n  circle.node {\n    fill: red;\n    pointer-events: none;\n  }\n  line.edge {\n    stroke: #900;\n    stroke-width: 3;\n    pointer-events: none;\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover, &:active, &:focus {\n      stroke: green;\n      stroke-width: 4;\n    }\n  }  \n"]))),Z="NavGraphDemoZone",k=new m.UL(0,0,600,600)}}]);