"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[358],{13358:function(t,e,n){n.r(e),n.d(e,{default:function(){return m}});var r=n(92809),o=n(30266),a=n(809),c=n.n(a),i=n(11163),u=n(59748),f=n(86352),s=n(58601),l=n(50597),p=n(8357),b=n(12464),d=n(8311);function O(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function y(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?O(Object(n),!0).forEach((function(e){(0,r.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):O(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function h(t){var e,n,o=(0,s.v8)(t),a=(0,p.Z)((function(t){var e=t.portal;return o in e?e[o]:null}));return e=t,n=a,u.default.useEffect((function(){if(n)JSON.stringify(n.meta)!==JSON.stringify(e)&&console.warn("Detected different TabMetas with same portalKey",n.meta,e);else{var t=(0,s.v8)(e),o=b.oD({attributes:{class:"portal"}});p.Z.setState((function(n){return{portal:y(y({},n.portal),{},(0,r.Z)({},t,{key:t,meta:e,portal:o}))}}));var a=Object.values(p.Z.getState().tabs).filter((function(t){return t.pagePathname===location.pathname})).find((function(t){return t.def.some((function(t){return t.filepath===e.filepath}))}));null!==a&&void 0!==a&&a.disabled||setTimeout((function(){return o.setPortalProps({disabled:!1})}),300)}}),[]),a?(0,d.tZ)(b.t0,{node:a.portal}):null}function g(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function m(t){var e=u.default.useMemo((function(){return f.Model.fromJson((0,s.J8)(t.tabs))}),[t.tabs]);return function(t,e){u.default.useEffect((function(){var n=p.Z.getState().tabs;return t.id?(n[t.id]||(n[t.id]={key:t.id,def:t.tabs,selectTab:function(t){return e.doAction(f.Actions.selectTab(t))},scrollTo:function(){var e=(0,o.Z)(c().mark((function e(){var n,r,o;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.id,r=document.getElementById(n).getBoundingClientRect(),o=r.top,window.scrollBy({top:o,behavior:"smooth"}),e.next=5,(0,l.c)(window.pageYOffset+o);case 5:if(e.sent){e.next=7;break}return e.abrupt("return");case 7:i.default.push("#".concat(n));case 8:case"end":return e.stop()}}),e)})));function n(){return e.apply(this,arguments)}return n}(),getTabNodes:function(){var t=[];return e.visitNodes((function(e){return e instanceof f.TabNode&&t.push(e)})),t},disabled:!0,pagePathname:location.pathname}),p.Z.setState({}),function(){delete p.Z.getState().tabs[t.id]}):console.warn("Tabs has no id",t.tabs)}),[e])}(t,e),(0,d.tZ)(f.Layout,{model:e,factory:v,realtimeResize:!0})}function v(t){var e=t.getConfig();return(0,d.tZ)(h,function(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?g(Object(n),!0).forEach((function(e){(0,r.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):g(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}({},e))}},58601:function(t,e,n){n.d(e,{v8:function(){return o},Ff:function(){return c},J8:function(){return i}});var r=n(86576);function o(t){return"".concat(a(t)).concat(t.idSuffix||"")}function a(t){switch(t.key){case"code":case"component":return t.filepath;case"terminal":return"@".concat(t.filepath);default:throw(0,r.Ql)(t)}}function c(t,e){return"".concat(t,"--tabs--").concat(e)}function i(t){return{global:{tabEnableRename:!1},layout:{type:"row",weight:100,children:[{type:"tabset",weight:50,selected:0,children:t.map((function(t){return{type:"tab",id:o(t),name:a(t),config:(0,r.I8)(t),enableClose:!1}}))}]}}}}}]);