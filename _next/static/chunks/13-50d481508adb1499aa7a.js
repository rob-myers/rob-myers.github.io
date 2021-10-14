"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[13],{59885:function(n,t,e){e.d(t,{pq:function(){return r},Od:function(){return o},Ar:function(){return a}});var i=e(5152),r=(0,i.default)((function(){return Promise.all([e.e(126),e.e(135),e.e(209)]).then(e.bind(e,35209))}),{ssr:!1,loadableGenerated:{webpack:function(){return[35209]},modules:["../components/dynamic.tsx -> ./code/CodeEditor"]}}),o=(0,i.default)((function(){return Promise.all([e.e(142),e.e(586)]).then(e.bind(e,17586))}),{ssr:!1,loadableGenerated:{webpack:function(){return[17586]},modules:["../components/dynamic.tsx -> ./sh/XTerm"]}}),a=(0,i.default)((function(){return Promise.all([e.e(980),e.e(488),e.e(472),e.e(329)]).then(e.bind(e,76329))}),{ssr:!1,loadableGenerated:{webpack:function(){return[76329]},modules:["../components/dynamic.tsx -> ./page/Layout"]}})},24009:function(n,t,e){e.d(t,{Z:function(){return W}});var i,r=e(52209),o=e(79056),a=e(59748),c=e(73460),s=e(88269),u=e(86576),h=e(17928),l=e(11455),d=e(72328),f=e(92809),p=e(17120),x=e(30266),y=e(10219),g=e(809),m=e.n(g),b=e(11163),v=e(94184),w=e.n(v),k=e(58199),Z=e(8311);function O(){return(0,Z.tZ)("hr",{className:_})}var j,M,_=(0,s.iv)(i||(i=(0,r.Z)(["\n  margin: 0;\n  border-color: var(--focus-bg);\n\n  @media(min-width: 800px) {\n    padding-bottom: 80px;\n    border: 0;\n  }\n"]))),P=e(52542),S=e(59885);function z(n){var t=n.enabled,e=n.toggleEnabled;return(0,Z.BX)("div",{className:N,children:[(0,Z.tZ)("div",{className:w()("top-right",t&&"enabled"),onClick:t?e:void 0,children:"disable"}),!t&&(0,Z.tZ)("div",{className:w()("central",t&&"enabled"),onClick:e,children:"interact"})]})}var N=(0,s.iv)(j||(j=(0,r.Z)(["\n  font-family: Roboto, Arial, sans-serif;\n\n  > .top-right {\n    position: absolute;\n    right: -10px;\n    top: calc(-32px + 6px);\n    z-index: 2;\n    border-radius: 4px 4px 0 0;\n    padding: 2px 16px;\n    \n    cursor: pointer;\n    background: #333;\n    color: #777;\n    font-size: 14px;\n    font-weight: 300;\n    \n    &.enabled {\n      color: #fff;\n    }\n  }\n\n  > .central {\n    position: absolute;\n    z-index: 5;\n    left: calc(50% - (128px / 2));\n    top: calc(50% - 20px);\n    \n    cursor: pointer;\n    color: #ddd;\n    background: #000;\n    padding: 12px 32px;\n    border-radius: 4px;\n    border: 1px solid #ddd;\n    font-size: 1.2rem;\n\n    opacity: 1;\n    transition: 300ms opacity ease;\n    &.enabled {\n      opacity: 0;\n    }\n  }\n"])));function D(n){var t=n.colour;return(0,Z.tZ)("div",{className:w()(C,{clear:"clear"===t,faded:"faded"===t})})}var E,T,C=(0,s.iv)(M||(M=(0,r.Z)(["\n  &:not(.faded) {\n    pointer-events: none;\n  }\n\n  position: absolute;\n  z-index: 4;\n  width: inherit;\n  height: inherit;\n  background: #000;\n  font-family: sans-serif;\n\n  opacity: 1;\n  transition: opacity 1s ease-in;\n  &.clear {\n    opacity: 0;\n    transition: opacity 0.5s ease-in;\n  }\n  &.faded {\n    opacity: 0.5;\n    transition: opacity 0.5s ease-in;\n  }\n"])));function B(n){var t=a.default.useRef(null),e=a.default.useState("black"),i=(0,o.Z)(e,2),r=i[0],c=i[1],s=a.default.useState(!!n.enabled),u=(0,o.Z)(s,2),h=u[0],l=u[1];return a.default.useEffect((function(){c(h?"clear":"faded")}),[]),(0,Z.BX)("figure",{ref:t,className:w()("tabs","scrollable",R(n.height)),children:[(0,Z.tZ)("span",{id:n.id,className:"anchor"}),(0,Z.BX)("div",{className:X(n.height),children:["black"!==r&&(0,Z.tZ)(S.Ar,{id:n.id,tabs:n.tabs,rootRef:t}),(0,Z.tZ)(z,{enabled:h,toggleEnabled:function(){l(!h),c("clear"===r?"faded":"clear")}}),(0,Z.tZ)(D,{colour:r})]})]})}var A,R=function(n){return(0,s.iv)(E||(E=(0,r.Z)(["\n  background: var(--focus-bg);\n\n  @keyframes fadein {\n    from { opacity: 0; }\n    to   { opacity: 1; }\n  }\n\n  .flexlayout__tabset {\n    animation: fadein 1s;\n  }\n\n  .flexlayout__tabset, .flexlayout__tab {\n    background: white;\n  }\n\n  > .flexlayout__layout {\n    background: #444;\n    position: relative;\n    height: ","px;\n  }\n  .flexlayout__tab {\n    border-top: 6px solid #444;\n    position: relative;\n    /** Handle svg overflow */\n    overflow: hidden;\n  }\n  .flexlayout__tabset_tabbar_outer {\n    background: #222;\n    border-bottom: 1px solid #555;\n  }\n  .flexlayout__tab_button--selected, .flexlayout__tab_button:hover {\n    background: #444;\n  }\n  .flexlayout__tab_button_content {\n    user-select: none;\n    font-size: 13px;\n    color: #aaa;\n  }\n  .flexlayout__tab_button--selected .flexlayout__tab_button_content {\n    color: #fff;\n  }\n  .flexlayout__tab_button:hover:not(.flexlayout__tab_button--selected) .flexlayout__tab_button_content {\n    color: #ddd;\n  }\n  .flexlayout__splitter_vert, .flexlayout__splitter_horz {\n    background: #827575;\n  }\n"])),n)},X=function(n){return(0,s.iv)(T||(T=(0,r.Z)(["\n  width: 100%;\n  height: ","px;\n  position: relative;\n"])),n)},G=e(45172),J=e.n(G),K=["node","href","title","children"],L=["node","children"],q=["node","children"];function F(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,i)}return e}function H(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?F(Object(e),!0).forEach((function(t){(0,f.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):F(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function I(n){var t=(0,b.useRouter)(),e=a.default.useMemo((function(){var t=new Date(n.dateTime);return"".concat(t.getDate()).concat(function(n){if(n>3)return"th";if(1===n)return"st";if(2===n)return"nd";if(3===n)return"rd"}(t.getDate())," ").concat(U[t.getMonth()]," ").concat(t.getFullYear())}),[n.dateTime]),i=a.default.useMemo((function(){return V(n.articleKey,t)}),[n.articleKey]);return(0,Z.BX)(Z.HY,{children:[(0,Z.BX)("article",{className:w()(n.className,Y),children:[(0,Z.tZ)("span",{className:"anchor",id:"article-".concat(n.articleKey)}),(0,Z.tZ)("time",{dateTime:n.dateTime,children:e}),(0,Z.tZ)(P.Z,{children:n.children,components:i})]}),(0,Z.tZ)(O,{})]})}var Y=(0,s.iv)(A||(A=(0,r.Z)(["\n  line-height: 1.6;\n  background: var(--focus-bg);\n  border: var(--blog-border-width) solid var(--border-bg);\n  font-size: 1.1rem;\n  \n  padding: 64px 128px 96px 128px;\n  @media(max-width: 800px) {\n    padding: 32px 64px 48px 64px;\n  }\n  @media(max-width: 600px) {\n    padding: 8px 12px;\n    font-size: 1.1rem;\n    border: none;\n    line-height: 1.7;\n  }\n\n  a {\n    code {\n      color: unset;\n    }\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -96px;\n    }\n  }\n  a.new-tab-link::after {\n    display: inline-block;\n    content: '';\n    background-image: url('/icon/ext-link-icon.svg');\n    background-size: 13px 13px;\n    height: 13px;\n    width: 13px;\n    margin-left: 2px;\n  }\n  a.anchor-link::after {\n    display: inline-block;\n    content: '';\n    background-image: url('/icon/anchor-icon.svg');\n    background-size: 13px 13px;\n    height: 13px;\n    width: 13px;\n    margin: 0 2px 0 4px;\n  }\n\n  span.cmd {\n    color: #555;\n    background: #ddd;\n    font-family: monospace;\n    letter-spacing: 1px;\n    font-size: smaller;\n    padding: 2px 4px;\n    @media(max-width: 600px) {\n      user-select: all;\n    }\n  }\n\n  > span.anchor {\n    position: absolute;\n    top: -48px;\n  }\n\n  aside {\n    margin: 32px 0;\n    padding: 8px 32px;\n    border-radius: 8px;\n    border: 2px dashed #ccc;\n    font-size: 1.1rem;\n    @media(max-width: 600px) {\n      font-size: 1rem;\n      margin: 8px 0;\n      padding: 0 16px;\n    }\n\n    > figure.tabs {\n      padding: 8px 0;\n      @media(max-width: 600px) {\n        padding: 8px 0 12px;\n      }\n    }\n  }\n\n  blockquote {\n    margin: 32px 0;\n    border-left: 10px solid #ddd;\n    padding-left: 30px;\n    \n    @media(max-width: 600px) {\n      margin: 20px 0;\n      padding-left: 20px;\n    }\n  }\n\n  code {\n    font-family: sans-serif;\n    letter-spacing: 1px;\n    color: #444;\n    font-size: smaller;\n    letter-spacing: 2px;\n    padding: 0 2px;\n  }\n\n  figure {\n    margin: 0;\n  }\n  \n  figure.tabs {\n    border: 10px solid #333;\n    border-radius: 8px;\n    margin: 48px 0;\n    @media(max-width: 600px) {\n      margin: 32px 0;\n    }\n\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -96px;\n    }\n  }\n\n  h1, h2, h3, h4 {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-weight: 400;\n    a {\n      color: #008;\n    }\n  }\n  h2 {\n    font-size: 2.7rem;\n    @media(max-width: 600px) {\n      margin: 16px 0 24px;\n      font-size: 2rem;\n    }\n  }\n  h3 {\n    font-size: 1.8rem;\n    @media(max-width: 600px) {\n      font-size: 1.3em;\n    }\n\n    position: relative;\n    > span.anchor {\n      position: absolute;\n      top: -48px;\n    }\n  }\n\n  p {\n   margin: 32px 0;\n   @media(max-width: 600px) {\n     margin: 16px 0;\n   }\n  }\n\n  table {\n    padding: 8px;\n    border: 1px solid #bbb;\n    width: 100%;\n    margin: 32px 0;\n    @media(max-width: 600px) {\n      margin: 20px 0;\n    }\n    \n    th, td {\n      padding: 3px;\n      text-align: left;\n      vertical-align: top;\n      font-size: 1.1rem;\n      @media(max-width: 600px) {\n        font-size: 1rem;\n        padding: 4px 2px;\n      }\n    }\n  }\n\n  position: relative;\n  > time {\n    position: absolute;\n    right: -10px;\n    top: -50px;\n    width: 136px;\n\n    background: var(--border-bg);\n    text-align: center;\n    color: #555;\n    border-radius: 6px 6px 0 0;\n    padding: 12px;\n    font-size: 1rem;\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n\n    @media(max-width: 600px) {\n      top: 16px;\n      right: 0;\n      border-radius: 0 0 0 4px;\n      background: none;\n      font-size: 1.1rem;\n      width: unset;\n      margin-top: 8px;\n    }\n  }\n\n  ul, ol {\n    @media(max-width: 600px) {\n      padding-left: 20px;\n    }\n    + p {\n      padding-top: 6px;\n    }\n  }\n\n  ul li, ol li {\n    margin: 4px 0;\n  }\n\n"]))),V=function(n,t){return{a:function(i){i.node;var r=i.href,a=i.title,c=i.children;(0,y.Z)(i,K);if("@anchor"===a){var s="".concat(n,"--link-").concat($(c));return(0,Z.BX)(k.Z,{href:r,className:"anchor-link",title:a,prePush:"#".concat(s),children:[(0,Z.tZ)("span",{id:s,className:"anchor"}),c]})}if("@new-tab"===a)return(0,Z.tZ)("a",{href:r,title:a,className:"new-tab-link",target:"_blank",rel:"noopener",children:c});if("#command"===r)return(0,Z.tZ)("a",{href:r,title:a,onClick:function(){var n=(0,x.Z)(m().mark((function n(i){var r,c,s,u,h,d,f,x;return m().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:i.preventDefault(),r=a.split(" "),c=(0,p.Z)(r),s=c[0],u=c.slice(1),n.t0=s,n.next="open-tab"===n.t0?5:"sigkill"===n.t0?13:15;break;case 5:if(h=(0,o.Z)(u,2),d=h[0],f=h[1],!(x=l.Z.getState().tabs[d])){n.next=12;break}return x.selectTab(f),n.next=11,new Promise((function(n){return J().to(document.getElementById(d),500,n)}));case 11:t.push("#".concat(d));case 12:return n.abrupt("break",16);case 13:return Promise.all([e.e(980),e.e(472)]).then(e.bind(e,56127)).then((function(n){n.default.api.getSession(u[0]).ttyShell.xterm.sendSigKill()})),n.abrupt("break",16);case 15:console.warn("link triggered unrecognised command:",a);case 16:case"end":return n.stop()}}),n)})));return function(t){return n.apply(this,arguments)}}(),children:c});if(/^(?:http)|(?:mailto)/.test(r)){var u="".concat(n,"--link-").concat($(c));return(0,Z.BX)("a",{href:r,title:a,onClick:function(){var n=(0,x.Z)(m().mark((function n(t){return m().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return t.preventDefault(),n.next=3,new Promise((function(n){return J().to(document.getElementById(u),500,n)}));case 3:window.location.href="#".concat(u),window.location.href=r;case 5:case"end":return n.stop()}}),n)})));return function(t){return n.apply(this,arguments)}}(),children:[(0,Z.tZ)("span",{id:u,className:"anchor"}),c]})}return(0,Z.tZ)(k.Z,{href:r,title:a,children:c})},div:function(n){switch(n.class){case"tabs":var t=Number(n.height||100),e=a.default.useMemo((function(){return Function("return ".concat(n.tabs||"[]"))()}),[n.tabs]);return(0,Z.tZ)(B,{height:t,tabs:e,enabled:"true"===n.enabled,id:n.id});default:return(0,Z.tZ)("div",H({},n))}},h2:function(t){t.node;var e=t.children,i=(0,y.Z)(t,L);return(0,Z.tZ)("h2",H(H({},i),{},{children:(0,Z.tZ)(k.Z,{href:"#article-".concat(n),children:(0,Z.tZ)("a",{children:e})})}))},h3:function(t){t.node;var e=t.children,i=(0,y.Z)(t,q),r=a.default.useMemo((function(){return"".concat(n,"--").concat(a.default.Children.toArray(e)[0].toString().toLowerCase().replace(/\s/g,"-"))}),[]);return(0,Z.BX)("h3",H(H({},i),{},{children:[(0,Z.tZ)("span",{id:r,className:"anchor"}),(0,Z.tZ)(k.Z,{href:"#".concat(r),children:(0,Z.tZ)("a",{children:e})})]}))}}};function $(n){return a.default.Children.toArray(n)[0].toString().toLowerCase().replace(/\s/g,"-")}var Q,U=["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];function W(n){var t=n.keys,e=n.markdown,i=(0,a.useRef)(),r=(0,c.Z)({debounce:30,scroll:!0}),s=(0,o.Z)(r,2),f=s[0],p=s[1];return(0,a.useEffect)((function(){var n,e=Array.from((null===(n=i.current)||void 0===n?void 0:n.children)||[]).map((function(n,e){return{key:t[e],rect:d.U.fromJson(n.getBoundingClientRect()).delta(window.scrollX,window.scrollY)}}));l.Z.setState({articles:(0,u.Rw)(e)}),l.Z.api.updateArticleKey()}),[p]),(0,a.useEffect)((function(){return function(){t.forEach((function(n){return delete l.Z.getState().articles[n]})),l.Z.setState({})}}),[]),(0,Z.tZ)("ul",{className:nn,ref:function(n){f(n),n&&(i.current=n)},children:t.map((function(n){return(0,Z.tZ)("li",{children:(0,Z.tZ)(I,{articleKey:n,dateTime:h.mh[n].timestamp,children:e[n]||""})},n)}))})}var nn=(0,s.iv)(Q||(Q=(0,r.Z)(["\n  padding: 0;\n  margin: 0;\n  list-style: none;\n"])))},82308:function(n,t,e){e.d(t,{Z:function(){return P}});var i=e(52209),r=e(88269),o=e(11455);function a(){(0,o.Z)((function(n){return Object.values(n.tabs)}),(function(n,t){return n.length===t.length}));return null}var c,s=e(92809),u=e(10219),h=e(11163),l=e(94184),d=e.n(l),f=e(52542),p=e(17928),x=e(58199),y=e(55349),g=e(8311);function m(){var n=(0,o.Z)((function(n){return n.articleKey?p.mh[n.articleKey]:null})),t=null!==n&&void 0!==n&&n.prev?p.mh[n.prev]:null,e=null!==n&&void 0!==n&&n.next?p.mh[n.next]:null;return null!==n&&void 0!==n&&n.index?(0,g.tZ)("nav",{className:v,children:(0,g.BX)("ul",{children:[(0,g.tZ)("li",{children:(0,g.tZ)(x.Z,{href:(0,p.Gu)(t||n),children:(0,g.tZ)("span",{className:"prev",children:"prev"})})}),(0,g.tZ)("li",{children:(0,g.tZ)(x.Z,{href:(0,p.Gu)(n),children:(0,g.tZ)("a",{className:"primary",children:n.index})})}),(0,g.tZ)("li",{children:(0,g.tZ)(x.Z,{href:(0,p.Gu)(e||n),forward:!0,children:(0,g.tZ)("span",{className:"next",children:"next"})})})]})}):null}var b,v=(0,r.iv)(c||(c=(0,i.Z)(["\n  position: absolute;\n  z-index: 10;\n  right: ","px;\n  top: -48px;\n  @media(max-width: 1024px) { top: -32px; }\n  @media(max-width: 600px) { top: 0; }\n\n  font-size: 1rem;\n\n  > ul {\n    position: fixed;\n    width: ","px;\n    height: ","px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: 0;\n    margin: 0;\n\n    li {\n      list-style: none;\n      list-style-position: inside;\n      padding: 0 5px;\n    }\n    a {\n      color: #ccc;\n    }\n    a.primary {\n      color: #fff;\n    }\n  }\n"])),140,140,y.M),w=["children"];function k(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,i)}return e}function Z(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?k(Object(e),!0).forEach((function(t){(0,s.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):k(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function O(){return(0,g.BX)("header",{className:d()("title",_),children:[(0,g.tZ)(m,{}),(0,g.tZ)(f.Z,{components:M,children:"\n# Rogue Markup\n\n$( game ai | roguelike | web dev )\n      "})]})}var j,M={h1:function(n){var t=n.children,e=(0,u.Z)(n,w),i=(0,h.useRouter)();return(0,g.tZ)("h1",Z(Z({onClick:function(){return i.push("/")}},e),{},{children:t}))}},_=(0,r.iv)(b||(b=(0,i.Z)(["\n  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n  position: relative;\n\n  @media(max-width: 600px) {\n    padding-left: 8px;\n    border-bottom: 2px solid #999;\n    border: 0 solid #000;\n    padding-top: 64px;\n  }\n  padding-top: 40px;\n\n  h1 {\n    margin: 0;\n    font-size: 6rem;\n    font-weight: 300;\n    cursor: pointer;\n    color: #333;\n    display: inline-block;\n    \n    @media(max-width: 800px) {\n      font-size: 5rem;\n    }\n    @media(max-width: 600px) {\n      font-size: 3rem;\n    }\n  }\n  \n  /** Site subtitle */\n  p {\n    color: #444;\n    letter-spacing: 2px;\n    font-size: 1.4rem;\n    margin: 0;\n    padding: 40px 0 48px;\n    font-weight: 300;\n    \n    @media(max-width: 600px) {\n      font-size: 1rem;\n      padding: 20px 0 20px 4px;\n      color: #222;\n    }\n  }\n\n"])));function P(n){var t=n.children;return(0,g.BX)(g.HY,{children:[(0,g.tZ)(a,{}),(0,g.BX)("section",{className:S,children:[(0,g.tZ)(O,{}),(0,g.tZ)("main",{children:t})]})]})}var S=(0,r.iv)(j||(j=(0,i.Z)(["\n  max-width: 1024px;\n  width: 100%;\n\n  padding: 48px 64px;\n  @media(max-width: 1024px) {\n    padding: 32px 64px;\n    margin: 0;\n  }\n  @media(max-width: 600px) {\n    padding: 0;\n  }\n"])))},52542:function(n,t,e){e.d(t,{Z:function(){return d}});var i=e(92809),r=e(38456),o=e.n(r),a=e(76388),c=e.n(a),s=e(10043),u=e.n(s),h=e(8311);function l(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,i)}return e}function d(n){return(0,h.tZ)(o(),function(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?l(Object(e),!0).forEach((function(t){(0,i.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):l(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}({rehypePlugins:[c()],remarkPlugins:[u()]},n))}},86576:function(n,t,e){e.d(t,{I8:function(){return p},IC:function(){return x},Ql:function(){return y},Z$:function(){return g},wO:function(){return m},or:function(){return b},Rw:function(){return v},$G:function(){return w},Q8:function(){return k},BH:function(){return Z},RT:function(){return O}});var i=e(79056),r=e(68216),o=e(92809),a=e(97131),c=e(809),s=e.n(c),u=e(87668),h=e.n(u),l=s().mark(j);function d(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,i)}return e}function f(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?d(Object(e),!0).forEach((function(t){(0,o.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):d(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function p(n){return JSON.parse(JSON.stringify(n))}function x(n){return JSON.stringify(n,null,"\t")}function y(n){return"testNever: ".concat(x(n)," not implemented.")}function g(n){return n[n.length-1]}function m(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return new Promise((function(t){return setTimeout((function(){return t()}),n)}))}function b(n){return"function"===typeof n?function(n){return n.trim().replace(/\s\s+/g," ").trim()}("".concat(n)):function(n){try{var t=[];return JSON.stringify(n,(function(n,e){return"function"===typeof e?"[Function]".concat((t=Object.keys(e)).length?" ...{".concat(t,"} "):""):e}))}catch(e){}}(n)||h()(n,(function(n,t){return t instanceof HTMLElement?"HTMLElement[".concat(t.nodeName,"]"):t}))}function v(n){return n.reduce((function(n,t){return f(f({},n),{},(0,o.Z)({},t.key,t))}),{})}function w(n){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:50;return n.length<=t?n:"".concat(n.slice(0,t)," ...")}function k(n,t){var e,i={};return(e=n,Object.keys(e)).forEach((function(e){return i[e]=t(n[e])})),i}var Z=function n(){var t=this;(0,r.Z)(this,n),(0,o.Z)(this,"resolve",null),(0,o.Z)(this,"reject",null),(0,o.Z)(this,"promise",new Promise((function(n,e){t.resolve=n,t.reject=e})))};function O(n){return Array.from(j(n))}function j(n){var t,e,r,o,c,u,h=arguments;return s().wrap((function(s){for(;;)switch(s.prev=s.next){case 0:t=h.length>1&&void 0!==h[1]?h[1]:[],s.t0=null===n||void 0===n?void 0:n.constructor,s.next=s.t0===Object?4:12;break;case 4:e=0,r=Object.entries(n);case 5:if(!(e<r.length)){s.next=11;break}return o=(0,i.Z)(r[e],2),c=o[0],u=o[1],s.delegateYield(j(u,[].concat((0,a.Z)(t),[c])),"t1",8);case 8:e++,s.next=5;break;case 11:return s.abrupt("break",14);case 12:return s.next=14,t.join("/");case 14:case"end":return s.stop()}}),l)}},72328:function(n,t,e){e.d(t,{U:function(){return c}});var i=e(97131),r=e(68216),o=e(25997),a=e(49345),c=function(){function n(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0;(0,r.Z)(this,n),this.x=t,this.y=e,this.width=i,this.height=o}return(0,o.Z)(n,[{key:"area",get:function(){return this.width*this.height}},{key:"bottom",get:function(){return this.y+this.height}},{key:"bottomLeft",get:function(){return new a.d(this.x,this.y+this.height)}},{key:"bottomRight",get:function(){return new a.d(this.x+this.width,this.y+this.height)}},{key:"center",get:function(){return new a.d(this.cx,this.cy)}},{key:"cx",get:function(){return this.x+.5*this.width}},{key:"cy",get:function(){return this.y+.5*this.height}},{key:"geoJson",get:function(){return{type:"Polygon",coordinates:[[[this.x,this.y],[this.x+this.width,this.y],[this.x+this.width,this.y+this.height],[this.x,this.y+this.height]]]}}},{key:"json",get:function(){return{x:this.x,y:this.y,width:this.width,height:this.height}}},{key:"key",get:function(){return"".concat(this.x,",").concat(this.y,",").concat(this.width,",").concat(this.height)}},{key:"dimension",get:function(){return Math.max(this.width,this.height)}},{key:"points",get:function(){return[new a.d(this.x,this.y),new a.d(this.x,this.y+this.height),new a.d(this.x+this.width,this.y+this.height),new a.d(this.x+this.width,this.y)]}},{key:"right",get:function(){return this.x+this.width}},{key:"topLeft",get:function(){return new a.d(this.x,this.y)}},{key:"topRight",get:function(){return new a.d(this.x+this.width,this.y)}},{key:"applyMatrix",value:function(n){if(!n.isIdentity){var t=n.transformPoint(this.topLeft),e=n.transformPoint(this.bottomRight);this.x=Math.min(t.x,e.x),this.y=Math.min(t.y,e.y),this.width=Math.max(t.x,e.x)-this.x,this.height=Math.max(t.y,e.y)-this.y}return this}},{key:"clone",value:function(){return new n(this.x,this.y,this.width,this.height)}},{key:"contains",value:function(n){var t=n.x,e=n.y;return this.x<=t&&t<=this.x+this.width&&this.y<=e&&e<=this.y+this.height}},{key:"copy",value:function(n){var t=n.x,e=n.y,i=n.width,r=n.height;return this.x=t,this.y=e,this.width=i,this.height=r,this}},{key:"covers",value:function(n){var t=n.x,e=n.y,i=n.width,r=n.height;return this.x<=t&&t+i<=this.x+this.width&&this.y<=e&&e+r<=this.y+this.height}},{key:"delta",value:function(n,t){return this.x+=n,this.y+=t,this}},{key:"inset",value:function(n){var t=[this.cx,this.cy],e=t[0],i=t[1];return this.outset(-n),this.width<0&&(this.x=e,this.width=0),this.height<0&&(this.y=i,this.height=0),this}},{key:"intersects",value:function(n){return 2*Math.abs(this.cx-n.cx)<=this.width+n.width&&2*Math.abs(this.cy-n.cy)<=this.height+n.height}},{key:"offset",value:function(n){var t=n.x,e=n.y;return this.x+=t,this.y+=e,this}},{key:"outset",value:function(n){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n;return this.x-=n,this.y-=t,this.width+=2*n,this.height+=2*t,this}},{key:"scale",value:function(n){return this.x*=n,this.y*=n,this.width*=n,this.height*=n,this}},{key:"setPosition",value:function(n){return this.x=n.x,this.y=n.y,this}},{key:"toString",value:function(){return"".concat(this.x,",").concat(this.y,",").concat(this.width,",").concat(this.height)}}],[{key:"zero",get:function(){return new n(0,0,0,0)}},{key:"from",value:function(){for(var t=arguments.length,e=new Array(t),r=0;r<t;r++)e[r]=arguments[r];if(e.length){if(e[0]instanceof a.d){var o=e,c=Math.min.apply(Math,(0,i.Z)(o.map((function(n){return n.x})))),s=Math.min.apply(Math,(0,i.Z)(o.map((function(n){return n.y})))),u=Math.max.apply(Math,(0,i.Z)(o.map((function(n){return n.x})))),h=Math.max.apply(Math,(0,i.Z)(o.map((function(n){return n.y}))));return new n(c,s,u-c,h-s)}var l=e,d=Math.min.apply(Math,(0,i.Z)(l.map((function(n){return n.x})))),f=Math.min.apply(Math,(0,i.Z)(l.map((function(n){return n.y})))),p=Math.max.apply(Math,(0,i.Z)(l.map((function(n){return n.x+n.width})))),x=Math.max.apply(Math,(0,i.Z)(l.map((function(n){return n.y+n.height}))));return new n(d,f,p-d,x-f)}return n.zero}},{key:"fromJson",value:function(t){return new n(t.x,t.y,t.width,t.height)}}]),n}()},49345:function(n,t,e){e.d(t,{d:function(){return o}});var i=e(68216),r=e(25997),o=function(){function n(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;(0,i.Z)(this,n),this.x=t,this.y=e}return(0,r.Z)(n,[{key:"angle",get:function(){return Math.atan2(this.y,this.x)}},{key:"coord",get:function(){return[this.x,this.y]}},{key:"json",get:function(){return{x:this.x,y:this.y}}},{key:"length",get:function(){return Math.sqrt(this.x*this.x+this.y*this.y)}},{key:"lengthSquared",get:function(){return this.x*this.x+this.y*this.y}},{key:"add",value:function(n){var t=n.x,e=n.y;return this.translate(t,e)}},{key:"addScaledVector",value:function(n,t){return this.x+=n.x*t,this.y+=n.y*t,this}},{key:"clone",value:function(){return new n(this.x,this.y)}},{key:"copy",value:function(n){return this.set(n.x,n.y)}},{key:"distanceTo",value:function(n){return Math.hypot(n.x-this.x,n.y-this.y)}},{key:"distanceToSquared",value:function(n){return Math.pow(n.x-this.x,2)+Math.pow(n.y-this.y,2)}},{key:"dot",value:function(n){return this.x*n.x+this.y*n.y}},{key:"dotArgs",value:function(n,t){return this.x*n+this.y*t}},{key:"equals",value:function(n){var t=n.x,e=n.y;return this.x===t&&this.y===e}},{key:"normalize",value:function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1;return this.length?this.scale(n/this.length):(console.error("Cannot normalize Vect '".concat(this,"' to length '").concat(n,"'")),this)}},{key:"precision",value:function(n){return this.set(Number(this.x.toFixed(n)),Number(this.y.toFixed(n)))}},{key:"rotate",value:function(n){var t=[this.x,this.y],e=t[0],i=t[1];return this.x=Math.cos(n)*e-Math.sin(n)*i,this.y=Math.sin(n)*e+Math.cos(n)*i,this}},{key:"round",value:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},{key:"scale",value:function(n){return this.x*=n,this.y*=n,this}},{key:"set",value:function(n,t){return this.x=n,this.y=t,this}},{key:"sub",value:function(n){var t=n.x,e=n.y;return this.translate(-t,-e)}},{key:"subVectors",value:function(n,t){return this.x=n.x-t.x,this.y=n.y-t.y,this}},{key:"toString",value:function(){return"".concat(this.x,",").concat(this.y)}},{key:"translate",value:function(n,t){return this.x+=n,this.y+=t,this}}],[{key:"zero",get:function(){return new n(0,0)}},{key:"average",value:function(t){return t.length?t.reduce((function(n,t){return n.add(t)}),n.zero).scale(1/t.length):n.zero}},{key:"from",value:function(t){return Array.isArray(t)?new n(t[0],t[1]):new n(t.x,t.y)}}]),n}()}}]);