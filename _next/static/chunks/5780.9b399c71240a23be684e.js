"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5780],{95814:function(e,n,t){t.d(n,{Z:function(){return m}});var r=t(92809),o=t(97131),i=t(30266),u=t(809),c=t.n(u),s=t(88767),a=t(91441),l=t(48103),f=t(2026),d=t(39660),h=t(68451);function p(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function v(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?p(Object(t),!0).forEach((function(n){(0,r.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function m(e){return(0,s.useQuery)((0,a.tU)(e),(0,i.Z)(c().mark((function n(){var t,r,i,u,s,f,p;return c().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.t0=d.Vn,n.next=3,fetch((0,a.tU)(e)).then((function(e){return e.json()}));case 3:return n.t1=n.sent,t=(0,n.t0)(n.t1),r=t.roomGraph,i=r.nodesArray.filter((function(e){return"room"===e.type})).map((function(e,n){var i=r.getEdgesFrom(e).flatMap((function(e){var n=e.dst;return"door"===n.type?t.doors[n.doorId].poly:[]}));return l.LA.union([t.rooms[n]].concat((0,o.Z)(i)))[0]})),u=t.groups.singles.filter((function(e){return e.tags.includes("light")})).map((function(e){var n=e.poly,t=e.tags;return{center:n.center,poly:n,reverse:t.includes("reverse")}})),s=t.groups.singles.filter((function(e){return e.tags.includes("relate-doors")})).reduce((function(e,n){var r=n.poly,i=t.doors.flatMap((function(e,n){return h.J.convexPolysIntersect(e.poly.outline,r.outline)?n:[]}));return i.forEach((function(n){var t;return(t=e[n]||(e[n]=[])).push.apply(t,(0,o.Z)(i.filter((function(e){return e!==n}))))})),i.length<=1&&console.warn("poly tagged 'relate-doors' intersects \u2264 1 doorIds: ".concat(i)),e}),{}),f=t.rooms.map((function(e){return{default:e.center,labels:[],light:{},spawn:[]}})),u.forEach((function(e,n){var r=e.center,o=e.poly,i=e.reverse,u=t.rooms.findIndex((function(e){return e.contains(r)})),c=t.doors.findIndex((function(e){return h.J.convexPolysIntersect(o.outline,e.poly.outline)}));if(-1===u||-1===c)console.warn("useGeomorphData: light ".concat(n," has room/doorId ").concat(u,"/").concat(c));else if(i){var s=t.doors[c].roomIds.find((function(e){return e!==u}));"number"!==typeof s?console.warn("useGeomorphData: reverse light ".concat(n," lacks other roomId (room/doorId ").concat(u,"/").concat(c,")")):u=s}f[u].light[c]=r})),t.groups.singles.filter((function(e){return e.tags.includes("spawn")})).map((function(e){return e.poly.center})).forEach((function(e,n){var r=t.rooms.findIndex((function(n){return n.contains(e)}));r>=0?f[r].spawn.push(e):console.warn("spawn point ".concat(n," should be inside some room"))})),t.labels.forEach((function(e){var n=t.rooms.findIndex((function(n){return n.contains(e.center)}));n>=0?(f[n].labels.push(e),f[n].default=l.dl.from(f[n].labels[0].center)):console.warn("label ".concat(e.text," should be inside some room"))})),(p=v(v({},t),{},{hullDoors:t.doors.filter((function(e){return e.tags.includes("hull")})),hullOutline:t.hullPoly[0].removeHoles(),pngRect:l.UL.fromJson(t.items[0].pngRect),roomsWithDoors:i,relDoorId:s,point:f,lazy:null})).lazy=g(p),y(p),n.abrupt("return",p);case 17:case"end":return n.stop()}}),n)}))),{cacheTime:1/0,keepPreviousData:!0,staleTime:1/0})}function g(e){var n={roomNavPoly:{}},t=new Proxy({},{get:function(t,r){if("string"===typeof r){var o=Number(r);if(e.roomsWithDoors[o]&&!n.roomNavPoly[o]){var i=l.LA.intersect(e.navPoly,[e.roomsWithDoors[o]]);i.sort((function(e,n){return e.rect.area>n.rect.area?-1:1})),n.roomNavPoly[o]=i[0]}return n.roomNavPoly[o]}}});return new Proxy(n,{get:function(e,n){if("roomNavPoly"===n)return t}})}function y(e){e.navZone.doorNodeIds.forEach((function(n,t){var r=e.doors[t];if(e.hullDoors.includes(r)){var i,u=r.roomIds.find((function(e){return null!==e}));if(Number.isFinite(u))(i=e.navZone.roomNodeIds[u]).push.apply(i,(0,o.Z)(n));else(0,f.ZK)("extendRoomNodeIds: ".concat(e.key," (hull) door ").concat(t," has empty roomIds"))}}))}},19964:function(e,n,t){t.d(n,{Z:function(){return Z}});var r=t(97131),o=t(79056),i=t(68216),u=t(25997),c=t(14695),s=t(91077),a=t(30268),l=t(92953),f=t(92809),d=t(48103),h=t(82405),p=t(81033),v=function(){function e(n){(0,i.Z)(this,e),this.content=[],this.scoreFunction=n}return(0,u.Z)(e,[{key:"push",value:function(e){this.content.push(e),this.sinkDown(this.content.length-1)}},{key:"pop",value:function(){var e=this.content[0],n=this.content.pop();return this.content.length>0&&(this.content[0]=n,this.bubbleUp(0)),e}},{key:"remove",value:function(e){var n=this.content.indexOf(e),t=this.content.pop();n!==this.content.length-1&&(this.content[n]=t,this.scoreFunction(t)<this.scoreFunction(e)?this.sinkDown(n):this.bubbleUp(n))}},{key:"size",value:function(){return this.content.length}},{key:"rescoreElement",value:function(e){this.sinkDown(this.content.indexOf(e))}},{key:"sinkDown",value:function(e){for(var n=this.content[e];e>0;){var t=(e+1>>1)-1,r=this.content[t];if(!(this.scoreFunction(n)<this.scoreFunction(r)))break;this.content[t]=n,this.content[e]=r,e=t}}},{key:"bubbleUp",value:function(e){for(var n=this.content.length,t=this.content[e],r=this.scoreFunction(t);;){var o=e+1<<1,i=o-1,u=null,c=-1/0;if(i<n){var s=this.content[i];(c=this.scoreFunction(s))<r&&(u=i)}if(o<n){var a=this.content[o];this.scoreFunction(a)<(null===u?r:c)&&(u=o)}if(null===u)break;this.content[e]=this.content[u],this.content[u]=t,e=u}}}]),e}(),m=function(){function e(){(0,i.Z)(this,e)}return(0,u.Z)(e,null,[{key:"init",value:function(e){for(var n=e.nodesArray,t=0;t<n.length;t++){var r=n[t];r.f=0,r.g=0,r.h=0,r.cost=1,r.visited=!1,r.closed=!1,r.parent=null}}},{key:"cleanUp",value:function(e){for(var n=0;n<e.length;n++){var t=e[n];delete t.f,delete t.g,delete t.h,delete t.cost,delete t.visited,delete t.closed,delete t.parent}}},{key:"heap",value:function(){return new v((function(e){return e.f}))}},{key:"search",value:function(e,n,t){this.init(e);var r=e.nodesArray,o=this.heap();for(o.push(n);o.size()>0;){var i=o.pop();if(i===t){for(var u=i,c=[];u.parent;)c.push(u),u=u.parent;return c.push(n),this.cleanUp(c),c.reverse(),c}i.closed=!0;for(var s=this.neighbours(r,i),a=0,l=s.length;a<l;a++){var f=s[a];if(!f.closed){var d=i.g+f.cost,h=f.visited;if(!h||d<f.g){if(f.visited=!0,f.parent=i,!f.centroid||!t.centroid)throw new Error("Unexpected state");f.h=f.h||this.heuristic(f.centroid,t.centroid),f.g=d,f.f=f.g+f.h,h?o.rescoreElement(f):o.push(f)}}}}return[]}},{key:"heuristic",value:function(e,n){return p.c.distanceToSquared(e,n)}},{key:"neighbours",value:function(e,n){for(var t=[],r=0;r<n.neighbours.length;r++)t.push(e[n.neighbours[r]]);return t}}]),e}(),g=function(){function e(){(0,i.Z)(this,e),this.portals=[]}return(0,u.Z)(e,[{key:"push",value:function(e,n){void 0===n&&(n=e),this.portals.push({left:e,right:n})}},{key:"stringPull",value:function(){var e,n,t,r=this.portals,o=[],i=0,u=0,c=0;e=r[0].left,n=r[0].left,t=r[0].right,o.push(e);for(var s=1;s<r.length;s++){var a=r[s].left,l=r[s].right;if(p.c.triarea2(e,t,l)<=0){if(!(p.c.vequal(e,t)||p.c.triarea2(e,n,l)>0)){o.push(n),n=e=n,t=e,u=i=u,c=i,s=i;continue}t=l,c=s}if(p.c.triarea2(e,n,a)>=0){if(!(p.c.vequal(e,n)||p.c.triarea2(e,t,a)<0)){o.push(t),n=e=t,t=e,u=i=c,c=i,s=i;continue}n=a,u=s}}return 0!==o.length&&p.c.vequal(o[o.length-1],r[r.length-1].left)||o.push(r[r.length-1].left),this.path=o,o}}]),e}(),y=t(68451);function b(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function I(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?b(Object(t),!0).forEach((function(n){(0,f.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):b(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function k(e,n){var t="undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=function(e,n){if(!e)return;if("string"===typeof e)return P(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return P(e,n)}(e))||n&&e&&"number"===typeof e.length){t&&(e=t);var r=0,o=function(){};return{s:o,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,u=!0,c=!1;return{s:function(){t=t.call(e)},n:function(){var e=t.next();return u=e.done,e},e:function(e){c=!0,i=e},f:function(){try{u||null==t.return||t.return()}finally{if(c)throw i}}}}function P(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,r=new Array(n);t<n;t++)r[t]=e[t];return r}function O(e){var n=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var t,r=(0,l.Z)(e);if(n){var o=(0,l.Z)(this).constructor;t=Reflect.construct(r,arguments,o)}else t=r.apply(this,arguments);return(0,a.Z)(this,t)}}var w=function(e){(0,s.Z)(t,e);var n=O(t);function t(e){var r;(0,i.Z)(this,t),r=n.call(this),(0,f.Z)((0,c.Z)(r),"gm",void 0),(0,f.Z)((0,c.Z)(r),"vectors",void 0),(0,f.Z)((0,c.Z)(r),"nodeToMeta",void 0),r.gm=e,r.vectors=e.navZone.vertices.map(d.dl.from);var o=e.navZone.groups.flatMap((function(e){return e}));return r.nodeToMeta=o.map((function(e){return{doorId:-1,roomId:-1}})),e.navZone.doorNodeIds.forEach((function(e,n){e.forEach((function(e){r.nodeToMeta[e].doorId=n,o[e].neighbours.flatMap((function(e){return o[e].neighbours})).forEach((function(e){return r.nodeToMeta[e].nearDoorId=n}))}))})),e.navZone.roomNodeIds.forEach((function(e,n){e.forEach((function(e){return r.nodeToMeta[e].roomId=n}))})),r}return(0,u.Z)(t,[{key:"findPath",value:function(e,n){var t=this,i=this.getClosestNode(e),u=this.getClosestNode(n);if(!i||!u)return null;var c,s=m.search(this,i,u),a=s.reduce((function(e,n){var r=e.length?e[e.length-1]:void 0,o=t.nodeToMeta[n.index],i=o.doorId>=0?"door":"room";return(null===r||void 0===r?void 0:r.key)===i?r.nodes.push(n):(e.push("door"===i?{key:i,nodes:[n],doorId:o.doorId}:{key:i,nodes:[n],roomId:o.roomId}),"room"===i&&-1===o.roomId&&console.warn("findPathNew: expected roomId for node",n,o)),e}),[]),l=[e.clone()],f=[],h=-1,p=-1,v=k(a.entries());try{for(v.s();!(c=v.n()).done;){var g=(0,o.Z)(c.value,2),b=g[0],P=g[1];if("door"===P.key){if("break"===function(){var r=t.gm.doors[P.doorId];if(b>0){var o=a[b-1].roomId,i={index:l.length-1,doorId:P.doorId,hullDoorId:t.gm.hullDoors.indexOf(r),otherRoomId:r.roomIds[1-r.roomIds.findIndex((function(e){return e===o}))]};f.push(I(I({key:"pre-exit-room"},i),{},{willExitRoomId:o})),f.push(I(I({key:"exit-room"},i),{},{exitedRoomId:o}))}else h=P.doorId;if(!a[b+1])return l.push(n.clone()),p=P.doorId,"break";var u=a[b+1].roomId,c=r.entries[r.roomIds.findIndex((function(e){return e===u}))];0===b&&e.distanceTo(c)<.1||l.push(c.clone())}())break}else!function(){var o=P.roomId,i=0===b?e:l[l.length-1],u=n;if(b<a.length-1){var c=t.gm.doors[a[b+1].doorId];u=c.entries[c.roomIds.findIndex((function(e){return e===o}))]}if(b>0){var s=a[b-1].doorId,h=t.gm.doors[s];f.push({key:"enter-room",index:l.length-1,doorId:s,hullDoorId:t.gm.hullDoors.indexOf(h),enteredRoomId:o,otherRoomId:h.roomIds[1-h.roomIds.findIndex((function(e){return e===o}))]})}var p=t.gm.lazy.roomNavPoly[o];if(!y.J.lineSegCrossesPolygon(i,u,p))l.push(u.clone());else{var v=t.computeStringPull(i,u,P.nodes).path.map(d.dl.from);l.push.apply(l,(0,r.Z)(y.J.removePathReps(v.slice(1))))}if(!a[b+1]){var m=t.nodeToMeta[P.nodes[P.nodes.length-1].index];if(void 0!==m.nearDoorId&&m.nearDoorId>=0){var g=t.gm.doors[m.nearDoorId];f.push({key:"pre-near-door",index:l.length-1,doorId:m.nearDoorId,hullDoorId:t.gm.hullDoors.indexOf(g),currentRoomId:o,otherRoomId:g.roomIds[1-g.roomIds.findIndex((function(e){return e===o}))]})}}}()}}catch(O){v.e(O)}finally{v.f()}return console.log("findPath",{nodePath:s,nodeMetas:s.map((function(e){return t.nodeToMeta[e.index]})),partition:a,fullPath:l,navMetas:f}),{fullPath:l,navMetas:f,doorIds:[h,p]}}},{key:"getClosestNode",value:function(e){var n=this.nodesArray,t=this.vectors,r=null,o=1/0;return n.forEach((function(n){var i=n.centroid.distanceToSquared(e);i<o&&p.c.isVectorInPolygon(e,n,t)&&(r=n,o=i)})),r||n.forEach((function(n){var t=p.c.distanceToSquared(n.centroid,e);t<o&&(r=n,o=t)})),r}},{key:"getPortalFromTo",value:function(e,n){for(var t=0;t<e.neighbours.length;t++)if(e.neighbours[t]===n.index)return e.portals[t]}},{key:"computeStringPull",value:function(e,n,t){var r=new g;r.push(e);for(var o=0;o<t.length;o++){var i=t[o],u=t[o+1];if(u){var c=this.getPortalFromTo(i,u);r.push(this.vectors[c[0]],this.vectors[c[1]])}}return r.push(n),r.stringPull(),r}}],[{key:"fromZone",value:function(e){for(var n=e.navZone,r=n.groups,i=(n.vertices,new t(e)),u=r.flatMap((function(e){return e})),c=0,s=Object.entries(u);c<s.length;c++){var a=(0,o.Z)(s[c],2),l=a[0],f=a[1];i.registerNode({type:"tri",id:"tri-".concat(l),index:Number(l),vertexIds:f.vertexIds.slice(),portals:f.portals.map((function(e){return e.slice()})),cost:1,visited:!1,closed:!1,parent:null,centroid:d.dl.from(f.centroid),neighbours:f.neighbours.slice()})}for(var h=function(){var e=(0,o.Z)(v[p],2),n=e[0],t=e[1],r="tri-".concat(n);t.neighbours.map((function(e){return"tri-".concat(e)})).forEach((function(e){return i.registerEdge({src:r,dst:e})}))},p=0,v=Object.entries(u);p<v.length;p++)h();return i}}]),t}(h.b),x=t(88767);function Z(e,n,t){return(0,x.useQuery)(function(e){return"pathfinding-".concat(e)}(e),(function(){return{graph:w.fromZone(n)}}),{enabled:!!n&&!t,keepPreviousData:!0,staleTime:1/0})}}}]);