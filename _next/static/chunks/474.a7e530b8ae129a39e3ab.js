(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[474],{66595:function(e){function t(e){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}t.keys=function(){return[]},t.resolve=t,t.id=66595,e.exports=t},80557:function(e,t,s){"use strict";s.r(t),s.d(t,{parseService:function(){return h}});var a=s(26265),n=s(70298),r="unassigned-tty",i=s(29950);function o(e,t){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),s.push.apply(s,a)}return s}function l(e){for(var t=1;t<arguments.length;t++){var s=null!=arguments[t]?arguments[t]:{};t%2?o(Object(s),!0).forEach((function(t){(0,a.Z)(e,t,s[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(s)):o(Object(s)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(s,t))}))}return e}var h=new class{constructor(){(0,a.Z)(this,"mockMeta",void 0),(0,a.Z)(this,"mockPos",void 0),(0,a.Z)(this,"pos",(e=>{var{Line:t,Col:s,Offset:a}=e;return{Line:t(),Col:s(),Offset:a()}})),(0,a.Z)(this,"base",(e=>{var{Pos:t,End:s}=e;return{meta:this.mockMeta,parent:null}})),(0,a.Z)(this,"ArithmCmd",(e=>{var{Pos:t,End:s,Left:a,Right:n,Unsigned:r,X:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ArithmCmd",Left:this.pos(a),Right:this.pos(n),Unsigned:r,X:this.ArithmExpr(i)})})),(0,a.Z)(this,"ArithmExp",(e=>{var{Pos:t,End:s,Bracket:a,Left:n,Right:r,Unsigned:i,X:o}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ArithmExp",Bracket:a,Left:this.pos(n),Right:this.pos(r),Unsigned:i,X:this.ArithmExpr(o)})})),(0,a.Z)(this,"ArrayElem",(e=>{var{Pos:t,End:s,Comments:a,Index:n,Value:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ArrayElem",Comments:a.map(this.Comment),Index:n?this.ArithmExpr(n):null,Value:this.Word(r)})})),(0,a.Z)(this,"ArithmExpr",(e=>"Y"in e?this.BinaryArithm(e):"Post"in e?this.UnaryArithm(e):"Lparen"in e?this.ParenArithm(e):this.Word(e))),(0,a.Z)(this,"ArrayExpr",(e=>{var{Pos:t,End:s,Elems:a,Last:n,Lparen:r,Rparen:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ArrayExpr",Elems:a.map(this.ArrayElem),Last:n.map(this.Comment),Lparen:this.pos(r),Rparen:this.pos(i)})})),(0,a.Z)(this,"Assign",(e=>{var{Pos:t,End:s,Append:a,Array:n,Index:r,Naked:i,Name:o,Value:h}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Assign",Append:a,Array:n?this.ArrayExpr(n):null,Index:r?this.ArithmExpr(r):null,Naked:i,Name:this.Lit(o),Value:h?this.Word(h):h})})),(0,a.Z)(this,"BinaryArithm",(e=>{var{Pos:t,End:s,Op:a,OpPos:n,X:r,Y:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"BinaryArithm",Op:this.op(a),OpPos:this.pos(n),X:this.ArithmExpr(r),Y:this.ArithmExpr(i)})})),(0,a.Z)(this,"BinaryCmd",(e=>{var{Pos:t,End:s,Op:a,OpPos:n,X:r,Y:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"BinaryCmd",Op:this.op(a),OpPos:this.pos(n),X:this.Stmt(r),Y:this.Stmt(i)})})),(0,a.Z)(this,"BinaryTest",(e=>{var{Pos:t,End:s,Op:a,OpPos:n,X:r,Y:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"BinaryTest",Op:this.op(a),OpPos:this.pos(n),X:this.TestExpr(r),Y:this.TestExpr(i)})})),(0,a.Z)(this,"Block",(e=>{var{Pos:t,End:s,Lbrace:a,Rbrace:n,Stmts:r,Last:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Block",Lbrace:this.pos(a),Rbrace:this.pos(n),Stmts:r.map((e=>this.Stmt(e))),Last:i.map(this.Comment)})})),(0,a.Z)(this,"CallExpr",(e=>{var{Pos:t,End:s,Args:a,Assigns:n}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"CallExpr",Args:a.map(this.Word),Assigns:n.map(this.Assign)})})),(0,a.Z)(this,"CaseClause",(e=>{var{Pos:t,End:s,Case:a,Esac:n,Items:r,Last:i,Word:o}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"CaseClause",Case:this.pos(a),Esac:this.pos(n),Items:r.map(this.CaseItem),Last:i.map(this.Comment),Word:this.Word(o)})})),(0,a.Z)(this,"CaseItem",(e=>{var{Pos:t,End:s,Comments:a,Op:n,OpPos:r,Patterns:i,Stmts:o}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"CaseItem",Comments:a.map(this.Comment),Op:this.op(n),OpPos:this.pos(r),Patterns:i.map(this.Word),Stmts:o.map((e=>this.Stmt(e)))})})),(0,a.Z)(this,"CmdSubst",(e=>{var{Pos:t,End:s,Left:a,ReplyVar:n,Right:r,Stmts:i,TempFile:o}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"CmdSubst",Left:this.pos(a),ReplyVar:n,Right:this.pos(r),Stmts:i.map((e=>this.Stmt(e))),TempFile:o})})),(0,a.Z)(this,"Comment",(e=>{var{Pos:t,End:s,Hash:a,Text:n}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Comment",Hash:this.pos(a),Text:n})})),(0,a.Z)(this,"CStyleLoop",(e=>{var{Pos:t,End:s,Cond:a,Init:n,Lparen:r,Post:i,Rparen:o}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"CStyleLoop",Cond:this.ArithmExpr(a),Init:this.ArithmExpr(n),Lparen:this.pos(r),Post:this.ArithmExpr(i),Rparen:this.pos(o)})})),(0,a.Z)(this,"Command",(e=>"Args"in e&&!("Variant"in e)?this.CallExpr(e):"FiPos"in e?this.IfClause(e):"WhilePos"in e?this.WhileClause(e):"ForPos"in e?this.ForClause(e):"Case"in e?this.CaseClause(e):"Lbrace"in e?this.Block(e):"Lparen"in e?this.Subshell(e):"Y"in e?this.BinaryCmd(e):"Body"in e?this.FuncDecl(e):"Unsigned"in e?this.ArithmCmd(e):"X"in e?this.TestClause(e):"Variant"in e?this.DeclClause(e):"Let"in e?this.LetClause(e):"Time"in e?this.TimeClause(e):this.CoprocClause(e))),(0,a.Z)(this,"CoprocClause",(e=>{var{Pos:t,End:s,Coproc:a,Name:n,Stmt:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"CoprocClause",Coproc:this.pos(a),Name:n?this.Lit(n):null,Stmt:this.Stmt(r)})})),(0,a.Z)(this,"DblQuoted",(e=>{var{Pos:t,End:s,Dollar:a,Parts:n,Left:r,Right:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"DblQuoted",Dollar:a,Parts:n.map(this.WordPart),Left:this.pos(r),Right:this.pos(i)})})),(0,a.Z)(this,"DeclClause",(e=>{var{Pos:t,End:s,Args:a,Variant:n}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"DeclClause",Args:a.map(this.Assign),Variant:this.Lit(n)})})),(0,a.Z)(this,"ExtGlob",(e=>{var{Pos:t,End:s,Op:a,OpPos:n,Pattern:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ExtGlob",Op:this.op(a),OpPos:this.pos(n),Pattern:this.Lit(r)})})),(0,a.Z)(this,"File",(e=>{var{Name:t,Stmts:s}=e;return l(l({},this.base({Pos:this.mockPos,End:this.mockPos})),{},{type:"File",Name:t,Stmts:s.map((e=>this.Stmt(e))),meta:this.mockMeta})})),(0,a.Z)(this,"ForClause",(e=>{var{Pos:t,End:s,Do:a,DonePos:n,DoPos:r,ForPos:i,Loop:o,Select:h}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ForClause",Do:a.map((e=>this.Stmt(e))),DonePos:this.pos(n),DoPos:this.pos(r),ForPos:this.pos(i),Loop:this.Loop(o),Select:h})})),(0,a.Z)(this,"FuncDecl",(e=>{var{Pos:t,End:s,Body:a,Name:n,Position:r,RsrvWord:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"FuncDecl",Body:this.Stmt(a),Name:this.Lit(n),Position:this.pos(r),RsrvWord:i})})),(0,a.Z)(this,"IfClause",(e=>{var{Pos:t,End:s,Cond:a,CondLast:n,Else:r,FiPos:i,Then:o,ThenLast:h,ThenPos:m,Last:p}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"IfClause",ThenPos:this.pos(m),FiPos:this.pos(i),Cond:a.map((e=>this.Stmt(e))),CondLast:(n||[]).map(this.Comment),Then:o.map((e=>this.Stmt(e))),ThenLast:(h||[]).map(this.Comment),Else:r?this.IfClause(r):null,Last:p.map(this.Comment)})})),(0,a.Z)(this,"LetClause",(e=>{var{Pos:t,End:s,Exprs:a,Let:n}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"LetClause",Exprs:a.map(this.ArithmExpr),Let:this.pos(n)})})),(0,a.Z)(this,"Lit",(e=>{var{Pos:t,End:s,Value:a,ValueEnd:n,ValuePos:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Lit",Value:a,ValueEnd:this.pos(n),ValuePos:this.pos(r)})})),(0,a.Z)(this,"Loop",(e=>"Name"in e?this.WordIter(e):this.CStyleLoop(e))),(0,a.Z)(this,"ParamExp",(e=>{var{Pos:t,End:s,Dollar:a,Excl:n,Exp:r,Index:i,Length:o,Names:h,Param:m,Rbrace:p,Repl:u,Short:d,Slice:v,Width:P}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ParamExp",Dollar:this.pos(a),Excl:n,Exp:r?{type:"Expansion",Op:this.op(r.Op),Word:r.Word?this.Word(r.Word):null}:null,Index:i?this.ArithmExpr(i):null,Length:o,Names:h?this.op(h):null,Param:this.Lit(m),Rbrace:this.pos(p),Repl:u?{type:"Replace",All:u.All,Orig:this.Word(u.Orig),With:u.With?this.Word(u.With):null}:null,Short:d,Slice:v?{type:"Slice",Length:v.Length?this.ArithmExpr(v.Length):null,Offset:this.ArithmExpr(v.Offset)}:null,Width:P})})),(0,a.Z)(this,"ParenArithm",(e=>{var{Pos:t,End:s,Lparen:a,Rparen:n,X:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ParenArithm",Lparen:this.pos(a),Rparen:this.pos(n),X:this.ArithmExpr(r)})})),(0,a.Z)(this,"ParenTest",(e=>{var{Pos:t,End:s,Lparen:a,Rparen:n,X:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ParenTest",Lparen:this.pos(a),Rparen:this.pos(n),X:this.TestExpr(r)})})),(0,a.Z)(this,"ProcSubst",(e=>{var{Pos:t,End:s,Op:a,OpPos:n,Rparen:r,Stmts:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"ProcSubst",Op:this.op(a),OpPos:this.pos(n),Rparen:this.pos(r),Stmts:i.map((e=>this.Stmt(e)))})})),(0,a.Z)(this,"Redirect",(e=>{var{Pos:t,End:s,Hdoc:a,N:n,Op:r,OpPos:i,Word:o}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Redirect",Hdoc:a?this.Word(a):null,N:n?this.Lit(n):null,Op:this.op(r),OpPos:this.pos(i),Word:this.Word(o)})})),(0,a.Z)(this,"SglQuoted",(e=>{var{Pos:t,End:s,Dollar:a,Left:n,Right:r,Value:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"SglQuoted",Dollar:a,Left:this.pos(n),Right:this.pos(r),Value:i})})),(0,a.Z)(this,"Stmt",(e=>{var{Pos:t,End:s,Background:a,Cmd:n,Comments:r,Coprocess:i,Negated:o,Position:h,Redirs:m,Semicolon:p}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Stmt",Background:a,Cmd:n?this.Command(n):null,Comments:r.map(this.Comment),Coprocess:i,Negated:o,Position:this.pos(h),Redirs:m.map(this.Redirect),Semicolon:this.pos(p)})})),(0,a.Z)(this,"Subshell",(e=>{var{Pos:t,End:s,Lparen:a,Rparen:n,Stmts:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Subshell",Lparen:this.pos(a),Rparen:this.pos(n),Stmts:r.map(this.Stmt)})})),(0,a.Z)(this,"TestClause",(e=>{var{Pos:t,End:s,Left:a,Right:n,X:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"TestClause",Left:this.pos(a),Right:this.pos(n),X:this.TestExpr(r)})})),(0,a.Z)(this,"TestExpr",(e=>"Y"in e?this.BinaryTest(e):"Op"in e?this.UnaryTest(e):"X"in e?this.ParenTest(e):this.Word(e))),(0,a.Z)(this,"TimeClause",(e=>{var{Pos:t,End:s,PosixFormat:a,Stmt:n,Time:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"TimeClause",PosixFormat:a,Stmt:n?this.Stmt(n):null,Time:this.pos(r)})})),(0,a.Z)(this,"UnaryArithm",(e=>{var{Pos:t,End:s,Op:a,OpPos:n,Post:r,X:i}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"UnaryArithm",Op:this.op(a),OpPos:this.pos(n),Post:r,X:this.ArithmExpr(i)})})),(0,a.Z)(this,"UnaryTest",(e=>{var{Pos:t,End:s,Op:a,OpPos:n,X:r}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"UnaryTest",Op:this.op(a),OpPos:this.pos(n),X:this.TestExpr(r)})})),(0,a.Z)(this,"WhileClause",(e=>{var{Pos:t,End:s,Cond:a,Do:n,DonePos:r,DoPos:i,Until:o,WhilePos:h}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"WhileClause",Cond:a.map((e=>this.Stmt(e))),Do:n.map((e=>this.Stmt(e))),DonePos:this.pos(r),DoPos:this.pos(i),Until:o,WhilePos:this.pos(h)})})),(0,a.Z)(this,"Word",(e=>{var{Pos:t,End:s,Parts:a}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"Word",Parts:a.map(this.WordPart)})})),(0,a.Z)(this,"WordIter",(e=>{var{Pos:t,End:s,Items:a,Name:n}=e;return l(l({},this.base({Pos:t,End:s})),{},{type:"WordIter",Items:a.map(this.Word),Name:this.Lit(n)})})),(0,a.Z)(this,"WordPart",(e=>"ValuePos"in e?this.Lit(e):"Value"in e?this.SglQuoted(e):"Parts"in e?this.DblQuoted(e):"Slice"in e?this.ParamExp(e):"TempFile"in e?this.CmdSubst(e):"X"in e?this.ArithmExp(e):"Stmts"in e?this.ProcSubst(e):this.ExtGlob(e))),(0,a.Z)(this,"opMetas",[{name:"illegalTok",value:null},{name:"_EOF",value:null},{name:"_Newl",value:null},{name:"_Lit",value:null},{name:"_LitWord",value:null},{name:"_LitRedir",value:null},{name:"sglQuote",value:"'"},{name:"dblQuote",value:'"'},{name:"bckQuote",value:"`"},{name:"and",value:"&"},{name:"andAnd",value:"&&"},{name:"orOr",value:"||"},{name:"or",value:"|"},{name:"orAnd",value:"|&"},{name:"dollar",value:"$"},{name:"dollSglQuote",value:"$'"},{name:"dollDblQuote",value:'$"'},{name:"dollBrace",value:"${"},{name:"dollBrack",value:"$["},{name:"dollParen",value:"$("},{name:"dollDblParen",value:"$(("},{name:"leftBrack",value:"["},{name:"dblLeftBrack",value:"[["},{name:"leftParen",value:"("},{name:"dblLeftParen",value:"(("},{name:"rightBrace",value:"}"},{name:"rightBrack",value:"]"},{name:"rightParen",value:")"},{name:"dblRightParen",value:"))"},{name:"semicolon",value:";"},{name:"dblSemicolon",value:";;"},{name:"semiAnd",value:";&"},{name:"dblSemiAnd",value:";;&"},{name:"semiOr",value:";|"},{name:"exclMark",value:"!"},{name:"tilde",value:"~"},{name:"addAdd",value:"++"},{name:"subSub",value:"--"},{name:"star",value:"*"},{name:"power",value:"**"},{name:"equal",value:"=="},{name:"nequal",value:"!="},{name:"lequal",value:"<="},{name:"gequal",value:">="},{name:"addAssgn",value:"+="},{name:"subAssgn",value:"-="},{name:"mulAssgn",value:"*="},{name:"quoAssgn",value:"/="},{name:"remAssgn",value:"%="},{name:"andAssgn",value:"&="},{name:"orAssgn",value:"|="},{name:"xorAssgn",value:"^="},{name:"shlAssgn",value:"<<="},{name:"shrAssgn",value:">>="},{name:"rdrOut",value:">"},{name:"appOut",value:">>"},{name:"rdrIn",value:"<"},{name:"rdrInOut",value:"<>"},{name:"dplIn",value:"<&"},{name:"dplOut",value:">&"},{name:"clbOut",value:">|"},{name:"hdoc",value:"<<"},{name:"dashHdoc",value:"<<-"},{name:"wordHdoc",value:"<<<"},{name:"rdrAll",value:"&>"},{name:"appAll",value:"&>>"},{name:"cmdIn",value:"<("},{name:"cmdOut",value:">("},{name:"plus",value:"+"},{name:"colPlus",value:":+"},{name:"minus",value:"-"},{name:"colMinus",value:":-"},{name:"quest",value:"?"},{name:"colQuest",value:":?"},{name:"assgn",value:"="},{name:"colAssgn",value:":="},{name:"perc",value:"%"},{name:"dblPerc",value:"%%"},{name:"hash",value:"#"},{name:"dblHash",value:"##"},{name:"caret",value:"^"},{name:"dblCaret",value:"^^"},{name:"comma",value:","},{name:"dblComma",value:",,"},{name:"at",value:"@"},{name:"slash",value:"/"},{name:"dblSlash",value:"//"},{name:"colon",value:":"},{name:"tsExists",value:"-e"},{name:"tsRegFile",value:"-f"},{name:"tsDirect",value:"-d"},{name:"tsCharSp",value:"-c"},{name:"tsBlckSp",value:"-b"},{name:"tsNmPipe",value:"-p"},{name:"tsSocket",value:"-S"},{name:"tsSmbLink",value:"-L"},{name:"tsSticky",value:"-k"},{name:"tsGIDSet",value:"-g"},{name:"tsUIDSet",value:"-u"},{name:"tsGrpOwn",value:"-G"},{name:"tsUsrOwn",value:"-O"},{name:"tsModif",value:"-N"},{name:"tsRead",value:"-r"},{name:"tsWrite",value:"-w"},{name:"tsExec",value:"-x"},{name:"tsNoEmpty",value:"-s"},{name:"tsFdTerm",value:"-t"},{name:"tsEmpStr",value:"-z"},{name:"tsNempStr",value:"-n"},{name:"tsOptSet",value:"-o"},{name:"tsVarSet",value:"-v"},{name:"tsRefVar",value:"-R"},{name:"tsReMatch",value:"=~"},{name:"tsNewer",value:"-nt"},{name:"tsOlder",value:"-ot"},{name:"tsDevIno",value:"-ef"},{name:"tsEql",value:"-eq"},{name:"tsNeq",value:"-ne"},{name:"tsLeq",value:"-le"},{name:"tsGeq",value:"-ge"},{name:"tsLss",value:"-lt"},{name:"tsGtr",value:"-gt"},{name:"globQuest",value:"?("},{name:"globStar",value:"*("},{name:"globPlus",value:"+("},{name:"globAt",value:"@("},{name:"globExcl",value:"!("}]),this.mockPos=()=>({Line:()=>1,Col:()=>1,Offset:()=>0}),this.mockMeta={sessionKey:"code-has-not-run",pid:-1,ppid:-1,pgid:-1,fd:{0:r,1:r,2:r},stack:[]}}interactiveParse(e){var t=n.syntax.NewParser(),s=null,a=0;try{t.Interactive({read:()=>e.slice(1e3*a,1e3*++a)},(()=>(s=t.Incomplete(),!1)))}catch(i){}var r=s?null:this.parse(e);return{incomplete:s,parsed:r}}parse(e){var t=n.syntax.NewParser(n.syntax.KeepComments(!0),n.syntax.Variant(n.syntax.LangBash)).Parse(e,"src.sh"),s=this.File(t);return(0,i.$r)(s)}tryParseBuffer(e){try{var t=e.join("\n")+"\n",{incomplete:s,parsed:a}=this.interactiveParse(t);return s?{key:"incomplete"}:{key:"complete",parsed:a,src:t}}catch(n){return console.error(n),{key:"failed",error:"".concat(n.Error())}}}op(e){var t=this.opMetas[e];return t.value||t.name}}}}]);