import Editor from "../editor";
import 'quill/dist/quill.snow.css'
import EditorEvents from "../editor-events";
import '../modules/task-list';
import ReconnectingWebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";
import Quill from 'quill';
import richText from "rich-text";
ShareDB.types.register(richText.type);

// For icons of header value 3
const icons = Quill.import('ui/icons');
icons['header'][3] = require('!html-loader!quill/assets/icons/header-3.svg');
import '../display.styl';
let quill=null
let title=null;
let groupid=null;
let ws2=new WebSocket("ws://47.94.108.20:3335");
// document.getElementById("confirm").onclick=function() {
let ws3=new WebSocket("ws://47.94.108.20:3336")

    document.getElementById("confirm").onclick=function(){
//初始化
        var edit= document.getElementById("editor")
        edit.innerHTML="<div class=\"editor-container\" id=\"container\"></div>";


    var studentno=document.getElementById("studentno").value

    title=document.getElementById("textno").value



    var data=JSON.stringify({type:"orignal",textno:title,studentno:studentno})



    ws2.send(data)

    ws2.onmessage=function(e){
        var data = JSON.parse(e.data);
        var theindex = 0;
        let authors=[]
        console.log(data.name)
        if(data.error==="none"){
            for(var i=0;i<data.name.length;i++){
                authors.push({id:data.id[i],name:data.name[i]})
                if(data.name[i]===studentno){
                    theindex=i;
                    console.log(theindex)
                }
            }
            let testUrl = 'https://yd.wemiks.com/banner-2d980584-yuanben.svg';
            document.getElementById("textdescription").value=data.articledescription
            console.log(data.datas)
            window.jsondata=data.datas
            console.log(data.datas)
            window.jsondata1=data.datas1
            console.log(data.datas1)
            window.jsondata2=data.datas2
            console.log(data.datas2)
            let editorOptions = {
                authorship: {
                    // author: authors[authorIndex],
                    author:authors[theindex],
                    authorColor: '#ed5634',
                    colors: [
                        "#f7b452",
                        "#ef6c91",
                        "#8e6ed5",
                        "#6abc91",
                        "#5ac5c3",
                        "#7297e3",
                        "#9bc86e",
                        "#ebd562",
                        "#d499b9",
                        "#f7b452",
                        "#ef6c91",
                        "#8e6ed5",
                        "#6abc91",
                        "#5ac5c3",
                        "#7297e3",
                    ],
                    handlers: {
                        getAuthorInfoById: (authorId) => {
                            return new Promise((resolve, reject) => {
                                let author = authors.find((a) => a.id + '' === authorId);
                                // let author=author1
                                console.log("当前用户的id是: " + authorId);
                                console.log(author)
                                if (author) {
                                    resolve(author);
                                } else {
                                    reject("user not found");
                                }
                            });
                        }
                    }
                },
                image: {
                    handlers: {
                        imageDataURIUpload: (dataURI) => {
                            return new Promise((resolve) => {
                                resolve(testUrl);
                            });
                        },
                        imageSrcUpload: (src) => {
                            return new Promise((resolve) => {
                                resolve(testUrl);
                            });
                        },
                        imageUploadError: (err) => {
                            console.log("image upload error: " + err);
                        }
                    }
                }
            };
            let toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],
                [{'header': 1}, {'header': 2}, {'header': 3}],
                [{'list': 'ordered'}, {'list': 'bullet'}, 'task-list', {'indent': '+1'}, {'indent': '-1'}],
                ['align', 'color', 'background'],
                ['blockquote', 'code-block']
            ];
            let quillOptions = {
                modules: {
                    toolbar: toolbarOptions,
                    'task-list': true
                },
                theme: 'snow'
            };

            let editor = new Editor("#container", editorOptions, quillOptions);

            editor.on(EditorEvents.imageSkipped, () => {
                console.log("image skipped");
            });

            editor.on(EditorEvents.documentLoaded, () => {
                console.log("document loaded");
            });

            editor.on(EditorEvents.synchronizationError, (err) => {
                console.log("connection error");
                console.log(err);
            });

            console.log(title)
            let websocketEndpoint = "ws://47.94.108.20:8085";

            editor.syncThroughWebsocket(websocketEndpoint, "examples",title);

            let socket = new ReconnectingWebSocket(websocketEndpoint);

            let connection = new ShareDB.Connection(socket);

            let doc = connection.get("examples", title);

// Create a hidden quill editor to parse delta to html


            let editorContainer = document.createElement('div');
            editorContainer.style.display = 'none';

            quill = new Quill(editorContainer);

            doc.fetch((err) => {
                if (err) {
                    console.log(err);
                    return;
                }

                let delta = doc.data;
                quill.setContents(delta);

                document.querySelector(".content").innerHTML = quill.root.innerHTML;

                doc.destroy();
                socket.close();

                editor.on(EditorEvents.editorTextChanged, (delta) => {
                    let del = delta.oldDelta.compose(delta.delta)
                    quill.setContents(del);
                    document.querySelector(".content").innerHTML = quill.root.innerHTML;
                    console.log(quill.getContents())
                    console.log(quill.getText())
                })

            });
        }else {
            alert("您输入的信息有误，请重新输入！")
        }
    }
}

    document.getElementById("fetchdata").onclick=function(){
        var data=JSON.stringify({type:"fetchdata",textno:title})
        ws2.send(data)
        var dataarray=[];
        var dataarray1=[];
        var dataarray2=[];
        ws2.onmessage=function (data) {
            console.log(data.data)
            var datas=JSON.parse(data.data)
            console.log(datas)
            for(var i=0;i<datas.authors.length;i++){
                dataarray.push({value:datas.contributions[i],name:datas.authors[i]})
            }
            console.log(dataarray)
            window.jsondata=dataarray;
            console.log("button所得",datas.thelogintimes);
            window.jsondata1=datas.thelogintimes;
            console.log("button所得",datas.talks);
            window.jsondata2=datas.talks;
            console.log("xinde",datas.categoriestosubmit)
            window.jsondata3=datas.categoriestosubmit;
        }
    }






    let ws = new WebSocket("ws://47.94.108.20:3334")       //点击保存数据库的按钮，数据会被保存进数据库
    let flags=0;
    document.getElementById("savetomongodb").onclick = function () {

            var strs = quill.getText();
            var contents = quill.getContents();
            ws.send(JSON.stringify({type:"0",title: title, contents: strs, datas: contents,flags:flags }))
            flags=1;
         ws.onmessage = function (e) {
             if (e.data === "更新成功") {
                 alert("更新成功！");
             }
         }
    }



    document.getElementById("savethefirstarticle").onclick=function(){
        var strs = quill.getText();
        var contents = quill.getContents();
        ws.send(JSON.stringify({type:"1",title: title, contents: strs, datas: contents,flags:flags }))
        flags=1;
        ws.onmessage = function (e) {
            if (e.data === "更新成功") {
                alert("一稿更新成功！");
            }
        }
        document.getElementById("savethefirstarticle").setAttribute("disabled",true)
    }

    document.getElementById("savethesecondarticle").onclick=function(){
        var strs = quill.getText();
        var contents = quill.getContents();
        ws.send(JSON.stringify({type:"2",title: title, contents: strs, datas: contents,flags:flags }))
        flags=1;
        ws.onmessage = function (e) {
            if (e.data === "更新成功") {
                alert("二稿更新成功！");
            }
        }
        document.getElementById("savethesecondarticle").setAttribute("disabled",true)
    }

    document.getElementById("savethefinalarticle").onclick=function(){
        var strs = quill.getText();
        var contents = quill.getContents();
        ws.send(JSON.stringify({type:"3",title: title, contents: strs, datas: contents,flags:flags }))
        flags=1;
        ws.onmessage = function (e) {
            if (e.data === "更新成功") {
                alert("三稿更新成功！");
            }
        }
        document.getElementById("savethefinalarticle").setAttribute("disabled",true)
    }



    window.onbeforeunload=function () {     //页面刷新或者是关闭的时候进行页面的刷新
            ws.close()
            ws2.close()
            ws3.close()
    }



    document.getElementById("checkarticle").onclick=function () {                       //点击按钮之后从数据库里面加载对应的文章列表
            var thestudentno = document.getElementById("studentno").value;
            console.log(thestudentno)
            ws3.send(JSON.stringify({type: "catchtextno", studentno: thestudentno}));
            ws3.onmessage = function (data) {
                console.log(data)
                var datas = JSON.parse(data.data)
                console.log(datas);
                var textarrays = datas.textnos;
                console.log(textarrays)
                for (var i = 0; i < textarrays.length; i++) {
                    $("#textno").append("<option value='" + textarrays[i] + "'>" + textarrays[i] + "</option>");
                }
            }
    }