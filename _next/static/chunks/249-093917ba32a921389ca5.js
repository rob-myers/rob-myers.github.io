"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[249],{11951:function(n,e,t){t.d(e,{Z:function(){return Zn}});var r,o=t(52209),i=t(79056),a=t(59748),l=t(73460),c=t(88269),d=t(86576),s=t(17928),p=t(8357),u=t(72328),f=t(92809),m=t(17120),h=t(30266),g=t(10219),x=t(809),b=t.n(x),v=t(94184),y=t.n(v),w=t(58601),Z=t(58199),k=t(8311);function O(){return(0,k.tZ)("hr",{className:_})}var _=(0,c.iv)(r||(r=(0,o.Z)(["\n  margin: 0;\n  border-color: var(--focus-bg);\n\n  @media(min-width: 800px) {\n    padding-bottom: 80px;\n    border: 0;\n  }\n"]))),E=t(52542);var S=!1;if("undefined"!==typeof window){var z={get passive(){S=!0}};window.addEventListener("testPassive",null,z),window.removeEventListener("testPassive",null,z)}var P,N,j,T="undefined"!==typeof window&&window.navigator&&window.navigator.platform&&(/iP(ad|hone|od)/.test(window.navigator.platform)||"MacIntel"===window.navigator.platform&&window.navigator.maxTouchPoints>1),C=[],B=!1,D=-1,M=void 0,A=void 0,R=void 0,X=function(n){return C.some((function(e){return!(!e.options.allowTouchMove||!e.options.allowTouchMove(n))}))},I=function(n){var e=n||window.event;return!!X(e.target)||(e.touches.length>1||(e.preventDefault&&e.preventDefault(),!1))},L=function(){void 0!==R&&(document.body.style.paddingRight=R,R=void 0),void 0!==M&&(document.body.style.overflow=M,M=void 0)},Y=function(){if(void 0!==A){var n=-parseInt(document.body.style.top,10),e=-parseInt(document.body.style.left,10);document.body.style.position=A.position,document.body.style.top=A.top,document.body.style.left=A.left,window.scrollTo(e,n),A=void 0}},q=function(n,e){if(n){if(!C.some((function(e){return e.targetElement===n}))){var t={targetElement:n,options:e||{}};C=[].concat(function(n){if(Array.isArray(n)){for(var e=0,t=Array(n.length);e<n.length;e++)t[e]=n[e];return t}return Array.from(n)}(C),[t]),T?window.requestAnimationFrame((function(){if(void 0===A){A={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left};var n=window,e=n.scrollY,t=n.scrollX,r=n.innerHeight;document.body.style.position="fixed",document.body.style.top=-e,document.body.style.left=-t,setTimeout((function(){return window.requestAnimationFrame((function(){var n=r-window.innerHeight;n&&e>=r&&(document.body.style.top=-(e+n))}))}),300)}})):function(n){if(void 0===R){var e=!!n&&!0===n.reserveScrollBarGap,t=window.innerWidth-document.documentElement.clientWidth;if(e&&t>0){var r=parseInt(window.getComputedStyle(document.body).getPropertyValue("padding-right"),10);R=document.body.style.paddingRight,document.body.style.paddingRight=r+t+"px"}}void 0===M&&(M=document.body.style.overflow,document.body.style.overflow="hidden")}(e),T&&(n.ontouchstart=function(n){1===n.targetTouches.length&&(D=n.targetTouches[0].clientY)},n.ontouchmove=function(e){1===e.targetTouches.length&&function(n,e){var t=n.targetTouches[0].clientY-D;!X(n.target)&&(e&&0===e.scrollTop&&t>0||function(n){return!!n&&n.scrollHeight-n.scrollTop<=n.clientHeight}(e)&&t<0?I(n):n.stopPropagation())}(e,n)},B||(document.addEventListener("touchmove",I,S?{passive:!1}:void 0),B=!0))}}else console.error("disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.")},G=function(n){n?(C=C.filter((function(e){return e.targetElement!==n})),T&&(n.ontouchstart=null,n.ontouchmove=null,B&&0===C.length&&(document.removeEventListener("touchmove",I,S?{passive:!1}:void 0),B=!1)),T?Y():L()):console.error("enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.")},F=t(59885),K=function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"auto",t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:13;return(0,c.iv)(P||(P=(0,o.Z)(["\n  &::after {\n    display: inline-block;\n    content: '';\n    background-image: url('/icon/",".svg');\n    background-size: ","px ","px;\n    height: ","px;\n    width: ","px;\n    margin: ",";\n  }\n"])),n,t,t,t,t,e)};function H(n){return(0,k.BX)("div",{className:J,children:[(0,k.BX)("div",{className:"top-right",children:[(0,k.tZ)("div",{className:K("anchor-icon-white","auto",13),onClick:n.clickAnchor,title:"anchor"}),(0,k.tZ)("div",{className:K(n.expanded?"compress":"expand-solid","auto",13),onClick:n.toggleExpand,title:n.expanded?"minimise":"maximise"}),(0,k.tZ)("div",{className:y()("disable-icon",K("circle-xmark","auto",16),n.enabled&&"enabled"),onClick:n.enabled?n.toggleEnabled:void 0,title:n.enabled?"disable":void 0})]}),!n.enabled&&(0,k.tZ)("div",{className:"central",onClick:n.toggleEnabled,children:"interact"})]})}var J=(0,c.iv)(N||(N=(0,o.Z)(["\n  font-family: Roboto, Arial, sans-serif;\n\n  > .top-right {\n    position: absolute;\n    right: -10px;\n    top: -38px;\n    z-index: 2;\n    height: 30px;\n\n    background: #444;\n    /* border-radius: 4px 4px 0 0; */\n    border-bottom-width: 0;\n    padding: 4px 8px 0 8px;\n    \n    display: flex;\n    line-height: initial;\n    align-items: center;\n    > div {\n      padding: 0 8px;\n    }\n    > div.disable-icon {\n      position: relative;\n      transform: translateY(1.25px);\n      @media(max-width: 600px) {\n        transform: translateY(2.25px);\n      }\n      &:not(.enabled) {\n        filter: brightness(70%);\n      }\n    }\n\n    cursor: pointer;\n  }\n\n  > .central {\n    position: absolute;\n    z-index: 6;\n    left: calc(50% - (128px / 2));\n    top: calc(50% - 20px);\n    \n    cursor: pointer;\n    color: #ddd;\n    background: rgba(0, 0, 0, 0.9);\n    padding: 12px 32px;\n    border-radius: 4px;\n    border: 1px solid #ddd;\n    font-size: 1.2rem;\n    letter-spacing: 2px;\n  }\n"])));function Q(n){var e=n.colour;return(0,k.tZ)("div",{className:y()(nn,{clear:"clear"===e,faded:"faded"===e})})}var U,W,V,$,nn=(0,c.iv)(j||(j=(0,o.Z)(["\n  &:not(.faded) {\n    pointer-events: none;\n  }\n\n  position: absolute;\n  z-index: 4;\n  width: 100%;\n  height: 100%;\n  background: #000;\n  font-family: sans-serif;\n\n  opacity: 1;\n  transition: opacity 1s ease-in;\n  &.clear {\n    opacity: 0;\n    transition: opacity 0.5s ease-in;\n  }\n  &.faded {\n    opacity: 0.5;\n    transition: opacity 0.5s ease-in;\n  }\n"]))),en=t(28645);function tn(n){var e=(0,en.PQ)(),t=a.default.useState((function(){return{enabled:!!n.enabled,colour:"black",expanded:!1,contentDiv:void 0,toggleEnabled:function(){r.enabled=!r.enabled,r.colour="clear"===r.colour?"faded":"clear",e();var t=p.Z.getState().tabs[n.id];if(t){var o=p.Z.getState().portal;t.getTabNodes().map((function(n){return n.getId()})).filter((function(n){return n in o})).forEach((function(n){return o[n].portal.setPortalProps({disabled:!r.enabled})})),t.disabled=!r.enabled}else console.warn('Tabs not found for id "'.concat(n.id,'". Expected Markdown syntax <div class="tabs" name="my-identifier" ...>.'))},toggleExpand:function(){r.expanded=!r.expanded,r.expanded&&!r.enabled&&r.toggleEnabled(),e()},onModalBgPress:function(){r.expanded=!1,e()},preventTouch:function(n){return n.preventDefault()}}})),r=(0,i.Z)(t,1)[0];return a.default.useEffect((function(){r.colour=r.enabled?"clear":"faded",e()}),[]),a.default.useEffect((function(){r.contentDiv&&(r.expanded?q:G)(r.contentDiv)}),[r.expanded]),(0,k.BX)("figure",{className:y()("tabs","scrollable",on),children:[(0,k.tZ)("span",{id:n.id,className:"anchor"}),r.expanded&&(0,k.BX)(k.HY,{children:[(0,k.tZ)("div",{className:"modal-backdrop",onPointerUp:r.onModalBgPress,onTouchStart:r.preventTouch}),(0,k.tZ)("div",{className:ln(n.height)})]}),(0,k.BX)("div",{ref:function(n){return n&&(r.contentDiv=n)},className:r.expanded?cn:an(n.height),children:["black"!==r.colour&&(0,k.tZ)(F.Ar,{id:n.id,tabs:n.tabs}),(0,k.tZ)(H,{enabled:r.enabled,expanded:r.expanded,clickAnchor:function(){var e=p.Z.getState().tabs[n.id];null===e||void 0===e||e.scrollTo()},toggleExpand:r.toggleExpand,toggleEnabled:r.toggleEnabled}),(0,k.tZ)(Q,{colour:r.colour})]})]})}var rn,on=(0,c.iv)(U||(U=(0,o.Z)(["\n  margin: 64px 0;\n  @media(max-width: 600px) {\n    margin: 40px 0 32px 0;\n  }\n\n  background: var(--focus-bg);\n\n  position: relative;\n  > span.anchor {\n    position: absolute;\n    top: -96px;\n  }\n\n  .modal-backdrop {\n    position: fixed;\n    z-index: 19;\n    left: 0;\n    top: 0;\n    width: 100vw;\n    height: 100vh;\n    background: rgba(0, 0, 0, 0.6);\n  }\n\n  @keyframes fadein {\n    from { opacity: 0; }\n    to   { opacity: 1; }\n  }\n\n  .flexlayout__tabset {\n    animation: fadein 1s;\n  }\n\n  .flexlayout__tabset, .flexlayout__tab {\n    background: white;\n  }\n\n  .flexlayout__layout {\n    background: #444;\n  }\n  .flexlayout__tab {\n    border-top: 6px solid #444;\n    position: relative;\n    overflow: hidden;\n\n    /** react-reverse-portal wraps things in a div  */\n    > div.portal {\n      width: 100%;\n      height: 100%;\n    }\n  }\n  .flexlayout__tabset_tabbar_outer {\n    background: #222;\n    border-bottom: 1px solid #555;\n  }\n  .flexlayout__tab_button--selected, .flexlayout__tab_button:hover {\n    background: #444;\n  }\n  .flexlayout__tab_button_content {\n    user-select: none;\n    font-size: 13px;\n    color: #aaa;\n  }\n  .flexlayout__tab_button--selected .flexlayout__tab_button_content {\n    color: #fff;\n  }\n  .flexlayout__tab_button:hover:not(.flexlayout__tab_button--selected) .flexlayout__tab_button_content {\n    color: #ddd;\n  }\n  .flexlayout__splitter_vert, .flexlayout__splitter_horz {\n    background: #827575;\n  }\n"]))),an=function(n){return(0,c.iv)(W||(W=(0,o.Z)(["\n  width: 100%;\n  height: ","px;\n  position: relative;\n  border: 10px solid #444;\n"])),n)},ln=function(n){return(0,c.iv)(V||(V=(0,o.Z)(["\n  height: ","px;\n  background: #fff;\n"])),n)},cn=(0,c.iv)($||($=(0,o.Z)(["\n  position: fixed;\n  z-index: 20;\n  top: 80px;\n  left: 5%;\n  width: 90%;\n  height: calc(100% - 160px);\n  border: 10px solid #444;\n  @media(max-width: 600px) {\n    left: 0;\n    top: 80px;\n    width: 100%;\n    height: calc(100% - 120px);\n   }\n"]))),dn=["node","href","title","children"],sn=["node","children","title"],pn=["node"],un=["node","children"],fn=["node","children"];function mn(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function hn(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?mn(Object(t),!0).forEach((function(e){(0,f.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):mn(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function gn(n){var e=a.default.useMemo((function(){var e=new Date(n.dateTime);return"".concat(e.getDate()).concat(function(n){if(n>3)return"th";if(1===n)return"st";if(2===n)return"nd";if(3===n)return"rd"}(e.getDate())," ").concat(yn[e.getMonth()]," ").concat(e.getFullYear())}),[n.dateTime]),t=a.default.useMemo((function(){return bn(n.articleKey,{dateTime:n.dateTime,dateText:e,tags:n.tags})}),[n.articleKey]);return(0,k.BX)(k.HY,{children:[(0,k.BX)("article",{className:y()(n.className,xn),children:[(0,k.tZ)("span",{className:"anchor",id:n.articleKey}),(0,k.tZ)(E.Z,{children:n.children,components:t})]}),(0,k.tZ)(O,{})]})}var xn=(0,c.iv)(rn||(rn=(0,o.Z)(["\n  line-height: 2.2;\n  background: var(--focus-bg);\n  border: var(--blog-border-width) solid var(--border-bg);\n  font-size: 1rem;\n  overflow-wrap: break-word;\n  position: relative; /** For anchors */\n  \n  padding: 64px 164px 96px 164px;\n  @media(max-width: 1024px) {\n    padding: 64px 128px 64px 128px;\n  }\n  @media(max-width: 600px) {\n    padding: 8px 12px;\n    font-size: 1.1rem;\n    border: none;\n    line-height: 1.7;\n  }\n\n  a {\n    code {\n      color: unset;\n    }\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -96px;\n    }\n  }\n\n  aside {\n    margin: 24px 0;\n    padding: 36px 48px;\n    font-size: 0.9rem;\n    border: 0 solid #ddd;\n    background: #eee;\n\n    p {\n      margin: 12px 0;\n    }\n    p + blockquote, blockquote + p {\n      margin-top: 0px;\n    }\n    \n    @media(max-width: 600px) {\n      padding: 8px 20px;\n      font-size: 0.9rem;\n      border-radius: 12px;\n    }\n\n    blockquote {\n      margin: 0;\n      border-left: 8px solid #ccc;\n    }\n    figure.tabs {\n      @media(min-width: 600px) {\n        margin: 40px 0;\n      }\n    }\n\n    position: relative;\n    .anchor {\n      position: absolute;\n      top: -48px;\n    }\n  }\n\n  blockquote {\n    margin: 32px 0;\n    border-left: 8px solid #ddd;\n    padding-left: 30px;\n    \n    @media(max-width: 600px) {\n      margin: 20px 0;\n      padding-left: 20px;\n    }\n  }\n  blockquote + p {\n    margin-top: -12px;\n    @media(max-width: 600px) {\n      margin-top: 0;\n    }\n  }\n  \n  code {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    letter-spacing: 1px;\n    color: #444;\n    letter-spacing: 2px;\n    padding: 0 2px;\n  }\n\n  h1, h2, h3, h4 {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-weight: 400;\n    a {\n      color: #444;\n    }\n    letter-spacing: 2px;\n  }\n  h2 {\n    font-size: 3rem;\n    @media(max-width: 1024px) {\n      font-size: 2.8rem;\n    }\n    @media(max-width: 600px) {\n      margin: 16px 0 16px;\n      font-size: 1.9rem;\n    }\n  }\n  h2 + time {\n    display: block;\n    margin-top: -24px;\n    margin-bottom: 32px;\n    font-family: monospace;\n    font-size: 0.9rem;\n    > span {\n      margin-right: 16px;\n      > span {\n        padding: 4px 6px;\n        border: 1px solid #ddd;\n        color: #666;\n      }\n    }\n    @media(max-width: 600px) {\n      font-size: 0.8rem;\n      margin-top: 0px;\n      > span {\n        padding: 3px 0px;\n      }\n    }\n  }\n  h2 + time + div.tags {\n    margin-top: -12px;\n    display: flex;\n    flex-wrap: wrap;\n    font-size: 0.7rem;\n    font-family: sans-serif;\n    letter-spacing: 2px;\n    color: #fff;\n    span {\n      padding: 4px 8px;\n      margin-right: 4px;\n      margin-bottom: 4px;\n      background: #99a;\n      border-radius: 3px;\n      border: 2px solid rgba(0, 0, 0, 0.1);\n    }\n    @media(max-width: 600px) {\n      font-size: 0.65rem;\n      span {\n        padding: 3px 8px;\n      }\n    }\n  }\n  h3 {\n    font-size: 1.7rem;\n    @media(max-width: 600px) {\n      font-size: 1.3rem;\n    }\n\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -48px;\n    }\n  }\n\n  h2 + p, h3 + p {\n    margin-top: 0px;\n  }\n\n  li blockquote {\n    margin: 0;\n    p {\n      margin: 16px 0;\n    }\n  }\n\n  p {\n   margin: 40px 0;\n   @media(max-width: 600px) {\n     margin: 16px 0;\n   }\n\n   code {\n     font-size: 1rem;\n   }\n  }\n\n  p + blockquote {\n    margin-top: -20px;\n    @media(max-width: 600px) {\n      margin-top: -4px;\n    }\n  }\n\n  span.cmd {\n    color: #555;\n    background: #eee;\n    font-family: monospace;\n    letter-spacing: 1px;\n    font-size: smaller;\n    padding: 2px 4px;\n    @media(max-width: 600px) {\n      user-select: all;\n    }\n  }\n\n  > span.anchor {\n    position: absolute;\n    top: -48px;\n  }\n\n  table {\n    padding: 8px;\n    border: 1px solid #bbb;\n    width: 100%;\n    margin: 40px 0;\n    @media(max-width: 600px) {\n      margin: 20px 0;\n    }\n    th, td {\n      padding: 6px;\n      text-align: left;\n      vertical-align: top;\n      @media(max-width: 600px) {\n        padding: 4px 2px;\n      }\n    }\n  }\n\n  ul, ol {\n    @media(max-width: 600px) {\n      padding-left: 20px;\n    }\n    + p {\n      padding-top: 6px;\n    }\n  }\n\n  ul li, ol li {\n    margin: 4px 0;\n  }\n\n"]))),bn=function(n,e){return{a:function(e){e.node;var r=e.href,o=e.title,a=e.children;(0,g.Z)(e,dn);if("@anchor"===o){var l=wn(n,a),c=Number((r||"").split("#")[0])||null;return(0,k.tZ)(Z.Z,{href:r,className:y()("anchor-link",K("anchor-icon","0 2px 0 4px")),id:l,prePush:"#".concat(l),title:o,backward:!!c&&c<s.mh[n].part,children:a})}return"@new-tab"===o?(0,k.tZ)("a",{href:r,title:o,className:y()("new-tab-link",K("ext-link-icon","0 2px 0 4px")),target:"_blank",rel:"noopener",children:a}):"#command"===r?(0,k.tZ)("a",{href:r,title:o,onClick:function(){var e=(0,h.Z)(b().mark((function e(r){var a,l,c,d,s,u,f,h,g;return b().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r.preventDefault(),a=o.split(" "),l=(0,m.Z)(a),c=l[0],d=l.slice(1),e.t0=c,e.next="open-tab"===e.t0?5:"sigkill"===e.t0?11:13;break;case 5:return s=(0,i.Z)(d,2),u=s[0],f=s[1],h=(0,w.Ff)(n,u),null===(g=p.Z.getState().tabs[h])||void 0===g||g.selectTab(f),null===g||void 0===g||g.scrollTo(),e.abrupt("break",14);case 11:return Promise.all([t.e(980),t.e(472)]).then(t.bind(t,56127)).then((function(n){n.default.api.getSession(d[0]).ttyShell.xterm.sendSigKill()})),e.abrupt("break",14);case 13:console.warn("link triggered unrecognised command:",o);case 14:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),children:a}):(0,k.tZ)(Z.Z,{href:r,title:o,id:wn(n,a),children:a})},aside:function(e){e.node;var t=e.children,r=e.title,o=(0,g.Z)(e,sn),i=function(n,e){return"".concat(n,"--aside--").concat(e)}(n,r);return(0,k.BX)("aside",hn(hn({},o),{},{children:[(0,k.tZ)("span",hn(hn({},r&&{id:i}),{},{className:"anchor"})),t]}))},div:function(e){e.node;var t=(0,g.Z)(e,pn);switch(t.class){case"tabs":var r=Number(t.height||100),o=a.default.useMemo((function(){return Function("return ".concat(t.tabs||"[]"))()}),[t.tabs]);return(0,k.tZ)(tn,{height:r,tabs:o,enabled:"true"===t.enabled,id:t.name?(0,w.Ff)(n,t.name):""});default:return(0,k.tZ)("div",hn({},t))}},h2:function(t){t.node;var r=t.children,o=(0,g.Z)(t,un);return(0,k.BX)(k.HY,{children:[(0,k.tZ)("h2",hn(hn({},o),{},{children:(0,k.tZ)(Z.Z,{href:"#".concat(n),children:(0,k.tZ)("a",{children:r})})})),(0,k.tZ)("time",{dateTime:e.dateTime,children:e.dateText.split(" ").map((function(n){return(0,k.tZ)("span",{children:Array.from(n).map((function(n){return(0,k.tZ)("span",{children:n})}))})}))}),(0,k.tZ)("div",{className:"tags",title:"tags",children:e.tags.map((function(n){return(0,k.tZ)("span",{children:n})}))})]})},h3:function(e){e.node;var t=e.children,r=(0,g.Z)(e,fn),o=a.default.useMemo((function(){return"".concat(n,"--").concat(a.default.Children.toArray(t)[0].toString().toLowerCase().replace(/\s/g,"-"))}),[]);return(0,k.BX)("h3",hn(hn({},r),{},{children:[(0,k.tZ)("span",{id:o,className:"anchor"}),(0,k.tZ)(Z.Z,{href:"#".concat(o),children:(0,k.tZ)("a",{children:t})})]}))}}};var vn,yn=["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];function wn(n,e){return"".concat(n,"--link--").concat(function(n){return a.default.Children.toArray(n)[0].toString().toLowerCase().replace(/\s/g,"-")}(e))}function Zn(n){var e=n.keys,t=n.markdown,r=a.default.useRef(),o=(0,l.Z)({debounce:30,scroll:!1}),c=(0,i.Z)(o,2),f=c[0],m=c[1];return a.default.useEffect((function(){var n,t=Array.from((null===(n=r.current)||void 0===n?void 0:n.children)||[]).map((function(n,t){return{key:e[t],rect:u.U.fromJson(n.getBoundingClientRect()).delta(window.scrollX,window.scrollY)}}));p.Z.setState({articles:(0,d.Rw)(t)}),p.Z.api.updateArticleKey()}),[m]),a.default.useEffect((function(){return function(){e.forEach((function(n){return delete p.Z.getState().articles[n]})),p.Z.setState({})}}),[]),(0,k.tZ)("ol",{className:kn,ref:function(n){f(n),n&&(r.current=n)},children:e.map((function(n){return(0,k.tZ)("li",{children:(0,k.tZ)(gn,{articleKey:n,dateTime:s.mh[n].timestamp,children:t[n]||"",tags:s.mh[n].tags})},n)}))})}var kn=(0,c.iv)(vn||(vn=(0,o.Z)(["\n  padding: 0;\n  margin: 0;\n  list-style: none;\n"])))},36886:function(n,e,t){t.d(e,{Z:function(){return C}});var r,o=t(52209),i=t(88269),a=t(92809),l=t(10219),c=t(11163),d=t(94184),s=t.n(d),p=t(52542),u=t(17928),f=t(8357),m=t(58199),h=t(55349),g=t(8311);function x(){var n=(0,f.Z)((function(n){return n.articleKey?u.mh[n.articleKey]:null})),e=null!==n&&void 0!==n&&n.prev?u.mh[n.prev]:null,t=null!==n&&void 0!==n&&n.next?u.mh[n.next]:null;return null!==n&&void 0!==n&&n.index?(0,g.tZ)("nav",{className:v,children:(0,g.BX)("ul",{children:[(0,g.tZ)("li",{children:(0,g.tZ)(m.Z,{href:(0,u.Gu)(e||n),backward:!0,children:(0,g.tZ)("span",{className:"prev",children:"prev"})})}),(0,g.tZ)("li",{children:(0,g.tZ)(m.Z,{href:(0,u.Gu)(n),children:(0,g.tZ)("a",{className:"primary",children:n.index})})}),(0,g.tZ)("li",{children:(0,g.tZ)(m.Z,{href:(0,u.Gu)(t||n),children:(0,g.tZ)("span",{className:"next",children:"next"})})})]})}):null}var b,v=(0,i.iv)(r||(r=(0,o.Z)(["\n  position: absolute;\n  z-index: 10;\n  right: ","px;\n  top: -48px;\n  @media(max-width: 1024px) { top: -32px; }\n  @media(max-width: 600px) { top: 0; }\n\n  font-size: 1rem;\n\n  > ul {\n    position: fixed;\n    width: ","px;\n    height: ","px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: 0;\n    margin: 0;\n\n    li {\n      list-style: none;\n      list-style-position: inside;\n      padding: 0 5px;\n    }\n    a {\n      color: #ccc;\n    }\n    a.primary {\n      color: #fff;\n    }\n  }\n"])),140,140,h.M),y=t(59748),w=t(39944);function Z(){(0,w.x)((function(){var n=Array.from(document.querySelectorAll(".anchor")).filter((function(n){return n.id&&!n.id.includes("--link--")})),e=Array.from(n).map((function(n){return n.getBoundingClientRect().y})).findIndex((function(n){return n>0}))-1;e>=0&&localStorage.setItem(O,JSON.stringify(n[e].id))}));var n=y.default.useMemo((function(){if(localStorage.getItem(O)){var n="#".concat(JSON.parse(localStorage.getItem(O)));return localStorage.removeItem(O),n}return location.hash?location.hash:""}),[]);return(0,g.tZ)("div",{className:_,children:(0,g.tZ)("div",{className:"fixed",children:(0,g.tZ)(m.Z,{href:n,postPush:function(){},children:"continue"})})})}var k,O="close-anchor-id",_=(0,i.iv)(b||(b=(0,o.Z)(["\n  position: absolute;\n  right: ","px;\n  z-index: 3;\n  top: -8px;\n\n  @media(max-width: 1024px) {\n    top: 8px;\n  }\n  @media(max-width: 600px) {\n    top: 40px;\n  }\n\n  .fixed {\n    position: fixed;\n    /* border-radius: 0 0 64px 64px; */\n    width: ","px;\n\n    text-align: center;\n    font-size: 15px;\n    letter-spacing: 2px;\n    padding: 6px 0 14px;\n    background: #000;\n\n    a {\n      color: #fff;\n    }\n  }\n"])),140,140),E=["children","node"];function S(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function z(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?S(Object(t),!0).forEach((function(e){(0,a.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):S(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function P(){return(0,g.BX)("header",{className:s()("title",T),children:[(0,g.tZ)(x,{}),(0,g.tZ)(Z,{}),(0,g.tZ)(p.Z,{components:j,children:"\n# Rogue Markup\n\n$( game ai | roguelike | web dev )\n      "})]})}var N,j={h1:function(n){var e=n.children,t=(n.node,(0,l.Z)(n,E)),r=(0,c.useRouter)();return(0,g.tZ)("h1",z(z({onClick:function(){return r.push("/")}},t),{},{children:e}))}},T=(0,i.iv)(k||(k=(0,o.Z)(["\n  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n  position: relative;\n  \n  @media(max-width: 600px) {\n    background: #eee;\n    padding-bottom: 8px;\n    padding-left: 8px;\n    border-bottom: 1px solid #aaa;\n    padding-top: 64px;\n  }\n  padding-top: 40px;\n\n  h1 {\n    margin: 0;\n    font-size: 5rem;\n    font-weight: 300;\n    cursor: pointer;\n    color: #333;\n    display: inline-block;\n    \n    @media(max-width: 800px) {\n      font-size: 5rem;\n    }\n    @media(max-width: 600px) {\n      font-size: 3rem;\n    }\n  }\n  \n  /** Site subtitle */\n  p {\n    color: #444;\n    letter-spacing: 2px;\n    font-size: 1.4rem;\n    margin: 0;\n    padding: 40px 0 48px;\n    font-weight: 300;\n    \n    @media(max-width: 600px) {\n      font-size: 1.1rem;\n      padding: 20px 0 20px 4px;\n      color: #222;\n    }\n  }\n\n"])));function C(n){var e=n.children;return(0,g.BX)("section",{className:B,children:[(0,g.tZ)(P,{}),(0,g.tZ)("main",{children:e})]})}var B=(0,i.iv)(N||(N=(0,o.Z)(["\n  max-width: 1024px;\n  width: 100%;\n\n  padding: 48px 64px;\n  @media(max-width: 1024px) {\n    padding: 32px 0 32px 40px;\n    margin: 0;\n  }\n  @media(max-width: 600px) {\n    padding: 0;\n  }\n"])))},52542:function(n,e,t){t.d(e,{Z:function(){return u}});var r=t(92809),o=t(38456),i=t.n(o),a=t(76388),l=t.n(a),c=t(10043),d=t.n(c),s=t(8311);function p(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function u(n){return(0,s.tZ)(i(),function(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?p(Object(t),!0).forEach((function(e){(0,r.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):p(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}({rehypePlugins:[l()],remarkPlugins:[d()]},n))}},58601:function(n,e,t){t.d(e,{v8:function(){return o},Ff:function(){return a},J8:function(){return l}});var r=t(86576);function o(n){return"".concat(i(n)).concat(n.idSuffix||"")}function i(n){switch(n.key){case"code":case"component":return n.filepath;case"terminal":return"@".concat(n.filepath);default:throw(0,r.Ql)(n)}}function a(n,e){return"".concat(n,"--tabs--").concat(e)}function l(n){return{global:{tabEnableRename:!1},layout:{type:"row",weight:100,children:[{type:"tabset",weight:50,selected:0,children:n.map((function(n){return{type:"tab",id:o(n),name:i(n),config:(0,r.I8)(n),enableClose:!1}}))}]}}}},73460:function(n,e,t){var r=t(59748),o=t(20296);function i(n){const e=[];if(!n||n===document.body)return e;const{overflow:t,overflowX:r,overflowY:o}=window.getComputedStyle(n);return[t,r,o].some((n=>"auto"===n||"scroll"===n))&&e.push(n),[...e,...i(n.parentElement)]}const a=["x","y","top","bottom","left","right","width","height"],l=(n,e)=>a.every((t=>n[t]===e[t]));e.Z=function({debounce:n,scroll:e,polyfill:t}={debounce:0,scroll:!1}){const a=t||("undefined"===typeof window?class{}:window.ResizeObserver);if(!a)throw new Error("This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills");const[c,d]=(0,r.useState)({left:0,top:0,width:0,height:0,bottom:0,right:0,x:0,y:0}),s=(0,r.useRef)({element:null,scrollContainers:null,resizeObserver:null,lastBounds:c}),p=n?"number"===typeof n?n:n.scroll:null,u=n?"number"===typeof n?n:n.resize:null,f=(0,r.useRef)(!1);(0,r.useEffect)((()=>(f.current=!0,()=>{f.current=!1})));const[m,h,g]=(0,r.useMemo)((()=>{const n=()=>{if(!s.current.element)return;const{left:n,top:e,width:t,height:r,bottom:o,right:i,x:a,y:c}=s.current.element.getBoundingClientRect(),p={left:n,top:e,width:t,height:r,bottom:o,right:i,x:a,y:c};Object.freeze(p),f.current&&!l(s.current.lastBounds,p)&&d(s.current.lastBounds=p)};return[n,u?(0,o.debounce)(n,u):n,p?(0,o.debounce)(n,p):n]}),[d,p,u]);function x(){s.current.scrollContainers&&(s.current.scrollContainers.forEach((n=>n.removeEventListener("scroll",g,!0))),s.current.scrollContainers=null),s.current.resizeObserver&&(s.current.resizeObserver.disconnect(),s.current.resizeObserver=null)}function b(){s.current.element&&(s.current.resizeObserver=new a(g),s.current.resizeObserver.observe(s.current.element),e&&s.current.scrollContainers&&s.current.scrollContainers.forEach((n=>n.addEventListener("scroll",g,{capture:!0,passive:!0}))))}var v,y,w;return v=g,y=Boolean(e),(0,r.useEffect)((()=>{if(y){const n=v;return window.addEventListener("scroll",n,{capture:!0,passive:!0}),()=>{window.removeEventListener("scroll",n,!0)}}}),[v,y]),w=h,(0,r.useEffect)((()=>{const n=w;return window.addEventListener("resize",n),()=>{window.removeEventListener("resize",n)}}),[w]),(0,r.useEffect)((()=>{x(),b()}),[e,g,h]),(0,r.useEffect)((()=>x),[]),[n=>{n&&n!==s.current.element&&(x(),s.current.element=n,s.current.scrollContainers=i(n),b())},c,m]}}}]);