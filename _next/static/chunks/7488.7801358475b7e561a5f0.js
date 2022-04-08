"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7488],{95814:function(e,t,n){n.d(t,{Z:function(){return v}});var r=n(92809),o=n(97131),i=n(30266),u=n(809),s=n.n(u),c=n(88767),a=n(91441),l=n(48103),h=n(60168);function f(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function d(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?f(Object(n),!0).forEach((function(t){(0,r.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):f(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function v(e,t){return(0,c.useQuery)((0,a.tU)(e),(0,i.Z)(s().mark((function t(){var n,r,i,u,c,f;return s().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,fetch((0,a.tU)(e)).then((function(e){return e.json()})).then(h.Vn);case 2:return n=t.sent,r=n.roomGraph,i=r.nodesArray.filter((function(e){return"room"===e.type})).map((function(e,t){var i=r.getEdgesFrom(e).flatMap((function(e){var t=e.dst;return"door"===t.type?n.doors[t.doorIndex].poly:[]}));return l.LA.union([n.holes[t]].concat((0,o.Z)(i)))[0]})),u=n.groups.singles.filter((function(e){return e.tags.includes("switch")})).map((function(e){return e.poly.center})),c=n.groups.singles.filter((function(e){return e.tags.includes("spawn")})).map((function(e){return e.poly.center})),f=d(d({},n),{},{holesWithDoors:i,holeSwitches:n.holes.map((function(e){return u.find((function(t){return e.contains(t)}))||e.rect.center})),hullDoors:n.doors.filter((function(e){return e.tags.includes("hull")})),hullOutline:n.hullPoly[0].removeHoles(),pngRect:l.UL.fromJson(n.items[0].pngRect),spawnPoints:c}),t.abrupt("return",f);case 9:case"end":return t.stop()}}),t)}))),d({cacheTime:1/0},t))}},21416:function(e,t,n){n.d(t,{Z:function(){return u}});var r=n(88767),o=n(96005),i=n(84175);function u(e,t,n){return(0,r.useQuery)("pathfinding-".concat(e),(function(){var n=o.B.createZone((0,i.Nh)(t));return o.k.setZoneData(e,n),{pathfinding:o.k,zone:n}}),{enabled:!!t&&!n,keepPreviousData:!0,staleTime:1/0})}},96005:function(e,t,n){n.d(t,{B:function(){return w},k:function(){return P}});var r=n(68216),o=n(25997),i=function(){function e(){(0,r.Z)(this,e)}return(0,o.Z)(e,null,[{key:"roundNumber",value:function(e,t){var n=Math.pow(10,t);return Math.round(e*n)/n}},{key:"sample",value:function(e){return e[Math.floor(Math.random()*e.length)]}},{key:"distanceToSquared",value:function(e,t){var n=e.x-t.x,r=e.y-t.y;return n*n+r*r}},{key:"isPointInPoly",value:function(e,t){for(var n=!1,r=-1,o=e.length,i=o-1;++r<o;i=r)(e[r].y<=t.y&&t.y<e[i].y||e[i].y<=t.y&&t.y<e[r].y)&&t.x<(e[i].x-e[r].x)*(t.y-e[r].y)/(e[i].y-e[r].y)+e[r].x&&(n=!n);return n}},{key:"isVectorInPolygon",value:function(e,t,n){var r=1/0,o=-1/0,i=[];return t.vertexIds.forEach((function(e){r=Math.min(n[e].y,r),o=Math.max(n[e].y,o),i.push(n[e])})),!!(e.y<o+.5&&e.y>r-.5&&this.isPointInPoly(i,e))}},{key:"triarea2",value:function(e,t,n){var r=t.x-e.x,o=t.y-e.y;return-((n.x-e.x)*o-r*(n.y-e.y))}},{key:"vequal",value:function(e,t){return this.distanceToSquared(e,t)<1e-5}}]),e}(),u=function(){function e(t){(0,r.Z)(this,e),this.content=[],this.scoreFunction=t}return(0,o.Z)(e,[{key:"push",value:function(e){this.content.push(e),this.sinkDown(this.content.length-1)}},{key:"pop",value:function(){var e=this.content[0],t=this.content.pop();return this.content.length>0&&(this.content[0]=t,this.bubbleUp(0)),e}},{key:"remove",value:function(e){var t=this.content.indexOf(e),n=this.content.pop();t!==this.content.length-1&&(this.content[t]=n,this.scoreFunction(n)<this.scoreFunction(e)?this.sinkDown(t):this.bubbleUp(t))}},{key:"size",value:function(){return this.content.length}},{key:"rescoreElement",value:function(e){this.sinkDown(this.content.indexOf(e))}},{key:"sinkDown",value:function(e){for(var t=this.content[e];e>0;){var n=(e+1>>1)-1,r=this.content[n];if(!(this.scoreFunction(t)<this.scoreFunction(r)))break;this.content[n]=t,this.content[e]=r,e=n}}},{key:"bubbleUp",value:function(e){for(var t=this.content.length,n=this.content[e],r=this.scoreFunction(n);;){var o=e+1<<1,i=o-1,u=null,s=-1/0;if(i<t){var c=this.content[i];(s=this.scoreFunction(c))<r&&(u=i)}if(o<t){var a=this.content[o];this.scoreFunction(a)<(null===u?r:s)&&(u=o)}if(null===u)break;this.content[e]=this.content[u],this.content[u]=n,e=u}}}]),e}(),s=function(){function e(){(0,r.Z)(this,e)}return(0,o.Z)(e,null,[{key:"init",value:function(e){for(var t=0;t<e.length;t++){var n=e[t];n.f=0,n.g=0,n.h=0,n.cost=1,n.visited=!1,n.closed=!1,n.parent=null}}},{key:"cleanUp",value:function(e){for(var t=0;t<e.length;t++){var n=e[t];delete n.f,delete n.g,delete n.h,delete n.cost,delete n.visited,delete n.closed,delete n.parent}}},{key:"heap",value:function(){return new u((function(e){return e.f}))}},{key:"search",value:function(e,t,n){this.init(e);var r=this.heap();for(r.push(t);r.size()>0;){var o=r.pop();if(o===n){for(var i=o,u=[];i.parent;)u.push(i),i=i.parent;return this.cleanUp(u),u.reverse()}o.closed=!0;for(var s=this.neighbours(e,o),c=0,a=s.length;c<a;c++){var l=s[c];if(!l.closed){var h=o.g+l.cost,f=l.visited;if(!f||h<l.g){if(l.visited=!0,l.parent=o,!l.centroid||!n.centroid)throw new Error("Unexpected state");l.h=l.h||this.heuristic(l.centroid,n.centroid),l.g=h,l.f=l.g+l.h,f?r.rescoreElement(l):r.push(l)}}}}return[]}},{key:"heuristic",value:function(e,t){return i.distanceToSquared(e,t)}},{key:"neighbours",value:function(e,t){for(var n=[],r=0;r<t.neighbours.length;r++)n.push(e[t.neighbours[r]]);return n}}]),e}(),c=n(79056),a=n(48103),l=function(){function e(){(0,r.Z)(this,e)}return(0,o.Z)(e,null,[{key:"buildZone",value:function(e){var t=this,n=this._buildNavigationMesh(e);n.vertices.forEach((function(e){e.x=i.roundNumber(e.x,2),e.y=i.roundNumber(e.y,2)}));var r={};r.vertices=n.vertices;var o=this._buildPolygonGroups(n);return r.groups=new Array(o.length),o.forEach((function(e,n){var o=new Map;e.forEach((function(e,t){return o.set(e,t)}));var u=new Array(e.length);e.forEach((function(e,n){var s=[];e.neighbours.forEach((function(e){return s.push(o.get(e))}));var c=[];e.neighbours.forEach((function(n){return c.push(t._getSharedVerticesInOrder(e,n))}));var l=new a.dl(0,0);l.add(r.vertices[e.vertexIds[0]]),l.add(r.vertices[e.vertexIds[1]]),l.add(r.vertices[e.vertexIds[2]]),l.scale(1/3),l.x=i.roundNumber(l.x,2),l.y=i.roundNumber(l.y,2),u[n]={id:n,centroid:l,neighbours:s,portals:c,vertexIds:e.vertexIds}})),r.groups[n]=u})),r}},{key:"_buildNavigationMesh",value:function(e){return this._buildPolygonsFromTriang(e)}},{key:"_spreadGroupId",value:function(e){for(var t=new Set([e]);t.size>0;){var n=t;t=new Set,n.forEach((function(n){n.group=e.group,n.neighbours.forEach((function(e){void 0===e.group&&t.add(e)}))}))}}},{key:"_buildPolygonGroups",value:function(e){var t=this,n=e.polygons,r=[];return n.forEach((function(e){void 0!==e.group?r[e.group].push(e):(e.group=r.length,t._spreadGroupId(e),r.push([e]))})),r}},{key:"_buildPolygonNeighbours",value:function(e,t){var n=new Set,r=t[e.vertexIds[0]],o=t[e.vertexIds[1]],i=t[e.vertexIds[2]];return r.forEach((function(t){t!==e&&(o.includes(t)||i.includes(t))&&n.add(t)})),o.forEach((function(t){t!==e&&i.includes(t)&&n.add(t)})),n}},{key:"_buildPolygonsFromTriang",value:function(e){for(var t=this,n=[],r=[],o={},i=0;i<e.vs.length;i++)r.push(a.dl.from(e.vs[i])),o[i]=[];for(var u=0;u<e.tris.length;u++){var s=(0,c.Z)(e.tris[u],3),l=s[0],h=s[1],f=s[2],d={vertexIds:[l,h,f]};n.push(d),o[l].push(d),o[h].push(d),o[f].push(d)}return n.forEach((function(e){e.neighbours=t._buildPolygonNeighbours(e,o)})),{polygons:n,vertices:r}}},{key:"_getSharedVerticesInOrder",value:function(e,t){var n=e.vertexIds,r=n[0],o=n[1],i=n[2],u=t.vertexIds,s=u.includes(r),c=u.includes(o),a=u.includes(i);return s&&c&&a?Array.from(n):s&&c?[r,o]:c&&a?[o,i]:s&&a?[i,r]:(console.warn("Error processing navigation mesh neighbors; neighbors with <2 shared vertices found."),[])}}]),e}(),h=function(){function e(){(0,r.Z)(this,e),this.portals=[]}return(0,o.Z)(e,[{key:"push",value:function(e,t){void 0===t&&(t=e),this.portals.push({left:e,right:t})}},{key:"stringPull",value:function(){var e,t,n,r=this.portals,o=[],u=0,s=0,c=0;e=r[0].left,t=r[0].left,n=r[0].right,o.push(e);for(var a=1;a<r.length;a++){var l=r[a].left,h=r[a].right;if(i.triarea2(e,n,h)<=0){if(!(i.vequal(e,n)||i.triarea2(e,t,h)>0)){o.push(t),t=e=t,n=e,s=u=s,c=u,a=u;continue}n=h,c=a}if(i.triarea2(e,t,l)>=0){if(!(i.vequal(e,t)||i.triarea2(e,n,l)<0)){o.push(n),t=e=n,n=e,s=u=c,c=u,a=u;continue}t=l,s=a}}return 0!==o.length&&i.vequal(o[o.length-1],r[r.length-1].left)||o.push(r[r.length-1].left),this.path=o,o}}]),e}(),f=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new a.dl,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:new a.dl,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:new a.dl;(0,r.Z)(this,e),this.a=t,this.b=n,this.c=o}return(0,o.Z)(e,[{key:"closestPointToPoint",value:function(e,t){var n,r,o=this.a,i=this.b,u=this.c;d.subVectors(i,o),v.subVectors(u,o),p.subVectors(e,o);var s=d.dot(p),c=v.dot(p);if(s<=0&&c<=0)return t.copy(o);y.subVectors(e,i);var a=d.dot(y),l=v.dot(y);if(a>=0&&l<=a)return t.copy(i);var h=s*l-a*c;if(h<=0&&s>=0&&a<=0)return n=s/(s-a),t.copy(o).addScaledVector(d,n);g.subVectors(e,u);var f=d.dot(g),k=v.dot(g);if(k>=0&&f<=k)return t.copy(u);var m=f*c-s*k;if(m<=0&&c>=0&&k<=0)return r=c/(c-k),t.copy(o).addScaledVector(v,r);var w=a*k-f*l;if(w<=0&&l-a>=0&&f-k>=0)return b.subVectors(u,i),r=(l-a)/(l-a+(f-k)),t.copy(i).addScaledVector(b,r);var P=1/(w+m+h);return n=m*P,r=h*P,t.copy(o).addScaledVector(d,n).addScaledVector(v,r)}},{key:"set",value:function(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}}]),e}(),d=new a.dl,v=new a.dl,p=new a.dl,y=new a.dl,g=new a.dl,b=new a.dl;function k(e,t){var n="undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(!e)return;if("string"===typeof e)return m(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return m(e,t)}(e))||t&&e&&"number"===typeof e.length){n&&(e=n);var r=0,o=function(){};return{s:o,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,u=!0,s=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return u=e.done,e},e:function(e){s=!0,i=e},f:function(){try{u||null==n.return||n.return()}finally{if(s)throw i}}}}function m(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var w=function(){function e(){(0,r.Z)(this,e),this.zones={},this.MAX_DIST_TO_SOME_CENTROID=500;var t={point:new a.dl(0,0),triangle:new f,endPoint:new a.dl(0,0),closestNode:null,closestPoint:new a.dl(0,0),closestDistance:1/0};this.temp=t}return(0,o.Z)(e,[{key:"clampStep",value:function(e,t,n,r,o,i){var u=this.zones[r].vertices,s=this.zones[r].groups[o],c=[n],a={};a[n.id]=0;var l=this.temp;l.closestNode=null,l.closestPoint.set(0,0),l.closestDistance=1/0,l.endPoint.copy(t);for(var h=c.pop();h;h=c.pop()){l.triangle.set(u[h.vertexIds[0]],u[h.vertexIds[1]],u[h.vertexIds[2]]),l.triangle.closestPointToPoint(l.endPoint,l.point),l.point.distanceToSquared(l.endPoint)<l.closestDistance&&(l.closestNode=h,l.closestPoint.copy(l.point),l.closestDistance=l.point.distanceToSquared(l.endPoint));var f=a[h.id];if(!(f>2))for(var d=0;d<h.neighbours.length;d++){var v=s[h.neighbours[d]];v.id in a||(c.push(v),a[v.id]=f+1)}}return i.copy(l.closestPoint),l.closestNode}},{key:"findPath",value:function(e,t,n,r){var o=this.zones[n].groups[r],i=this.zones[n].vertices,u=this.getClosestNode(e,n,r),c=this.getClosestNode(t,n,r);if(!u||!c)return null;var l=s.search(o,u,c),f=new h;f.push(e);for(var d=0;d<l.length;d++){var v=l[d],p=l[d+1];if(p){var y=this.getPortalFromTo(v,p);f.push(i[y[0]],i[y[1]])}}return f.push(t),f.stringPull(),{path:f.path.map(a.dl.from).slice(1).reduce((function(e,t){return e.length&&t.equals(e[e.length-1])?e:e.concat(t)}),[]),nodePath:l}}},{key:"getRandomNode",value:function(e,t,n,r){if(!this.zones[e])return new a.dl(0,0);n=n||null,r=r||0;var o=[];return this.zones[e].groups[t].forEach((function(e){n&&r?i.distanceToSquared(n,e.centroid)<r*r&&o.push(e.centroid):o.push(e.centroid)})),i.sample(o)||new a.dl(0,0)}},{key:"getClosestNode",value:function(e,t,n){var r=this.zones[t].groups[n],o=this.zones[t].vertices,u=null,s=1/0;return r.forEach((function(t){var n=i.distanceToSquared(t.centroid,e);n<s&&i.isVectorInPolygon(e,t,o)&&(u=t,s=n)})),u||r.forEach((function(t){var n=i.distanceToSquared(t.centroid,e);n<s&&(u=t,s=n)})),u}},{key:"getPortalFromTo",value:function(e,t){for(var n=0;n<e.neighbours.length;n++)if(e.neighbours[n]===t.id)return e.portals[n]}},{key:"getGroup",value:function(e,t){if(!this.zones[e])return null;for(var n=this.zones[e],r=0;r<n.groups.length;r++){var o,u=k(n.groups[r]);try{for(u.s();!(o=u.n()).done;){var s=o.value,c=[n.vertices[s.vertexIds[0]],n.vertices[s.vertexIds[1]],n.vertices[s.vertexIds[2]]];if(i.isPointInPoly(c,t))return r}}catch(a){u.e(a)}finally{u.f()}}return null}},{key:"ready",value:function(e){return!!this.zones[e]}},{key:"setZoneData",value:function(e,t){this.zones[e]=t}}],[{key:"createZone",value:function(e){return l.buildZone(e)}}]),e}(),P=new w}}]);