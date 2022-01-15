(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2197,5349],{17928:function(n,e,t){"use strict";t.d(e,{mh:function(){return i},Pd:function(){return r},Gu:function(){return a}});var i={homepage:{key:"homepage",label:"",info:"Home page",timestamp:"2021-07-19",part:-1,index:"",prev:null,next:null,tags:[]},test:{key:"test",label:"test",info:"Test page for development purposes",timestamp:"2021-07-19",part:-1,index:"",prev:null,next:null,tags:[]},objective:{key:"objective",label:"objective",info:"Our overall objective",timestamp:"2021-07-19",part:1,index:"1a",prev:null,next:"constraints",tags:["intent","game ai","traveller","npc","navmesh","geomorph","codesandbox"]},constraints:{key:"constraints",label:"constraints",info:"Constraints: tech, game mechanics, setting",timestamp:"2021-07-19",part:1,index:"1b",prev:"objective",next:"finishing",tags:["tech","mechanics","terminal","setting"]},finishing:{key:"finishing",label:"finishing",info:"Finishing as a skill",timestamp:"2021-07-19",part:1,index:"1c",prev:"constraints",next:"technology",tags:["finishing as a skill","better game ai","teleglitch"]},technology:{key:"technology",label:"technology",info:"The tech we'll use",timestamp:"2021-07-19",part:2,index:"2a",prev:"finishing",next:"tech1",tags:["lego bricks","specific tech"]},tech1:{key:"tech1",label:"tech: js",info:"JavaScript components",timestamp:"2021-07-19",part:2,index:"2b",prev:"technology",next:"tech2",tags:["javascript","react","preact","jsx","performance","hot reload"]},tech2:{key:"tech2",label:"tech: ai",info:"Tech related to gameplay",timestamp:"2021-07-19",part:2,index:"2c",prev:"tech1",next:"tech3",tags:["navigation","navgraph","navmesh","string pull","steering","detour","raycast"]},tech3:{key:"tech3",label:"tech: dev",info:"Dev env and in-browser terminal",timestamp:"2021-07-19",part:2,index:"2d",prev:"tech2",next:"geomorphs",tags:[]},geomorphs:{key:"geomorphs",label:"geomorphs",info:"How we use Starship Geomorphs",timestamp:"2021-07-19",part:3,index:"3a",prev:"tech3",next:null,tags:[]}},r=Object.values(i).filter((function(n){return n.part>0})).reduce((function(n,e){return(n[e.part]=n[e.part]||[]).push(e),n}),[]);function a(n){return"".concat("/part/").concat(n.part,"#").concat(n.key)}},43057:function(n,e,t){"use strict";t.d(e,{Z:function(){return T}});var i,r=t(52209),a=t(88269),o=t(92809),c=t(10219),l=t(11163),s=t(94184),p=t.n(s),d=t(38456),h=t.n(d),u=t(17928),f=t(11455),m=t(58199),g=t(55349),x=t(8311);function v(){var n=(0,f.Z)((function(n){return n.articleKey?u.mh[n.articleKey]:null})),e=null!==n&&void 0!==n&&n.prev?u.mh[n.prev]:null,t=null!==n&&void 0!==n&&n.next?u.mh[n.next]:null;return null!==n&&void 0!==n&&n.index?(0,x.tZ)("nav",{className:y,children:(0,x.BX)("ul",{children:[(0,x.tZ)("li",{children:(0,x.tZ)(m.Z,{href:(0,u.Gu)(e||n),backward:!0,children:(0,x.tZ)("span",{className:"prev",children:"prev"})})}),(0,x.tZ)("li",{children:(0,x.tZ)(m.Z,{href:(0,u.Gu)(n),children:(0,x.tZ)("a",{className:"primary",children:n.index})})}),(0,x.tZ)("li",{children:(0,x.tZ)(m.Z,{href:(0,u.Gu)(t||n),children:(0,x.tZ)("span",{className:"next",children:"next"})})})]})}):null}var b,y=(0,a.iv)(i||(i=(0,r.Z)(["\n  position: absolute;\n  z-index: 10;\n  right: ","px;\n  top: -48px;\n  @media(max-width: 1024px) { top: -32px; }\n  @media(max-width: 600px) { top: 0; }\n\n  font-size: 1rem;\n\n  > ul {\n    background: #000;\n    position: fixed;\n    width: ","px;\n    height: ","px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: 0;\n    margin: 0;\n\n    li {\n      list-style: none;\n      list-style-position: inside;\n      padding: 0 5px;\n    }\n    a {\n      color: #ccc;\n    }\n    a.primary {\n      color: #fff;\n    }\n  }\n"])),140,140,g.barHeight),w=t(59885),Z=["children","node"];function k(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,i)}return t}function j(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?k(Object(t),!0).forEach((function(e){(0,o.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):k(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function O(){return(0,x.BX)("header",{className:p()("title",P),children:[(0,x.tZ)(v,{}),(0,x.tZ)(w.H3,{}),(0,x.tZ)(h(),{components:z,children:"\n# Starship Markup\n\n$( game ai | roguelike | web dev )\n      "})]})}var N,z={h1:function(n){var e=n.children,t=(n.node,(0,c.Z)(n,Z)),i=(0,l.useRouter)();return(0,x.tZ)("h1",j(j({onClick:function(){return i.push("/")}},t),{},{children:e}))}},P=(0,a.iv)(b||(b=(0,r.Z)(["\n  position: relative;\n  \n  @media(max-width: 600px) {\n    background: #eee;\n    padding-bottom: 8px;\n    padding-left: 8px;\n    border-bottom: 1px solid #aaa;\n    padding-top: 64px;\n  }\n  padding-top: 40px;\n  \n  h1 {\n    margin: 0;\n    font-size: 5.5rem;\n    font-weight: 300;\n    font-family: Georgia, 'Times New Roman', Times, serif;\n    cursor: pointer;\n    color: #333;\n    display: inline-block;\n    \n    @media(max-width: 800px) {\n      font-size: 5rem;\n    }\n    @media(max-width: 600px) {\n      font-size: 3.5rem;\n    }\n  }\n  \n  /** Site subtitle */\n  p {\n    color: #444;\n    letter-spacing: 3px;\n    font-size: 0.8rem;\n    font-family: sans-serif;\n    margin: 0;\n    padding: 40px 0 48px;\n    font-weight: 300;\n    \n    @media(max-width: 600px) {\n      padding: 20px 0 20px 4px;\n      color: #222;\n    }\n  }\n\n"])));function T(n){var e=n.children;return(0,x.BX)("section",{className:E,children:[(0,x.tZ)(O,{}),(0,x.tZ)("main",{children:e})]})}var E=(0,a.iv)(N||(N=(0,r.Z)(["\n  max-width: 1024px;\n  width: 100%;\n\n  padding: 48px 64px;\n  @media(max-width: 1024px) {\n    padding: 32px 0 32px 40px;\n    margin: 0;\n  }\n  @media(max-width: 600px) {\n    padding: 0;\n  }\n"])))},55349:function(n,e,t){"use strict";t.r(e),t.d(e,{barHeight:function(){return k},default:function(){return w}});var i,r=t(52209),a=t(79056),o=t(59748),c=t(20296),l=t.n(c),s=t(94184),p=t.n(s),d=t(88269),h=t(11455),u=t(17928),f=t(58199),m=t(8311);function g(){var n=(0,h.Z)((function(n){return n.articleKey})),e=n?u.mh[n].part:null;return(0,m.BX)("section",{className:y,children:[(0,m.tZ)("h3",{children:(0,m.tZ)(f.Z,{href:"/",children:"Starship Markup"})}),u.Pd.map((function(t,i){return(0,m.tZ)("ul",{children:t.map((function(t){return(0,m.tZ)("li",{className:t.key===n?"current":void 0,children:(0,m.BX)(f.Z,{href:(0,u.Gu)(t),title:t.info,backward:!!e&&t.part<e,children:[t.index," ",t.label]})},t.key)}))},i)}))]})}var x,v,b,y=(0,d.iv)(i||(i=(0,r.Z)(["\n  padding: 0;\n  color: #aaa;\n  \n  h3 {\n    padding: 20px 12px;\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-size: 1.8rem;\n    font-weight: 300;\n    margin: 0;\n    a {\n      color: #ddd;\n    }\n    border: 0 solid #aaa;\n    border-width: 0 0 2px;\n  }\n  \n  ul {\n    font-size: 1.1rem;\n    padding: 6px 0;\n    margin: 0;\n    border: 0 solid #aaa;\n    border-width: 0 0 2px;\n\n    li {\n      list-style: none;\n      list-style-position: inside;\n      display: flex;\n    }\n    li.current {\n      a {\n        color: white;\n      }\n    }\n    a {\n      padding: 10px 12px;\n      width: 100%;\n      color: #888;\n      &:hover {\n        color: #ccc;\n      }\n    }\n  }\n"])));function w(){var n=o.default.useState(!1),e=(0,a.Z)(n,2),t=e[0],i=e[1];return o.default.useEffect((function(){var n=l()((function(){return h.Z.api.updateArticleKey()}),5);return window.addEventListener("scroll",n),function(){return window.removeEventListener("scroll",n)}}),[]),(0,m.BX)(m.HY,{children:[(0,m.BX)("nav",{className:p()(j,t?"open":"closed"),onClick:function(n){n.stopPropagation(),n.target instanceof HTMLAnchorElement||i(!t)},children:[(0,m.tZ)("div",{className:"article-overlay"}),(0,m.tZ)("div",{className:"handle",children:(0,m.tZ)("div",{className:"icon",children:t?"<":">"})}),(0,m.tZ)(g,{})]}),(0,m.tZ)("div",{className:O,onClick:function(n){n.stopPropagation(),n.target instanceof HTMLAnchorElement||i(!t)}}),(0,m.tZ)(N,{navOpen:t})]})}var Z=256,k=40,j=(0,d.iv)(x||(x=(0,r.Z)(["\n  position: fixed;\n  z-index: 11;\n  height: calc(100% + 200px);\n  width: ","px;\n\n  font-weight: 300;\n  font-family: sans-serif;\n  background-color: #222;\n  color: white;\n  cursor: pointer;\n  opacity: 0.975;\n  /** https://stackoverflow.com/questions/21003535/anyway-to-prevent-the-blue-highlighting-of-elements-in-chrome-when-clicking-quic  */\n  -webkit-tap-highlight-color: transparent;\n  \n  left: 0;\n  transition: transform 500ms ease;\n  &.open {\n    transform: translateX(0px);\n  }\n  &.closed {\n    transform: translateX(-","px);\n  }\n\n  > .article-overlay {\n    position: absolute;\n    top: 0;\n    left: ","px;\n    width: 100vw;\n    height: 0;\n    background: rgba(0, 0, 0, .1);\n  }\n  @media(max-width: 1280px) {\n    &.open > .article-overlay {\n      height: 100%;\n      background: rgba(0, 0, 0, .25);\n    }\n  }\n  > .handle {\n    position: absolute;\n    top: -1px;\n    right: -","px;\n    width: ","px;\n    height: ","px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    user-select: none;\n    \n    .icon {\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      background: #900;\n      color: #fff;\n      width: inherit;\n      height: inherit;\n      padding: 0 0 2px 0;\n    }\n\n    animation: fadeInHandle ease-in 500ms forwards;\n    @keyframes fadeInHandle {\n      0% { opacity: 0; }\n      100% { opacity: 1; }\n    }\n  }\n"])),Z,Z,Z,40,40,k+1),O=(0,d.iv)(v||(v=(0,r.Z)(["\n  position: fixed;\n  cursor: pointer;\n  z-index: 7;\n  left: 0;\n  width: calc(100vw + ","px);\n  height: ","px;\n  background: black;\n\n  animation: fadeInTopBar ease-in 300ms forwards;\n  @keyframes fadeInTopBar {\n    0% { opacity: 0; }\n    100% { opacity: 1; }\n  }\n"])),Z,k);function N(n){var e=n.navOpen;return(0,m.tZ)("div",{className:p()(z,!e&&"closed")})}var z=(0,d.iv)(b||(b=(0,r.Z)(["\n  min-width: ","px;\n  transition: min-width 500ms ease;\n  &.closed {\n    min-width: 0;\n  }\n  @media(max-width: 1280px) {\n    display: none;\n  }\n"])),Z)},97348:function(n,e,t){"use strict";t.r(e),t.d(e,{default:function(){return h}});var i,r=t(10219),a=t(52209),o=t(88269),c=t(43057),l=t(38456),s=t.n(l),p=t(8311),d=["node","children"];function h(){return(0,p.tZ)(c.Z,{children:(0,p.tZ)(s(),{className:u,children:"\n## 404\n\nThe requested path was not found:\n\n~~~\n~~~\n",components:f})})}var u=(0,o.iv)(i||(i=(0,a.Z)(["\n  background: #eee;\n  padding: 32px;\n  min-height: 300px;\n  font-size: 1.1rem;\n\n  h2 {\n    font-weight: 300;\n    font-size: 2rem;\n  }\n  code {\n    color: #f00;\n  }\n  \n  @media(max-width: 600px) {\n    background: #fff;\n    padding: 8px;\n    font-size: 1rem;\n    h2 {\n      margin: 8px 0 0;\n      font-size: 1.8rem;\n    }\n  }\n"]))),f={code:function(n){n.node,n.children,(0,r.Z)(n,d);var e=location.pathname;return(0,p.tZ)("code",{children:e})}}},9014:function(n,e,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/404",function(){return t(97348)}])}},function(n){n.O(0,[9774,9351,6758,2888,179],(function(){return e=9014,n(n.s=e);var e}));var e=n.O();_N_E=e}]);