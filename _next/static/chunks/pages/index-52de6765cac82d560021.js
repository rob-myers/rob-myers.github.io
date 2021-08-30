(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{52542:function(n,e,t){"use strict";t.d(e,{Z:function(){return w}});var i=t(52209),r=t(58377),o=t(92809),a=t(88823),l=t(11163),c=(t(59748),t(88269)),s=t(38456),d=t.n(s),u=t(76388),p=t.n(u),f=t(10043),m=t.n(f);function h(){var n=(0,i.Z)(["\n  h1 {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-size: 7.5rem;\n    font-weight: 300;\n    cursor: pointer;\n    margin: 48px 0 24px;\n    \n    @media(max-width: 1024px) {\n      margin: 12px 0 24px;\n      font-size: 6rem;\n    }\n    @media(max-width: 800px) {\n      font-size: 5rem;\n    }\n    @media(max-width: 400px) {\n      font-size: 3.3rem;\n    }\n  }\n  \n  p {// Site subtitle\n    color: #444;\n    margin: 0 0 32px 0;\n    padding-top: 16px;\n    letter-spacing: 1px;\n    font-size: 1rem;\n    font-family: monospace;\n   \n    @media(max-width: 800px) {\n      padding-top: 0;\n    }\n    @media(max-width: 400px) {\n      font-size: 0.8rem;\n    }\n  }\n"]);return h=function(){return n},n}function g(){var n=(0,i.Z)(["\n  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,\n    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;\n  font-size: 1.2rem;\n\n  h1, h2, h3, h4 {\n    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;\n    font-weight: 500;\n  }\n\n  @media(max-width: 540px) {\n    font-size: 1.1rem;\n  }\n  \n  p {\n    line-height: 1.5;\n  }\n  code {\n    font-size: 12pt;\n    font-family: Courier, monospace;\n    color: #444;\n    background: #eee;\n  }\n  ul, ol {\n    margin: 20px 0;\n    line-height: 1.4;\n    padding-left: var(--list-indent);\n\n    li {\n      margin: 8px 0;\n      ul, ol {\n        line-height: 1.2;\n      }\n    }\n  }\n  ul.contains-task-list {\n    padding-left: 12px;\n    li.task-list-item {\n      list-style: none;\n    }\n  }\n\n  span.float {\n    float: right;\n    color: #555;\n    @media(max-width: 480px) {\n      float: unset;\n      display: block;\n      margin-top: 8px;\n    }\n  }\n\n  table {\n    border: 1px solid #ccc;\n    border-left: 4px solid #999;\n\n    th, td {\n      text-align: left;\n      vertical-align: top;\n      padding: 8px;\n      @media(max-width: 540px) {\n        padding: 4px 2px;\n      }\n    }\n  }\n\n  hr {\n    margin: 32px 0 24px;\n    height: 4px;\n    background: #ddd;\n    border-color: #ddd;\n  }\n"]);return g=function(){return n},n}function x(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);e&&(i=i.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,i)}return t}function b(n){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?x(Object(t),!0).forEach((function(e){(0,o.Z)(n,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):x(Object(t)).forEach((function(e){Object.defineProperty(n,e,Object.getOwnPropertyDescriptor(t,e))}))}return n}function w(n){return(0,a.tZ)("div",{className:n.title?Z:O,children:(0,a.tZ)(d(),b({rehypePlugins:[p()],remarkPlugins:[m()],components:n.title?v:y},n))})}var v={h1(n){var{children:e}=n,t=(0,r.Z)(n,["children"]),i=(0,l.useRouter)();return(0,a.tZ)("h1",b(b({onClick:()=>i.push("/")},t),{},{children:e}))}},y={a(n){var{node:e,href:t,title:i,children:o}=n,l=(0,r.Z)(n,["node","href","title","children"]);return(0,a.tZ)("a",b(b(b(b({href:t},["@new-tab"].includes(i)&&{className:"new-tab-link",target:"_blank"}),{},{title:i},"#command"===t&&{onClick:n=>{n.preventDefault(),console.warn("link triggered command:",i)}}),l),{},{children:o}))},float(n){var{children:e}=n,t=(0,r.Z)(n,["children"]);return(0,a.tZ)("span",b(b({},t),{},{className:"float",style:b(b({},t.style),{},{fontSize:t.rem?"".concat(t.rem,"rem"):void 0}),children:e}))}},O=(0,c.iv)(g()),Z=(0,c.iv)(h())},22200:function(n,e,t){"use strict";t.d(e,{Z:function(){return o}});var i=t(88823),r=t(52542);function o(){return(0,i.tZ)(r.Z,{title:!0,children:"\n  # Rogue Markup\n\n  $( roguelike | built online | game ai )\n\n  ---\n"})}},12562:function(n,e,t){"use strict";t.r(e),t.d(e,{default:function(){return a}});var i=t(88823),r=t(52542),o=t(22200);function a(){return(0,i.tZ)("div",{className:"main",children:(0,i.BX)("section",{children:[(0,i.tZ)(o.Z,{}),(0,i.tZ)(r.Z,{children:"\n## Coming soon\n        "})]})})}},45301:function(n,e,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return t(12562)}])}},function(n){n.O(0,[774,488,888,179],(function(){return e=45301,n(n.s=e);var e}));var e=n.O();_N_E=e}]);