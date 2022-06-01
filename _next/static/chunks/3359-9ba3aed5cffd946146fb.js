"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3359,5349],{17928:function(n,e,t){t.d(e,{mh:function(){return i},Pd:function(){return a},Gu:function(){return r}});var i={homepage:{key:"homepage",label:"",info:"Home page",timestamp:"2022-02-22",part:-1,index:"",prev:null,next:null,tags:[]},test:{key:"test",label:"test",info:"Test page for development purposes",timestamp:"2022-02-22",part:-1,index:"",prev:null,next:null,tags:[]},objective:{key:"objective",label:"objective",info:"Our overall objective",timestamp:"2022-02-22",part:1,index:"1a",prev:null,next:"constraints",tags:["game ai","traveller","npc","navmesh","geomorph"]},constraints:{key:"constraints",label:"constraints",info:"Constraints: tech, game mechanics, setting",timestamp:"2022-02-22",part:1,index:"1b",prev:"objective",next:"finishing",tags:["tech","mechanics","terminal","setting"]},finishing:{key:"finishing",label:"finishing",info:"Finishing as a skill",timestamp:"2022-02-22",part:1,index:"1c",prev:"constraints",next:"technology",tags:["finishing as a skill","better game ai","teleglitch"]},technology:{key:"technology",label:"technology",info:"The tech we'll use",timestamp:"2022-02-22",part:2,index:"2a",prev:"finishing",next:"tech1",tags:["lego bricks","specific tech"]},tech1:{key:"tech1",label:"tech: js",info:"JavaScript components",timestamp:"2022-02-22",part:2,index:"2b",prev:"technology",next:"tech2",tags:["javascript","react","preact","jsx","performance","hot reload"]},tech2:{key:"tech2",label:"tech: ai",info:"Tech related to gameplay",timestamp:"2022-02-22",part:2,index:"2c",prev:"tech1",next:"tech3",tags:["navigation","navgraph","navmesh","string pull","steering","detour","raycast"]},tech3:{key:"tech3",label:"tech: dev",info:"Dev env and in-browser terminal",timestamp:"2022-02-22",part:2,index:"2d",prev:"tech2",next:"geomorphs",tags:[]},geomorphs:{key:"geomorphs",label:"geomorphs",info:"How we use Starship Geomorphs",timestamp:"2022-02-22",part:3,index:"3a",prev:"tech3",next:null,tags:[]}},a=Object.values(i).filter((function(n){return n.part>0})).reduce((function(n,e){return(n[e.part]=n[e.part]||[]).push(e),n}),[]);function r(n){return"".concat("/part/").concat(n.part,"#").concat(n.key)}},97300:function(n,e,t){t.d(e,{v:function(){return i}});var i={navMain:"nav-main",navMainOpen:"open",navMainClosed:"closed",navMini:"nav-mini"}},68292:function(n,e,t){t.d(e,{Z:function(){return fn}});var i=t(52209),a=t(79056),r=t(59748),o=t(73460),l=t(88269),c=t(84175),d=t(17928),p=t(11455),s=t(72328),u=t(92809),h=t(17120),f=t(30266),m=t(10219),x=t(809),g=t.n(x),b=t(94184),v=t.n(b),y=t(58601),w=t(38456),Z=t.n(w),k=t(76388),_=t.n(k),O=t(10043),N=t.n(O),S=t(8311);function E(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,i)}return t}function T(n){return(0,S.tZ)(Z(),function(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?E(Object(t),!0).forEach((function(e){(0,u.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):E(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}({rehypePlugins:[_()],remarkPlugins:[N()]},n))}var j,z=t(58199);function P(){return(0,S.tZ)("hr",{className:D})}var M,C,B,D=(0,l.iv)(j||(j=(0,i.Z)(["\n  margin: 0;\n  border-color: var(--focus-bg);\n\n  @media(min-width: 800px) {\n    padding-bottom: 80px;\n    border: 0;\n  }\n"]))),A=t(58509),X=t(27375),G=t(44275),H=t(59885),K=function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"auto",t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:13;return(0,l.iv)(M||(M=(0,i.Z)(["\n  &::after {\n    display: inline-block;\n    content: '';\n    background-image: url('/icon/",".svg');\n    background-size: ","px ","px;\n    height: ","px;\n    width: ","px;\n    margin: ",";\n  }\n"])),n,t,t,t,t,e)};function I(n){return(0,S.BX)("div",{className:q,children:[(0,S.BX)("div",{className:"top-right",children:[(0,S.tZ)(z.Z,{href:"#".concat(n.parentTabsId),className:K("anchor-icon-white","auto",13),title:"anchor"}),(0,S.tZ)("div",{className:K(n.expanded?"compress":"expand-solid","auto",13),onClick:n.toggleExpand,title:n.expanded?"minimise":"maximise"}),(0,S.tZ)("div",{className:v()("disable-icon",K("circle-xmark","auto",16),n.enabled&&"enabled"),onClick:n.enabled?n.toggleEnabled:void 0,title:n.enabled?"disable":void 0})]}),!n.enabled&&(0,S.tZ)("div",{className:"central",onClick:n.toggleEnabled,children:"interact"})]})}var q=(0,l.iv)(C||(C=(0,i.Z)(["\n  font-family: Roboto, Arial, sans-serif;\n\n  > .top-right {\n    position: absolute;\n    right: calc(-1 * var(--tabs-border-width));\n    top: -38px;\n    z-index: 2;\n    height: 38px;\n\n    background: #444;\n    border-bottom-width: 0;\n\n    padding: 0px 8px;\n    @media(max-width: 600px) {\n      padding: 0 8px 2px 8px;\n    }\n    \n    display: flex;\n    line-height: initial;\n    align-items: center;\n    > * {\n      padding: 0 8px;\n      height: 100%;\n      display: flex;\n      align-items: center;\n    }\n    \n    > div.disable-icon {\n      position: relative;\n      transform: translateY(0.25px) scale(0.88);\n      \n      &:not(.enabled) {\n        filter: brightness(70%);\n      }\n    }\n\n    cursor: pointer;\n  }\n\n  > .central {\n    position: absolute;\n    z-index: 6;\n    left: calc(50% - (128px / 2));\n    top: calc(50% - 20px);\n    \n    cursor: pointer;\n    color: #ddd;\n    background: rgba(0, 0, 0, 0.9);\n    padding: 12px 32px;\n    border-radius: 4px;\n    border: 1px solid #ddd;\n    font-size: 1.2rem;\n    letter-spacing: 2px;\n  }\n"])));function F(n){var e=n.colour;return(0,S.tZ)("div",{className:v()(U,{clear:"clear"===e,faded:"faded"===e})})}var L,R,Y,J,U=(0,l.iv)(B||(B=(0,i.Z)(["\n  &:not(.faded) {\n    pointer-events: none;\n  }\n\n  position: absolute;\n  z-index: 4;\n  width: 100%;\n  height: 100%;\n  background: #000;\n  font-family: sans-serif;\n\n  opacity: 1;\n  transition: opacity 1s ease-in;\n  &.clear {\n    opacity: 0;\n    transition: opacity 0.5s ease-in;\n  }\n  &.faded {\n    opacity: 0.5;\n    transition: opacity 0.5s ease-in;\n  }\n"])));function Q(n){var e=(0,X.Z)(),t="expanded@tab-".concat(n.id),i=(0,G.Z)((function(){return{enabled:!!n.initEnabled,colour:"black",expanded:!1,contentDiv:void 0,toggleEnabled:function(){i.enabled=!i.enabled,i.colour="clear"===i.colour?"faded":"clear",!i.enabled&&i.expanded&&i.toggleExpand();var t=p.Z.getState().tabs[n.id];if(t){var a=p.Z.getState().portal;t.getTabNodes().filter((function(n){return n.isVisible()})).map((function(n){return n.getId()})).filter((function(n){return n in a})).forEach((function(n){return a[n].portal.setPortalProps({disabled:!i.enabled})})),t.disabled=!i.enabled}else console.warn('Tabs not found for id "'.concat(n.id,'". ')+'Expected Markdown syntax <div class="tabs" name="my-identifier" ...>');e()},toggleExpand:function(){i.expanded=!i.expanded,i.expanded?((0,c.xd)(t,"true"),i.enabled||i.toggleEnabled()):localStorage.removeItem(t),e()},onKeyUp:function(n){i.expanded&&"Escape"===n.key&&i.toggleExpand()},onModalBgPress:function(){i.expanded&&i.toggleExpand()},preventTouch:function(n){n.preventDefault()}}}));return r.default.useEffect((function(){i.colour=i.enabled?"clear":"faded","true"===(0,c.Lk)(t)&&(p.Z.getState().navOpen?localStorage.removeItem(t):(i.expanded=!0,location.href="#".concat(n.id))),e()}),[]),r.default.useEffect((function(){i.contentDiv&&(i.expanded?A.Qp:A.tG)(i.contentDiv)}),[i.expanded]),(0,S.BX)("figure",{className:v()("tabs","scrollable",$),onKeyUp:i.onKeyUp,tabIndex:0,children:[(0,S.tZ)("span",{id:n.id,className:"anchor"}),i.expanded&&(0,S.BX)(S.HY,{children:[(0,S.tZ)("div",{className:"modal-backdrop",onPointerDown:i.onModalBgPress,onTouchStart:i.preventTouch}),(0,S.tZ)("div",{className:nn(n.height)})]}),(0,S.BX)("div",{ref:function(n){return n&&(i.contentDiv=n)},className:i.expanded?en:W(n.height),children:["black"!==i.colour&&(0,S.tZ)(H.Ar,{id:n.id,tabs:n.tabs,initEnabled:!!n.initEnabled}),(0,S.tZ)(I,{enabled:i.enabled,expanded:i.expanded,parentTabsId:n.id,toggleExpand:i.toggleExpand,toggleEnabled:i.toggleEnabled}),(0,S.tZ)(F,{colour:i.colour})]})]})}var V,$=(0,l.iv)(L||(L=(0,i.Z)(["\n  margin: 64px 0;\n  @media(max-width: 600px) {\n    margin: 40px 0 32px 0;\n  }\n\n  background: var(--focus-bg);\n\n  position: relative;\n  > span.anchor {\n    position: absolute;\n    top: -96px;\n  }\n\n  .modal-backdrop {\n    position: fixed;\n    z-index: 19;\n    left: 0;\n    top: 0;\n    width: 100vw;\n    height: 100vh;\n    background: rgba(0, 0, 0, 0.6);\n  }\n\n  .flexlayout__tabset, .flexlayout__tab {\n    background: white;\n  }\n\n  .flexlayout__layout {\n    background: #444;\n  }\n  .flexlayout__tab {\n    /** Pixel 5: white lines when 4px */\n    border-top: 3px solid #444;\n    position: relative;\n    overflow: hidden;\n\n    /** react-reverse-portal wraps things in a div  */\n    > div.portal {\n      width: 100%;\n      height: 100%;\n    }\n  }\n  .flexlayout__tabset_tabbar_outer {\n    background: #222;\n    border-bottom: 1px solid #555;\n  }\n  .flexlayout__tab_button--selected, .flexlayout__tab_button:hover {\n    background: #444;\n  }\n  .flexlayout__tab_button_content {\n    user-select: none;\n    font-size: 0.7rem;\n    font-family: sans-serif;\n    font-weight: 300;\n    color: #aaa;\n  }\n  .flexlayout__tab_button--selected .flexlayout__tab_button_content {\n    color: #fff;\n  }\n  .flexlayout__tab_button:hover:not(.flexlayout__tab_button--selected) .flexlayout__tab_button_content {\n    color: #ddd;\n  }\n  .flexlayout__splitter_vert, .flexlayout__splitter_horz {\n    background: #827575;\n  }\n"]))),W=function(n){return(0,l.iv)(R||(R=(0,i.Z)(["\n  width: 100%;\n  height: ","px;\n  position: relative;\n  border: var(--tabs-border-width) solid #444;\n  \n  @media(max-width: 600px) {\n    height: ","px;\n  }\n"])),Array.isArray(n)?n[1]:n,Array.isArray(n)?n[0]:n)},nn=function(n){return(0,l.iv)(Y||(Y=(0,i.Z)(["\n  height: ","px;\n  @media(max-width: 600px) {\n    height: ","px;\n  }\n  background: #fff;\n"])),Array.isArray(n)?n[1]:n,Array.isArray(n)?n[0]:n)},en=(0,l.iv)(J||(J=(0,i.Z)(["\n  position: fixed;\n  z-index: 20;\n  top: 80px;\n  left: calc(max(5%, (100% - 1000px) / 2));\n  width: calc(min(90%, 1000px));\n  height: calc(100% - 80px);\n  border: var(--tabs-border-width) solid #444;\n  @media(max-width: 600px) {\n    left: 0;\n    top: 80px;\n    width: 100%;\n    height: calc(100% - 80px);\n   }\n"]))),tn=["node","href","title","children"],an=["node","children","title"],rn=["node"];function on(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,i)}return t}function ln(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?on(Object(t),!0).forEach((function(e){(0,u.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):on(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function cn(n){var e=r.default.useMemo((function(){var e=new Date(n.dateTime);return"".concat(e.getDate()).concat(function(n){var e=Number(n.toString().slice(-1));if(e>3)return"th";if(1===e)return"st";if(2===e)return"nd";if(3===e)return"rd"}(e.getDate())," ").concat(un[e.getMonth()]," ").concat(e.getFullYear())}),[n.dateTime]),t=r.default.useMemo((function(){return pn(n.articleKey,{dateTime:n.dateTime,dateText:e,tags:n.tags})}),[n.articleKey]);return(0,S.BX)(S.HY,{children:[(0,S.BX)("article",{className:v()(n.className,dn),children:[(0,S.tZ)("span",{className:"anchor",id:n.articleKey}),(0,S.tZ)(T,{children:n.children,components:t})]}),(0,S.tZ)(P,{})]})}var dn=(0,l.iv)(V||(V=(0,i.Z)(["\n  line-height: 2.2;\n  /* background: var(--focus-bg); */\n  /* border: var(--blog-border-width) solid var(--border-bg); */\n  border: 0 solid var(--border-bg);\n  border-width: 1px 0 0 1px;\n  font-size: 1rem;\n  overflow-wrap: break-word;\n  position: relative; /** For anchors */\n  \n  padding: 64px 164px 96px 164px;\n  @media(max-width: 1024px) {\n    padding: 64px 48px;\n  }\n  @media(max-width: 600px) {\n    padding: 8px 12px;\n    font-size: 1.1rem;\n    border: none;\n    line-height: 2;\n    font-weight: 300;\n    background: white;\n  }\n\n  a {\n    code {\n      color: unset;\n    }\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -96px;\n    }\n  }\n\n  aside {\n    margin: 24px 0;\n    padding: 36px 48px;\n    font-size: 0.9rem;\n    font-weight: 300;\n    border: 0 solid #ddd;\n    background: #eee;\n    \n    p {\n      margin: 12px 0;\n    }\n    p + blockquote, blockquote + p {\n      margin-top: 0px;\n    }\n    \n    @media(max-width: 600px) {\n      padding: 8px 20px;\n      font-size: 0.9rem;\n      border-radius: 12px;\n      border-width: 0 2px 2px 0;\n      line-height: 1.9;\n    }\n\n    blockquote {\n      margin: 0;\n      border-left: 8px solid #ccc;\n    }\n    figure.tabs {\n      @media(min-width: 600px) {\n        margin: 40px 0;\n      }\n    }\n\n    position: relative;\n    .anchor {\n      position: absolute;\n      top: -48px;\n    }\n  }\n\n  blockquote {\n    margin: 32px 0;\n    border-left: 8px solid #ddd;\n    padding-left: 30px;\n    font-weight: 300;\n    \n    @media(max-width: 600px) {\n      margin: 20px 0;\n      padding-left: 20px;\n      font-style: italic;\n    }\n  }\n  blockquote + p {\n    margin-top: -12px;\n    @media(max-width: 600px) {\n      margin-top: 0;\n    }\n  }\n  \n  code {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    letter-spacing: 1px;\n    color: #444;\n    letter-spacing: 2px;\n    padding: 0 2px;\n  }\n\n  figcaption {\n    text-align: center;\n  }\n\n  h1, h2, h3, h4 {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-weight: 300;\n    letter-spacing: 2px;\n    a {\n      color: #444;\n    }\n    @media(max-width: 600px) {\n      font-weight: 400;\n    }\n  }\n  h2 {\n    font-size: 2.8rem;\n    @media(max-width: 1024px) {\n      font-size: 2.6rem;\n    }\n    @media(max-width: 600px) {\n      margin: 16px 0 16px;\n      font-size: 1.7rem;\n    }\n  }\n  h2 + time {\n    display: block;\n    margin-top: -24px;\n    margin-bottom: 32px;\n    font-size: 0.7rem;\n    line-height: 3;\n    > span {\n      margin-right: 16px;\n      white-space: pre;\n      > span {\n        padding: 6px 10px;\n        margin: 0 1px;\n        border: 1px solid #aaa;\n        border-radius: 2px;\n        color: #333;\n      }\n    }\n    @media(max-width: 600px) {\n      margin-top: 0;\n      > span {\n        padding: 4px 0px;\n        margin-right: 12px;\n        > span {\n          padding: 6px 8px;\n        }\n      }\n    }\n  }\n  h2 + time + div.tags {\n    margin-top: -12px;\n    display: flex;\n    flex-wrap: wrap;\n    font-size: 0.7rem;\n    font-family: sans-serif;\n    letter-spacing: 2px;\n    span {\n      padding: 2px 8px;\n      margin-right: 4px;\n      margin-bottom: 4px;\n      border-radius: 3px;\n      border: 2px solid rgba(0, 0, 0, 0.1);\n      background: #555;\n      color: #fff;\n    }\n    @media(max-width: 600px) {\n      margin-top: -16px;\n      margin-bottom: 32px;\n    }\n  }\n  h3 {\n    font-size: 1.7rem;\n    @media(max-width: 600px) {\n      font-size: 1.3rem;\n    }\n\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -48px;\n    }\n  }\n\n  h2 + p, h3 + p {\n    margin-top: 0px;\n  }\n\n  li blockquote {\n    margin: 0;\n    p {\n      margin: 16px 0;\n    }\n  }\n\n  p {\n   margin: 40px 0;\n   @media(max-width: 600px) {\n     margin: 16px 0;\n   }\n\n   code {\n     font-size: 1rem;\n   }\n  }\n\n  p + blockquote {\n    margin-top: -20px;\n    @media(max-width: 600px) {\n      margin-top: -4px;\n    }\n  }\n\n  span.cmd {\n    color: #555;\n    background: #eee;\n    font-family: monospace;\n    letter-spacing: 1px;\n    font-size: smaller;\n    padding: 2px 4px;\n    @media(max-width: 600px) {\n      user-select: all;\n    }\n  }\n\n  > span.anchor {\n    position: absolute;\n    top: -48px;\n  }\n\n  table {\n    padding: 8px;\n    border: 1px solid #bbb;\n    width: 100%;\n    margin: 40px 0;\n    @media(max-width: 600px) {\n      margin: 20px 0;\n    }\n    th, td {\n      padding: 6px;\n      text-align: left;\n      vertical-align: top;\n      @media(max-width: 600px) {\n        padding: 4px 2px;\n      }\n    }\n  }\n\n  ul, ol {\n    @media(max-width: 600px) {\n      padding-left: 20px;\n    }\n    + p {\n      padding-top: 6px;\n    }\n  }\n\n  ul li, ol li {\n    margin: 4px 0;\n  }\n\n"]))),pn=function(n,e){return{a:function(e){e.node;var i=e.href,r=e.title,o=e.children;(0,m.Z)(e,tn);if("@anchor"===r){var l=hn(n,o),c=Number((i||"").split("#")[0])||null;return(0,S.tZ)(z.Z,{href:i,className:v()("anchor-link",K("anchor-icon","0 2px 0 4px")),id:l,prePush:"#".concat(l),title:r,backward:!!c&&c<d.mh[n].part,children:o})}return"@new-tab"===r?(0,S.tZ)("a",{href:i,title:r,className:v()("new-tab-link",K("ext-link-icon","0 2px 0 4px")),target:"_blank",rel:"noopener",children:o}):"#command"===i?(0,S.tZ)("a",{href:i,title:r,onClick:function(){var e=(0,f.Z)(g().mark((function e(i){var o,l,c,d,s,u,f,m,x;return g().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:i.preventDefault(),o=r.split(" "),l=(0,h.Z)(o),c=l[0],d=l.slice(1),e.t0=c,e.next="open-tab"===e.t0?5:"sigkill"===e.t0?11:13;break;case 5:return s=(0,a.Z)(d,2),u=s[0],f=s[1],m=(0,y.Ff)(n,u),null===(x=p.Z.getState().tabs[m])||void 0===x||x.selectTab(f),null===x||void 0===x||x.scrollTo(),e.abrupt("break",14);case 11:return Promise.all([t.e(9763),t.e(7874),t.e(2876)]).then(t.bind(t,34735)).then((function(n){n.default.api.getSession(d[0]).ttyShell.xterm.sendSigKill()})),e.abrupt("break",14);case 13:console.warn("link triggered unrecognised command:",r);case 14:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),children:o}):(0,S.tZ)(z.Z,{href:i,title:r,id:hn(n,o),children:o})},aside:function(e){e.node;var t=e.children,i=e.title,a=(0,m.Z)(e,an),r=function(n,e){return"".concat(n,"--aside--").concat(e)}(n,i);return(0,S.BX)("aside",ln(ln({},a),{},{children:[(0,S.tZ)("span",ln(ln({},i&&{id:r}),{},{className:"anchor"})),t]}))},div:function(e){e.node;var t=(0,m.Z)(e,rn);switch(t.className){case"tabs":var i=r.default.useMemo((function(){return Function("return ".concat(t.height))()}),[t.height]),a=r.default.useMemo((function(){return Function("return ".concat(t.tabs||"[]"))()}),[t.tabs]),o=Number(t.show)||1,l=[a.slice(0,o),a.slice(o)];return(0,S.tZ)(Q,{id:t.name?(0,y.Ff)(n,t.name):"",tabs:l,height:i,initEnabled:"true"===t.enabled});default:return(0,S.tZ)("div",ln({},t))}},h2:function(t){var i=t.children;return(0,S.BX)(S.HY,{children:[(0,S.tZ)("h2",{children:(0,S.tZ)(z.Z,{href:"#".concat(n),children:(0,S.tZ)("a",{children:i})})}),(0,S.tZ)("time",{dateTime:e.dateTime,children:e.dateText.split(" ").map((function(n){return(0,S.tZ)("span",{children:Array.from(n).map((function(n){return(0,S.tZ)("span",{children:n})}))})}))}),(0,S.tZ)("div",{className:"tags",title:"tags",children:e.tags.map((function(n){return(0,S.tZ)("span",{children:n})}))})]})},h3:function(e){var t=e.children,i=r.default.useMemo((function(){return"".concat(n,"--").concat(r.default.Children.toArray(t)[0].toString().toLowerCase().replace(/\s/g,"-"))}),[]);return(0,S.BX)("h3",{children:[(0,S.tZ)("span",{id:i,className:"anchor"}),(0,S.tZ)(z.Z,{href:"#".concat(i),children:(0,S.tZ)("a",{children:t})})]})}}};var sn,un=["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];function hn(n,e){return"".concat(n,"--link--").concat(function(n){return r.default.Children.toArray(n)[0].toString().toLowerCase().replace(/\s/g,"-")}(e))}function fn(n){var e=n.keys,t=n.markdown,i=r.default.useRef(),l=(0,o.Z)({debounce:30,scroll:!1}),u=(0,a.Z)(l,2),h=u[0],f=u[1];return r.default.useEffect((function(){var n,t=Array.from((null===(n=i.current)||void 0===n?void 0:n.children)||[]).map((function(n,t){return{key:e[t],rect:s.U.fromJson(n.getBoundingClientRect()).delta(window.scrollX,window.scrollY)}}));p.Z.setState({articles:(0,c.Rw)(t)}),p.Z.api.updateArticleKey()}),[f]),r.default.useEffect((function(){return function(){e.forEach((function(n){return delete p.Z.getState().articles[n]})),p.Z.setState({})}}),[]),(0,S.tZ)("ol",{className:mn,ref:function(n){h(n),n&&(i.current=n)},children:e.map((function(n){return(0,S.tZ)("li",{children:(0,S.tZ)(cn,{articleKey:n,dateTime:d.mh[n].timestamp,children:t[n]||"",tags:d.mh[n].tags})},n)}))})}var mn=(0,l.iv)(sn||(sn=(0,i.Z)(["\n  padding: 0;\n  margin: 0;\n  list-style: none;\n"])))},43057:function(n,e,t){t.d(e,{Z:function(){return S}});var i,a=t(52209),r=t(88269),o=t(10219),l=t(11163),c=t(94184),d=t.n(c),p=t(38456),s=t.n(p),u=t(17928),h=t(11455),f=t(97300),m=t(58199),x=t(55349),g=t(8311);function b(){var n=(0,h.Z)((function(n){return n.articleKey?u.mh[n.articleKey]:null})),e=null!==n&&void 0!==n&&n.prev?u.mh[n.prev]:null,t=null!==n&&void 0!==n&&n.next?u.mh[n.next]:null;return null!==n&&void 0!==n&&n.index?(0,g.tZ)("nav",{className:d()(f.v.navMini,y),children:(0,g.BX)("ul",{children:[(0,g.tZ)("li",{children:(0,g.tZ)(m.Z,{href:(0,u.Gu)(e||n),backward:!0,children:(0,g.tZ)("span",{className:"prev",children:"prev"})})}),(0,g.tZ)("li",{children:(0,g.tZ)(m.Z,{href:(0,u.Gu)(n),children:(0,g.tZ)("a",{className:"primary",children:n.index})})}),(0,g.tZ)("li",{children:(0,g.tZ)(m.Z,{href:(0,u.Gu)(t||n),children:(0,g.tZ)("span",{className:"next",children:"next"})})})]})}):null}var v,y=(0,r.iv)(i||(i=(0,a.Z)(["\n  position: absolute;\n  z-index: 10;\n  right: ","px;\n  top: -40px;\n  @media(max-width: 1024px) { top: -32px; }\n  @media(max-width: 600px) { top: 0; }\n\n  font-size: 1rem;\n\n  > ul {\n    background: #000;\n    position: fixed;\n    width: ","px;\n    height: ","px;\n\n    display: flex;\n    justify-content: center;\n    align-items: stretch;\n    padding: 0;\n    margin: 0;\n\n    li {\n      list-style: none;\n      list-style-position: inside;\n      padding: 0 5px;\n    }\n    a {\n      color: #ccc;\n      height: 100%;\n      display: flex;\n      align-items: center;\n    }\n    a.primary {\n      color: #fff;\n    }\n  }\n"])),140,140,x.barHeight),w=t(59885),Z=["children","node"];function k(){return(0,g.BX)("header",{className:d()("title",N),children:[(0,g.tZ)(b,{}),(0,g.tZ)(w.H3,{}),(0,g.tZ)(s(),{components:O,children:"\n# The Last Redoubt\n\n$( video game | web dev | game ai )\n      "})]})}var _,O={h1:function(n){var e=n.children,t=(n.node,(0,o.Z)(n,Z),(0,l.useRouter)());return(0,g.tZ)("h1",{onClick:function(){return t.push("/")},children:e})}},N=(0,r.iv)(v||(v=(0,a.Z)(["\n  position: relative;\n  \n  @media(max-width: 600px) {\n    padding-left: 8px;\n    border-bottom: 1px solid #777;\n  }\n  \n  h1 {\n    margin: 0;\n    font-size: 4.8rem;\n    font-weight: 300;\n    letter-spacing: 4px;\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    cursor: pointer;\n    color: #444;\n    text-transform: uppercase;\n    text-shadow: 0 0 2px #888888bb;\n    padding-top: 40px;\n    \n    @media(max-width: 800px) {\n      font-size: 3.5rem;\n    }\n    @media(max-width: 600px) {\n      padding-top: 72px;\n      font-size: 2.2rem;\n      color: #333;\n    }\n  }\n  \n  /** Site subtitle */\n  p {\n    color: #424242;\n    font-size: 1rem;\n    font-family: 'Courier New', Courier, monospace;\n    margin: 0;\n    padding: 40px 0 48px;\n    font-weight: 300;\n    text-transform: lowercase;\n    \n    @media(max-width: 600px) {\n      padding: 24px 0 28px 4px;\n    }\n  }\n\n"])));function S(n){var e=n.children;return(0,g.BX)("section",{className:E,children:[(0,g.tZ)(k,{}),(0,g.tZ)("main",{children:e})]})}var E=(0,r.iv)(_||(_=(0,a.Z)(["\n  max-width: 1280px;\n  width: 100%;\n\n  padding: 32px 0 32px 40px;\n  margin: 0;\n  @media(max-width: 600px) {\n    padding: 0;\n  }\n"])))},55349:function(n,e,t){t.r(e),t.d(e,{barHeight:function(){return k},default:function(){return w}});var i,a=t(52209),r=t(59748),o=t(20296),l=t.n(o),c=t(94184),d=t.n(c),p=t(88269),s=t(11455),u=t(97300),h=t(17928),f=t(58199),m=t(8311);function x(){var n=(0,s.Z)((function(n){return n.articleKey})),e=n?h.mh[n].part:null;return(0,m.BX)("section",{className:y,children:[(0,m.tZ)("h3",{children:(0,m.tZ)(f.Z,{href:"/",children:"The Last Redoubt"})}),h.Pd.map((function(t,i){return(0,m.tZ)("ul",{children:t.map((function(t){return(0,m.tZ)("li",{className:t.key===n?"current":void 0,children:(0,m.BX)(f.Z,{href:(0,h.Gu)(t),title:t.info,backward:!!e&&t.part<e,children:[t.index," ",t.label]})},t.key)}))},i)}))]})}var g,b,v,y=(0,p.iv)(i||(i=(0,a.Z)(["\n  padding: 0;\n  color: #aaa;\n  \n  h3 {\n    padding: 20px 12px;\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-size: 1.8rem;\n    font-weight: 300;\n    margin: 0;\n    a {\n      color: #ddd;\n    }\n    border: 0 solid #aaa;\n    border-width: 0 0 2px;\n  }\n  \n  ul {\n    font-size: 1.1rem;\n    padding: 6px 0;\n    margin: 0;\n    border: 0 solid #aaa;\n    border-width: 0 0 2px;\n\n    li {\n      list-style: none;\n      list-style-position: inside;\n      display: flex;\n    }\n    li.current {\n      a {\n        color: white;\n      }\n    }\n    a {\n      padding: 10px 12px;\n      width: 100%;\n      color: #888;\n      &:hover {\n        color: #ccc;\n      }\n    }\n  }\n"])));function w(){var n=(0,s.Z)((function(n){return n.navOpen}));return r.default.useEffect((function(){var n=l()((function(){return s.Z.api.updateArticleKey()}),5);return window.addEventListener("scroll",n),function(){return window.removeEventListener("scroll",n)}}),[]),(0,m.BX)(m.HY,{children:[(0,m.BX)("nav",{className:d()(u.v.navMain,_,n?u.v.navMainOpen:u.v.navMainClosed),onClick:function(e){e.stopPropagation(),e.target instanceof HTMLAnchorElement||s.Z.setState({navOpen:!n})},children:[(0,m.tZ)("div",{className:"article-overlay"}),(0,m.tZ)("div",{className:"handle",children:(0,m.tZ)("div",{className:"icon",children:n?"<":">"})}),(0,m.tZ)(x,{})]}),(0,m.tZ)("div",{className:O,onClick:function(e){e.stopPropagation(),e.target instanceof HTMLAnchorElement||s.Z.setState({navOpen:!n})}}),(0,m.tZ)(N,{navOpen:n})]})}var Z=256,k=40,_=(0,p.iv)(g||(g=(0,a.Z)(["\n  position: fixed;\n  z-index: 11;\n  height: calc(100% + 200px);\n  width: ","px;\n\n  font-weight: 300;\n  font-family: sans-serif;\n  background-color: #222;\n  color: white;\n  cursor: pointer;\n  opacity: 0.975;\n  /** https://stackoverflow.com/questions/21003535/anyway-to-prevent-the-blue-highlighting-of-elements-in-chrome-when-clicking-quic  */\n  -webkit-tap-highlight-color: transparent;\n  \n  left: 0;\n  transition: transform 500ms ease;\n  &.open {\n    transform: translateX(0px);\n  }\n  &.closed {\n    transform: translateX(-","px);\n  }\n\n  > .article-overlay {\n    position: absolute;\n    top: 0;\n    left: ","px;\n    width: 100vw;\n    height: 0;\n    background: rgba(0, 0, 0, .1);\n  }\n  @media(max-width: 1280px) {\n    &.open > .article-overlay {\n      height: 100%;\n      background: rgba(0, 0, 0, .25);\n    }\n  }\n  > .handle {\n    position: absolute;\n    top: -1px;\n    right: -","px;\n    width: ","px;\n    height: ","px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    user-select: none;\n    \n    .icon {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      background: #900;\n      color: #fff;\n      width: inherit;\n      height: inherit;\n      padding: 0 0 2px 0;\n    }\n\n    animation: fadeInHandle ease-in 500ms forwards;\n    @keyframes fadeInHandle {\n      0% { opacity: 0; }\n      100% { opacity: 1; }\n    }\n  }\n"])),Z,Z,Z,40,40,k+1),O=(0,p.iv)(b||(b=(0,a.Z)(["\n  position: fixed;\n  cursor: pointer;\n  z-index: 7;\n  left: 0;\n  width: calc(100vw + ","px);\n  height: ","px;\n  background: black;\n\n  animation: fadeInTopBar ease-in 300ms forwards;\n  @keyframes fadeInTopBar {\n    0% { opacity: 0; }\n    100% { opacity: 1; }\n  }\n"])),Z,k);function N(n){var e=n.navOpen;return(0,m.tZ)("div",{className:d()(S,!e&&"closed")})}var S=(0,p.iv)(v||(v=(0,a.Z)(["\n  min-width: ","px;\n  transition: min-width 500ms ease;\n  &.closed {\n    min-width: 0;\n  }\n  @media(max-width: 1280px) {\n    display: none;\n  }\n"])),Z)},58601:function(n,e,t){t.d(e,{v8:function(){return r},zD:function(){return o},Ff:function(){return l},J8:function(){return c}});var i=t(97131),a=t(84175);function r(n){return"".concat(o(n)).concat(n.idSuffix||"")}function o(n){switch(n.key){case"code":case"component":return n.filepath;case"terminal":return"@".concat(n.filepath);default:throw(0,a.Ql)(n)}}function l(n,e){return"".concat(n,"--tabs--").concat(e)}function c(n){return{global:{tabEnableRename:!1,rootOrientationVertical:!0,tabEnableClose:!1},layout:{type:"row",children:n[0].map((function(e,t){return{type:"row",weight:e.weight,children:0===t?[{type:"tabset",children:[e].concat((0,i.Z)(n[1])).map((function(n){return{type:"tab",id:r(n),name:o(n),config:(0,a.I8)(n)}}))}]:[{type:"tabset",children:[{type:"tab",id:r(e),name:o(e),config:(0,a.I8)(e)}]}]}}))}}}}}]);