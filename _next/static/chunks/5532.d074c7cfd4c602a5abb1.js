"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5532],{49071:function(e,t,n){n.r(t),n.d(t,{default:function(){return Z}});var r=n(52209),o=n(59748),i=n(88269),s=n(20296),c=n(6320),l=n(50269),a=n(56127),u=n(79056);var f,d=n(59885),v=n(94184),p=n.n(v),g=n(44275),h=n(8311);function w(e){var t=(0,g.Z)((function(){return{onClick:function(t){var n=t.target,r=e.session.ttyShell.xterm;if(r.xterm.scrollToBottom(),n.classList.contains("lowercase")){var o=r.forceLowerCase=!r.forceLowerCase,i="\u26a0\ufe0f  input ".concat(o?"forced as":"not forced as"," lowercase");a.default.api.warnCleanly(e.session.key,i),n.classList.toggle("enabled"),localStorage.setItem(b,"".concat(o))}else n.classList.contains("ctrl-c")?r.sendSigKill():n.classList.contains("clear")?r.clearScreen():n.classList.contains("up")?r.reqHistoryLine(1):n.classList.contains("down")&&r.reqHistoryLine(-1);r.xterm.focus()}}}));return o.default.useEffect((function(){var t=e.session.ttyShell.xterm;return localStorage.getItem(b)||localStorage.setItem(b,"true"),t.forceLowerCase="true"===localStorage.getItem(b),function(){t.forceLowerCase=!1}}),[]),(0,h.BX)("div",{className:m,onClick:t.onClick,style:{top:"".concat(e.offset,"px")},children:[(0,h.tZ)("div",{className:p()("icon lowercase",{enabled:e.session.ttyShell.xterm.forceLowerCase}),children:"abc"}),(0,h.tZ)("div",{className:"icon ctrl-c",children:"\ud83d\udc80"}),(0,h.tZ)("div",{className:"icon clear",children:"\u2205"}),(0,h.tZ)("div",{className:"icon up",children:"\u2b06\ufe0f"}),(0,h.tZ)("div",{className:"icon down",children:"\u2b07\ufe0f"})]})}var y,b="touch-tty-force-lowercase",m=(0,i.iv)(f||(f=(0,r.Z)(["\n  position: absolute;\n  z-index: 100000;\n  top: 0;\n  right: 16px;\n  width: 32px;\n  height: 128px;\n\n  line-height: 1; /** Needed for mobile viewing 'Desktop site' */\n  background-color: rgba(0, 0, 0, 0.7);\n  font-size: 0.75rem;\n  border: 1px solid #555;\n  border-width: 1px 1px 1px 1px;\n  color: white;\n\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  transition: top 500ms ease;\n\n  .lowercase {\n    color: #999;\n    &.enabled {\n      color: white;\n    }\n  }\n\n  .icon {\n    cursor: pointer;\n    width: 100%;\n    text-align: center;\n    flex: 1;\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n  }\n"]))),x=n(27375),O=n(84175);function Z(e){var t=e.sessionKey,n=e.env,r=(0,x.Z)(),i=(0,g.Z)((function(){return{offset:0,xtermReady:!1,isTouchDevice:(0,l.us)(),session:null}}));return function(e){var t=o.default.useState((function(){return e()})),n=(0,u.Z)(t,2),r=n[0],i=n[1];o.default.useEffect((function(){function t(){i(e())}return window.addEventListener("resize",t),function(){return window.removeEventListener("resize",t)}}),[])}((function(){return i.isTouchDevice=(0,l.us)()})),o.default.useEffect((function(){return i.session=a.default.api.createSession(t,n),r(),function(){return a.default.api.removeSession(t)}}),[t]),(0,h.BX)(S,{children:[i.session&&(0,h.tZ)(d.Od,{onMount:function(e){var t=(0,O.Cq)(i.session),n=new c.q5(e,t.key,t.ttyIo);n.initialise(),t.ttyShell.initialise(n),i.xtermReady=!0,r(),n.xterm.onLineFeed((0,s.debounce)((function(){i.isTouchDevice&&(i.offset=Math.max(1,parseInt(e.textarea.style.top)-100),r())}),100))},options:k}),i.isTouchDevice&&i.session&&i.xtermReady&&(0,h.tZ)(w,{session:i.session,offset:i.offset})]})}var S=(0,i.zo)("div")(y||(y=(0,r.Z)(["\n  grid-area: terminal;\n  background: black;\n  height: 100%;\n  padding: 4px;\n  /** TODO fix padding without scrollbar offset */\n"]))),k={allowProposedApi:!0,fontSize:16,cursorBlink:!0,rendererType:"canvas",rightClickSelectsWord:!0,theme:{background:"black",foreground:"#41FF00"},convertEol:!1,scrollback:250,rows:50}},44275:function(e,t,n){n.d(t,{Z:function(){return s}});var r=n(79056),o=n(59748),i=n(84175);function s(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=o.default.useState(e),s=(0,r.Z)(n,1),c=s[0];return o.default.useMemo((function(){var n=e.toString()!==c._prevFn;if(c._prevFn)if(n){for(var o=e(),s=0,l=Object.entries(o);s<l.length;s++){var a,u,f,d=(0,r.Z)(l[s],2),v=d[0],p=d[1],g=v;if("function"===typeof p)c[g]=p;else if(null!==(a=Object.getOwnPropertyDescriptor(c,g))&&void 0!==a&&a.get||null!==(u=Object.getOwnPropertyDescriptor(c,g))&&void 0!==u&&u.set){var h,w;Object.defineProperty(c,g,{get:null===(h=Object.getOwnPropertyDescriptor(o,g))||void 0===h?void 0:h.get,set:null===(w=Object.getOwnPropertyDescriptor(o,g))||void 0===w?void 0:w.set})}else v in c?c._prevInit&&null!==(f=t.overwrite)&&void 0!==f&&f[g]&&!(0,i.fS)(c._prevInit[g],o[g])&&(c[g]=o[g]):c[g]=p}for(var y=0,b=Object.keys(c);y<b.length;y++){var m=b[y];m in o||["_prevFn","_prevInit"].includes(m)||delete c[m]}c._prevFn=e.toString(),c._prevInit=o}else for(var x=e(),O=0,Z=Object.entries(x);O<Z.length;O++){var S,k,L=(0,r.Z)(Z[O],2),j=L[0],D=L[1];if("function"===typeof D)c[j]=D;else if(null!==(S=Object.getOwnPropertyDescriptor(c,j))&&void 0!==S&&S.get||null!==(k=Object.getOwnPropertyDescriptor(c,j))&&void 0!==k&&k.set){var _,C;Object.defineProperty(c,j,{get:null===(_=Object.getOwnPropertyDescriptor(x,j))||void 0===_?void 0:_.get,set:null===(C=Object.getOwnPropertyDescriptor(x,j))||void 0===C?void 0:C.set})}}else c._prevFn=e.toString(),c._prevInit=e()}),t.deps||[]),c}},17120:function(e,t,n){n.d(t,{Z:function(){return c}});var r=n(32296),o=n(99846),i=n(16988),s=n(95243);function c(e){return(0,r.Z)(e)||(0,o.Z)(e)||(0,i.Z)(e)||(0,s.Z)()}}}]);