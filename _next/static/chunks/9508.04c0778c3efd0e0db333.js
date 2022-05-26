"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9508],{73481:function(t,n,r){r.r(n),r.d(n,{default:function(){return w}});var e,o=r(52209),i=r(97131),u=r(59748),c=r(88269),a=r(94975),s=r(48103),l=r(91441),p=r(84175),f=r(44275),h=r(27375),d=r(97301),m=r(87079),g=r(30245),y=r(8311);function b(t,n){var r="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!r){if(Array.isArray(t)||(r=function(t,n){if(!t)return;if("string"===typeof t)return v(t,n);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return v(t,n)}(t))||n&&t&&"number"===typeof t.length){r&&(t=r);var e=0,o=function(){};return{s:o,n:function(){return e>=t.length?{done:!0}:{done:!1,value:t[e++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,u=!0,c=!1;return{s:function(){r=r.call(t)},n:function(){var t=r.next();return u=t.done,t},e:function(t){c=!0,i=t},f:function(){try{u||null==r.return||r.return()}finally{if(c)throw i}}}}function v(t,n){(null==n||n>t.length)&&(n=t.length);for(var r=0,e=new Array(n);r<n;r++)e[r]=t[r];return e}function w(t){var n=(0,h.Z)(),r=(0,d.Z)([{layoutKey:"g-101--multipurpose"}]),e=r.gms,o=r.gmGraph,c=e[0],v=(0,f.Z)((function(){return{clipPath:"none",doorsApi:{},roomShown:{0:!0,2:!0},onToggleLight:function(t){var n=t.target,r=Number(n.getAttribute("data-index"));r in v.roomShown?delete v.roomShown[r]:v.roomShown[r]=!0,v.updateMasks()},updateMasks:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,r=(0,p.Nh)(c),e=r.pngRect,u=r.hullOutline,a=r.roomsWithDoors,l=r.roomGraph,f=Object.keys(v.roomShown).map(Number),h=v.doorsApi.getOpen(0),d=f.flatMap((function(t){return o.computeLightPolygons(0,t,h)})),m=f.map((function(t){return a[t]})).concat(d.map((function(t){return t.poly}))).map((function(t){return t.precision(2)})),g=l.getAdjacentDoors.apply(l,(0,i.Z)(f.map((function(t){return l.nodesArray[t]}))));this.doorsApi.setVisible(0,g.map((function(t){return t.doorId})));var y=s.LA.cutOut(m,[u]).map((function(t){return t.translate(-e.x,-e.y)})),b=y.map((function(t){return"".concat(t.svgPath)})).join(" ");n(),setTimeout((function(){v.clipPath="path('".concat(b,"')"),n()}),t)}}}),{overwrite:{roomShown:!0},deps:[c]});return u.default.useEffect((function(){if(c){var t,n=b(Object.keys(v.roomShown).map(Number));try{for(n.s();!(t=n.n()).done;){var r=t.value;c.rooms[r]||delete v.roomShown[r]}}catch(o){n.e(o)}finally{n.f()}v.updateMasks();var e=v.doorsApi.events.pipe((0,a.h)((function(t){return"closed-door"===t.key||"opened-door"===t.key}))).subscribe((function(t){return v.updateMasks("closed-door"===t.key?300:0)}));return function(){return e.unsubscribe()}}}),[c]),(0,y.tZ)(m.Z,{dark:!0,className:O,children:c&&(0,y.BX)(y.HY,{children:[(0,y.tZ)("img",{className:"geomorph",src:(0,l.qX)(c.key),draggable:!1,style:{left:c.pngRect.x,top:c.pngRect.y,width:c.pngRect.width,height:c.pngRect.height}}),(0,y.tZ)("img",{className:"geomorph-dark",src:(0,l.qX)(c.key),draggable:!1,style:{left:c.pngRect.x,top:c.pngRect.y,width:c.pngRect.width,height:c.pngRect.height,clipPath:v.clipPath,WebkitClipPath:v.clipPath}}),(0,y.tZ)("div",{className:"light-toggles",onClick:v.onToggleLight,children:c.roomsSwitch.map((function(t,n){return(0,y.tZ)("div",{"data-index":n,className:"toggle",style:{left:t.x-5,top:t.y-5,borderColor:v.roomShown[n]?"#5f5":"rgba(200, 0, 0, 0.3)",outline:v.roomShown[n]?"1px solid black":"1px solid rgba(255, 255, 255, 0.5)"}},n)}))}),(0,y.tZ)(g.Z,{gms:e,gmGraph:o,onLoad:function(t){return v.doorsApi=t},initOpen:{}})]})})}var O=(0,c.iv)(e||(e=(0,o.Z)(["\n  img.geomorph-dark {\n    position: absolute;\n    filter: invert(100%) brightness(45%) contrast(200%) sepia(0%) hue-rotate(0deg) blur(0px);\n  }\n  img.geomorph {\n    position: absolute;\n    filter: brightness(65%) sepia(50%) hue-rotate(180deg);\n  }\n  div.light-toggles {\n    position: absolute;\n\n    div.toggle {\n      border-radius: 5px;\n      border: 5px solid white;\n      position: absolute;\n      cursor: pointer;\n    }\n  }\n  svg.room-graph {\n    position: absolute;\n    pointer-events: none;\n    circle, line {\n      pointer-events: none;\n    }\n  }\n"])))},95814:function(t,n,r){r.d(n,{Z:function(){return m}});var e=r(92809),o=r(97131),i=r(30266),u=r(809),c=r.n(u),a=r(88767),s=r(91441),l=r(48103),p=r(2026),f=r(39660);function h(t,n){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(t);n&&(e=e.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),r.push.apply(r,e)}return r}function d(t){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?h(Object(r),!0).forEach((function(n){(0,e.Z)(t,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):h(Object(r)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(r,n))}))}return t}function m(t,n){return(0,a.useQuery)((0,s.tU)(t),(0,i.Z)(c().mark((function n(){var r,e,i,u,a,p;return c().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,fetch((0,s.tU)(t)).then((function(t){return t.json()})).then(f.Vn);case 2:return r=n.sent,e=r.roomGraph,i=e.nodesArray.filter((function(t){return"room"===t.type})).map((function(t,n){var i=e.getEdgesFrom(t).flatMap((function(t){var n=t.dst;return"door"===n.type?r.doors[n.doorId].poly:[]}));return l.LA.union([r.rooms[n]].concat((0,o.Z)(i)))[0]})),u=r.groups.singles.filter((function(t){return t.tags.includes("switch")})).map((function(t){return t.poly.center})),a=r.groups.singles.filter((function(t){return t.tags.includes("spawn")})).map((function(t){return t.poly.center})),(p=d(d({},r),{},{roomsWithDoors:i,roomsSwitch:r.rooms.map((function(t){return u.find((function(n){return t.contains(n)}))||t.rect.center})),hullDoors:r.doors.filter((function(t){return t.tags.includes("hull")})),hullOutline:r.hullPoly[0].removeHoles(),pngRect:l.UL.fromJson(r.items[0].pngRect),spawnPoints:a,lazy:null})).lazy=g(p),y(p),n.abrupt("return",p);case 11:case"end":return n.stop()}}),n)}))),d({cacheTime:1/0},n))}function g(t){var n={roomNavPoly:{}},r=new Proxy({},{get:function(r,e){if("string"===typeof e){var o=Number(e);if(t.roomsWithDoors[o]&&!n.roomNavPoly[o]){var i=l.LA.intersect(t.navPoly,[t.roomsWithDoors[o]]);i.sort((function(t,n){return t.rect.area>n.rect.area?-1:1})),n.roomNavPoly[o]=i[0]}return n.roomNavPoly[o]}}});return new Proxy(n,{get:function(t,n){if("roomNavPoly"===n)return r}})}function y(t){t.navZone.doorNodeIds.forEach((function(n,r){var e=t.doors[r];if(t.hullDoors.includes(e)){var i,u=e.roomIds.find(Boolean);if(Number.isFinite(u))(i=t.navZone.roomNodeIds[u]).push.apply(i,(0,o.Z)(n));else(0,p.ZK)("extendRoomNodeIds: ".concat(t.key," (hull) door ").concat(r," has empty roomIds"))}}))}},2566:function(t,n,r){r.d(n,{Q:function(){return o}});var e=r(70655),o=function(t){function n(n,r,e,o,i){var u=t.call(this,n)||this;return u.onUnsubscribe=i,u._next=r?function(t){try{r(t)}catch(n){this.destination.error(n)}}:t.prototype._next,u._error=e?function(t){try{e(t)}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._error,u._complete=o?function(){try{o()}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._complete,u}return(0,e.ZT)(n,t),n.prototype.unsubscribe=function(){var n;!this.closed&&(null===(n=this.onUnsubscribe)||void 0===n||n.call(this)),t.prototype.unsubscribe.call(this)},n}(r(7038).Lv)},94975:function(t,n,r){r.d(n,{h:function(){return i}});var e=r(96798),o=r(2566);function i(t,n){return(0,e.e)((function(r,e){var i=0;r.subscribe(new o.Q(e,(function(r){return t.call(n,r,i++)&&e.next(r)})))}))}},96798:function(t,n,r){r.d(n,{e:function(){return o}});var e=r(58474);function o(t){return function(n){if(function(t){return(0,e.m)(null===t||void 0===t?void 0:t.lift)}(n))return n.lift((function(n){try{return t(n,this)}catch(r){this.error(r)}}));throw new TypeError("Unable to lift unknown Observable type")}}}}]);