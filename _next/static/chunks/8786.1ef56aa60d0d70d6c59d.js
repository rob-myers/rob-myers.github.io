"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8786],{8786:function(n,t,e){e.d(t,{te:function(){return d},Vn:function(){return h},LH:function(){return w},Mo:function(){return O}});var r=e(79056),o=e(97131),a=e(92809),l=e(30266),c=e(809),u=e.n(c),s=(e(77503),e(292)),i=e(48103),p=(e(50269),e(68451)),f=e(91441);function m(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function y(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?m(Object(e),!0).forEach((function(t){(0,a.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):m(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function d(n,t,e){return g.apply(this,arguments)}function g(){return(g=(0,l.Z)(u().mark((function n(t,e,a){var l,c,m,d,g,h,O,x,A,L,j,k,P,M,D,Z,R;return u().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(l=new i._3,c={singles:[],obstacles:[],walls:[]},t.items.forEach((function(n,t){var r,a,u;l.feedFromArray(n.transform||[1,0,0,1,0,0]);var s=e[n.symbol],p=s.singles,f=s.obstacles,m=s.walls,y=s.hull;t&&(l.a*=.2,l.b*=.2,l.c*=.2,l.d*=.2);var d=p.map((function(n){return{tags:n.tags,poly:n.poly.clone().applyMatrix(l).precision(4)}})).filter((function(t){var e=t.tags;return n.doors&&e.includes("door")?e.some((function(t){return n.doors.includes(t)})):!n.walls||!e.includes("wall")||e.some((function(t){return n.walls.includes(t)}))}));(r=c.singles).push.apply(r,(0,o.Z)(d)),(a=c.obstacles).push.apply(a,(0,o.Z)(f.map((function(n){return n.clone().applyMatrix(l)})))),(u=c.walls).push.apply(u,(0,o.Z)(i.LA.union([].concat((0,o.Z)(m.map((function(n){return n.clone().applyMatrix(l)}))),(0,o.Z)(w(d,"wall")),(0,o.Z)(y.flatMap((function(n){return n.createOutset(2)})).map((function(n){return n.applyMatrix(l)})))))))})),c.singles.forEach((function(n){return n.poly.fixOrientation().precision(4)})),c.obstacles.forEach((function(n){return n.fixOrientation().precision(4)})),c.walls.forEach((function(n){return n.fixOrientation().precision(4)})),m=w(c.singles,"door"),d=c.walls.flatMap((function(n){return i.LA.cutOut(m,[n])})),g=c.walls,c.walls=i.LA.union(d),c.singles=c.singles.reduce((function(n,t){return n.concat(t.tags.includes("wall")?i.LA.cutOut(m,[t.poly]).map((function(n){return y(y({},t),{},{poly:n})})):t)}),[]),h=t.items.map((function(n){return e[n.symbol]})),O=h[0],x=O.hull.map((function(n){return n.clone().removeHoles()})),A=w(c.singles,"window"),L=i.LA.cutOut([].concat(d.flatMap((function(n){return n.createOutset(12)})),c.obstacles.flatMap((function(n){return n.createOutset(8)}))),x).map((function(n){return n.cleanFinalReps().fixOrientation().precision(4)})),!a){n.next=22;break}return n.next=19,a.triangulate(L,{minAngle:10});case 19:n.t0=n.sent,n.next=23;break;case 22:n.t0={vs:[],tris:[]};case 23:return j=n.t0,(k=(0,s.vL)(0,0).getContext("2d")).font=f.Dv.font,P=v(c.singles,"label").map((function(n){var t=n.poly,e=n.tags,r=t.rect.center.json,o=e.filter((function(n){return"label"!==n})).join(" "),a=!o.match(/[gjpqy]/),l={x:k.measureText(o).width,y:a?f.Dv.noTailPx:f.Dv.sizePx},c={x:r.x-.5*l.x,y:r.y-.5*l.y,width:l.x,height:l.y};return{text:o,center:r,rect:c,padded:(new i.UL).copy(c).outset(f.Dv.padX,f.Dv.padY).json}})),M=i.LA.union(O.hull.concat(g,A)),D=M.flatMap((function(n){return n.holes.map((function(n){return new i.LA(n)}))})),Z=b(D,m),R=c.singles.filter((function(n){return n.tags.includes("door")})).map((function(n){var t=n.poly,e=n.tags,o=p.J.polyToAngledRect(t),a=o.angle,l=o.rect,c=p.J.getAngledRectSeg({angle:a,rect:l}),u=(0,r.Z)(c,2),s=u[0],i=u[1];return{angle:a,rect:l.json,poly:t,tags:e,seg:[s.json,i.json]}})),n.abrupt("return",{key:t.key,id:t.id,def:t,groups:c,holes:D,doors:R,labels:P,navDecomp:j,navPoly:L,roomGraph:Z,hullPoly:O.hull.map((function(n){return n.clone()})),hullTop:i.LA.cutOut(m.concat(A),O.hull),hullRect:i.UL.from.apply(i.UL,(0,o.Z)(O.hull.concat(m).map((function(n){return n.rect})))),items:h.map((function(n,e){return{key:n.key,pngHref:e?"/symbol/".concat(n.key,".png"):"/debug/".concat(t.key,".png"),pngRect:n.pngRect,transformArray:t.items[e].transform,transform:t.items[e].transform?"matrix(".concat(t.items[e].transform,")"):void 0}}))});case 32:case"end":return n.stop()}}),n)})))).apply(this,arguments)}function h(n){var t=n.def,e=n.groups,r=n.holes,o=n.doors,a=n.labels,l=n.navPoly,c=n.navDecomp,u=n.roomGraph,s=n.hullPoly,p=n.hullRect,f=n.hullTop,m=n.items;return{key:t.key,id:t.id,def:t,groups:{obstacles:e.obstacles.map(i.LA.from),singles:e.singles.map((function(n){return{tags:n.tags,poly:i.LA.from(n.poly)}})),walls:e.walls.map(i.LA.from)},holes:r.map(i.LA.from),doors:o.map((function(n){return y(y({},n),{},{poly:i.LA.from(n.poly)})})),labels:a,navPoly:l.map(i.LA.from),navDecomp:c,roomGraph:u,hullPoly:s.map(i.LA.from),hullRect:p,hullTop:f.map(i.LA.from),items:m}}function b(n,t){return{nodes:[].concat((0,o.Z)(n.map((function(n,t){return{id:"hole-".concat(t),type:"room",holeIndex:t}}))),(0,o.Z)(t.map((function(n,t){return{id:"door-".concat(t),type:"door",doorIndex:t}})))),edges:t.flatMap((function(t,e){var r=n.flatMap((function(n,e){return 1===i.LA.union([n,t]).length?e:[]}));return 1===r.length||2===r.length?r.flatMap((function(n){return[{src:"hole-".concat(n),dst:"door-".concat(e)},{dst:"hole-".concat(n),src:"door-".concat(e)}]})):(console.warn("door ".concat(e,": unexpected adjacent holes: ").concat(r)),[])}))}}function w(n,t){return v(n,t).map((function(n){return n.poly}))}function v(n,t){return n.filter((function(n){return n.tags.includes(t)}))}function O(n){return Object.values(n).reduce((function(n,t){return(n[t.key]={key:(e=t).key,hull:e.hull.map(i.LA.from),obstacles:e.obstacles.map(i.LA.from),walls:e.walls.map(i.LA.from),singles:e.singles.map((function(n){var t=n.tags,e=n.poly;return{tags:t,poly:i.LA.from(e)}})),pngRect:e.pngRect,lastModified:e.lastModified})&&n;var e}),{})}}}]);