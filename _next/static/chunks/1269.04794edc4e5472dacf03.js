(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1269],{9580:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return de}});var r=n(79056),o=n(52209),a=n(30266),i=n(809),s=n.n(i),c=n(67294),l=n(88269),u=n(94975),p=n(84175),d=n(68451),f=n(91441),m=n(48103),g=n(23921),h=n(27375),y=n(44275),v=n(97301),b=n(34735),x=n(87079),w=n(30245),k=n(97131),I=n(92809),P=n(94184),A=n.n(P),N=n(16716),j=n(24781),O=n(32817),T=n(95196),Z=n(29127),R=n(74727),S=n(29120),M=n(29998),K=n(99763);function E(e,t){return D.apply(this,arguments)}function D(){return(D=(0,K.Z)(s().mark((function e(t,n){var r,o,a,i;return s().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r={promise:L()},o=!1,a=t.subscribe({next:function(e){window.setTimeout((function(){var t=r.promise;r.promise=L(),t.resolve(e)}))},error:function(e){window.setTimeout((function(){var t=r.promise;r.promise=L(),t.reject(e)}))},complete:function(){window.setTimeout((function(){o=!0,r.promise.resolve()}))}}),null===n||void 0===n||n(r,a),e.prev=4;case 5:return e.next=8,(0,M.Z)(r.promise);case 8:if(i=e.sent,!o){e.next=11;break}return e.abrupt("break",15);case 11:return e.next=13,i;case 13:e.next=5;break;case 15:return e.prev=15,a.unsubscribe(),e.finish(15);case 18:case"end":return e.stop()}}),e,null,[[4,,15,18]])})))).apply(this,arguments)}function L(){var e={},t=new Promise((function(t,n){Object.assign(e,{resolve:t,reject:n})}));return Object.assign(t,e)}n(77503),n(292),n(26470),n(7951),n(28949),n(42830),n(89539),n(21801);n(2026),n(48764).Buffer;function G(e){var t,n,r=e;return"global-nav"===(null===r||void 0===r?void 0:r.key)&&(null===(t=r.fullPath)||void 0===t||null===(n=t.every)||void 0===n?void 0:n.call(t,m.dl.isVectJson))&&Array.isArray(r.navMetas)||!1}var C=n(13702),J=n(50269),W=JSON.parse('{"sP":2,"HB":{"idle":{"animName":"idle","aabb":{"x":0,"y":0,"width":128,"height":128},"frameCount":1},"walk":{"animName":"walk","aabb":{"x":0,"y":0,"width":128,"height":128},"frameCount":10}}}');function V(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function z(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?V(Object(n),!0).forEach((function(t){(0,I.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):V(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var q=.19,B=40*q*W.sP,H=3*B,U=15,F={"enter-room":-.02,"exit-room":-.02,"pre-exit-room":-(B+10),"pre-near-door":-(B+10),"start-seg":0},_=n(98379),X=n(19964);var Q,Y=n(85893),$=W.HB,ee=W.sP;function te(e){var t=e.npc;return c.useEffect((function(){return"idle"===t.anim.spriteSheet&&0===t.anim.aux.count&&t.startAnimation(),function(){window.clearTimeout(t.anim.wayTimeoutId)}}),[]),(0,Y.jsxs)("div",{ref:t.npcRef.bind(t),className:A()("npc",t.key,t.anim.spriteSheet,re),"data-npc-key":t.key,children:[(0,Y.jsx)("div",{className:A()("body",t.key,"no-select"),"data-npc-key":t.key}),(0,Y.jsx)("div",{className:"interact-circle"})]})}var ne,re=(0,l.iv)(Q||(Q=(0,o.Z)(["\n  position: absolute;\n  pointer-events: none;\n  \n  .body {\n    position: absolute;\n    filter: grayscale(100%) brightness(140%);\n    /** Animate turning */\n    transition: transform 1s;\n    transform: rotate(calc(","rad + var(--npc-target-look-angle))) scale(",");\n  }\n  \n  &.walk .body {\n    width: ","px;\n    height: ","px;\n    left: ","px;\n    top: ","px;\n    background: url('/npc/first-npc--walk.png');\n  }\n\n  &.idle .body {\n    width: ","px;\n    height: ","px;\n    left: ","px;\n    top: ","px;\n    background: url('/npc/first-npc--idle.png');\n  }\n\n  &.disabled .body {\n    animation-play-state: paused;\n  }\n\n  .interact-circle {\n    display: var(--npcs-debug-display);\n    position: absolute;\n    width: calc(2 * var(--npcs-interact-radius));\n    height: calc(2 * var(--npcs-interact-radius));\n    left: calc(-1 * var(--npcs-interact-radius));\n    top: calc(-1 * var(--npcs-interact-radius));\n    border-radius: calc(2 * var(--npcs-interact-radius));\n    border: 1px solid rgba(0, 0, 255, 0.25);\n  }\n"])),0,q,$.walk.aabb.width*ee,$.walk.aabb.height*ee,-$.walk.aabb.width*ee*.5,-$.walk.aabb.height*ee*.5,$.idle.aabb.width*ee,$.idle.aabb.height*ee,-$.idle.aabb.width*ee*.5,-$.idle.aabb.height*ee*.5);function oe(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function ae(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?oe(Object(n),!0).forEach((function(t){(0,I.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):oe(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function ie(e){var t=(0,h.Z)(),n=function(e,t){var n=c.useState((function(){return e.gms.map((function(e){return e.key}))})),o=(0,r.Z)(n,2),a=o[0],i=o[1];c.useMemo((function(){var t=e.gms.map((function(e){return e.key})).filter((function(e){return!a.includes(e)}));t.length&&i([].concat((0,k.Z)(a),(0,k.Z)(t)))}),[e]);var s=a.map((function(n){return(0,X.Z)(n,e.gmData[n],t)})),l=e.gms.every((function(e){return a.includes(e.key)}))&&s.every((function(e){return e.data}));return c.useMemo((function(){return l?{pfs:e.gms.map((function(e){var t=a.findIndex((function(t){return t===e.key}));return(0,p.Nh)(s[t].data)}))}:{pfs:[]}}),[l])}(e.gmGraph,e.disabled),o=(0,y.Z)((function(){return{decor:{},events:new N.x,npc:{},playerKey:null,rootEl:{},ready:!0,session:{},class:{Vect:m.dl},rxjs:{filter:u.h,first:T.P,map:Z.U,take:R.q,otag:E},addTtyLineCtxts:function(e,t,n){o.session[e].tty[t]=n.map((function(e){return ae(ae({},e),{},{lineText:(0,g.vp)(e.lineText),linkText:(0,g.vp)(e.linkText)})}))},cleanSessionCtxts:function(){for(var e=0,t=Object.keys(o.session);e<t.length;e++){var n=t[e],a=b.default.api.getSession(n);a?function(){var e=o.session[n].tty,t=Math.max(0,a.ttyShell.xterm.totalLinesOutput-2*_.bt);Object.values(e).forEach((function(n){var o=(0,r.Z)(n,1)[0].lineNumber;return o<=t&&delete e[o]}))}():delete o.session[n]}},getGmGraph:function(){return e.gmGraph},getGlobalNavPath:function(t,n){var r=e.gmGraph.gms,a=r.findIndex((function(e){return e.gridRect.contains(t)})),i=r.findIndex((function(e){return e.gridRect.contains(n)}));if(-1===a||-1===i)throw Error("getGlobalNavPath: src/dst must be inside some geomorph's aabb");if(a===i){var s=o.getLocalNavPath(a,t,n);return console.log("localNavPath (single)",s),{key:"global-nav",fullPath:s.fullPath.slice(),navMetas:s.navMetas.map((function(e){return ae(ae({},e),{},{gmId:s.gmId})}))}}var c=e.gmGraph.findPath(t,n);if(!c)throw Error("getGlobalNavPath: gmGraph.findPath not found: ".concat(JSON.stringify(t)," -> ").concat(JSON.stringify(n)));console.log("gmEdges",c);for(var l=[],u=[],p=function(e){var r=0===e?o.getLocalNavPath(a,t,c[0].srcDoorEntry):e<c.length?o.getLocalNavPath(c[e-1].dstGmId,c[e-1].dstDoorEntry,c[e].srcDoorEntry):o.getLocalNavPath(i,c[e-1].dstDoorEntry,n);console.log("localNavPath",e,r);var s=c[e];if(0===e&&r.doorIds[0]>=0)l.push(m.dl.from(t));else if(e===c.length&&r.doorIds[1]>=0)l.push(m.dl.from(n));else{var p=l.length;l.push.apply(l,(0,k.Z)(r.fullPath));var d=u.findIndex((function(e){return"start-seg"===e.key&&e.index===r.fullPath.length-1}));u.splice(d,1),u.push.apply(u,(0,k.Z)(r.navMetas.map((function(e){return ae(ae({},e),{},{index:p+e.index,gmId:r.gmId})}))))}if(s){var f={gmId:s.srcGmId,doorId:s.srcDoorId,hullDoorId:s.srcHullDoorId,index:l.length-1,otherRoomId:null};u.push(ae({key:"pre-exit-room",willExitRoomId:s.srcRoomId},f)),u.push(ae({key:"exit-room",exitedRoomId:s.srcRoomId},f))}},d=0;d<c.length+1;d++)p(d);return{key:"global-nav",fullPath:l,navMetas:u}},getLocalNavPath:function(t,r,o){var a=e.gmGraph.gms[t],i=a.inverseMatrix.transformPoint(m.dl.from(r)),s=a.inverseMatrix.transformPoint(m.dl.from(o)),c=n.pfs[t].graph.findPath(i,s);return c?ae(ae({key:"local-nav",gmId:t},c),{},{fullPath:c.fullPath.map((function(e){return a.matrix.transformPoint(m.dl.from(e)).precision(3)}))}):{key:"local-nav",gmId:t,fullPath:[],navMetas:[],doorIds:[-1,-1]}},getNpcGlobalNav:function(e){var t=o.npc[e.npcKey];if(!t)throw Error('npcKey "'.concat(e.npcKey,'" does not exist'));if(!m.dl.isVectJson(e.point))throw Error("invalid point: ".concat(JSON.stringify(e.point)));if(!o.isPointLegal(e.point))throw Error("outside navPoly: ".concat(JSON.stringify(e.point)));var n=o.getGlobalNavPath(t.getPosition(),e.point);return e.debug&&o.setDecor(e.npcKey,{key:e.npcKey,type:"path",path:n.fullPath}),n},getNpcInteractRadius:function(){return(0,J.PK)(o.rootEl,C.vR.npcsInteractRadius)},getNpc:function(e){var t=o.npc[e];if(!t)throw Error('npc "'.concat(e,'" does not exist'));return t},getNpcsIntersecting:function(e){return Object.values(o.npc).filter((function(t){return d.J.rectIntersectsConvexPoly(t.getBounds(),e.outline)}))},getPanZoomApi:function(){return e.panZoomApi},getPlayer:function(){return o.playerKey?o.getNpc(o.playerKey):null},getPointTags:function(e){var t=[];return o.isPointLegal(e)&&t.push("nav"),t},isPointLegal:function(t){var n=e.gmGraph.gms.findIndex((function(e){return e.gridRect.contains(t)}));if(-1===n)return!1;var r=e.gmGraph.gms[n],o=r.navPoly,a=r.inverseMatrix.transformPoint(m.dl.from(t));return o.some((function(e){return e.contains(a)}))},npcAct:function(e){return(0,a.Z)(s().mark((function t(){var n,r;return s().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:t.t0=e.action,t.next="add-decor"===t.t0?3:"cancel"===t.t0?5:"config"===t.t0?8:"get"===t.t0?11:"look-at"===t.t0?12:"pause"===t.t0?18:"play"===t.t0?21:"remove-decor"===t.t0?24:"set-player"===t.t0?26:28;break;case 3:return o.setDecor(e.key,e),t.abrupt("break",29);case 5:return t.next=7,o.getNpc(e.npcKey).cancel();case 7:return t.abrupt("break",29);case 8:return"number"===typeof e.interactRadius&&o.rootEl.style.setProperty(C.vR.npcsInteractRadius,"".concat(e.interactRadius,"px")),void 0!==e.debug&&o.rootEl.style.setProperty(C.vR.npcsDebugDisplay,e.debug?"initial":"none"),t.abrupt("break",29);case 11:return t.abrupt("return",o.getNpc(e.npcKey));case 12:if(r=o.getNpc(e.npcKey),m.dl.isVectJson(e.point)){t.next=15;break}throw Error("invalid point: ".concat(JSON.stringify(e.point)));case 15:return t.next=17,r.lookAt(e.point);case 17:return t.abrupt("break",29);case 18:return t.next=20,o.getNpc(e.npcKey).pause();case 20:return t.abrupt("break",29);case 21:return t.next=23,o.getNpc(e.npcKey).play();case 23:return t.abrupt("break",29);case 24:return o.setDecor(e.decorKey,null),t.abrupt("break",29);case 26:return o.events.next({key:"set-player",npcKey:null!==(n=e.npcKey)&&void 0!==n?n:null}),t.abrupt("break",29);case 28:throw Error((0,p.Ql)(e,'unrecognised action: "'.concat(JSON.stringify(e),'"')));case 29:case"end":return t.stop()}}),t)})))()},onTtyLink:function(e,t,n,r,a){var i,s;o.cleanSessionCtxts();var c=null===(i=o.session[e])||void 0===i||null===(s=i.tty[t])||void 0===s?void 0:s.find((function(e){return e.lineText===n&&e.linkStartIndex===a&&e.linkText===r}));if(c)switch(console.log("onTtyLink found",c),c.key){case"room":var l=o.getGmGraph().gms[c.gmId],u=l.matrix.transformPoint(l.point[c.roomId].default.clone());o.panZoomTo({zoom:2,ms:2e3,point:u})}},panZoomTo:function(t){return(0,a.Z)(s().mark((function n(){return s().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(!(!t||t.zoom&&!Number.isFinite(t.zoom)||t.point&&!m.dl.isVectJson(t.point)||t.ms&&!Number.isFinite(t.ms))){n.next=2;break}throw Error("expected format: { zoom?: number; point?: { x: number; y: number }; ms: number; easing?: string }");case 2:return n.prev=2,n.next=5,e.panZoomApi.panZoomTo(t.zoom,t.point,t.ms,t.easing);case 5:return n.abrupt("return","completed");case 8:return n.prev=8,n.t0=n.catch(2),n.abrupt("return","cancelled");case 11:case"end":return n.stop()}}),n,null,[[2,8]])})))()},rootRef:function(e){e&&(o.rootEl=e,e.style.setProperty(C.vR.npcsInteractRadius,"".concat(H,"px")),e.style.setProperty(C.vR.npcsDebugDisplay,"none"))},setDecor:function(e,n){if(n){if(!function(e){var t;return!(!e||"path"!==e.type||null===e||void 0===e||null===(t=e.path)||void 0===t||!t.every((function(e){return m.dl.isVectJson(e)})))||!(!e||"circle"!==e.type||!m.dl.isVectJson(e.center)||"number"!==typeof e.radius)}(n))throw Error("invalid decor");o.decor[e]=n}else delete o.decor[e];t()},spawn:function(n){if(!n.npcKey||"string"!==typeof n.npcKey||!n.npcKey.trim())throw Error("invalid npc key: ".concat(JSON.stringify(n.npcKey)));if(!n.point||"number"!==typeof n.point.x||"number"!==typeof n.point.y)throw Error("invalid point: ".concat(JSON.stringify(n.point)));if(!o.isPointLegal(n.point))throw Error("cannot spawn outside navPoly: ".concat(JSON.stringify(n.point)));o.npc[n.npcKey]=function(e,t,n){var r=n.disabled,o=n.panZoomApi,i=n.npcs;return{key:e,epochMs:Date.now(),def:{key:e,position:t,angle:0,paused:!!r},el:{root:{},body:{}},anim:{animPath:[],aux:{angs:[],count:0,edges:[],elens:[],navPathPolys:[],sofars:[],total:0},spriteSheet:"idle",translate:new Animation,rotate:new Animation,sprites:new Animation,wayMetas:[],wayTimeoutId:0},cancel:function(){var e=this;return(0,a.Z)(s().mark((function t(){var n,r;return s().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return console.log("cancel: cancelling ".concat(e.def.key)),e.clearWayMetas(),r=e.anim,null!==(n=e.el.root)&&void 0!==n&&n.getAnimations().includes(r.translate)&&r.translate.commitStyles(),e.el.body instanceof HTMLDivElement&&e.setLookTarget(e.getAngle()),t.next=7,new Promise((function(e){r.translate.addEventListener("cancel",(function(){return e()})),r.translate.cancel(),r.rotate.cancel()}));case 7:case"end":return t.stop()}}),t)})))()},clearWayMetas:function(){this.anim.wayMetas.length=0},followNavPath:function(e,t){var n=this;return(0,a.Z)(s().mark((function r(){var o;return s().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if((o=n.anim).animPath=e.map(m.dl.from),n.clearWayMetas(),n.updateAnimAux(),!(o.animPath.length<=1||0===o.aux.total)){r.next=6;break}return r.abrupt("return");case 6:return null!==t&&void 0!==t&&t.globalNavMetas&&(o.wayMetas=t.globalNavMetas.map((function(e){return z(z({},e),{},{length:Math.max(0,o.aux.sofars[e.index]+F[e.key])})}))),n.setSpritesheet("walk"),n.startAnimation(),i.events.next({key:"started-walking",npcKey:n.def.key}),console.log("followNavPath: ".concat(n.def.key," started walk")),n.nextWayTimeout(),r.prev=12,r.next=15,new Promise((function(e,t){o.translate.addEventListener("finish",(function(){console.log("followNavPath: ".concat(n.def.key," finished walk")),e()})),o.translate.addEventListener("cancel",(function(){o.translate.finished||console.log("followNavPath: ".concat(n.def.key," cancelled walk")),t(new Error("cancelled"))}))}));case 15:return r.prev=15,n.setSpritesheet("idle"),n.startAnimation(),i.events.next({key:"stopped-walking",npcKey:n.def.key}),r.finish(15);case 20:case"end":return r.stop()}}),r,null,[[12,,15,20]])})))()},getAngle:function(){var e=new DOMMatrixReadOnly(window.getComputedStyle(this.el.body).transform);return Math.atan2(e.m12,e.m11)},getAnimDef:function(){var e=this.anim,t=this.anim.aux;return{translateKeyframes:e.animPath.flatMap((function(e,n){return[{offset:t.sofars[n]/t.total,transform:"translate(".concat(e.x,"px, ").concat(e.y,"px)")},{offset:t.sofars[n]/t.total,transform:"translate(".concat(e.x,"px, ").concat(e.y,"px)")}]})),rotateKeyframes:e.animPath.flatMap((function(e,n){return[{offset:t.sofars[n]/t.total,transform:"rotateZ(".concat(t.angs[n-1]||t.angs[n]||0,"rad) scale(").concat(q,")")},{offset:t.sofars[n]/t.total,transform:"rotateZ(".concat(t.angs[n]||t.angs[n-1]||0,"rad) scale(").concat(q,")")}]})),opts:{duration:t.total*U,direction:"normal",fill:"forwards"}}},getBounds:function(){var e=this.getPosition();return new m.UL(e.x-B,e.y-B,2*B,2*B)},getPosition:function(){var e,t,n=m.dl.from((null===(e=(t=this.el.root).getBoundingClientRect)||void 0===e?void 0:e.call(t))||[0,0]),r=n.x,a=n.y;return m.dl.from(o.getWorld({clientX:r,clientY:a})).precision(2)},getTargets:function(){var e=this.anim;if("idle"===e.spriteSheet||null===e.translate.currentTime)return[];var t=e.translate.currentTime;return e.aux.sofars.map((function(n,r){return{point:e.animPath[r],arriveMs:n*U-t}})).filter((function(e){return e.arriveMs>=0}))},lookAt:function(e){var t=this.getPosition(),n=m.dl.from(e).sub(t);if(0===n.length)return this.getAngle();for(var r=(0,J.PK)(this.el.root,C.vR.npcTargetLookAngle),o=Math.atan2(n.y,n.x);o-r>Math.PI;)o-=2*Math.PI;for(;r-o>Math.PI;)o+=2*Math.PI;return this.setLookTarget(o),o},nextWayTimeout:function(){var e=this.anim;if(null===e.translate.currentTime)return console.warn("nextWayTimeout: anim.root.currentTime is null");e.wayMetas[0]&&(e.wayTimeoutId=window.setTimeout(this.wayTimeout.bind(this),e.wayMetas[0].length*U-e.translate.currentTime))},npcRef:function(e){e&&0===this.anim.aux.count&&(this.el.root=e,this.el.body=e.childNodes[0],this.el.root.style.transform="translate(".concat(this.def.position.x,"px, ").concat(this.def.position.y,"px)"),this.setLookTarget(0))},pause:function(){console.log("pause: pausing ".concat(this.def.key));var e=this.anim;e.translate.pause(),e.rotate.pause(),e.sprites.pause(),e.translate.commitStyles(),this.setLookTarget(this.getAngle()),window.clearTimeout(e.wayTimeoutId),this.def.key===i.playerKey&&i.getPanZoomApi().animationAction("pause")},get paused(){return"paused"===this.anim.translate.playState},play:function(){console.log("play: resuming ".concat(this.def.key));var e=this.anim;e.translate.play(),e.rotate.play(),e.sprites.play(),this.nextWayTimeout(),this.def.key===i.playerKey&&i.getPanZoomApi().animationAction("play")},setLookTarget:function(e){this.el.root.style.setProperty(C.vR.npcTargetLookAngle,"".concat(e,"rad"))},setSpritesheet:function(e){e!==this.anim.spriteSheet&&(this.el.root.classList.remove(this.anim.spriteSheet),this.el.root.classList.add(e),this.anim.spriteSheet=e)},startAnimation:function(){var e=this.anim;if(e.aux.count&&(e.translate.commitStyles(),this.setLookTarget(this.getAngle()),e.translate.cancel(),e.rotate.cancel()),"walk"===e.spriteSheet){var t=this.getAnimDef(),n=t.translateKeyframes,r=t.rotateKeyframes,o=t.opts;e.translate=this.el.root.animate(n,o),e.rotate=this.el.body.animate(r,o);var a=W.HB,i=W.sP;e.sprites=this.el.body.animate([{offset:0,backgroundPosition:"0px"},{offset:1,backgroundPosition:"".concat(-a.walk.frameCount*a.walk.aabb.width*i,"px")}],{easing:"steps(".concat(a.walk.frameCount,")"),duration:625,iterations:1/0})}else"idle"===e.spriteSheet&&(this.clearWayMetas(),this.setLookTarget(this.getAngle()),e.translate=this.el.root.animate([],{duration:2e3,iterations:1/0}),e.rotate=this.el.body.animate([],{duration:2e3,iterations:1/0}),e.sprites=this.el.body.animate([],{duration:2e3,iterations:1/0}));e.aux.count++},updateAnimAux:function(){var e=this.anim,t=e.aux;t.edges=e.animPath.map((function(t,n){return{p:t,q:e.animPath[n+1]}})).slice(0,-1),t.angs=t.edges.map((function(e){return Number(Math.atan2(e.q.y-e.p.y,e.q.x-e.p.x).toFixed(2))})),t.elens=t.edges.map((function(e){var t=e.p,n=e.q;return Number(t.distanceTo(n).toFixed(2))})),t.navPathPolys=t.edges.map((function(e){var t=e.q.clone().sub(e.p).rotate(Math.PI/2).normalize(.01);return new m.LA([e.p.clone().add(t),e.q.clone().add(t),e.q.clone().sub(t),e.p.clone().sub(t)])}));var n=t.elens.reduce((function(e,t){return e.total+=t,e.sofars.push(e.sofars[e.sofars.length-1]+t),e}),{sofars:[0],total:0});t.sofars=n.sofars,t.total=n.total},wayTimeout:function(){var e=this.anim;if(0===e.wayMetas.length||"idle"===e.spriteSheet||null===e.translate.currentTime||"paused"===e.translate.playState)return 0===e.wayMetas.length&&console.warn("wayTimeout: empty anim.wayMetas"),null===e.translate.currentTime&&console.warn("wayTimeout: anim.root.currentTime is null"),void("idle"===e.spriteSheet&&console.warn('wayTimeout: anim.spriteSheet is "idle"'));if(e.translate.currentTime>=e.wayMetas[0].length*U-1){var t=e.wayMetas.shift();console.log(t),i.events.next({key:"way-point",npcKey:this.def.key,meta:t})}this.nextWayTimeout()}}}(n.npcKey,n.point,{disabled:e.disabled,panZoomApi:e.panZoomApi,npcs:o}),t()},trackNpc:function(t){var n=t.npcKey,r=t.process;if(!o.npc[n])throw Error('npc "'.concat(n,'" does not exist'));var i="no-track";return(0,j.T)((0,O.of)({key:"init-track"}),o.events,e.panZoomApi.events).pipe((0,u.h)((function(e){return 1===r.status&&("init-track"===e.key||"ui-idle"===e.key||"resized-bounds"===e.key||"cancelled-panzoom-to"===e.key||"completed-panzoom-to"===e.key||"started-walking"===e.key&&e.npcKey===n||"stopped-walking"===e.key&&e.npcKey===n)}))).subscribe({next:function(t){return(0,a.Z)(s().mark((function r(){var a,c,l;return s().wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(e.panZoomApi.isIdle()||"started-walking"===t.key){r.next=4;break}return i="no-track",console.warn("@",i),r.abrupt("return");case 4:if(a=o.npc[n],c=a.getPosition(),"idle"!==a.anim.spriteSheet||null!==e.panZoomApi.anims[0]&&"finished"!==e.panZoomApi.anims[0].playState||!(e.panZoomApi.distanceTo(c)>10)){r.next=17;break}return i="panzoom-to",console.warn("@",i),r.prev=9,r.next=12,e.panZoomApi.panZoomTo(2,c,2e3);case 12:r.next=16;break;case 14:r.prev=14,r.t0=r.catch(9);case 16:i="no-track";case 17:if("started-walking"!==t.key){r.next=28;break}return i="follow-walk",console.warn("@",i),r.prev=20,l=a.getTargets().map((function(e){return m.dl.from(e.point)})),r.next=24,e.panZoomApi.followPath(l,{animScaleFactor:U});case 24:r.next=28;break;case 26:r.prev=26,r.t1=r.catch(20);case 28:case"end":return r.stop()}}),r,null,[[9,14],[20,26]])})))()}})},walkNpc:function(e){return(0,a.Z)(s().mark((function t(){var n,r,a;return s().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(n=o.getNpc(e.npcKey),G(e)){t.next=3;break}throw Error("invalid global navpath: ".concat(JSON.stringify(e)));case 3:return t.prev=3,a=(r=e).fullPath,console.log("global navMetas",r.navMetas),t.next=9,n.followNavPath(a,{globalNavMetas:r.navMetas});case 9:t.next=18;break;case 11:if(t.prev=11,t.t0=t.catch(3),!(t.t0 instanceof Error&&"cancelled"===t.t0.message)){t.next=17;break}console.info("".concat(e.npcKey,": walkNpc cancelled")),t.next=18;break;case 17:throw t.t0;case 18:case"end":return t.stop()}}),t,null,[[3,11]])})))()}}}),{deps:[n,e.doorsApi]});return c.useEffect((function(){return(0,S.Zi)(e.npcsKey,o),e.onLoad(o),function(){return(0,S.lB)(e.npcsKey)}}),[]),(0,Y.jsxs)("div",{className:A()("npcs",ce),ref:o.rootRef,children:[Object.entries(o.decor).map((function(e){var t=(0,r.Z)(e,2),n=t[0],o=t[1];return(0,Y.jsx)(le,{item:o},n)})),Object.values(o.npc).map((function(e){return(0,Y.jsx)(te,{npc:e},"".concat(e.key,"@").concat(e.epochMs))}))]})}var se,ce=(0,l.iv)(ne||(ne=(0,o.Z)(["\n  position: absolute;\n  canvas {\n    position: absolute;\n    pointer-events: none;\n  }\n  div.debug-npc {\n    position: absolute;\n    width: 30px;\n    height: 30px;\n    border-radius: 30px;\n    border: 1px solid red;\n    transform: translate(-15px, -15px);\n  }\n  svg {\n    position: absolute;\n    pointer-events: none;\n\n    .debug-circle {\n      fill: #ff000035;\n    }\n  }\n"])));function le(e){var t,n,r=e.item;switch(r.type){case"path":t=m.UL.fromPoints.apply(m.UL,(0,k.Z)(r.path)).outset(10),n=(0,Y.jsxs)("g",{className:"debug-path",children:[(0,Y.jsx)("polyline",{fill:"none",stroke:"#88f",strokeDasharray:"2 2",strokeWidth:1,points:r.path.map((function(e){return"".concat(e.x,",").concat(e.y)})).join(" ")}),r.path.map((function(e,t){return(0,Y.jsx)("circle",{fill:"none",stroke:"#ff444488",r:2,cx:e.x,cy:e.y},t)}))]});break;case"circle":t=new m.UL(r.center.x-r.radius,r.center.y-r.radius,2*r.radius,2*r.radius),n=(0,Y.jsx)("circle",{className:"debug-circle",cx:r.center.x,cy:r.center.y,r:r.radius});break;default:return console.error("unexpected decor",r),null}return(0,Y.jsx)("svg",{width:t.width,height:t.height,style:{left:t.x,top:t.y},children:(0,Y.jsx)("g",{style:{transform:"translate(".concat(-t.x,"px, ").concat(-t.y,"px)")},children:n})})}function ue(e,t){var n="undefined"!==typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(!e)return;if("string"===typeof e)return pe(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return pe(e,t)}(e))||t&&e&&"number"===typeof e.length){n&&(e=n);var r=0,o=function(){};return{s:o,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,i=!0,s=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return i=e.done,e},e:function(e){s=!0,a=e},f:function(){try{i||null==n.return||n.return()}finally{if(s)throw a}}}}function pe(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function de(e){var t=(0,h.Z)(),n=(0,v.Z)([{layoutKey:"g-301--bridge"},{layoutKey:"g-101--multipurpose",transform:[1,0,0,1,0,600]},{layoutKey:"g-302--xboat-repair-bay",transform:[1,0,0,1,-1200,600]},{layoutKey:"g-303--passenger-deck",transform:[1,0,0,-1,-1200,1800]},{layoutKey:"g-302--xboat-repair-bay",transform:[-1,0,0,1,2400,600]},{layoutKey:"g-301--bridge",transform:[1,0,0,-1,0,2400]}]),r=n.gms,o=n.gmGraph,i=(0,y.Z)((function(){return{gmId:0,roomId:9,initOpen:{0:[24]},clipPath:r.map((function(e){return"none"})),doorsApi:{ready:!1},panZoomApi:{ready:!1},npcsApi:{ready:!1},handlePlayerWayEvent:function(e){return(0,a.Z)(s().mark((function t(){var n,r,a,c;return s().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:t.t0=e.meta.key,t.next="exit-room"===t.t0?3:"enter-room"===t.t0?6:"pre-exit-room"===t.t0||"pre-near-door"===t.t0?8:"start-seg"===t.t0?13:14;break;case 3:return null!==e.meta.otherRoomId?(n=[e.meta.gmId,e.meta.otherRoomId],i.gmId=n[0],i.roomId=n[1]):(r=o.getAdjacentRoomCtxt(e.meta.gmId,e.meta.hullDoorId))&&(a=[r.adjGmId,r.adjRoomId],i.gmId=a[0],i.roomId=a[1]),i.updateAll(),t.abrupt("break",15);case 6:return i.gmId===e.meta.gmId&&i.roomId===e.meta.enteredRoomId||(i.gmId=e.meta.gmId,i.roomId=e.meta.enteredRoomId,i.updateAll()),t.abrupt("break",15);case 8:if(i.doorsApi.open[e.meta.gmId][e.meta.doorId]){t.next=12;break}return c=i.npcsApi.getNpc(e.npcKey),t.next=12,c.cancel();case 12:case 13:return t.abrupt("break",15);case 14:throw(0,p.Ql)(e.meta);case 15:case"end":return t.stop()}}),t)})))()},playerNearDoor:function(e,t){var n=i.npcsApi.getPlayer();if(!n)return!0;var o=n.getPosition(),a=i.npcsApi.getNpcInteractRadius(),s=r[e].doors[t].poly.clone().applyMatrix(r[e].matrix);return d.J.circleIntersectsConvexPolygon(o,a,s)},safeToCloseDoor:function(e,t){var n=r[e].doors[t].poly.clone().applyMatrix(r[e].matrix);return 0===i.npcsApi.getNpcsIntersecting(n).length},setRoomByNpc:function(e){var t=i.npcsApi.getNpc(e).getPosition(),n=o.findRoomContaining(t);if(n){var r=[n.gmId,n.roomId];i.gmId=r[0],i.roomId=r[1],i.updateAll()}else console.error("set-player ".concat(e,": no room contains ").concat(JSON.stringify(t)))},updateAll:function(){i.updateClipPath(),i.updateVisibleDoors(),t()},updateClipPath:function(){var e=r[i.gmId],t=r.map((function(e){return[]})),n=i.doorsApi.getOpen(i.gmId),a=o.computeLightPolygons(i.gmId,i.roomId,n);r.forEach((function(n,r){var o=a.filter((function(e){return r===e.gmIndex})).map((function(e){return e.poly.precision(2)}));if(n===e){var s=e.roomsWithDoors[i.roomId];t[r]=o.concat(s).reduce((function(e,t){return m.LA.cutOut([t],e)}),[n.hullOutline])}else t[r]=m.LA.cutOut(o,[n.hullOutline])})),t.forEach((function(e,t){e.forEach((function(e){return e.translate(-r[t].pngRect.x,-r[t].pngRect.y)}));var n=e.map((function(e){return"".concat(e.svgPath)})).join(" ");i.clipPath[t]=n.length?"path('".concat(n,"')"):"none"}))},updateVisibleDoors:function(){var e=this,t=r[i.gmId],n=r.map((function(e){return[]}));n[i.gmId]=t.roomGraph.getAdjacentDoors(i.roomId).map((function(e){return e.doorId})),t.roomGraph.getAdjacentHullDoorIds(t,i.roomId).flatMap((function(e){var t=e.hullDoorIndex;return o.getAdjacentRoomCtxt(i.gmId,t)||[]})).forEach((function(e){var t=e.adjGmId,r=e.adjDoorId;return(n[t]=n[t]||[]).push(r)})),r.forEach((function(t,r){return e.doorsApi.setVisible(r,n[r])}))}}}),{overwrite:{gmId:!0,roomId:!0},deps:[r,o]});return c.useEffect((function(){if(r.length&&i.doorsApi.ready&&i.npcsApi.ready){i.updateAll();var e=i.doorsApi.events.pipe((0,u.h)((function(e){return"closed-door"===e.key||"opened-door"===e.key}))).subscribe((function(){return i.updateAll()})),t=i.npcsApi.events.subscribe((function(e){"set-player"===e.key&&(i.npcsApi.playerKey=e.npcKey||null,e.npcKey&&i.setRoomByNpc(e.npcKey)),"way-point"===e.key&&e.npcKey===i.npcsApi.playerKey&&i.handlePlayerWayEvent(e),"decor"===e.key&&i.npcsApi.setDecor(e.meta.key,e.meta)}));return function(){e.unsubscribe(),t.unsubscribe()}}}),[r,i.doorsApi.ready,i.npcsApi.ready]),r.length?(0,Y.jsxs)(x.Z,{className:me,initZoom:1.5,initCenter:{x:300,y:300},dark:!0,onLoad:function(e){i.panZoomApi=e,t()},children:[r.map((function(e,t){return(0,Y.jsx)("img",{className:"geomorph",src:(0,f.qX)(e.key),draggable:!1,width:e.pngRect.width,height:e.pngRect.height,style:{left:e.pngRect.x,top:e.pngRect.y,transform:e.transformStyle,transformOrigin:e.transformOrigin}},t)})),i.doorsApi.ready&&(0,Y.jsx)(ge,{showIds:!0,showLabels:!0,doorsApi:i.doorsApi,gms:r,gmGraph:o,gmId:i.gmId,npcsApi:i.npcsApi,roomId:i.roomId,setRoom:function(e,t){var n=[e,t];i.gmId=n[0],i.roomId=n[1],i.updateAll()}}),i.panZoomApi.ready&&(0,Y.jsx)(ie,{disabled:e.disabled,doorsApi:i.doorsApi,gmGraph:o,npcsKey:fe,panZoomApi:i.panZoomApi,onLoad:function(e){!i.npcsApi.ready&&(i.npcsApi=e)&&t()}}),r.map((function(e,t){return(0,Y.jsx)("img",{className:"geomorph-dark",src:(0,f.qX)(e.key),draggable:!1,width:e.pngRect.width,height:e.pngRect.height,style:{clipPath:i.clipPath[t],WebkitClipPath:i.clipPath[t],left:e.pngRect.x,top:e.pngRect.y,transform:e.transformStyle,transformOrigin:e.transformOrigin}},t)})),(0,Y.jsx)(w.Z,{gms:r,gmGraph:o,initOpen:i.initOpen,playerNearDoor:i.playerNearDoor,safeToCloseDoor:i.safeToCloseDoor,onLoad:function(e){!i.doorsApi.ready&&(i.doorsApi=e)&&t()}})]}):null}var fe="npcs-demo-1",me=(0,l.iv)(se||(se=(0,o.Z)(["\n  img {\n    position: absolute;\n    transform-origin: top left;\n    pointer-events: none;\n  }\n  img.geomorph {\n    filter: brightness(80%);\n  }\n  img.geomorph-dark {\n    filter: invert(100%) brightness(34%);\n    /* filter: invert(100%) brightness(55%) contrast(200%) brightness(60%); */\n  }\n\n  div.debug {\n    position: absolute;\n\n    div.debug-door-arrow, div.debug-label-info {\n      cursor: pointer;\n      position: absolute;\n      border-radius: ","px;\n    }\n    div.debug-door-arrow {\n      background-image: url('/icon/solid_arrow-circle-right.svg');\n    }\n    div.debug-label-info {\n      background-image: url('/icon/info-icon.svg');\n    }\n\n    div.debug-door-id-icon, div.debug-room-id-icon {\n      position: absolute;\n      background: black;\n      color: white;\n      font-size: 8px;\n      line-height: 1;\n      border: 1px solid black;\n    }\n    div.debug-room-id-icon {\n      color: #4f4;\n    }\n    div.debug-window {\n      position: absolute;\n      background: #0000ff40;\n      border: 1px solid white;\n      pointer-events: none;\n      transform-origin: top left;\n    }\n    svg.debug-room-nav, svg.debug-room-outline {\n      position: absolute;\n      pointer-events: none;\n      path.nav-poly {\n        pointer-events: none;\n        fill: rgba(255, 0, 0, 0.1);\n        stroke: blue;\n      }\n      path.room-outline {\n        pointer-events: none;\n        fill: rgba(0, 0, 255, 0.1);\n        stroke: red;\n      }\n    }\n  }\n"])),5);function ge(e){var t=e.gms[e.gmId],n=e.doorsApi.getVisible(e.gmId),o=t.lazy.roomNavPoly[e.roomId],i=o.rect,l=t.rooms[e.roomId].rect,u=t.rooms[e.roomId],d=t.point[e.roomId].labels,f=c.useCallback(function(){var n=(0,a.Z)(s().mark((function n(r){var o,a,i,c,l,u,d,f,m,h,y;return s().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if("debug-door-arrow"!==(o=r.target).className){n.next=10;break}if(a=t.doors[Number(o.getAttribute("data-debug-door-id"))],!((i=t.getHullDoorId(a))>=0)){n.next=9;break}(c=e.gmGraph.getAdjacentRoomCtxt(e.gmId,i))?e.setRoom(c.adjGmId,c.adjRoomId):console.info("hull door is isolated",e.gmId,i),n.next=10;break;case 9:return n.abrupt("return",e.setRoom(e.gmId,t.getOtherRoomId(a,e.roomId)));case 10:if("debug-label-info"!==o.className){n.next=33;break}l=t.labels[Number(o.getAttribute("data-debug-label-id"))],u="\u2139\ufe0f  [".concat(g.ZD.Blue).concat(l.text).concat(g.ZD.Reset,"] with ").concat(t.roomGraph.getAdjacentDoors(e.roomId).length," doors"),d=Object.values(e.npcsApi.session).filter((function(e){return e.receiveMsgs})),f=ue(d),n.prev=15,f.s();case 17:if((m=f.n()).done){n.next=25;break}return h=m.value.key,n.next=21,b.default.api.writeMsgCleanly(h,u);case 21:y=n.sent,e.npcsApi.addTtyLineCtxts(h,y,[{lineNumber:y,lineText:u,linkText:l.text,linkStartIndex:(0,p.qW)("\u2139\ufe0f  ["),key:"room",gmId:e.gmId,roomId:e.roomId}]);case 23:n.next=17;break;case 25:n.next=30;break;case 27:n.prev=27,n.t0=n.catch(15),f.e(n.t0);case 30:return n.prev=30,f.f(),n.finish(30);case 33:case"end":return n.stop()}}),n,null,[[15,27,30,33]])})));return function(e){return n.apply(this,arguments)}}(),[t,e]);return(0,Y.jsxs)("div",{className:"debug-parent",onClick:f,children:[e.outlines&&e.gms.map((function(e,t){return(0,Y.jsx)("div",{style:{position:"absolute",left:e.gridRect.x,top:e.gridRect.y,width:e.gridRect.width,height:e.gridRect.height,border:"2px red solid"}},t)})),(0,Y.jsxs)("div",{className:"debug",style:{transform:t.transformStyle},children:[e.localNav&&(0,Y.jsx)("svg",{className:"debug-room-nav",width:i.width,height:i.height,style:{left:i.x,top:i.y},children:(0,Y.jsxs)("g",{style:{transform:"translate(".concat(-i.x,"px, ").concat(-i.y,"px)")},children:[(0,Y.jsx)("path",{className:"nav-poly",d:o.svgPath}),n.map((function(e){var n=(0,r.Z)(t.doors[e].seg,2),o=n[0],a=n[1];return(0,Y.jsx)("line",{stroke:"red",x1:o.x,y1:o.y,x2:a.x,y2:a.y},e)}))]})}),e.roomOutlines&&(0,Y.jsx)("svg",{className:"debug-room-outline",width:l.width,height:l.height,style:{left:l.x,top:l.y},children:(0,Y.jsx)("g",{style:{transform:"translate(".concat(-l.x,"px, ").concat(-l.y,"px)")},children:(0,Y.jsx)("path",{className:"room-outline",d:u.svgPath})})}),n.map((function(n){var r=t.doors[n],o=r.poly,a=r.normal,i=r.roomIds[0]===e.roomId?1:-1,s=m.dl.from(a).scale(-i).angle,c=o.center.addScaledVector(a,10*i),l=o.center.addScaledVector(a,10*-i);return[(0,Y.jsx)("div",{"data-debug-door-id":n,"data-tags":"debug door-arrow",className:"debug-door-arrow",style:{left:c.x-5,top:c.y-5,width:10,height:10,transform:"rotate(".concat(s,"rad)")}},n),e.showIds&&(0,Y.jsx)("div",{className:"debug-door-id-icon",style:{left:l.x,top:l.y-4},children:n},"icon"+n)]})),e.showIds&&(0,Y.jsx)("div",{className:"debug-room-id-icon",style:{left:i.x+i.width-35,top:i.y+25},children:e.roomId}),e.showLabels&&d.map((function(e){var t=e.center,n=e.text,r=e.index;return(0,Y.jsx)("div",{"data-debug-label-id":r,"data-tags":"debug label-icon",className:"debug-label-info",title:n,style:{left:t.x-5,top:t.y-5,width:10,height:10,filter:"invert(100%)"}},r)})),e.windows&&t.windows.map((function(e,t){var n=e.baseRect,r=e.angle;return(0,Y.jsx)("div",{className:"debug-window",style:{left:n.x,top:n.y,width:n.width,height:n.height,transform:"rotate(".concat(r,"rad)")}},"window-".concat(t))}))]},t.itemKey)]})}},69862:function(){},40964:function(){},28949:function(){}}]);