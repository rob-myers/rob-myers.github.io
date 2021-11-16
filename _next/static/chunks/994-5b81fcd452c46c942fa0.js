"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[994],{60370:function(n,e,t){t.d(e,{Z:function(){return en}});var r,i=t(52209),o=t(79056),a=t(59748),c=t(73460),l=t(88269),d=t(39944),s=t(86576),u=t(17928),p=t(11455),f=t(72328),h=t(92809),m=t(17120),b=t(30266),x=t(10219),g=t(809),v=t.n(g),w=t(94184),y=t.n(w),Z=t(58601),O=t(58199),k=t(8311);function _(){return(0,k.tZ)("hr",{className:E})}var S,z,j,E=(0,l.iv)(r||(r=(0,i.Z)(["\n  margin: 0;\n  border-color: var(--focus-bg);\n\n  @media(min-width: 800px) {\n    padding-bottom: 80px;\n    border: 0;\n  }\n"]))),N=t(52542),P=t(59885),C=function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"auto",t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:13;return(0,l.iv)(S||(S=(0,i.Z)(["\n  &::after {\n    display: inline-block;\n    content: '';\n    background-image: url('/icon/",".svg');\n    background-size: ","px ","px;\n    height: ","px;\n    width: ","px;\n    margin: ",";\n  }\n"])),n,t,t,t,t,e)};function M(n){var e=n.enabled,t=n.toggleEnabled,r=n.clickAnchor;return(0,k.BX)("div",{className:T,children:[(0,k.BX)("div",{className:y()("top-right",e&&"enabled"),children:[(0,k.tZ)("span",{className:C("anchor-icon-white","auto",10),onClick:r}),(0,k.tZ)("span",{onClick:e?t:void 0,children:"disable"})]}),!e&&(0,k.tZ)("div",{className:y()("central",e&&"enabled"),onClick:t,children:"interact"})]})}var T=(0,l.iv)(z||(z=(0,i.Z)(["\n  font-family: Roboto, Arial, sans-serif;\n\n  > .top-right {\n    position: absolute;\n    right: -10px;\n    top: calc(-32px + 2px);\n    z-index: 2;\n    border-radius: 4px 4px 0 0;\n    padding: 2px 16px;\n    \n    cursor: pointer;\n    background: #333;\n    color: #777;\n    font-size: 14px;\n    font-weight: 300;\n    \n    &.enabled {\n      color: #fff;\n    }\n\n    > span:not(:last-child) {\n      margin-right: 8px;\n    }\n  }\n\n  > .central {\n    position: absolute;\n    z-index: 5;\n    left: calc(50% - (128px / 2));\n    top: calc(50% - 20px);\n    \n    cursor: pointer;\n    color: #ddd;\n    background: #000;\n    padding: 12px 32px;\n    border-radius: 4px;\n    border: 1px solid #ddd;\n    font-size: 1.2rem;\n\n    opacity: 1;\n    transition: 300ms opacity ease;\n    &.enabled {\n      opacity: 0;\n    }\n  }\n"])));function B(n){var e=n.colour;return(0,k.tZ)("div",{className:y()(A,{clear:"clear"===e,faded:"faded"===e})})}var D,R,A=(0,l.iv)(j||(j=(0,i.Z)(["\n  &:not(.faded) {\n    pointer-events: none;\n  }\n\n  position: absolute;\n  z-index: 4;\n  width: inherit;\n  height: inherit;\n  background: #000;\n  font-family: sans-serif;\n\n  opacity: 1;\n  transition: opacity 1s ease-in;\n  &.clear {\n    opacity: 0;\n    transition: opacity 0.5s ease-in;\n  }\n  &.faded {\n    opacity: 0.5;\n    transition: opacity 0.5s ease-in;\n  }\n"])));function X(n){var e=a.default.useRef(null),t=a.default.useState(!!n.enabled),r=(0,o.Z)(t,2),i=r[0],c=r[1],l=a.default.useState("black"),d=(0,o.Z)(l,2),s=d[0],u=d[1];return a.default.useEffect((function(){u(i?"clear":"faded")}),[]),(0,k.BX)("figure",{ref:e,className:y()("tabs","scrollable",L),children:[(0,k.tZ)("span",{id:n.id,className:"anchor"}),(0,k.BX)("div",{className:K(n.height),children:["black"!==s&&(0,k.tZ)(P.Ar,{id:n.id,tabs:n.tabs,rootRef:e}),(0,k.tZ)(M,{enabled:i,toggleEnabled:function(){var e=!i;c(e),u("clear"===s?"faded":"clear");var t=p.Z.getState().tabs[n.id];((null===t||void 0===t?void 0:t.getTabNodes())||[]).map((function(n){return n.getId()})).forEach((function(n){var t=p.Z.getState().portal[n];null===t||void 0===t||t.portal.setPortalProps({disabled:!e})}))},clickAnchor:function(){var e=p.Z.getState().tabs[n.id];null===e||void 0===e||e.scrollTo()}}),(0,k.tZ)(B,{colour:s})]})]})}var G,L=(0,l.iv)(D||(D=(0,i.Z)(["\n  background: var(--focus-bg);\n\n  @keyframes fadein {\n    from { opacity: 0; }\n    to   { opacity: 1; }\n  }\n\n  .flexlayout__tabset {\n    animation: fadein 1s;\n  }\n\n  .flexlayout__tabset, .flexlayout__tab {\n    background: white;\n  }\n\n  .flexlayout__layout {\n    background: #444;\n  }\n  .flexlayout__tab {\n    border-top: 6px solid #444;\n    position: relative;\n    overflow: hidden;\n\n    /** react-reverse-portal wraps things in a div  */\n    > div.portal {\n      width: 100%;\n      height: 100%;\n    }\n  }\n  .flexlayout__tabset_tabbar_outer {\n    background: #222;\n    border-bottom: 1px solid #555;\n  }\n  .flexlayout__tab_button--selected, .flexlayout__tab_button:hover {\n    background: #444;\n  }\n  .flexlayout__tab_button_content {\n    user-select: none;\n    font-size: 13px;\n    color: #aaa;\n  }\n  .flexlayout__tab_button--selected .flexlayout__tab_button_content {\n    color: #fff;\n  }\n  .flexlayout__tab_button:hover:not(.flexlayout__tab_button--selected) .flexlayout__tab_button_content {\n    color: #ddd;\n  }\n  .flexlayout__splitter_vert, .flexlayout__splitter_horz {\n    background: #827575;\n  }\n"]))),K=function(n){return(0,l.iv)(R||(R=(0,i.Z)(["\n  width: 100%;\n  height: ","px;\n  position: relative;\n"])),n)},I=["node","href","title","children"],J=["node"],F=["node","children"],q=["node","children"];function Y(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function V(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?Y(Object(t),!0).forEach((function(e){(0,h.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):Y(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function H(n){var e=a.default.useMemo((function(){var e=new Date(n.dateTime);return"".concat(e.getDate()).concat(function(n){if(n>3)return"th";if(1===n)return"st";if(2===n)return"nd";if(3===n)return"rd"}(e.getDate())," ").concat(W[e.getMonth()]," ").concat(e.getFullYear())}),[n.dateTime]),t=a.default.useMemo((function(){return U(n.articleKey)}),[n.articleKey]);return(0,k.BX)(k.HY,{children:[(0,k.BX)("article",{className:y()(n.className,Q),children:[(0,k.tZ)("span",{className:"anchor",id:n.articleKey}),(0,k.tZ)("time",{dateTime:n.dateTime,children:e}),(0,k.tZ)(N.Z,{children:n.children,components:t})]}),(0,k.tZ)(_,{})]})}var Q=(0,l.iv)(G||(G=(0,i.Z)(["\n  line-height: 1.8;\n  background: var(--focus-bg);\n  border: var(--blog-border-width) solid var(--border-bg);\n  font-size: 1rem;\n  \n  padding: 64px 128px 96px 128px;\n  @media(max-width: 800px) {\n    padding: 32px 64px 48px 64px;\n  }\n  @media(max-width: 600px) {\n    padding: 8px 12px;\n    font-size: 1.1rem;\n    border: none;\n    line-height: 1.7;\n  }\n\n  a {\n    code {\n      color: unset;\n    }\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -96px;\n    }\n  }\n\n  aside {\n    margin: 24px 0;\n    padding: 20px 32px;\n    border-radius: 8px;\n    background: rgba(230, 230, 230, 1);\n    color: #225;\n    font-size: 1rem;\n    p {\n      margin: 12px 0;\n    }\n\n    @media(max-width: 600px) {\n      margin: 8px 0;\n      padding: 16px 20px;\n      p {\n        margin: 8px 0;\n      }\n    }\n\n    blockquote {\n      margin: 0;\n      border-left: 10px solid #ccc;\n    }\n    figure.tabs {\n      @media(min-width: 600px) {\n        margin: 40px 0;\n      }\n    }\n  }\n\n  blockquote {\n    margin: 32px 0;\n    border-left: 10px solid #ddd;\n    padding-left: 30px;\n    \n    @media(max-width: 600px) {\n      margin: 20px 0;\n      padding-left: 20px;\n    }\n  }\n  \n  code {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    letter-spacing: 1px;\n    color: #444;\n    letter-spacing: 2px;\n    padding: 0 2px;\n  }\n\n  div.small-print {\n    font-size: smaller;\n  }\n\n  figure {\n    margin: 0;\n  }\n  \n  figure.tabs {\n    border: 10px solid #333;\n    border-radius: 8px;\n    margin: 48px 0;\n    @media(max-width: 600px) {\n      margin: 32px 0;\n    }\n\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -96px;\n    }\n  }\n\n  h1, h2, h3, h4 {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-weight: 400;\n    a {\n      color: #008;\n    }\n  }\n  h2 {\n    font-size: 2rem;\n    @media(max-width: 600px) {\n      margin: 16px 0 24px;\n      font-size: 1.9rem;\n    }\n  }\n  h3 {\n    font-size: 1.4rem;\n    @media(max-width: 600px) {\n      font-size: 1.3em;\n    }\n    @media(max-width: 800px) {\n      font-size: 1.4em;\n    }\n\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -48px;\n    }\n  }\n\n  h2 + p, h3 + p {\n    margin-top: 0px;\n  }\n\n  li blockquote {\n    margin: 0;\n    p {\n      margin: 16px 0;\n    }\n  }\n\n  p {\n   margin: 40px 0;\n   @media(max-width: 600px) {\n     margin: 16px 0;\n   }\n\n   code {\n     font-size: 1rem;\n   }\n  }\n\n  span.cmd {\n    color: #555;\n    background: #ddd;\n    font-family: monospace;\n    letter-spacing: 1px;\n    font-size: smaller;\n    padding: 2px 4px;\n    @media(max-width: 600px) {\n      user-select: all;\n    }\n  }\n\n  > span.anchor {\n    position: absolute;\n    top: -48px;\n  }\n\n  table {\n    padding: 8px;\n    border: 1px solid #bbb;\n    width: 100%;\n    margin: 40px 0;\n    @media(max-width: 600px) {\n      margin: 20px 0;\n    }\n    th, td {\n      padding: 6px;\n      text-align: left;\n      vertical-align: top;\n      @media(max-width: 600px) {\n        padding: 4px 2px;\n      }\n    }\n  }\n\n  position: relative;\n  > time {\n    position: absolute;\n    right: calc(-1 * var(--blog-border-width));\n    top: -52px;\n    width: 136px;\n\n    background: var(--border-bg);\n    text-align: center;\n    color: #555;\n    border-radius: 6px 6px 0 0;\n    padding: 12px;\n    font-size: 1rem;\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n\n    @media(max-width: 600px) {\n      top: 16px;\n      right: 0;\n      border-radius: 0 0 0 4px;\n      background: none;\n      font-size: 1.1rem;\n      width: unset;\n      margin-top: 8px;\n    }\n  }\n\n  ul, ol {\n    @media(max-width: 600px) {\n      padding-left: 20px;\n    }\n    + p {\n      padding-top: 6px;\n    }\n  }\n\n  ul li, ol li {\n    margin: 4px 0;\n  }\n\n"]))),U=function(n){return{a:function(e){e.node;var r=e.href,i=e.title,a=e.children;(0,x.Z)(e,I);if("@anchor"===i){var c=nn(n,a),l=Number((r||"").split("#")[0])||null;return(0,k.tZ)(O.Z,{href:r,className:y()("anchor-link",C("anchor-icon","0 2px 0 4px")),id:c,title:i,prePush:"#".concat(c),backward:!!l&&l<u.mh[n].part,children:a})}return"@new-tab"===i?(0,k.tZ)("a",{href:r,title:i,className:y()("new-tab-link",C("ext-link-icon","0 2px 0 4px")),target:"_blank",rel:"noopener",children:a}):"#command"===r?(0,k.tZ)("a",{href:r,title:i,onClick:function(){var e=(0,b.Z)(v().mark((function e(r){var a,c,l,d,s,u,f,h,b;return v().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r.preventDefault(),a=i.split(" "),c=(0,m.Z)(a),l=c[0],d=c.slice(1),e.t0=l,e.next="open-tab"===e.t0?5:"sigkill"===e.t0?11:13;break;case 5:return s=(0,o.Z)(d,2),u=s[0],f=s[1],h=(0,Z.Ff)(n,u),null===(b=p.Z.getState().tabs[h])||void 0===b||b.selectTab(f),null===b||void 0===b||b.scrollTo(),e.abrupt("break",14);case 11:return Promise.all([t.e(351),t.e(980),t.e(472)]).then(t.bind(t,56127)).then((function(n){n.default.api.getSession(d[0]).ttyShell.xterm.sendSigKill()})),e.abrupt("break",14);case 13:console.warn("link triggered unrecognised command:",i);case 14:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}(),children:a}):(0,k.tZ)(O.Z,{href:r,title:i,id:nn(n,a),children:a})},div:function(e){e.node;var t=(0,x.Z)(e,J);switch(t.class){case"tabs":var r=Number(t.height||100),i=a.default.useMemo((function(){return Function("return ".concat(t.tabs||"[]"))()}),[t.tabs]);return(0,k.tZ)(X,{height:r,tabs:i,enabled:"true"===t.enabled,id:t.name?(0,Z.Ff)(n,t.name):""});default:return(0,k.tZ)("div",V({},t))}},h2:function(e){e.node;var t=e.children,r=(0,x.Z)(e,F);return(0,k.tZ)("h2",V(V({},r),{},{children:(0,k.tZ)(O.Z,{href:"#".concat(n),children:(0,k.tZ)("a",{children:t})})}))},h3:function(e){e.node;var t=e.children,r=(0,x.Z)(e,q),i=a.default.useMemo((function(){return"".concat(n,"--").concat(a.default.Children.toArray(t)[0].toString().toLowerCase().replace(/\s/g,"-"))}),[]);return(0,k.BX)("h3",V(V({},r),{},{children:[(0,k.tZ)("span",{id:i,className:"anchor"}),(0,k.tZ)(O.Z,{href:"#".concat(i),children:(0,k.tZ)("a",{children:t})})]}))}}};var $,W=["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];function nn(n,e){return"".concat(n,"--link--").concat(function(n){return a.default.Children.toArray(n)[0].toString().toLowerCase().replace(/\s/g,"-")}(e))}function en(n){var e=n.keys,t=n.markdown,r=a.default.useRef(),i=(0,c.Z)({debounce:30,scroll:!1}),l=(0,o.Z)(i,2),h=l[0],m=l[1];return a.default.useEffect((function(){var n,t=Array.from((null===(n=r.current)||void 0===n?void 0:n.children)||[]).map((function(n,t){return{key:e[t],rect:f.U.fromJson(n.getBoundingClientRect()).delta(window.scrollX,window.scrollY)}}));p.Z.setState({articles:(0,s.Rw)(t)}),p.Z.api.updateArticleKey()}),[m]),a.default.useEffect((function(){return function(){e.forEach((function(n){return delete p.Z.getState().articles[n]})),p.Z.setState({})}}),[]),(0,d.x)((function(){var n=Array.from(document.querySelectorAll(".anchor")).filter((function(n){return n.id&&!n.id.includes("--link--")})),e=Array.from(n).map((function(n){return n.getBoundingClientRect().y})).findIndex((function(n){return n>0}))-1;e>=0&&localStorage.setItem("close-anchor-id",JSON.stringify(n[e].id))})),(0,k.tZ)("ol",{className:tn,ref:function(n){h(n),n&&(r.current=n)},children:e.map((function(n){return(0,k.tZ)("li",{children:(0,k.tZ)(H,{articleKey:n,dateTime:u.mh[n].timestamp,children:t[n]||""})},n)}))})}var tn=(0,l.iv)($||($=(0,i.Z)(["\n  padding: 0;\n  margin: 0;\n  list-style: none;\n"])))},36886:function(n,e,t){t.d(e,{Z:function(){return P}});var r,i=t(52209),o=t(88269),a=t(92809),c=t(10219),l=t(11163),d=t(94184),s=t.n(d),u=t(52542),p=t(17928),f=t(11455),h=t(58199),m=t(55349),b=t(8311);function x(){var n=(0,f.Z)((function(n){return n.articleKey?p.mh[n.articleKey]:null})),e=null!==n&&void 0!==n&&n.prev?p.mh[n.prev]:null,t=null!==n&&void 0!==n&&n.next?p.mh[n.next]:null;return null!==n&&void 0!==n&&n.index?(0,b.tZ)("nav",{className:v,children:(0,b.BX)("ul",{children:[(0,b.tZ)("li",{children:(0,b.tZ)(h.Z,{href:(0,p.Gu)(e||n),backward:!0,children:(0,b.tZ)("span",{className:"prev",children:"prev"})})}),(0,b.tZ)("li",{children:(0,b.tZ)(h.Z,{href:(0,p.Gu)(n),children:(0,b.tZ)("a",{className:"primary",children:n.index})})}),(0,b.tZ)("li",{children:(0,b.tZ)(h.Z,{href:(0,p.Gu)(t||n),children:(0,b.tZ)("span",{className:"next",children:"next"})})})]})}):null}var g,v=(0,o.iv)(r||(r=(0,i.Z)(["\n  position: absolute;\n  z-index: 10;\n  right: ","px;\n  top: -48px;\n  @media(max-width: 1024px) { top: -32px; }\n  @media(max-width: 600px) { top: 0; }\n\n  font-size: 1rem;\n\n  > ul {\n    position: fixed;\n    width: ","px;\n    height: ","px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: 0;\n    margin: 0;\n\n    li {\n      list-style: none;\n      list-style-position: inside;\n      padding: 0 5px;\n    }\n    a {\n      color: #ccc;\n    }\n    a.primary {\n      color: #fff;\n    }\n  }\n"])),140,140,m.M),w=t(59748);function y(){var n=w.default.useMemo((function(){if(localStorage.getItem("close-anchor-id")){var n="#".concat(JSON.parse(localStorage.getItem("close-anchor-id")));return localStorage.removeItem("close-anchor-id"),n}return location.hash?location.hash:""}),[]);return(0,b.tZ)("div",{className:O,children:(0,b.tZ)("div",{className:"fixed",children:(0,b.tZ)(h.Z,{href:n,postPush:function(){},children:"continue"})})})}var Z,O=(0,o.iv)(g||(g=(0,i.Z)(["\n  position: absolute;\n  right: ","px;\n  z-index: 3;\n  top: -8px;\n\n  @media(max-width: 1024px) {\n    top: 8px;\n  }\n  @media(max-width: 600px) {\n    top: 40px;\n  }\n\n  .fixed {\n    position: fixed;\n    border-radius: 0 0 64px 64px;\n    width: ","px;\n\n    text-align: center;\n    font-size: 15px;\n    letter-spacing: 1px;\n    padding: 6px 0 14px;\n    background: #444;\n\n    a {\n      color: #fff;\n    }\n  }\n"])),140,140),k=["children"];function _(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function S(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?_(Object(t),!0).forEach((function(e){(0,a.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):_(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function z(){return(0,b.BX)("header",{className:s()("title",N),children:[(0,b.tZ)(x,{}),(0,b.tZ)(y,{}),(0,b.tZ)(u.Z,{components:E,children:"\n# Rogue Markup\n\n$( game ai | roguelike | web dev )\n      "})]})}var j,E={h1:function(n){var e=n.children,t=(0,c.Z)(n,k),r=(0,l.useRouter)();return(0,b.tZ)("h1",S(S({onClick:function(){return r.push("/")}},t),{},{children:e}))}},N=(0,o.iv)(Z||(Z=(0,i.Z)(["\n  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n  position: relative;\n\n  @media(max-width: 600px) {\n    padding-left: 8px;\n    border-bottom: 2px solid #999;\n    border: 0 solid #000;\n    padding-top: 64px;\n  }\n  padding-top: 40px;\n\n  h1 {\n    margin: 0;\n    font-size: 5rem;\n    font-weight: 300;\n    cursor: pointer;\n    color: #333;\n    display: inline-block;\n    \n    @media(max-width: 800px) {\n      font-size: 5rem;\n    }\n    @media(max-width: 600px) {\n      font-size: 3rem;\n    }\n  }\n  \n  /** Site subtitle */\n  p {\n    color: #444;\n    letter-spacing: 2px;\n    font-size: 1.4rem;\n    margin: 0;\n    padding: 40px 0 48px;\n    font-weight: 300;\n    \n    @media(max-width: 600px) {\n      font-size: 1rem;\n      padding: 20px 0 20px 4px;\n      color: #222;\n    }\n  }\n\n"])));function P(n){var e=n.children;return(0,b.BX)("section",{className:C,children:[(0,b.tZ)(z,{}),(0,b.tZ)("main",{children:e})]})}var C=(0,o.iv)(j||(j=(0,i.Z)(["\n  max-width: 1024px;\n  width: 100%;\n\n  padding: 48px 64px;\n  @media(max-width: 1024px) {\n    padding: 32px 64px;\n    margin: 0;\n  }\n  @media(max-width: 600px) {\n    padding: 0;\n  }\n"])))},52542:function(n,e,t){t.d(e,{Z:function(){return p}});var r=t(92809),i=t(38456),o=t.n(i),a=t(76388),c=t.n(a),l=t(10043),d=t.n(l),s=t(8311);function u(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,r)}return t}function p(n){return(0,s.tZ)(o(),function(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?u(Object(t),!0).forEach((function(e){(0,r.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):u(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}({rehypePlugins:[c()],remarkPlugins:[d()]},n))}},58601:function(n,e,t){t.d(e,{v8:function(){return i},Ff:function(){return a},J8:function(){return c}});var r=t(86576);function i(n){return"".concat(o(n)).concat(n.idSuffix||"")}function o(n){switch(n.key){case"code":case"component":return n.filepath;case"terminal":return"@".concat(n.session);default:throw(0,r.Ql)(n)}}function a(n,e){return"".concat(n,"--tabs--").concat(e)}function c(n){return{global:{tabEnableRename:!1},layout:{type:"row",weight:100,children:[{type:"tabset",weight:50,selected:0,children:n.map((function(n){return{type:"tab",id:i(n),name:o(n),config:(0,r.I8)(n),enableClose:!1}}))}]}}}},39944:function(n,e,t){t.d(e,{x:function(){return a}});t(45697);var r=t(59748),i=r.useLayoutEffect,o=function(n){var e=(0,r.useRef)(n);return i((function(){e.current=n})),e},a=function(n){var e=o(n);(0,r.useEffect)((function(){var n=function(n){var t;if(null!=e.current&&(t=e.current(n)),n.defaultPrevented&&(n.returnValue=""),"string"===typeof t)return n.returnValue=t,t};return window.addEventListener("beforeunload",n),function(){window.removeEventListener("beforeunload",n)}}),[])}},73460:function(n,e,t){var r=t(59748),i=t(20296);function o(n){const e=[];if(!n||n===document.body)return e;const{overflow:t,overflowX:r,overflowY:i}=window.getComputedStyle(n);return[t,r,i].some((n=>"auto"===n||"scroll"===n))&&e.push(n),[...e,...o(n.parentElement)]}const a=["x","y","top","bottom","left","right","width","height"],c=(n,e)=>a.every((t=>n[t]===e[t]));e.Z=function({debounce:n,scroll:e,polyfill:t}={debounce:0,scroll:!1}){const a=t||("undefined"===typeof window?class{}:window.ResizeObserver);if(!a)throw new Error("This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills");const[l,d]=(0,r.useState)({left:0,top:0,width:0,height:0,bottom:0,right:0,x:0,y:0}),s=(0,r.useRef)({element:null,scrollContainers:null,resizeObserver:null,lastBounds:l}),u=n?"number"===typeof n?n:n.scroll:null,p=n?"number"===typeof n?n:n.resize:null,f=(0,r.useRef)(!1);(0,r.useEffect)((()=>(f.current=!0,()=>{f.current=!1})));const[h,m,b]=(0,r.useMemo)((()=>{const n=()=>{if(!s.current.element)return;const{left:n,top:e,width:t,height:r,bottom:i,right:o,x:a,y:l}=s.current.element.getBoundingClientRect(),u={left:n,top:e,width:t,height:r,bottom:i,right:o,x:a,y:l};Object.freeze(u),f.current&&!c(s.current.lastBounds,u)&&d(s.current.lastBounds=u)};return[n,p?(0,i.debounce)(n,p):n,u?(0,i.debounce)(n,u):n]}),[d,u,p]);function x(){s.current.scrollContainers&&(s.current.scrollContainers.forEach((n=>n.removeEventListener("scroll",b,!0))),s.current.scrollContainers=null),s.current.resizeObserver&&(s.current.resizeObserver.disconnect(),s.current.resizeObserver=null)}function g(){s.current.element&&(s.current.resizeObserver=new a(b),s.current.resizeObserver.observe(s.current.element),e&&s.current.scrollContainers&&s.current.scrollContainers.forEach((n=>n.addEventListener("scroll",b,{capture:!0,passive:!0}))))}var v,w,y;return v=b,w=Boolean(e),(0,r.useEffect)((()=>{if(w){const n=v;return window.addEventListener("scroll",n,{capture:!0,passive:!0}),()=>{window.removeEventListener("scroll",n,!0)}}}),[v,w]),y=m,(0,r.useEffect)((()=>{const n=y;return window.addEventListener("resize",n),()=>{window.removeEventListener("resize",n)}}),[y]),(0,r.useEffect)((()=>{x(),g()}),[e,b,m]),(0,r.useEffect)((()=>x),[]),[n=>{n&&n!==s.current.element&&(x(),s.current.element=n,s.current.scrollContainers=o(n),g())},l,h]}}}]);