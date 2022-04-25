"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5780],{95814:function(t,e,n){n.d(e,{Z:function(){return p}});var r=n(92809),o=n(97131),i=n(30266),u=n(809),c=n.n(u),s=n(88767),a=n(91441),l=n(48103),f=n(5524);function h(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function d(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?h(Object(n),!0).forEach((function(e){(0,r.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):h(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function p(t,e){return(0,s.useQuery)((0,a.tU)(t),(0,i.Z)(c().mark((function e(){var n,r,i,u,s,h;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch((0,a.tU)(t)).then((function(t){return t.json()})).then(f.Vn);case 2:return n=e.sent,r=n.roomGraph,i=r.nodesArray.filter((function(t){return"room"===t.type})).map((function(t,e){var i=r.getEdgesFrom(t).flatMap((function(t){var e=t.dst;return"door"===e.type?n.doors[e.doorIndex].poly:[]}));return l.LA.union([n.holes[e]].concat((0,o.Z)(i)))[0]})),u=n.groups.singles.filter((function(t){return t.tags.includes("switch")})).map((function(t){return t.poly.center})),s=n.groups.singles.filter((function(t){return t.tags.includes("spawn")})).map((function(t){return t.poly.center})),h=d(d({},n),{},{holesWithDoors:i,holeSwitches:n.holes.map((function(t){return u.find((function(e){return t.contains(e)}))||t.rect.center})),hullDoors:n.doors.filter((function(t){return t.tags.includes("hull")})),hullOutline:n.hullPoly[0].removeHoles(),pngRect:l.UL.fromJson(n.items[0].pngRect),spawnPoints:s}),e.abrupt("return",h);case 9:case"end":return e.stop()}}),e)}))),d({cacheTime:1/0},e))}},19964:function(t,e,n){n.d(e,{Z:function(){return P},H:function(){return Z}});var r=n(79056),o=n(68216),i=n(25997),u=n(14695),c=n(91077),s=n(30268),a=n(92953),l=n(92809),f=n(48103),h=n(82405),d=n(81033),p=function(){function t(e){(0,o.Z)(this,t),this.content=[],this.scoreFunction=e}return(0,i.Z)(t,[{key:"push",value:function(t){this.content.push(t),this.sinkDown(this.content.length-1)}},{key:"pop",value:function(){var t=this.content[0],e=this.content.pop();return this.content.length>0&&(this.content[0]=e,this.bubbleUp(0)),t}},{key:"remove",value:function(t){var e=this.content.indexOf(t),n=this.content.pop();e!==this.content.length-1&&(this.content[e]=n,this.scoreFunction(n)<this.scoreFunction(t)?this.sinkDown(e):this.bubbleUp(e))}},{key:"size",value:function(){return this.content.length}},{key:"rescoreElement",value:function(t){this.sinkDown(this.content.indexOf(t))}},{key:"sinkDown",value:function(t){for(var e=this.content[t];t>0;){var n=(t+1>>1)-1,r=this.content[n];if(!(this.scoreFunction(e)<this.scoreFunction(r)))break;this.content[n]=e,this.content[t]=r,t=n}}},{key:"bubbleUp",value:function(t){for(var e=this.content.length,n=this.content[t],r=this.scoreFunction(n);;){var o=t+1<<1,i=o-1,u=null,c=-1/0;if(i<e){var s=this.content[i];(c=this.scoreFunction(s))<r&&(u=i)}if(o<e){var a=this.content[o];this.scoreFunction(a)<(null===u?r:c)&&(u=o)}if(null===u)break;this.content[t]=this.content[u],this.content[u]=n,t=u}}}]),t}(),v=function(){function t(){(0,o.Z)(this,t)}return(0,i.Z)(t,null,[{key:"init",value:function(t){for(var e=t.nodesArray,n=0;n<e.length;n++){var r=e[n];r.f=0,r.g=0,r.h=0,r.cost=1,r.visited=!1,r.closed=!1,r.parent=null}}},{key:"cleanUp",value:function(t){for(var e=0;e<t.length;e++){var n=t[e];delete n.f,delete n.g,delete n.h,delete n.cost,delete n.visited,delete n.closed,delete n.parent}}},{key:"heap",value:function(){return new p((function(t){return t.f}))}},{key:"search",value:function(t,e,n){this.init(t);var r=t.nodesArray,o=this.heap();for(o.push(e);o.size()>0;){var i=o.pop();if(i===n){for(var u=i,c=[];u.parent;)c.push(u),u=u.parent;return this.cleanUp(c),c.reverse()}i.closed=!0;for(var s=this.neighbours(r,i),a=0,l=s.length;a<l;a++){var f=s[a];if(!f.closed){var h=i.g+f.cost,d=f.visited;if(!d||h<f.g){if(f.visited=!0,f.parent=i,!f.centroid||!n.centroid)throw new Error("Unexpected state");f.h=f.h||this.heuristic(f.centroid,n.centroid),f.g=h,f.f=f.g+f.h,d?o.rescoreElement(f):o.push(f)}}}}return[]}},{key:"heuristic",value:function(t,e){return d.c.distanceToSquared(t,e)}},{key:"neighbours",value:function(t,e){for(var n=[],r=0;r<e.neighbours.length;r++)n.push(t[e.neighbours[r]]);return n}}]),t}(),g=function(){function t(){(0,o.Z)(this,t),this.portals=[]}return(0,i.Z)(t,[{key:"push",value:function(t,e){void 0===e&&(e=t),this.portals.push({left:t,right:e})}},{key:"stringPull",value:function(){var t,e,n,r=this.portals,o=[],i=0,u=0,c=0;t=r[0].left,e=r[0].left,n=r[0].right,o.push(t);for(var s=1;s<r.length;s++){var a=r[s].left,l=r[s].right;if(d.c.triarea2(t,n,l)<=0){if(!(d.c.vequal(t,n)||d.c.triarea2(t,e,l)>0)){o.push(e),e=t=e,n=t,u=i=u,c=i,s=i;continue}n=l,c=s}if(d.c.triarea2(t,e,a)>=0){if(!(d.c.vequal(t,e)||d.c.triarea2(t,n,a)<0)){o.push(n),e=t=n,n=t,u=i=c,c=i,s=i;continue}e=a,u=s}}return 0!==o.length&&d.c.vequal(o[o.length-1],r[r.length-1].left)||o.push(r[r.length-1].left),this.path=o,o}}]),t}();function y(t,e){var n="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"===typeof t)return b(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return b(t,e)}(t))||e&&t&&"number"===typeof t.length){n&&(t=n);var r=0,o=function(){};return{s:o,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,u=!0,c=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return u=t.done,t},e:function(t){c=!0,i=t},f:function(){try{u||null==n.return||n.return()}finally{if(c)throw i}}}}function b(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function m(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function O(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?m(Object(n),!0).forEach((function(e){(0,l.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):m(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function k(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=(0,a.Z)(t);if(e){var o=(0,a.Z)(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return(0,s.Z)(this,n)}}var w=function(t){(0,c.Z)(n,t);var e=k(n);function n(t,r){var i;return(0,o.Z)(this,n),i=e.call(this),(0,l.Z)((0,u.Z)(i),"vectors",void 0),(0,l.Z)((0,u.Z)(i),"doorNodeIds",void 0),(0,l.Z)((0,u.Z)(i),"nodeToDoorId",void 0),i.vectors=t,i.doorNodeIds=r,i.nodeToDoorId=r.reduce((function(t,e,n){return e.forEach((function(e){return t[e]=n})),t}),{}),i}return(0,i.Z)(n,[{key:"findPath",value:function(t,e){var n,r=this,o=this.getClosestNode(t),i=this.getClosestNode(e);if(!o||!i)return null;var u=v.search(this,o,i),c=[],s=u.reduce((function(t,e){return void 0===r.nodeToDoorId[e.index]?t.length?t[t.length-1].push(e):t.push([e]):c[c.length-1]!==r.nodeToDoorId[e.index]&&(c.push(r.nodeToDoorId[e.index]),t.push([])),t}),[]);return 0===(null===(n=s[s.length-1])||void 0===n?void 0:n.length)&&s.pop(),{normalisedPaths:s.map((function(n,o){var i=0===o?t:n[0].centroid,u=o===s.length-1?e:n[n.length-1].centroid;return r.computeStringPull(i,u,n).path.map(f.dl.from)})).map((function(t,e){return(e?t:t.slice(1)).reduce((function(t,e){return t.length&&e.equals(t[t.length-1])?t:t.concat(e)}),[])})),nodePaths:s,doorIds:c}}},{key:"getClosestNode",value:function(t){var e=this.nodesArray,n=this.vectors,r=null,o=1/0;return e.forEach((function(e){var i=e.centroid.distanceToSquared(t);i<o&&d.c.isVectorInPolygon(t,e,n)&&(r=e,o=i)})),r||e.forEach((function(e){var n=d.c.distanceToSquared(e.centroid,t);n<o&&(r=e,o=n)})),r}},{key:"getPortalFromTo",value:function(t,e){for(var n=0;n<t.neighbours.length;n++)if(t.neighbours[n]===e.index)return t.portals[n]}},{key:"json",value:function(){return O(O({},this.plainJson()),{},{vectors:this.vectors.map((function(t){return t.json})),doorNodeIds:this.doorNodeIds})}},{key:"computeStringPull",value:function(t,e,n){var r=new g;r.push(t);for(var o=0;o<n.length;o++){var i=n[o],u=n[o+1];if(u){var c=this.getPortalFromTo(i,u);r.push(this.vectors[c[0]],this.vectors[c[1]])}}return r.push(e),r.stringPull(),r}}],[{key:"fromZone",value:function(t){for(var e=(0,r.Z)(t.groups,1)[0],o=new n(t.vertices.map(f.dl.from),t.doorNodeIds),i=0,u=Object.entries(e);i<u.length;i++){var c=(0,r.Z)(u[i],2),s=c[0],a=c[1];o.registerNode({type:"tri",id:"tri-".concat(s),index:Number(s),vertexIds:a.vertexIds.slice(),portals:a.portals.map((function(t){return t.slice()})),cost:1,visited:!1,closed:!1,parent:null,centroid:f.dl.from(a.centroid),neighbours:a.neighbours.slice()})}for(var l=function(){var t=(0,r.Z)(d[h],2),e=t[0],n=t[1],i="tri-".concat(e);n.neighbours.map((function(t){return"tri-".concat(t)})).forEach((function(t){return o.registerEdge({src:i,dst:t})}))},h=0,d=Object.entries(e);h<d.length;h++)l();return o}},{key:"from",value:function(t){var e,r=t.nodes,o=t.edges,i=t.vectors,u=t.doorNodeIds,c=new n(i.map(f.dl.from),u),s=y(r);try{for(s.s();!(e=s.n()).done;){var a=e.value;c.registerNode({type:"tri",id:a.id,index:a.index,vertexIds:a.vertexIds.slice(),portals:a.portals.map((function(t){return t.slice()})),cost:1,visited:!1,closed:!1,parent:null,centroid:f.dl.from(a.centroid),neighbours:[]})}}catch(m){s.e(m)}finally{s.f()}var l,h=y(o);try{for(h.s();!(l=h.n()).done;){var d=l.value;c.registerEdge(d)}}catch(m){h.e(m)}finally{h.f()}var p,v=y(r);try{for(v.s();!(p=v.n()).done;){var g=p.value,b=c.getNodeById(g.id);b.neighbours=c.getSuccs(b).map((function(t){return t.index}))}}catch(m){v.e(m)}finally{v.f()}return c}}]),n}(h.b),j=n(88767);function P(t,e,n){return(0,j.useQuery)(Z(t),(function(){var t=e;return{graph:w.fromZone(t)}}),{enabled:!!e&&!n,keepPreviousData:!0,staleTime:1/0})}function Z(t){return"pathfinding-".concat(t)}}}]);