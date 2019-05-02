// mojuleの読み込み
const http = require("http");
const fs = require("fs");
const ejs = require("ejs");
const url = require("url");
const qs = require("querystring");

// ejsの読み込み
const indexPage = fs.readFileSync("ejs/index.ejs", "utf8");
const loginPage = fs.readFileSync("ejs/login.ejs", "utf8");

// CSSの読み込み
const styleCss = fs.readFileSync("css/style.css", "utf8");

const maxNumber = 10;
const filePath = "resources/";
const fileName = "myData.txt";

// データ
var message_data;

readFromFile(filePath, fileName);

var server = http.createServer(getFromClient);

var portNumber = 3000;
server.listen(portNumber);

console.log("server start Up!!! port:" + portNumber);
// ここまでMainプログラム

function getFromClient(request, response) {

    var url_parts = url.parse(request.url, true);

    if (url_parts.pathname == "/") {
        responseIndex(request, response);
    } else if (url_parts.pathname == "/login") {
        responseLogin(request, response);
    } else if (url_parts.pathname == "/css/style.css") {
        response.writeHead(200, {
            "Content-Type" : "text/css"
        });
        response.write(styleCss);
        response.end();
    }
}

function responseIndex(request, response) {
    if (request.method == "POST") {
        var body = "";

        // データ受信時のイベント処理
        request.on("data", function (data) {
            body += data;
        });

        // データ受信終了時のイベント処理
        request.on("end", function () {
            data = qs.parse(body);
            addToData(data.id, data.msg, filePath, fileName, request);
            writeIndex(request, response);
        });
    } else {
        writeIndex(request, response);
    }
}

function writeIndex(request, response) {
    var msg = "なにかメッセージを書いて下さい";
    var content = ejs.render(indexPage, {
        title : "Index",
        content : msg,
        data : message_data,
        filename : "ejs/data_item"
    });
    response.writeHead(200, {
        "Content-Type" : "text/html"
    });
    response.write(content);
    response.end();
}

function responseLogin(request, response) {
    var content = ejs.render(loginPage, {});
    response.writeHead(200, {
        "Content-Type" : "text/html"
    });
    response.write(content);
    response.end();
}

function readFromFile(filePath, fileName) {
    var file = filePath + fileName;
    fs.readFile(file, "utf8", function (err, data) {
        message_data = data.split("\n");
    });
}

function addToData(id, msg, filePath, fileName, request) {
    var obj = {"id" : id, "msg" : msg};
    var objStr = JSON.stringify(obj);
    console.log("add Data : " + objStr);
    message_data.unshift(objStr);
    if (message_data.length > maxNumber) {
        message_data.pop();
    }
    saveToFile(filePath, fileName);
}

function saveToFile(filePath, fileName) {
    var data_str = message_data.join("\n");
    var file = filePath + fileName;
    fs.writeFile(file, data_str, function (err) {
        if (err) {
            throw err;
        }
    });
}

