"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5814],{95814:function(e,t,n){n.d(t,{Z:function(){return g}});var r=n(92809),o=n(79056),l=n(30266),a=n(809),c=n.n(a),u=n(88767),s=n(91441),i=n(48103),p=n(68451),f=n(8786);function m(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function y(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?m(Object(n),!0).forEach((function(t){(0,r.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):m(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function g(e){return(0,u.useQuery)((0,s.tU)(e),(0,l.Z)(c().mark((function t(){var n,r,l,a,u;return c().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,Promise.all([fetch((0,s.tU)(e)).then((function(e){return e.json()})).then(f.Vn),new Promise((function(t,n){var r=new Image;r.onload=function(){return t(r)},r.onerror=n,r.src=(0,s.qX)(e)}))]);case 2:return n=t.sent,r=(0,o.Z)(n,2),l=r[0],a=r[1],u=y(y({},l),{},{image:a,d:{doors:l.groups.singles.filter((function(e){return e.tags.includes("door")})).map((function(e){var t=e.poly,n=e.tags,r=p.J.polyToAngledRect(t),l=r.angle,a=r.rect,c=p.J.getAngledRectSeg({angle:l,rect:a}),u=(0,o.Z)(c,2),s=u[0],i=u[1];return{angle:l,rect:a.json,poly:t.geoJson,tags:n,seg:[s.json,i.json]}})),hullOutine:l.hullPoly[0].removeHoles(),pngRect:i.UL.fromJson(l.items[0].pngRect)}}),t.abrupt("return",u);case 8:case"end":return t.stop()}}),t)}))),{keepPreviousData:!0,cacheTime:1/0})}},8786:function(e,t,n){n.d(t,{te:function(){return m},Vn:function(){return g},LH:function(){return b},Mo:function(){return h}});var r=n(92809),o=n(97131),l=n(30266),a=n(809),c=n.n(a),u=(n(77503),n(292)),s=n(48103),i=n(91441);n(50269);function p(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function f(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?p(Object(n),!0).forEach((function(t){(0,r.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):p(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function m(e,t,n){return y.apply(this,arguments)}function y(){return(y=(0,l.Z)(c().mark((function e(t,n,r){var l,a,p,m,y,g,h,O,w,v,j,P,L,x,A;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(l=new s._3,a={singles:[],obstacles:[],walls:[]},t.items.forEach((function(e,t){var r,c,u;l.feedFromArray(e.transform||[1,0,0,1,0,0]);var i=n[e.symbol],p=i.singles,f=i.obstacles,m=i.walls,y=i.hull;t&&(l.a*=.2,l.b*=.2,l.c*=.2,l.d*=.2);var g=p.map((function(e){return{tags:e.tags,poly:e.poly.clone().applyMatrix(l).precision(4)}})).filter((function(t){var n=t.tags;return e.doors&&n.includes("door")?n.some((function(t){return e.doors.includes(t)})):!e.walls||!n.includes("wall")||n.some((function(t){return e.walls.includes(t)}))}));(r=a.singles).push.apply(r,(0,o.Z)(g)),(c=a.obstacles).push.apply(c,(0,o.Z)(f.map((function(e){return e.clone().applyMatrix(l)})))),(u=a.walls).push.apply(u,(0,o.Z)(s.LA.union([].concat((0,o.Z)(m.map((function(e){return e.clone().applyMatrix(l)}))),(0,o.Z)(b(g,"wall")),(0,o.Z)(y.flatMap((function(e){return e.createOutset(2)})).map((function(e){return e.applyMatrix(l)})))))))})),a.singles.forEach((function(e){return e.poly.fixOrientation().precision(4)})),a.obstacles.forEach((function(e){return e.fixOrientation().precision(4)})),a.walls.forEach((function(e){return e.fixOrientation().precision(4)})),p=b(a.singles,"door"),m=a.walls.flatMap((function(e){return s.LA.cutOut(p,[e])})),y=a.walls,a.walls=s.LA.union(m),a.singles=a.singles.reduce((function(e,t){return e.concat(t.tags.includes("wall")?s.LA.cutOut(p,[t.poly]).map((function(e){return f(f({},t),{},{poly:e})})):t)}),[]),g=t.items.map((function(e){return n[e.symbol]})),h=g[0],O=h.hull.map((function(e){return e.clone().removeHoles()})),w=b(a.singles,"window"),v=s.LA.cutOut([].concat(m.flatMap((function(e){return e.createOutset(12)})),a.obstacles.flatMap((function(e){return e.createOutset(8)}))),O).map((function(e){return e.cleanFinalReps().fixOrientation().precision(4)})),!r){e.next=22;break}return e.next=19,r.triangulate(v,{minAngle:10});case 19:e.t0=e.sent,e.next=23;break;case 22:e.t0={vs:[],tris:[]};case 23:return j=e.t0,(P=(0,u.vL)(0,0).getContext("2d")).font=i.Dv.font,L=d(a.singles,"label").map((function(e){var t=e.poly,n=e.tags,r=t.rect.center.json,o=n.filter((function(e){return"label"!==e})).join(" "),l=!o.match(/[gjpqy]/),a={x:P.measureText(o).width,y:l?i.Dv.noTailPx:i.Dv.sizePx},c={x:r.x-.5*a.x,y:r.y-.5*a.y,width:a.x,height:a.y};return{text:o,center:r,rect:c,padded:(new s.UL).copy(c).outset(i.Dv.padX,i.Dv.padY).json}})),x=s.LA.union(h.hull.concat(y,w)),A=x.flatMap((function(e){return e.holes.map((function(e){return new s.LA(e)}))})),e.abrupt("return",{key:t.key,id:t.id,def:t,groups:a,navPoly:v,navDecomp:j,walls:m,labels:L,allHoles:A,hullPoly:h.hull.map((function(e){return e.clone()})),hullTop:s.LA.cutOut(p.concat(w),h.hull),hullRect:s.UL.from.apply(s.UL,(0,o.Z)(h.hull.concat(p).map((function(e){return e.rect})))),items:g.map((function(e,n){return{key:e.key,pngHref:n?"/symbol/".concat(e.key,".png"):"/debug/".concat(t.key,".png"),pngRect:e.pngRect,transformArray:t.items[n].transform,transform:t.items[n].transform?"matrix(".concat(t.items[n].transform,")"):void 0}}))});case 30:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function g(e){var t=e.def,n=e.groups,r=e.walls,o=e.allHoles,l=e.labels,a=e.navPoly,c=e.navDecomp,u=e.hullPoly,i=e.hullRect,p=e.hullTop,f=e.items;return{key:t.key,id:t.id,def:t,groups:{obstacles:n.obstacles.map(s.LA.from),singles:n.singles.map((function(e){return{tags:e.tags,poly:s.LA.from(e.poly)}})),walls:n.walls.map(s.LA.from)},navPoly:a.map(s.LA.from),navDecomp:c,walls:r.map(s.LA.from),labels:l,allHoles:o.map(s.LA.from),hullPoly:u.map(s.LA.from),hullRect:i,hullTop:p.map(s.LA.from),items:f}}function b(e,t){return d(e,t).map((function(e){return e.poly}))}function d(e,t){return e.filter((function(e){return e.tags.includes(t)}))}function h(e){return Object.values(e).reduce((function(e,t){return(e[t.key]={key:(n=t).key,hull:n.hull.map(s.LA.from),obstacles:n.obstacles.map(s.LA.from),walls:n.walls.map(s.LA.from),singles:n.singles.map((function(e){var t=e.tags,n=e.poly;return{tags:t,poly:s.LA.from(n)}})),pngRect:n.pngRect,lastModified:n.lastModified})&&e;var n}),{})}}}]);