(function(e){function t(t){for(var r,o,i=t[0],c=t[1],l=t[2],d=0,f=[];d<i.length;d++)o=i[d],Object.prototype.hasOwnProperty.call(n,o)&&n[o]&&f.push(n[o][0]),n[o]=0;for(r in c)Object.prototype.hasOwnProperty.call(c,r)&&(e[r]=c[r]);u&&u(t);while(f.length)f.shift()();return s.push.apply(s,l||[]),a()}function a(){for(var e,t=0;t<s.length;t++){for(var a=s[t],r=!0,i=1;i<a.length;i++){var c=a[i];0!==n[c]&&(r=!1)}r&&(s.splice(t--,1),e=o(o.s=a[0]))}return e}var r={},n={app:0},s=[];function o(t){if(r[t])return r[t].exports;var a=r[t]={i:t,l:!1,exports:{}};return e[t].call(a.exports,a,a.exports,o),a.l=!0,a.exports}o.m=e,o.c=r,o.d=function(e,t,a){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(o.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)o.d(a,r,function(t){return e[t]}.bind(null,r));return a},o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],c=i.push.bind(i);i.push=t,i=i.slice();for(var l=0;l<i.length;l++)t(i[l]);var u=c;s.push([0,"chunk-vendors"]),a()})({0:function(e,t,a){e.exports=a("56d7")},"037e":function(e,t,a){"use strict";a.d(t,"a",(function(){return i}));a("d3b7"),a("25f0");var r=a("276c"),n=a("e954"),s=a("a9ee"),o=a.n(s),i=function(){function e(t){Object(r["a"])(this,e),this.stop_callback=t,this.recordVideo=null,this.timer=null}return Object(n["a"])(e,[{key:"start_record",value:function(){var e=this;navigator.getUserMedia=navigator.getUserMedia||navigator.mozGetUserMedia||navigator.webkitGetUserMedia,navigator.getUserMedia({audio:!0},(function(t){e.recordVideo=new o.a(t,{type:"audio"}),e.recordVideo.startRecording()}),(function(e){alert(e.toString())}))}},{key:"stop_record",value:function(){var e=this;this.recordVideo.stopRecording((function(){return e.stop_callback(e.recordVideo.getBlob())}))}}]),e}()},1:function(e,t){},"13be":function(e,t,a){},"166b":function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("a-select",{staticStyle:{width:"120px"},attrs:{placeholder:"请选择样本"},on:{change:e.handleChange}},[e._l(e.audioList,(function(t){return[a("a-select-option",{key:t,attrs:{value:t}},[e._v(e._s(t))])]}))],2),a("a-button",{style:{marginLeft:"24px"},on:{click:e.play}},[e._v("播放/暂停")]),a("a-button",{style:{marginLeft:"24px"},on:{click:e.stop}},[e._v("停止")]),a("a-button",{style:{marginLeft:"24px"},on:{click:e.start_record}},[e._v("开始录音")]),a("a-button",{style:{marginLeft:"24px"},on:{click:e.end_record}},[e._v("停止录音")]),a("input",{style:{marginLeft:"24px"},attrs:{name:"file",type:"file"},on:{change:e.handleChangeFile}}),a("wavesurfer",{ref:"surfer",attrs:{onready:e.on_ready,onseek:e.seek,audioprocess:e.audio_process}}),a("div",{staticClass:"tm-gallery-item presult",staticStyle:{border:"1px solid #000",margin:"auto"},attrs:{id:"presult3"}},[a("ul",{staticStyle:{"font-size":"xx-large",margin:"20px 80px"}},[a("li",[a("p",[e._v("Current Time：")]),a("p",{staticClass:"blink"},[e._v(e._s(e.nowtime))])]),a("li",[a("p",[e._v("Total Duration：")]),a("p",{staticStyle:{color:"#dd4814"}},[e._v(e._s(e.totaltime))])]),e._t("default")],2)])],1)},n=[],s=(a("99af"),a("b0c0"),a("cf5f")),o=a("ab79"),i=a("c9ba"),c=a("037e"),l=a("fc0e"),u={components:{wavesurfer:l["a"]},props:["serverName","processCallback","onplay"],data:function(){return{audioList:["请选择样本"],dir:"",upload_dir:"",recorder:null,to_temp:!1,mp3_name:"",nowtime:"",totaltime:""}},methods:{handleChange:function(e){"请选择样本"!=e&&(this.to_temp=!1,this.mp3_name=e,this.$refs.surfer.initAndLoadSpectrogram(this.getUrlServer(e)))},handleChangeFile:function(e){var t=this,a=new window.FormData,r=e.target.files[0];a.append("file",r),this.to_temp=!0,this.mp3_name=r.name,Object(s["a"])("/upload/"+this.$props.serverName,a,(function(){t.$refs.surfer.initAndLoadSpectrogram(t.getUrlUpload(r.name))}))},getUrlServer:function(e){return this.getUrl(this.dir,e)},getUrlUpload:function(e){return this.getUrl(this.upload_dir,e)},getUrl:function(e,t){return localStorage.getItem("apiurl")+e+"/"+t},record_stop_callback:function(e){var t=this,a=this.getTime()+".webm",r=new window.FormData;r.append("audio",e),r.append("name","asr"),r.append("mp3name",a),this.mp3_name=a,this.to_temp=!0,Object(i["a"])("/receive_audio",r,(function(){t.$refs.surfer.initAndLoadSpectrogram(t.getUrlUpload(a))}))},play:function(){this.$refs.surfer.play()},stop:function(){this.$refs.surfer.stop()},start_record:function(){this.recorder.start_record()},end_record:function(){this.recorder.stop_record()},getTime:function(){var e=new Date,t=e.getFullYear(),a=e.getMonth()+1,r=e.getDate(),n=e.getHours(),s=e.getMinutes(),o=e.getSeconds(),i=t+a+r+n+s+o;return i},audio_process:function(e){this.nowtime=e,this.$props.onplay&&this.$props.onplay(e)},seek:function(e){this.nowtime=e,this.$props.onplay&&this.$props.onplay(e)},on_ready:function(e){this.totaltime=e;var t=this,a=this.$props.serverName;t.to_temp&&(a+="/temp"),Object(i["b"])("/"+a,t.mp3_name,(function(e){t.$props.processCallback&&t.$props.processCallback(e)}))}},mounted:function(){var e=this;this.recorder=new c["a"](this.record_stop_callback),Object(o["a"])("/getAudios",{serverName:this.$props.serverName},(function(t){e.audioList=["请选择样本"].concat(t.data),e.dir=t.dir,e.upload_dir=t.upload_dir}))}},d=u,f=(a("e4e3"),a("2877")),p=Object(f["a"])(d,r,n,!1,null,"5dbea5f2",null);t["a"]=p.exports},"24ca":function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("audio-player",{attrs:{serverName:"ser",processCallback:e.callback}},[a("li",[a("p",[e._v("Emotion Analysis: ")]),a("p",{staticStyle:{color:"#dd4814"}},[e._v(e._s(e.result))])])])],1)},n=[],s=a("166b"),o={components:{AudioPlayer:s["a"]},data:function(){return{result:""}},methods:{callback:function(e){this.result=e.result}}},i=o,c=a("2877"),l=Object(c["a"])(i,r,n,!1,null,null,null);t["a"]=l.exports},2953:function(e,t,a){e.exports=a.p+"static/media/Underwater.7ec3a91b.mp4"},"2b52":function(e,t,a){},"2d50":function(e,t,a){},"3c45":function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("global-layout",[a("page-view")],1)},n=[],s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("a-layout",[a("sider-menu"),a("a-layout",[a("global-header"),a("a-layout-content",{style:{minHeight:e.minHeight,margin:"24px 24px"}},[e._t("default")],2),a("a-layout-footer",{staticStyle:{"text-align":"center"}},[e._v(" 大数据与智能认知实验室 ")])],1)],1)},o=[],i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("a-layout-header",{staticClass:"header"},[a("header-avatar")],1)},c=[],l=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"avatar"},[a("img",{attrs:{src:e.logo}})])},u=[],d={name:"HeaderAvatar",data:function(){return{logo:a("cf05")}}},f=d,p=(a("4119"),a("2877")),m=Object(p["a"])(f,l,u,!1,null,"09a643f2",null),h=m.exports,b={components:{HeaderAvatar:h}},v=b,g=(a("503b"),Object(p["a"])(v,i,c,!1,null,null,null)),_=g.exports,y=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("a-layout-sider",{staticStyle:{background:"#fff"},attrs:{width:"20%"}},[a("div",{staticClass:"logo"},[e._v("展示中心")]),a("a-menu",{style:{height:"100%",borderRight:0},attrs:{mode:"inline",theme:"dark",defaultSelectedKeys:e.selectedKeys}},[e._l(e.menu,(function(t){return[a("a-menu-item",{key:t.name},[a("router-link",{attrs:{to:{name:t.title}}},[e._v(e._s(t.title))])],1)]}))],2)],1)},j=[],k=(a("fb6a"),a("ac1f"),a("1276"),[{name:"home",title:"主页"},{name:"asr",title:"自动语音识别"},{name:"er",title:"情感识别"},{name:"sed",title:"声音事件检测"},{name:"vr",title:"声纹识别"},{name:"psr",title:"个性化语音识别"},{name:"enroll",title:"注册声音"},{name:"video",title:"去雾实验"},{name:"meeting",title:"会议室记录系统"}]),w={getMenu:function(){return k}},x={data:function(){return{menu:[]}},mounted:function(){this.menu=w.getMenu()},computed:{selectedKeys:function(){return this.$route.path.split("/").slice(-1)}}},S=x,$=(a("64ea"),Object(p["a"])(S,y,j,!1,null,null,null)),O=$.exports,C=window.innerHeight-64-24-90,U={components:{GlobalHeader:_,SiderMenu:O},data:function(){return{collapsed:!1,minHeight:C+"px"}}},T=U,P=(a("7fb3"),Object(p["a"])(T,s,o,!1,null,null,null)),L=P.exports,z=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("page-layout",{attrs:{title:e.title,needToBack:e.needToBack}},[a("transition",{attrs:{name:"page-taggle"}},[a("router-view",{ref:"page"})],1)],1)},D=[],N=(a("b0c0"),function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"page-layout"},[a("a-page-header",{staticClass:"page-header",attrs:{title:e.title}}),a("div",{ref:"page",staticClass:"page-content"},[e._t("default")],2)],1)}),E=[],M={props:["desc","title","needToBack"]},F=M,A=Object(p["a"])(F,N,E,!1,null,null,null),I=A.exports,H={components:{PageLayout:I},data:function(){return{title:"",desc:"",needToBack:!1}},mounted:function(){this.getPageHeaderInfo()},updated:function(){this.getPageHeaderInfo()},methods:{getPageHeaderInfo:function(){this.title=this.$route.name;var e=this.$refs.page;e&&(this.desc=e.desc,this.needToBack=e.needToBack)}}},B=H,R=Object(p["a"])(B,z,D,!1,null,null,null),G=R.exports,V={components:{GlobalLayout:L,PageView:G}},q=V,Y=Object(p["a"])(q,r,n,!1,null,null,null);t["a"]=Y.exports},4119:function(e,t,a){"use strict";var r=a("7656"),n=a.n(r);n.a},4678:function(e,t,a){var r={"./af":"2bfb","./af.js":"2bfb","./ar":"8e73","./ar-dz":"a356","./ar-dz.js":"a356","./ar-kw":"423e","./ar-kw.js":"423e","./ar-ly":"1cfd","./ar-ly.js":"1cfd","./ar-ma":"0a84","./ar-ma.js":"0a84","./ar-sa":"8230","./ar-sa.js":"8230","./ar-tn":"6d83","./ar-tn.js":"6d83","./ar.js":"8e73","./az":"485c","./az.js":"485c","./be":"1fc1","./be.js":"1fc1","./bg":"84aa","./bg.js":"84aa","./bm":"a7fa","./bm.js":"a7fa","./bn":"9043","./bn.js":"9043","./bo":"d26a","./bo.js":"d26a","./br":"6887","./br.js":"6887","./bs":"2554","./bs.js":"2554","./ca":"d716","./ca.js":"d716","./cs":"3c0d","./cs.js":"3c0d","./cv":"03ec","./cv.js":"03ec","./cy":"9797","./cy.js":"9797","./da":"0f14","./da.js":"0f14","./de":"b469","./de-at":"b3eb","./de-at.js":"b3eb","./de-ch":"bb71","./de-ch.js":"bb71","./de.js":"b469","./dv":"598a","./dv.js":"598a","./el":"8d47","./el.js":"8d47","./en-SG":"cdab","./en-SG.js":"cdab","./en-au":"0e6b","./en-au.js":"0e6b","./en-ca":"3886","./en-ca.js":"3886","./en-gb":"39a6","./en-gb.js":"39a6","./en-ie":"e1d3","./en-ie.js":"e1d3","./en-il":"7333","./en-il.js":"7333","./en-nz":"6f50","./en-nz.js":"6f50","./eo":"65db","./eo.js":"65db","./es":"898b","./es-do":"0a3c","./es-do.js":"0a3c","./es-us":"55c9","./es-us.js":"55c9","./es.js":"898b","./et":"ec18","./et.js":"ec18","./eu":"0ff2","./eu.js":"0ff2","./fa":"8df4","./fa.js":"8df4","./fi":"81e9","./fi.js":"81e9","./fo":"0721","./fo.js":"0721","./fr":"9f26","./fr-ca":"d9f8","./fr-ca.js":"d9f8","./fr-ch":"0e49","./fr-ch.js":"0e49","./fr.js":"9f26","./fy":"7118","./fy.js":"7118","./ga":"5120","./ga.js":"5120","./gd":"f6b4","./gd.js":"f6b4","./gl":"8840","./gl.js":"8840","./gom-latn":"0caa","./gom-latn.js":"0caa","./gu":"e0c5","./gu.js":"e0c5","./he":"c7aa","./he.js":"c7aa","./hi":"dc4d","./hi.js":"dc4d","./hr":"4ba9","./hr.js":"4ba9","./hu":"5b14","./hu.js":"5b14","./hy-am":"d6b6","./hy-am.js":"d6b6","./id":"5038","./id.js":"5038","./is":"0558","./is.js":"0558","./it":"6e98","./it-ch":"6f12","./it-ch.js":"6f12","./it.js":"6e98","./ja":"079e","./ja.js":"079e","./jv":"b540","./jv.js":"b540","./ka":"201b","./ka.js":"201b","./kk":"6d79","./kk.js":"6d79","./km":"e81d","./km.js":"e81d","./kn":"3e92","./kn.js":"3e92","./ko":"22f8","./ko.js":"22f8","./ku":"2421","./ku.js":"2421","./ky":"9609","./ky.js":"9609","./lb":"440c","./lb.js":"440c","./lo":"b29d","./lo.js":"b29d","./lt":"26f9","./lt.js":"26f9","./lv":"b97c","./lv.js":"b97c","./me":"293c","./me.js":"293c","./mi":"688b","./mi.js":"688b","./mk":"6909","./mk.js":"6909","./ml":"02fb","./ml.js":"02fb","./mn":"958b","./mn.js":"958b","./mr":"39bd","./mr.js":"39bd","./ms":"ebe4","./ms-my":"6403","./ms-my.js":"6403","./ms.js":"ebe4","./mt":"1b45","./mt.js":"1b45","./my":"8689","./my.js":"8689","./nb":"6ce3","./nb.js":"6ce3","./ne":"3a39","./ne.js":"3a39","./nl":"facd","./nl-be":"db29","./nl-be.js":"db29","./nl.js":"facd","./nn":"b84c","./nn.js":"b84c","./pa-in":"f3ff","./pa-in.js":"f3ff","./pl":"8d57","./pl.js":"8d57","./pt":"f260","./pt-br":"d2d4","./pt-br.js":"d2d4","./pt.js":"f260","./ro":"972c","./ro.js":"972c","./ru":"957c","./ru.js":"957c","./sd":"6784","./sd.js":"6784","./se":"ffff","./se.js":"ffff","./si":"eda5","./si.js":"eda5","./sk":"7be6","./sk.js":"7be6","./sl":"8155","./sl.js":"8155","./sq":"c8f3","./sq.js":"c8f3","./sr":"cf1e","./sr-cyrl":"13e9","./sr-cyrl.js":"13e9","./sr.js":"cf1e","./ss":"52bd","./ss.js":"52bd","./sv":"5fbd","./sv.js":"5fbd","./sw":"74dc","./sw.js":"74dc","./ta":"3de5","./ta.js":"3de5","./te":"5cbb","./te.js":"5cbb","./tet":"576c","./tet.js":"576c","./tg":"3b1b","./tg.js":"3b1b","./th":"10e8","./th.js":"10e8","./tl-ph":"0f38","./tl-ph.js":"0f38","./tlh":"cf75","./tlh.js":"cf75","./tr":"0e81","./tr.js":"0e81","./tzl":"cf51","./tzl.js":"cf51","./tzm":"c109","./tzm-latn":"b53d","./tzm-latn.js":"b53d","./tzm.js":"c109","./ug-cn":"6117","./ug-cn.js":"6117","./uk":"ada2","./uk.js":"ada2","./ur":"5294","./ur.js":"5294","./uz":"2e8c","./uz-latn":"010e","./uz-latn.js":"010e","./uz.js":"2e8c","./vi":"2921","./vi.js":"2921","./x-pseudo":"fd7e","./x-pseudo.js":"fd7e","./yo":"7f33","./yo.js":"7f33","./zh-cn":"5c3a","./zh-cn.js":"5c3a","./zh-hk":"49ab","./zh-hk.js":"49ab","./zh-tw":"90ea","./zh-tw.js":"90ea"};function n(e){var t=s(e);return a(t)}function s(e){if(!a.o(r,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return r[e]}n.keys=function(){return Object.keys(r)},n.resolve=s,e.exports=n,n.id="4678"},"4a5e":function(e,t,a){"use strict";var r=a("91a4"),n=a.n(r);n.a},"4fd7":function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("h2",[e._v(e._s(e.welcome))]),a("p",[e._v(e._s(e.detail))]),a("h2",[e._v(e._s(e.rs_title))]),a("p",[e._v(e._s(e.rs_detail))]),a("h2",[e._v("服务器选择")]),a("a-select",{staticStyle:{width:"120px"}},[a("a-select-option",{attrs:{value:"边缘服务器"}},[e._v("边缘服务器")]),a("a-select-option",{attrs:{value:"云服务器"}},[e._v("云服务器")])],1)],1)},n=[],s="本网站总共展示了7个示例,如左侧菜单所示. 你可以使用已有的声音样本, 上传或录制你自己的样本. 本系统同时被部署到云服务器和边缘服务器. 请随意体验吧^_^",o="欢迎来到大数据和人工认知实验室",i="说话人识别系统",c="说话人识别系统一听到声音就知道“知道你是谁”. 当然，如果你的声音没有被注册, 你就会认为是一个陌生人. 将来我们会开发一个结合语音识别和说话人识别的系统.",l={data:function(){return{dataSource:[],welcome:o,detail:s,rs_title:i,rs_detail:c,server:["边缘服务器","云服务器"]}},methods:{}},u=l,d=a("2877"),f=Object(d["a"])(u,r,n,!1,null,null,null);t["a"]=f.exports},"4fe5":function(e,t,a){},"503b":function(e,t,a){"use strict";var r=a("13be"),n=a.n(r);n.a},5393:function(e,t,a){e.exports=a.p+"static/media/Plane.cee49322.mp4"},5494:function(e,t,a){},"56d7":function(e,t,a){"use strict";a.r(t);a("380f");var r=a("f64c"),n=(a("1c85"),a("ccb9")),s=(a("7a59"),a("39ab")),o=(a("04f3"),a("ed3b")),i=(a("b8e1"),a("2f50")),c=(a("5e72"),a("3779")),l=(a("9f9e"),a("2c92")),u=(a("0723"),a("0020")),d=(a("06ea"),a("fe2b")),f=(a("9b09"),a("6634")),p=(a("c0ed"),a("9fd0")),m=(a("9e39"),a("f933")),h=(a("e1f5"),a("5efb")),b=(a("d2a2"),a("98c5")),v=(a("b6e5"),a("55f1")),g=(a("02cf"),a("9839")),_=(a("805a"),a("0c63")),y=(a("a71a"),a("b558")),j=(a("c721"),a("3af3")),k=(a("e260"),a("e6cf"),a("cca6"),a("a79d"),a("2b0e")),w=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"app"}},[a("a-config-provider",{attrs:{locale:e.locale}},[a("router-view")],1)],1)},x=[],S=(a("5b61"),a("4df5")),$=a("677e"),O=a.n($);k["a"].use(S["b"]);var C={data:function(){return{name:"app",locale:O.a}}},U=C,T=a("2877"),P=Object(T["a"])(U,w,x,!1,null,null,null),L=P.exports,z=a("d046"),D=(a("69b8"),a("d6d3")),N=a.n(D);k["a"].use(j["a"]),k["a"].use(y["a"]),k["a"].use(_["a"]),k["a"].use(g["b"]),k["a"].use(v["a"]),k["a"].use(b["a"]),k["a"].use(h["a"]),k["a"].use(m["a"]),k["a"].use(p["a"]),k["a"].use(f["a"]),k["a"].use(d["b"]),k["a"].use(u["a"]),k["a"].use(l["a"]),k["a"].use(c["a"]),k["a"].use(i["a"]),k["a"].use(o["a"]),k["a"].use(s["a"]),k["a"].use(n["a"]),k["a"].prototype.$message=r["a"],a("fda2"),a("451f"),k["a"].use(N.a),r["a"].config({duration:2}),localStorage.setItem("apiurl",""),new k["a"]({el:"#app",router:z["a"],render:function(e){return e(L)}})},"64ea":function(e,t,a){"use strict";var r=a("2d50"),n=a.n(r);n.a},"69b8":function(e,t,a){},7343:function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("audio-player",{attrs:{serverName:"sr",processCallback:e.callback}},[a("li",[a("p",[e._v("Speaker Name：")]),a("p",{staticStyle:{color:"#dd4814"}},[e._v(e._s(e.result))])])]),a("a-modal",{attrs:{title:"还没有注册","on-ok":"handleOk"},model:{value:e.visible,callback:function(t){e.visible=t},expression:"visible"}},[a("template",{slot:"footer"},[a("a-button",{key:"back",on:{click:e.handleCancel}},[e._v(" Return ")]),a("a-button",{key:"submit",attrs:{type:"primary"}},[a("router-link",{attrs:{to:{name:"注册声音"}},nativeOn:{click:function(t){return e.fresh(t)}}},[e._v(" 注册 ")])],1)],1),a("p",[e._v("你可以选择直接注册")])],2)],1)},n=[],s=a("e4e8"),o={components:{AudioPlayer:s["a"]},data:function(){return{result:"",visible:!1}},methods:{callback:function(e){this.result=e.result,""===this.result&&(this.visible=!0)},fresh:function(){this.$router.go(0)},handleCancel:function(){this.visible=!1}}},i=o,c=a("2877"),l=Object(c["a"])(i,r,n,!1,null,null,null);t["a"]=l.exports},"74ff":function(e,t,a){e.exports=a.p+"static/media/Whale.868d5dd0.mp4"},7656:function(e,t,a){},"7fb3":function(e,t,a){"use strict";var r=a("2b52"),n=a.n(r);n.a},"8e89":function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("a-tabs",{attrs:{"default-active-key":"1"}},[a("a-tab-pane",{key:"1",attrs:{tab:"简介"}},[e._v(" 雾在摄影时，是一种显著降低图像质量、影响观者视觉体验的干扰因素， 虽然在特定情况下，雾是艺术摄影中的重点关注对象， 但对于用户日常的拍摄以及地理成像等多种图像应用领域而言， 我们更希望能够减少雾的影响。因雾而降低质量的图像 ")]),a("a-tab-pane",{key:"2",attrs:{tab:"水下展示"}},[a("video-player",{ref:"videoPlayer",staticClass:"video-player vjs-custom-skin",attrs:{playsinline:!0,options:e.underOption}})],1),a("a-tab-pane",{key:"3",attrs:{tab:"水下展示2"}},[a("video-player",{ref:"videoPlayer",staticClass:"video-player vjs-custom-skin",attrs:{playsinline:!0,options:e.under2Option}})],1),a("a-tab-pane",{key:"4",attrs:{tab:"空中"}},[a("video-player",{ref:"videoPlayer",staticClass:"video-player vjs-custom-skin",attrs:{playsinline:!0,options:e.flyOption}})],1),a("a-tab-pane",{key:"5",attrs:{tab:"实时去雾陆地"}},[a("img",{staticClass:"video",staticStyle:{margin:"0 auto"},attrs:{src:e.feedUrl}})]),a("a-tab-pane",{key:"6",attrs:{tab:"实时去雾海上"}},[a("img",{staticClass:"video",staticStyle:{margin:"0 auto"},attrs:{src:e.feedUrlFog}})])],1)],1)},n=[];function s(e){return{playbackRates:[.5,1,1.5,2],autoplay:!1,muted:!1,loop:!1,preload:"auto",language:"zh-CN",aspectRatio:"16:9",fluid:!0,sources:[{type:"",src:e}],poster:"",notSupportedMessage:"此视频暂无法播放，请稍后再试",controlBar:{timeDivider:!0,durationDisplay:!0,remainingTimeDisplay:!1,fullscreenToggle:!0}}}var o={data:function(){return{result:"",underOption:s(a("2953")),under2Option:s(a("74ff")),flyOption:s(a("5393")),feedUrl:localStorage.getItem("apiurl")+"/video_feed",feedUrlFog:localStorage.getItem("apiurl")+"/fog_video_feed"}}},i=o,c=(a("9053"),a("2877")),l=Object(c["a"])(i,r,n,!1,null,"7a09821e",null);t["a"]=l.exports},9053:function(e,t,a){"use strict";var r=a("f3d1"),n=a.n(r);n.a},"91a4":function(e,t,a){},"9a94":function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("a-button",{on:{click:e.start_record}},[e._v("录音")]),a("a-button",{style:{marginLeft:"12px"},on:{click:e.end_record}},[e._v("停止录音")]),a("div",{staticClass:"form-group"},[a("label",{attrs:{for:"exampleFormControlTextarea1"}},[e._v("Dialogs")]),a("textarea",{directives:[{name:"model",rawName:"v-model",value:e.value,expression:"value"}],staticClass:"form-control",attrs:{rows:"15"},domProps:{value:e.value},on:{input:function(t){t.target.composing||(e.value=t.target.value)}}})]),a("wavesurfer",{ref:"surfer",attrs:{onready:e.on_ready}})],1)},n=[],s=a("037e"),o=a("fc0e"),i=a("c9ba"),c={components:{wavesurfer:o["a"]},data:function(){return{result:"",recorder:null,file:"",mp3name:"",value:"",timer:null,count:0}},methods:{callback:function(e){this.result=e.result},getTime:function(){var e=new Date,t=e.getFullYear(),a=e.getMonth()+1,r=e.getDate(),n=e.getHours(),s=e.getMinutes(),o=e.getSeconds(),i=t+a+r+n+s+o;return i},start_record:function(){this.recorder.start_record(),this.timer=setInterval(this.one_step_stop,3e3)},end_record:function(){null==this.timer?alert("please first beginning the recording before stopping! "):(clearInterval(this.timer),console.log("posting ended!"))},one_step_stop:function(){this.recorder.stop_record()},record_stop_callback:function(e){var t=this,a=this.getTime()+"_"+this.count+".webm";this.count+=1;var r=new window.FormData;r.append("audio",e),r.append("name","asr"),r.append("mp3name",a),this.mp3_name=a,this.to_temp=!0,Object(i["a"])("/receive_audio",r,(function(){t.$refs.surfer.initAndLoadSpectrogram(t.getUrl("/static/uploads/temp",a))})),this.recorder.start_record()},getUrl:function(e,t){return localStorage.getItem("apiurl")+e+"/"+t},on_ready:function(){var e=this,t=this;Object(i["b"])("/meeting",t.mp3_name,(function(t){e.value=e.value+t.sr.result+":"+t.asr.result+"\n"}))}},mounted:function(){this.recorder=new s["a"](this.record_stop_callback)}},l=c,u=(a("4a5e"),a("2877")),d=Object(u["a"])(l,r,n,!1,null,"fcccb470",null);t["a"]=d.exports},ab79:function(e,t,a){"use strict";a.d(t,"a",(function(){return i}));var r=a("bc3a"),n=a.n(r),s=n.a.create({timeout:15e3,headers:{"Content-Type":"application/json;charset=utf-8"},withCredentials:!0}),o=s;function i(e,t,a){o({url:localStorage.getItem("apiurl")+e,method:"post",data:JSON.stringify(t)}).then((function(e){200==e.status?a(e.data):console.log(e.statusText)})).catch((function(e){console.log(e)}))}},b84d:function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("audio-player",{attrs:{serverName:"sed",processCallback:e.callback,onplay:e.onplay}},[a("li",[a("p",[e._v("Active Events: ")]),a("p",{staticStyle:{color:"#dd4814"}},[e._v(e._s(e.result))])])])],1)},n=[],s=a("166b"),o={components:{AudioPlayer:s["a"]},data:function(){return{result:"",list:[]}},methods:{callback:function(e){this.list=e.result,this.result=e.result[0][1]},onplay:function(e){var t=parseInt(e);this.list.length>t&&(this.result=this.list[t][1])}}},i=o,c=a("2877"),l=Object(c["a"])(i,r,n,!1,null,null,null);t["a"]=l.exports},c9ba:function(e,t,a){"use strict";a.d(t,"a",(function(){return s})),a.d(t,"b",(function(){return o}));var r=a("bc3a"),n=a.n(r);function s(e,t,a){n()({url:localStorage.getItem("apiurl")+e,data:t,method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"}}).then((function(e){200==e.status?a(e.data):console.log(e.statusText)})).catch((function(e){console.log(e)}))}function o(e,t,a){n()({url:localStorage.getItem("apiurl")+e,data:t,method:"POST"}).then((function(e){200==e.status?a(e.data):console.log(e.statusText)})).catch((function(e){console.log(e)}))}},cf05:function(e,t,a){e.exports=a.p+"static/img/logo.37e69c23.png"},cf5f:function(e,t,a){"use strict";a.d(t,"a",(function(){return s}));var r=a("bc3a"),n=a.n(r);function s(e,t,a){n.a.post(localStorage.getItem("apiurl")+e,t,{method:"POST",headers:{"Content-Type":"multipart/form-data;charset=utf-8"},withCredentials:!0}).then((function(e){200==e.status?a(e.data):console.log(e.statusText)})).catch((function(e){console.log(e)}))}},d046:function(e,t,a){"use strict";(function(e){var r=a("2b0e"),n=a("8c4f"),s=a("3c45"),o=a("4fd7"),i=a("e95e"),c=a("24ca"),l=a("b84d"),u=a("7343"),d=a("d04b"),f=a("dd8f"),p=a("8e89"),m=a("9a94");r["a"].use(n["a"]);var h=new n["a"]({base:e,linkActiveClass:"active",routes:[{name:"Main",path:"/",redirect:"/home",component:s["a"],children:[{path:"/home",name:"主页",component:o["a"]},{path:"/asr",name:"自动语音识别",component:i["a"]},{path:"/er",name:"情感识别",component:c["a"]},{path:"/sed",name:"声音事件检测",component:l["a"]},{path:"/vr",name:"声纹识别",component:u["a"]},{path:"/psr",name:"个性化语音识别",component:d["a"]},{path:"/enroll",name:"注册声音",component:f["a"]},{path:"/video",name:"去雾实验",component:p["a"]},{path:"/meeting",name:"会议室记录系统",component:m["a"]}]}]});t["a"]=h}).call(this,"/")},d04b:function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("audio-player",{attrs:{serverName:"sr",processName:"meeting",processCallback:e.callback}},[a("li",[a("p",[e._v("Message：")]),a("p",[e._v(e._s(e.message)+" ")]),e._v(" "),a("br"),a("br"),a("br"),a("p",[e._v("Speaker Name：")]),a("p",{staticStyle:{color:"#dd4814"}},[e._v(e._s(e.speakername))]),a("br"),a("br"),a("br"),a("p",[e._v("Speech Recognition ")]),a("p",{staticStyle:{color:"#dd4814"}},[e._v(e._s(e.text))]),a("br"),a("br"),a("br")])])],1)},n=[],s=a("e4e8"),o={components:{AudioPlayer:s["a"]},data:function(){return{speakername:"",text:"",message:""}},methods:{callback:function(e){this.speakername=e.sr.result,this.text=e.sr.result;var t="successful recognition";"unknown"==this.speakername&&(t="failure recognition， the voice is not registered in the system!",this.speakername="",this.text=""),this.message=t}}},i=o,c=a("2877"),l=Object(c["a"])(i,r,n,!1,null,null,null);t["a"]=l.exports},d51b:function(e,t,a){"use strict";var r=a("4fe5"),n=a.n(r);n.a},dd8f:function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("a-form",{attrs:{form:e.form,"label-col":{span:5},"wrapper-col":{span:12}},on:{submit:e.handleSubmit}},[a("a-form-item",{attrs:{label:"name"}},[a("a-input",{directives:[{name:"decorator",rawName:"v-decorator",value:["name",{rules:[{required:!0,message:"请输入名字!"}]}],expression:"['name', { rules: [{ required: true, message: '请输入名字!' }] }]"}]})],1),a("a-form-item",{attrs:{label:"提示"}},[a("label",[e._v("声音信息(请录音或选择音频文件)")])]),a("a-form-item",{attrs:{label:"上传文件"}},[a("a-upload",{attrs:{"before-upload":e.beforeUpload}},[a("a-button",[a("a-icon",{attrs:{type:"upload"}}),e._v(" 点击上传 ")],1)],1)],1),a("a-form-item",{attrs:{label:"录音"}},[a("a-button",{on:{click:e.start_record}},[e._v("录音")]),a("a-button",{style:{marginLeft:"12px"},on:{click:e.end_record}},[e._v("停止录音")])],1),a("div",{style:{marginLeft:"16%"}}),a("a-form-item",{attrs:{"wrapper-col":{sm:{span:16,offset:5}}}},[a("a-button",{attrs:{type:"primary"},on:{click:e.handleSubmit}},[e._v("注册")])],1)],1)],1)},n=[],s=(a("b0c0"),a("cf5f")),o=a("037e"),i={data:function(){return{result:"",form:this.$form.createForm(this,{name:"coordinated"}),file:"",mp3name:"",recorder:null}},methods:{callback:function(e){this.result=e.result},handleSubmit:function(e){var t=this;e.preventDefault(),this.form.validateFields((function(e,a){if(!e)if(""!=t.filename){var r=new window.FormData;r.append("audio",t.file),r.append("name",a.name),r.append("mp3name",t.mp3name),Object(s["a"])("/enroll",r,(function(e){t.$message.success(e.result),console.log(e)}))}else t.$message.error("文件不能为空")}))},beforeUpload:function(e){return this.file=e,this.mp3name=e.name,!1},getTime:function(){var e=new Date,t=e.getFullYear(),a=e.getMonth()+1,r=e.getDate(),n=e.getHours(),s=e.getMinutes(),o=e.getSeconds(),i=t+a+r+n+s+o;return i},start_record:function(){this.recorder.start_record()},end_record:function(){this.recorder.stop_record()},record_stop_callback:function(e){var t=this.getTime()+".webm";this.file=e,this.mp3name=t}},mounted:function(){this.recorder=new o["a"](this.record_stop_callback)}},c=i,l=a("2877"),u=Object(l["a"])(c,r,n,!1,null,null,null);t["a"]=u.exports},e4e3:function(e,t,a){"use strict";var r=a("5494"),n=a.n(r);n.a},e4e8:function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("a-select",{staticStyle:{width:"120px"},attrs:{placeholder:"请选择样本"},on:{change:e.handleChange}},[e._l(e.audioList,(function(t){return[a("a-select-option",{key:t,attrs:{value:t}},[e._v(e._s(t))])]}))],2),a("a-button",{style:{marginLeft:"24px"},on:{click:e.play}},[e._v("播放/暂停")]),a("a-button",{style:{marginLeft:"24px"},on:{click:e.stop}},[e._v("停止")]),a("a-button",{style:{marginLeft:"24px"},on:{click:e.start_record}},[e._v("开始录音")]),a("a-button",{style:{marginLeft:"24px"},on:{click:e.end_record}},[e._v("停止录音")]),a("input",{style:{marginLeft:"24px"},attrs:{name:"file",type:"file"},on:{change:e.handleChangeFile}}),a("wavesurfer",{ref:"surfer",attrs:{onready:e.on_ready,onseek:e.seek,audioprocess:e.audio_process}}),a("div",{staticClass:"tm-gallery-item presult",staticStyle:{border:"1px solid #000",margin:"auto"},attrs:{id:"presult3"}},[a("ul",{staticStyle:{"font-size":"xx-large",margin:"20px 80px"}},[e._t("default")],2)])],1)},n=[],s=(a("99af"),a("b0c0"),a("cf5f")),o=a("ab79"),i=a("c9ba"),c=a("037e"),l=a("fc0e"),u={components:{wavesurfer:l["a"]},props:["serverName","processCallback","onplay","processName"],data:function(){return{audioList:["请选择样本"],dir:"",upload_dir:"",recorder:null,to_temp:!1,mp3_name:""}},methods:{handleChange:function(e){"请选择样本"!=e&&(this.to_temp=!1,this.mp3_name=e,this.$refs.surfer.initAndLoadSpectrogram(this.getUrlServer(e)))},handleChangeFile:function(e){var t=this,a=new window.FormData,r=e.target.files[0];a.append("file",r),this.to_temp=!0,this.mp3_name=r.name,Object(s["a"])("/upload/"+this.$props.serverName,a,(function(){t.$refs.surfer.initAndLoadSpectrogram(t.getUrlUpload(r.name))}))},getUrlServer:function(e){return this.getUrl(this.dir,e)},getUrlUpload:function(e){return this.getUrl(this.upload_dir,e)},getUrl:function(e,t){return localStorage.getItem("apiurl")+e+"/"+t},record_stop_callback:function(e){var t=this,a=this.getTime()+".webm",r=new window.FormData;r.append("audio",e),r.append("name","asr"),r.append("mp3name",a),this.mp3_name=a,this.to_temp=!0,Object(i["a"])("/receive_audio",r,(function(){t.$refs.surfer.initAndLoadSpectrogram(t.getUrlUpload(a))}))},play:function(){this.$refs.surfer.play()},stop:function(){this.$refs.surfer.stop()},start_record:function(){this.recorder.start_record()},end_record:function(){this.recorder.stop_record()},getTime:function(){var e=new Date,t=e.getFullYear(),a=e.getMonth()+1,r=e.getDate(),n=e.getHours(),s=e.getMinutes(),o=e.getSeconds(),i=t+a+r+n+s+o;return i},audio_process:function(e){this.$props.onplay&&this.$props.onplay(e)},seek:function(e){this.$props.onplay&&this.$props.onplay(e)},on_ready:function(){var e,t=this;e=this.$props.processName?this.$props.processName:this.$props.serverName,t.to_temp&&"meeting"!=e&&(e+="/temp"),Object(i["b"])("/"+e,t.mp3_name,(function(e){t.$props.processCallback&&t.$props.processCallback(e)}))}},mounted:function(){var e=this;this.recorder=new c["a"](this.record_stop_callback),Object(o["a"])("/getAudios",{serverName:this.$props.serverName},(function(t){e.audioList=["请选择样本"].concat(t.data),e.dir=t.dir,e.upload_dir=t.upload_dir}))}},d=u,f=(a("d51b"),a("2877")),p=Object(f["a"])(d,r,n,!1,null,"57a81844",null);t["a"]=p.exports},e95e:function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("audio-player",{attrs:{serverName:"asr",processCallback:e.callback}},[a("li",[a("p",[e._v("Decode Result: ")]),a("p",{staticStyle:{color:"#dd4814"}},[e._v(e._s(e.result))])])])],1)},n=[],s=a("166b"),o={components:{AudioPlayer:s["a"]},data:function(){return{result:""}},methods:{callback:function(e){this.result=e.result}}},i=o,c=a("2877"),l=Object(c["a"])(i,r,n,!1,null,null,null);t["a"]=l.exports},f3d1:function(e,t,a){},fc0e:function(e,t,a){"use strict";var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"waveformOuter"},[a("div",{ref:"waveform",staticStyle:{border:"1px solid #000"},attrs:{id:"waveform"}},[a("br"),a("div",{ref:"progressDiv",staticClass:"progress progress-striped active",attrs:{id:"progress-bar"}},[a("div",{ref:"progressBar",staticClass:"progress-bar progress-bar-info"})])]),a("div",{ref:"wavetimeline",staticStyle:{"background-color":"azure"},attrs:{id:"wave-timeline"}}),a("p",{staticStyle:{"text-align":"center","font-size":"x-large","font-style":"italic"}},[e._v("waveform")]),a("div",{ref:"wavespectrogram",staticStyle:{border:"1px solid #000"},attrs:{id:"wave-spectrogram"}}),a("p",{staticStyle:{"text-align":"center","font-size":"x-large","font-style":"italic"}},[e._v("spectrogram")])])},n=[],s=(a("b680"),a("8896")),o=a.n(s),i=a("c1be"),c=a.n(i),l=a("e59a"),u=a.n(l),d={props:["audioprocess","onseek","onready"],data:function(){return{wavesurfer:null}},methods:{initAndLoadSpectrogram:function(e){var t=this;this.wavesurfer&&this.wavesurfer.destroy();var a={container:this.$refs.waveform,waveColor:"violet",progressColor:"#0000ff",loaderColor:"purple",cursorColor:"#ff0000",cursorWidth:2,autoCenter:!1,fillParent:!0,hideScrollbar:!1,plugins:[c.a.create({container:t.$refs.wavetimeline,height:10}),u.a.create({container:t.$refs.wavespectrogram,labels:!1})]};this.wavesurfer=o.a.create(a),function(){t.wavesurfer.on("loading",t.showProgress),t.wavesurfer.on("ready",t.hideProgress),t.wavesurfer.on("destroy",t.hideProgress),t.wavesurfer.on("error",t.hideProgress)}(),this.wavesurfer.load(e),this.wavesurfer.on("audioprocess",(function(){var e=t.wavesurfer.getCurrentTime().toFixed(2);t.$props.audioprocess&&t.$props.audioprocess(e)})),this.wavesurfer.on("seek",(function(){var e=t.wavesurfer.getCurrentTime().toFixed(2);t.$props.onseek&&t.$props.onseek(e)})),this.wavesurfer.on("ready",(function(){var e=t.wavesurfer.getDuration().toFixed(2);t.$props.onready&&t.$props.onready(e)}))},showProgress:function(e){this.$refs.progressDiv.style.display="block",this.$refs.progressBar.style.width=e+"%"},hideProgress:function(){this.$refs.progressDiv.style.display="none"},play:function(){this.wavesurfer.playPause()},stop:function(){this.wavesurfer.stop()}}},f=d,p=a("2877"),m=Object(p["a"])(f,r,n,!1,null,null,null);t["a"]=m.exports}});
//# sourceMappingURL=app.f385f2be.js.map