"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5780],{95814:function(t,e,n){n.d(e,{Z:function(){return p}});var o=n(92809),r=n(97131),i=n(30266),s=n(809),u=n.n(s),c=n(88767),a=n(91441),l=n(48103),h=n(2026),f=n(39660);function d(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,o)}return n}function v(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?d(Object(n),!0).forEach((function(e){(0,o.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):d(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function p(t,e){return(0,c.useQuery)((0,a.tU)(t),(0,i.Z)(u().mark((function e(){var n,o,i,s,c,h;return u().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch((0,a.tU)(t)).then((function(t){return t.json()})).then(f.Vn);case 2:return n=e.sent,o=n.roomGraph,i=o.nodesArray.filter((function(t){return"room"===t.type})).map((function(t,e){var i=o.getEdgesFrom(t).flatMap((function(t){var e=t.dst;return"door"===e.type?n.doors[e.doorId].poly:[]}));return l.LA.union([n.rooms[e]].concat((0,r.Z)(i)))[0]})),s=n.groups.singles.filter((function(t){return t.tags.includes("switch")})).map((function(t){return t.poly.center})),c=n.groups.singles.filter((function(t){return t.tags.includes("spawn")})).map((function(t){return t.poly.center})),(h=v(v({},n),{},{roomsWithDoors:i,roomsSwitch:n.rooms.map((function(t){return s.find((function(e){return t.contains(e)}))||t.rect.center})),hullDoors:n.doors.filter((function(t){return t.tags.includes("hull")})),hullOutline:n.hullPoly[0].removeHoles(),pngRect:l.UL.fromJson(n.items[0].pngRect),spawnPoints:c,lazy:null})).lazy=g(h),m(h),e.abrupt("return",h);case 11:case"end":return e.stop()}}),e)}))),v({cacheTime:1/0},e))}function g(t){var e={roomNavPoly:{}},n=new Proxy({},{get:function(n,o){if("string"===typeof o){var r=Number(o);return t.roomsWithDoors[r]&&!e.roomNavPoly[r]&&(e.roomNavPoly[r]=l.LA.intersect(t.navPoly,[t.roomsWithDoors[r]])),e.roomNavPoly[r]}}});return new Proxy(e,{get:function(t,e){if("roomNavPoly"===e)return n}})}function m(t){t.navZone.doorNodeIds.forEach((function(e,n){var o=t.doors[n];if(t.hullDoors.includes(o)){var i,s=o.roomIds.find(Boolean);if(Number.isFinite(s))(i=t.navZone.roomNodeIds[s]).push.apply(i,(0,r.Z)(e));else(0,h.ZK)("extendRoomNodeIds: ".concat(t.key," (hull) door ").concat(n," has empty roomIds"))}}))}},19964:function(t,e,n){n.d(e,{Z:function(){return k},H:function(){return P}});var o=n(79056),r=n(68216),i=n(25997),s=n(14695),u=n(91077),c=n(30268),a=n(92953),l=n(92809),h=n(48103),f=n(82405),d=n(81033),v=function(){function t(e){(0,r.Z)(this,t),this.content=[],this.scoreFunction=e}return(0,i.Z)(t,[{key:"push",value:function(t){this.content.push(t),this.sinkDown(this.content.length-1)}},{key:"pop",value:function(){var t=this.content[0],e=this.content.pop();return this.content.length>0&&(this.content[0]=e,this.bubbleUp(0)),t}},{key:"remove",value:function(t){var e=this.content.indexOf(t),n=this.content.pop();e!==this.content.length-1&&(this.content[e]=n,this.scoreFunction(n)<this.scoreFunction(t)?this.sinkDown(e):this.bubbleUp(e))}},{key:"size",value:function(){return this.content.length}},{key:"rescoreElement",value:function(t){this.sinkDown(this.content.indexOf(t))}},{key:"sinkDown",value:function(t){for(var e=this.content[t];t>0;){var n=(t+1>>1)-1,o=this.content[n];if(!(this.scoreFunction(e)<this.scoreFunction(o)))break;this.content[n]=e,this.content[t]=o,t=n}}},{key:"bubbleUp",value:function(t){for(var e=this.content.length,n=this.content[t],o=this.scoreFunction(n);;){var r=t+1<<1,i=r-1,s=null,u=-1/0;if(i<e){var c=this.content[i];(u=this.scoreFunction(c))<o&&(s=i)}if(r<e){var a=this.content[r];this.scoreFunction(a)<(null===s?o:u)&&(s=r)}if(null===s)break;this.content[t]=this.content[s],this.content[s]=n,t=s}}}]),t}(),p=function(){function t(){(0,r.Z)(this,t)}return(0,i.Z)(t,null,[{key:"init",value:function(t){for(var e=t.nodesArray,n=0;n<e.length;n++){var o=e[n];o.f=0,o.g=0,o.h=0,o.cost=1,o.visited=!1,o.closed=!1,o.parent=null}}},{key:"cleanUp",value:function(t){for(var e=0;e<t.length;e++){var n=t[e];delete n.f,delete n.g,delete n.h,delete n.cost,delete n.visited,delete n.closed,delete n.parent}}},{key:"heap",value:function(){return new v((function(t){return t.f}))}},{key:"search",value:function(t,e,n){this.init(t);var o=t.nodesArray,r=this.heap();for(r.push(e);r.size()>0;){var i=r.pop();if(i===n){for(var s=i,u=[];s.parent;)u.push(s),s=s.parent;return this.cleanUp(u),u.reverse()}i.closed=!0;for(var c=this.neighbours(o,i),a=0,l=c.length;a<l;a++){var h=c[a];if(!h.closed){var f=i.g+h.cost,d=h.visited;if(!d||f<h.g){if(h.visited=!0,h.parent=i,!h.centroid||!n.centroid)throw new Error("Unexpected state");h.h=h.h||this.heuristic(h.centroid,n.centroid),h.g=f,h.f=h.g+h.h,d?r.rescoreElement(h):r.push(h)}}}}return[]}},{key:"heuristic",value:function(t,e){return d.c.distanceToSquared(t,e)}},{key:"neighbours",value:function(t,e){for(var n=[],o=0;o<e.neighbours.length;o++)n.push(t[e.neighbours[o]]);return n}}]),t}(),g=function(){function t(){(0,r.Z)(this,t),this.portals=[]}return(0,i.Z)(t,[{key:"push",value:function(t,e){void 0===e&&(e=t),this.portals.push({left:t,right:e})}},{key:"stringPull",value:function(){var t,e,n,o=this.portals,r=[],i=0,s=0,u=0;t=o[0].left,e=o[0].left,n=o[0].right,r.push(t);for(var c=1;c<o.length;c++){var a=o[c].left,l=o[c].right;if(d.c.triarea2(t,n,l)<=0){if(!(d.c.vequal(t,n)||d.c.triarea2(t,e,l)>0)){r.push(e),e=t=e,n=t,s=i=s,u=i,c=i;continue}n=l,u=c}if(d.c.triarea2(t,e,a)>=0){if(!(d.c.vequal(t,e)||d.c.triarea2(t,n,a)<0)){r.push(n),e=t=n,n=t,s=i=u,u=i,c=i;continue}e=a,s=c}}return 0!==r.length&&d.c.vequal(r[r.length-1],o[o.length-1].left)||r.push(o[o.length-1].left),this.path=r,r}}]),t}(),m=n(2026),y=n(68451);function b(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,o=(0,a.Z)(t);if(e){var r=(0,a.Z)(this).constructor;n=Reflect.construct(o,arguments,r)}else n=o.apply(this,arguments);return(0,c.Z)(this,n)}}var I=function(t){(0,u.Z)(n,t);var e=b(n);function n(t){var o;(0,r.Z)(this,n),o=e.call(this),(0,l.Z)((0,s.Z)(o),"gm",void 0),(0,l.Z)((0,s.Z)(o),"vectors",void 0),(0,l.Z)((0,s.Z)(o),"nodeToMeta",void 0),o.gm=t,o.vectors=t.navZone.vertices.map(h.dl.from);var i=t.navZone.groups[0];return o.nodeToMeta=i.map((function(t){return{doorId:-1,roomId:-1}})),t.navZone.doorNodeIds.forEach((function(t,e){t.forEach((function(t){return o.nodeToMeta[t].doorId=e}))})),t.navZone.roomNodeIds.forEach((function(t,e){t.forEach((function(t){return o.nodeToMeta[t].roomId=e}))})),o}return(0,i.Z)(n,[{key:"findPath",value:function(t,e){var n,o=this,r=this.getClosestNode(t),i=this.getClosestNode(e);if(!r||!i)return null;var s=p.search(this,r,i);0===s.length&&r===i&&s.push(r);var u=[],c=s.reduce((function(t,e){var n=o.nodeToMeta[e.index];if(-1===n.doorId)t.length?t[t.length-1].push(e):t.push([e]);else{var r=u[u.length-1];if(r&&r.doorId===n.doorId){if(n.doorId===r.doorId&&n.roomId!==r.dstRoomId){r.dstRoomId=n.roomId;var i=o.gm.doors[n.doorId];r.exit=i.roomIds[0]===n.roomId?i.entries[0]:i.entries[1]}}else{t.push([]);var s=o.gm.doors[n.doorId],c=s.roomIds[0]===n.roomId?s.entries[0]:s.entries[1];u.push({doorId:n.doorId,srcRoomId:n.roomId,dstRoomId:n.roomId,entry:c,exit:c})}}return t}),[]);return 0===(null===(n=c[c.length-1])||void 0===n?void 0:n.length)&&c.pop(),console.log({nodePaths:c,roomEdges:u}),{normalisedPaths:c.map((function(n,i){var s=0===i?t:u[i-1].exit,a=i===c.length-1?e:u[i].entry,l=0===i?o.nodeToMeta[r.index].roomId:u[i-1].dstRoomId;-1===l&&(l=o.gm.roomsWithDoors.findIndex((function(t){return t.outlineContains(s)})),(0,m.ZK)("FloorGraph ".concat(o.gm.key,": navNode ").concat(r.index," lacks associated roomId (using ").concat(l,")")));var f=o.gm.lazy.roomNavPoly[l];return y.J.lineSegCrossesPolygon(s,a,f[0])?o.computeStringPull(s,a,n).path.map(h.dl.from):[h.dl.from(s),h.dl.from(a)]})).map((function(t,e){return(e?t:t.slice(1)).reduce((function(t,e){return t.length&&e.equals(t[t.length-1])?t:t.concat(e)}),[])})),nodePaths:c,nodePathMetas:u}}},{key:"getClosestNode",value:function(t){var e=this.nodesArray,n=this.vectors,o=null,r=1/0;return e.forEach((function(e){var i=e.centroid.distanceToSquared(t);i<r&&d.c.isVectorInPolygon(t,e,n)&&(o=e,r=i)})),o||e.forEach((function(e){var n=d.c.distanceToSquared(e.centroid,t);n<r&&(o=e,r=n)})),o}},{key:"getPortalFromTo",value:function(t,e){for(var n=0;n<t.neighbours.length;n++)if(t.neighbours[n]===e.index)return t.portals[n]}},{key:"computeStringPull",value:function(t,e,n){var o=new g;o.push(t);for(var r=0;r<n.length;r++){var i=n[r],s=n[r+1];if(s){var u=this.getPortalFromTo(i,s);o.push(this.vectors[u[0]],this.vectors[u[1]])}}return o.push(e),o.stringPull(),o}}],[{key:"fromZone",value:function(t){for(var e=t.navZone,r=(0,o.Z)(e.groups,1)[0],i=(e.vertices,new n(t)),s=0,u=Object.entries(r);s<u.length;s++){var c=(0,o.Z)(u[s],2),a=c[0],l=c[1];i.registerNode({type:"tri",id:"tri-".concat(a),index:Number(a),vertexIds:l.vertexIds.slice(),portals:l.portals.map((function(t){return t.slice()})),cost:1,visited:!1,closed:!1,parent:null,centroid:h.dl.from(l.centroid),neighbours:l.neighbours.slice()})}for(var f=function(){var t=(0,o.Z)(v[d],2),e=t[0],n=t[1],r="tri-".concat(e);n.neighbours.map((function(t){return"tri-".concat(t)})).forEach((function(t){return i.registerEdge({src:r,dst:t})}))},d=0,v=Object.entries(r);d<v.length;d++)f();return i}}]),n}(f.b),Z=n(88767);function k(t,e,n){return(0,Z.useQuery)(P(t),(function(){return{graph:I.fromZone(e)}}),{enabled:!!e&&!n,keepPreviousData:!0,staleTime:1/0})}function P(t){return"pathfinding-".concat(t)}}}]);