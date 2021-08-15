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
let ws2=new WebSocket("ws://localhost:3335")
// document.getElementById("confirm").onclick=function() {
document.getElementById("confirm").onclick=function(){

    var studentno=document.getElementById("studentno").value

    title=document.getElementById("textno").value

    var data=JSON.stringify({textno:title,studentno:studentno})

    ws2.send(data)

    ws2.onmessage=function(e){
        var data = JSON.parse(e.data);
        var theindex = 0;
        let authors=[]
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


            let websocketEndpoint = "ws://127.0.0.1:8085";

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
    // ws=new WebSocket("ws://localhost:3334")
    // ws.onopen=function(){
    //     ws.send(JSON.stringify({title:title,id:id1,studentname:studentname}))
    // }

}






    let ws = new WebSocket("ws://localhost:3334")       //点击保存数据库的按钮，数据会被保存进数据库
    let flags=0;
    document.getElementById("savetomongodb").onclick = function () {

            var strs = quill.getText();
            var contents = quill.getContents();
            ws.send(JSON.stringify({title: title, contents: strs, datas: contents,flags:flags }))
            flags=1;
         ws.onmessage = function (e) {
             if (e.data === "更新成功") {
                 alert("更新成功！");
             }
         }
    }

