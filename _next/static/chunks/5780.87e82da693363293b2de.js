"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5780],{95814:function(e,n,t){t.d(n,{Z:function(){return m}});var o=t(92809),r=t(97131),i=t(30266),u=t(809),s=t.n(u),c=t(88767),a=t(91441),l=t(48103),f=t(2026),d=t(39660),h=t(68451);function p(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function v(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?p(Object(t),!0).forEach((function(n){(0,o.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function m(e){return(0,c.useQuery)((0,a.tU)(e),(0,i.Z)(s().mark((function n(){var t,o,i,u,c,f,p;return s().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.t0=d.Vn,n.next=3,fetch((0,a.tU)(e)).then((function(e){return e.json()}));case 3:return n.t1=n.sent,t=(0,n.t0)(n.t1),o=t.roomGraph,i=o.nodesArray.filter((function(e){return"room"===e.type})).map((function(e,n){var i=o.getEdgesFrom(e).flatMap((function(e){var n=e.dst;return"door"===n.type?t.doors[n.doorId].poly:[]}));return l.LA.union([t.rooms[n]].concat((0,r.Z)(i)))[0]})),u=t.groups.singles.filter((function(e){return e.tags.includes("light")})).map((function(e){var n=e.poly,t=e.tags;return{center:n.center,poly:n,reverse:t.includes("reverse")}})),c=t.groups.singles.filter((function(e){return e.tags.includes("relate-doors")})).reduce((function(e,n){var o=n.poly,i=t.doors.flatMap((function(e,n){return h.J.convexPolysIntersect(e.poly.outline,o.outline)?n:[]}));return i.forEach((function(n){var t;return(t=e[n]||(e[n]=[])).push.apply(t,(0,r.Z)(i.filter((function(e){return e!==n}))))})),i.length<=1&&console.warn("poly tagged 'relate-doors' intersects \u2264 1 doorIds: ".concat(i)),e}),{}),f=t.rooms.map((function(e){return{default:e.center,labels:[],light:{},spawn:[]}})),u.forEach((function(e,n){var o=e.center,r=e.poly,i=e.reverse,u=t.rooms.findIndex((function(e){return e.contains(o)})),s=t.doors.findIndex((function(e){return h.J.convexPolysIntersect(r.outline,e.poly.outline)}));if(-1===u||-1===s)console.warn("useGeomorphData: light ".concat(n," has room/doorId ").concat(u,"/").concat(s));else if(i){var c=t.doors[s].roomIds.find((function(e){return e!==u}));"number"!==typeof c?console.warn("useGeomorphData: reverse light ".concat(n," lacks other roomId (room/doorId ").concat(u,"/").concat(s,")")):u=c}f[u].light[s]=o})),t.groups.singles.filter((function(e){return e.tags.includes("spawn")})).map((function(e){return e.poly.center})).forEach((function(e,n){var o=t.rooms.findIndex((function(n){return n.contains(e)}));o>=0?f[o].spawn.push(e):console.warn("spawn point ".concat(n," should be inside some room"))})),t.labels.forEach((function(e){var n=t.rooms.findIndex((function(n){return n.contains(e.center)}));n>=0?(f[n].labels.push(e),f[n].default=l.dl.from(f[n].labels[0].center)):console.warn("label ".concat(e.text," should be inside some room"))})),(p=v(v({},t),{},{hullDoors:t.doors.filter((function(e){return e.tags.includes("hull")})),hullOutline:t.hullPoly[0].removeHoles(),pngRect:l.UL.fromJson(t.items[0].pngRect),roomsWithDoors:i,relDoorId:c,point:f,lazy:null,getHullDoorId:function(e){var n="number"===typeof e?this.doors[e]:e;return this.hullDoors.findIndex((function(e){return e===n}))},getOtherRoomId:function(e,n){return("number"===typeof e?this.doors[e]:e).roomIds.find((function(e){return e!==n}))||-1},isHullDoor:function(e){return("number"===typeof e?this.doors[e]:e).roomIds.includes(null)}})).lazy=g(p),y(p),n.abrupt("return",p);case 17:case"end":return n.stop()}}),n)}))),{cacheTime:1/0,keepPreviousData:!0,staleTime:1/0})}function g(e){var n={roomNavPoly:{}},t=new Proxy({},{get:function(t,o){if("string"===typeof o){var r=Number(o);if(e.roomsWithDoors[r]&&!n.roomNavPoly[r]){var i=l.LA.intersect(e.navPoly,[e.roomsWithDoors[r]]);i.sort((function(e,n){return e.rect.area>n.rect.area?-1:1})),n.roomNavPoly[r]=i[0]}return n.roomNavPoly[r]}}});return new Proxy(n,{get:function(e,n){if("roomNavPoly"===n)return t}})}function y(e){e.navZone.doorNodeIds.forEach((function(n,t){var o=e.doors[t];if(e.hullDoors.includes(o)){var i,u=o.roomIds.find((function(e){return null!==e}));if(Number.isFinite(u))(i=e.navZone.roomNodeIds[u]).push.apply(i,(0,r.Z)(n));else(0,f.ZK)("extendRoomNodeIds: ".concat(e.key," (hull) door ").concat(t," has empty roomIds"))}}))}},19964:function(e,n,t){t.d(n,{Z:function(){return Z}});var o=t(97131),r=t(79056),i=t(68216),u=t(25997),s=t(14695),c=t(91077),a=t(30268),l=t(92953),f=t(92809),d=t(48103),h=t(82405),p=t(81033),v=function(){function e(n){(0,i.Z)(this,e),this.content=[],this.scoreFunction=n}return(0,u.Z)(e,[{key:"push",value:function(e){this.content.push(e),this.sinkDown(this.content.length-1)}},{key:"pop",value:function(){var e=this.content[0],n=this.content.pop();return this.content.length>0&&(this.content[0]=n,this.bubbleUp(0)),e}},{key:"remove",value:function(e){var n=this.content.indexOf(e),t=this.content.pop();n!==this.content.length-1&&(this.content[n]=t,this.scoreFunction(t)<this.scoreFunction(e)?this.sinkDown(n):this.bubbleUp(n))}},{key:"size",value:function(){return this.content.length}},{key:"rescoreElement",value:function(e){this.sinkDown(this.content.indexOf(e))}},{key:"sinkDown",value:function(e){for(var n=this.content[e];e>0;){var t=(e+1>>1)-1,o=this.content[t];if(!(this.scoreFunction(n)<this.scoreFunction(o)))break;this.content[t]=n,this.content[e]=o,e=t}}},{key:"bubbleUp",value:function(e){for(var n=this.content.length,t=this.content[e],o=this.scoreFunction(t);;){var r=e+1<<1,i=r-1,u=null,s=-1/0;if(i<n){var c=this.content[i];(s=this.scoreFunction(c))<o&&(u=i)}if(r<n){var a=this.content[r];this.scoreFunction(a)<(null===u?o:s)&&(u=r)}if(null===u)break;this.content[e]=this.content[u],this.content[u]=t,e=u}}}]),e}(),m=function(){function e(){(0,i.Z)(this,e)}return(0,u.Z)(e,null,[{key:"init",value:function(e){for(var n=e.nodesArray,t=0;t<n.length;t++){var o=n[t];o.f=0,o.g=0,o.h=0,o.cost=1,o.visited=!1,o.closed=!1,o.parent=null}}},{key:"cleanUp",value:function(e){for(var n=0;n<e.length;n++){var t=e[n];delete t.f,delete t.g,delete t.h,delete t.cost,delete t.visited,delete t.closed,delete t.parent}}},{key:"heap",value:function(){return new v((function(e){return e.f}))}},{key:"search",value:function(e,n,t){this.init(e);var o=e.nodesArray,r=this.heap();for(r.push(n);r.size()>0;){var i=r.pop();if(i===t){for(var u=i,s=[];u.parent;)s.push(u),u=u.parent;return s.push(n),this.cleanUp(s),s.reverse(),s}i.closed=!0;for(var c=this.neighbours(o,i),a=0,l=c.length;a<l;a++){var f=c[a];if(!f.closed){var d=i.g+f.cost,h=f.visited;if(!h||d<f.g){if(f.visited=!0,f.parent=i,!f.centroid||!t.centroid)throw new Error("Unexpected state");f.h=f.h||this.heuristic(f.centroid,t.centroid),f.g=d,f.f=f.g+f.h,h?r.rescoreElement(f):r.push(f)}}}}return[]}},{key:"heuristic",value:function(e,n){return p.c.distanceToSquared(e,n)}},{key:"neighbours",value:function(e,n){for(var t=[],o=0;o<n.neighbours.length;o++)t.push(e[n.neighbours[o]]);return t}}]),e}(),g=function(){function e(){(0,i.Z)(this,e),this.portals=[]}return(0,u.Z)(e,[{key:"push",value:function(e,n){void 0===n&&(n=e),this.portals.push({left:e,right:n})}},{key:"stringPull",value:function(){var e,n,t,o=this.portals,r=[],i=0,u=0,s=0;e=o[0].left,n=o[0].left,t=o[0].right,r.push(e);for(var c=1;c<o.length;c++){var a=o[c].left,l=o[c].right;if(p.c.triarea2(e,t,l)<=0){if(!(p.c.vequal(e,t)||p.c.triarea2(e,n,l)>0)){r.push(n),n=e=n,t=e,u=i=u,s=i,c=i;continue}t=l,s=c}if(p.c.triarea2(e,n,a)>=0){if(!(p.c.vequal(e,n)||p.c.triarea2(e,t,a)<0)){r.push(t),n=e=t,t=e,u=i=s,s=i,c=i;continue}n=a,u=c}}return 0!==r.length&&p.c.vequal(r[r.length-1],o[o.length-1].left)||r.push(o[o.length-1].left),this.path=r,r}}]),e}(),y=t(68451);function b(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function I(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?b(Object(t),!0).forEach((function(n){(0,f.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):b(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function k(e,n){var t="undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=function(e,n){if(!e)return;if("string"===typeof e)return O(e,n);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return O(e,n)}(e))||n&&e&&"number"===typeof e.length){t&&(e=t);var o=0,r=function(){};return{s:r,n:function(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,u=!0,s=!1;return{s:function(){t=t.call(e)},n:function(){var e=t.next();return u=e.done,e},e:function(e){s=!0,i=e},f:function(){try{u||null==t.return||t.return()}finally{if(s)throw i}}}}function O(e,n){(null==n||n>e.length)&&(n=e.length);for(var t=0,o=new Array(n);t<n;t++)o[t]=e[t];return o}function P(e){var n=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var t,o=(0,l.Z)(e);if(n){var r=(0,l.Z)(this).constructor;t=Reflect.construct(o,arguments,r)}else t=o.apply(this,arguments);return(0,a.Z)(this,t)}}var w=function(e){(0,c.Z)(t,e);var n=P(t);function t(e){var o;(0,i.Z)(this,t),o=n.call(this),(0,f.Z)((0,s.Z)(o),"gm",void 0),(0,f.Z)((0,s.Z)(o),"vectors",void 0),(0,f.Z)((0,s.Z)(o),"nodeToMeta",void 0),o.gm=e,o.vectors=e.navZone.vertices.map(d.dl.from);var r=e.navZone.groups.flatMap((function(e){return e}));return o.nodeToMeta=r.map((function(e){return{doorId:-1,roomId:-1}})),e.navZone.doorNodeIds.forEach((function(e,n){e.forEach((function(e){o.nodeToMeta[e].doorId=n,r[e].neighbours.flatMap((function(e){return r[e].neighbours})).forEach((function(e){return o.nodeToMeta[e].nearDoorId=n}))}))})),e.navZone.roomNodeIds.forEach((function(e,n){e.forEach((function(e){return o.nodeToMeta[e].roomId=n}))})),o}return(0,u.Z)(t,[{key:"computeStringPull",value:function(e,n,t){var o=new g;o.push(e);for(var r=0;r<t.length;r++){var i=t[r],u=t[r+1];if(u){var s=this.getPortalFromTo(i,u);o.push(this.vectors[s[0]],this.vectors[s[1]])}}return o.push(n),o.stringPull(),o}},{key:"findPath",value:function(e,n){var t=this,i=this.getClosestNode(e),u=this.getClosestNode(n);if(!i||!u)return null;var s,c=m.search(this,i,u),a=c.reduce((function(e,n){var o=e.length?e[e.length-1]:void 0,r=t.nodeToMeta[n.index],i=r.doorId>=0?"door":"room";return(null===o||void 0===o?void 0:o.key)===i?o.nodes.push(n):(e.push("door"===i?{key:i,nodes:[n],doorId:r.doorId}:{key:i,nodes:[n],roomId:r.roomId}),"room"===i&&-1===r.roomId&&console.warn("findPathNew: expected roomId for node",n,r)),e}),[]),l=[e.clone()],f=[],h=-1,p=-1,v=k(a.entries());try{for(v.s();!(s=v.n()).done;){var g=(0,r.Z)(s.value,2),b=g[0],O=g[1];if("door"===O.key){if("break"===function(){var o=t.gm.doors[O.doorId];if(b>0){var r=a[b-1].roomId,i={index:l.length-1,doorId:O.doorId,hullDoorId:t.gm.hullDoors.indexOf(o),otherRoomId:o.roomIds[1-o.roomIds.findIndex((function(e){return e===r}))]};f.push(I(I({key:"pre-exit-room"},i),{},{willExitRoomId:r})),f.push(I(I({key:"exit-room"},i),{},{exitedRoomId:r}))}else h=O.doorId;if(!a[b+1])return l.push(n.clone()),p=O.doorId,"break";var u=a[b+1].roomId,s=o.entries[o.roomIds.findIndex((function(e){return e===u}))];0===b&&e.distanceTo(s)<.1||l.push(s.clone())}())break}else!function(){var r=O.roomId,i=0===b?e:l[l.length-1],u=n;if(b<a.length-1){var s=t.gm.doors[a[b+1].doorId];u=s.entries[s.roomIds.findIndex((function(e){return e===r}))]}if(b>0){var c=a[b-1].doorId,h=t.gm.doors[c];f.push({key:"enter-room",index:l.length-1,doorId:c,hullDoorId:t.gm.hullDoors.indexOf(h),enteredRoomId:r,otherRoomId:h.roomIds[1-h.roomIds.findIndex((function(e){return e===r}))]})}var p=t.gm.lazy.roomNavPoly[r];if(!y.J.lineSegCrossesPolygon(i,u,p))l.push(u.clone());else{var v=t.computeStringPull(i,u,O.nodes).path.map(d.dl.from);l.push.apply(l,(0,o.Z)(y.J.removePathReps(v.slice(1))))}if(!a[b+1]){var m=t.nodeToMeta[O.nodes[O.nodes.length-1].index];if(void 0!==m.nearDoorId&&m.nearDoorId>=0){var g=t.gm.doors[m.nearDoorId];f.push({key:"pre-near-door",index:l.length-1,doorId:m.nearDoorId,hullDoorId:t.gm.hullDoors.indexOf(g),currentRoomId:r,otherRoomId:g.roomIds[1-g.roomIds.findIndex((function(e){return e===r}))]})}}}()}}catch(P){v.e(P)}finally{v.f()}return console.log("findPath",{nodePath:c,nodeMetas:c.map((function(e){return t.nodeToMeta[e.index]})),partition:a,fullPath:l,navMetas:f}),{fullPath:l,navMetas:f,doorIds:[h,p]}}},{key:"getClosestNode",value:function(e){var n=this.nodesArray,t=this.vectors,o=null,r=1/0;return n.forEach((function(n){var i=n.centroid.distanceToSquared(e);i<r&&p.c.isVectorInPolygon(e,n,t)&&(o=n,r=i)})),o||n.forEach((function(n){var t=p.c.distanceToSquared(n.centroid,e);t<r&&(o=n,r=t)})),o}},{key:"getPortalFromTo",value:function(e,n){for(var t=0;t<e.neighbours.length;t++)if(e.neighbours[t]===n.index)return e.portals[t]}}],[{key:"fromZone",value:function(e){for(var n=e.navZone,o=n.groups,i=(n.vertices,new t(e)),u=o.flatMap((function(e){return e})),s=0,c=Object.entries(u);s<c.length;s++){var a=(0,r.Z)(c[s],2),l=a[0],f=a[1];i.registerNode({type:"tri",id:"tri-".concat(l),index:Number(l),vertexIds:f.vertexIds.slice(),portals:f.portals.map((function(e){return e.slice()})),cost:1,visited:!1,closed:!1,parent:null,centroid:d.dl.from(f.centroid),neighbours:f.neighbours.slice()})}for(var h=function(){var e=(0,r.Z)(v[p],2),n=e[0],t=e[1],o="tri-".concat(n);t.neighbours.map((function(e){return"tri-".concat(e)})).forEach((function(e){return i.registerEdge({src:o,dst:e})}))},p=0,v=Object.entries(u);p<v.length;p++)h();return i}}]),t}(h.b),x=t(88767);function Z(e,n,t){return(0,x.useQuery)(function(e){return"pathfinding-".concat(e)}(e),(function(){return{graph:w.fromZone(n)}}),{enabled:!!n&&!t,keepPreviousData:!0,staleTime:1/0})}}}]);