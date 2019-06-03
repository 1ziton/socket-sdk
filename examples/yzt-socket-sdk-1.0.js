var ws = null;
var url = "ws://localhost:8080/echo";
var deviceCode = uuid(32,16);
// var groups = [];
var authStr = null;

var retryCount = 10;

var heartBeatPackage = {'messageId':'','flag':false};

var sendUserMessageListenerFlag = false;

var setReceivePushMessageCallbackFunctionFlag = false;

var queryAction = "CLIENT_QUERY_ACTION";

/**
 * ping包消息
 * @type {{action: string, messageId: *, jsonMessage: string}}
 */
var pingMsg = {
    "action" : "CLIENT_PING_ACTION",
    "messageId" : uuid(16, 16),
    "jsonMessage" : "ping"
};
var clientMsg = {
    "action" : '',
    "messageId" : uuid(16, 16),
    "jsonMessage" : ''
}

/**
 * 利用事件来包装，一个管道解决send异步拿到结果问题
 */
var ep = new EventProxy(); // 事件代理对象（可自定义事件发送和监听，需要引入eventproxy.js：https://github.com/JacksonTian/eventproxy）

/**
 * 根据校验串连接websocket
 * @param authStr
 */
function connectWithAuthStr() {
    try{
        if(window.WebSocket) {
            if (ws == null || ws.readyState !== 1) {
                this.authStr = getAuthStr();
                console.log("authStr=" + authStr);
                connect();
            }
        }
    }catch (e) {
        throw  Error('You need create method with name "authStr" for get websocket auth string.');
    }
    // setAuthStr(authStr);
}

function connect() {
    if(window.WebSocket){
        if(ws == null || ws.readyState !== 1) {
            ws = new WebSocket(url + "?authStr=" + this.authStr + "&deviceCode=" + this.deviceCode);
            ws.onopen = function(event) {
                onOpen(event)
            };

            ws.onmessage = function(event) {
                onMessage(event);
            };

            ws.onclose = function(event) {
                onClose(event);
            };
            ws.onerror = function (event) {
                onError(event)
            };
        }else{
            console.log("ws state-" + ws.readyState);
        }
    }else {
        alert("not support websocket");
    }


}

function disConnect() {
    if (ws != null) {
        ws.close();
        ws.onclose = null;
        ws.onopen = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws = null;
    }
}


function setWsUrl(address) {
    url = "ws://" + address + "/echo";
}

function setAuthStr(authStr) {
    this.authStr = authStr;
}

/**
 * 客户端注册消息组
 * @param groups
 */
function registerGroups(groups) {
    if (isArray(groups) && groups.length > 0) {

        var groupList = [];
        for(var i = 0; i < groups.length; i++) {
            groupList.push({"groupName": groups[i]});
        }
        var groupMsg = {
            "action": 'REGISTER_GROUP_ACTION',
            "messageId": uuid(16, 16),
            "jsonMessage": JSON.stringify(groupList)
        }
        if(!ws) {
            connect();
        }
        ws.send(JSON.stringify(groupMsg));

    }else{
        alert("register groups param must be array!")
    }
}

/**
 * socket连接成功
 * @param event
 */
function onOpen(event) {
    console.log("websocket connected.")
    heartBeat.reset().start();
}

/**
 * socket消息监听
 * @param event
 */
function onMessage(event) {
    var message = event.data;
    try {
        var mobj = JSON.parse(message);
        if(typeof mobj == 'object' && mobj ){
            if (mobj.action) {
                if (mobj.action === "SEND_MESSAGE_USER_ACTION") {//端对端消息
                    //{"action":"SEND_MESSAGE_USER_ACTION","messageId":"HFG3UV71","code":4000,"desc":null,"jsonResult":"{\"userId\":\"U100\",\"channel\":\"C100\",\"group\":null,\"content\":\"hello\"}"}
                    var contObj = JSON.parse(mobj.jsonResult);
                    var gn  = contObj.group != null ? contObj.group.groupName : "";
                    message = "channel:" + contObj.channel + " userId:" + contObj.userId + " groupName:" + gn + " say:" + contObj.content;
                    console.log("recv msg:" + message);
                    //
                    // 根据msgId唯一触发执行的事件，并传送数据data
                    ep.trigger('ep_message_SEND_MESSAGE_USER_ACTION', contObj);
                }else if(mobj.action === "CLIENT_PING_ACTION") {
                    // var contObj = JSON.parse(mobj.jsonResult);
                    console.log("ping return message:" + message);
                    if(heartBeatPackage.flag) {
                        if(mobj.messageId === heartBeatPackage.messageId) {
                            heartBeatPackage.messageId = mobj;
                            heartBeatPackage.flag = false;
                        }else{
                            disConnect();
                            connect();
                        }
                    }
                }else if(mobj.action == "REGISTER_GROUP_ACTION") {
                    console.log("register group action return : " + message);
                    var contObj = JSON.parse(mobj.jsonResult);
                    // 根据msgId唯一触发执行的事件，并传送数据data
                    // ep.trigger(`ep_message_${msgId}`, contObj);
                }else if(mobj.action == 'QUERY_RESULT_ACTION'){
                    var contObj = JSON.parse(mobj.jsonResult);
                    console.log("query_result_action result: " + contObj);
                    ep.trigger(`ep_result_message_${mobj.messageId}`, contObj);
                }else if(mobj.action == 'SERVER_PUSH_MESSAGE_ACTION') {//业务端推送消息
                    var contObj = JSON.parse(mobj.jsonResult);
                    console.log("SERVER_PUSH_MESSAGE_ACTION result: " + contObj);
                    if(setReceivePushMessageCallbackFunctionFlag) {
                        ep.trigger('SERVER_PUSH_MESSAGE_TRIGGER', contObj);
                    }else {
                        console.log("setReceivePushMessageCallbackFunction function not set the value, pass deal with push message." + contObj);
                    }
                }
            }
        }

    }catch (e) {
        console.log(e);
    }
}

function onClose(event) {
    //服务器端主动断开
    console.log("websocket onclose event, connect again");
}

function onError(event) {
    console.log('Error occured: ' + event.data);
}

/**
 * 查询收到业务端推送历史消息
 */
function queryHistoryPushMessage(page, size, callbackFun) {
    var jsonMessage = {
        'bussinessAction': 'QUERY_HISTORY_MESSAGE_ACTION',
        'page': page,
        'size': size
    };
    var clientJson = {
        "action" : "CLIENT_QUERY_ACTION",
        "messageId" : uuid(16, 16),
        "jsonMessage" : JSON.stringify(jsonMessage)
    };
    ep.once(`ep_result_message_${clientJson.messageId}`, function(data) {
        callbackFun(data);
    });
    try{
        ws.send(JSON.stringify(clientJson));
    }catch(e) {
        console.log(e);
    }
}

/**
 * 消息已读动作
 */
function messageReadAction(contentId, callbackFun) {
    var jsonMessage = {
        'bussinessAction': 'MESSAGE_READ_ACTION',
        'contentId': contentId
    };
    var clientJson = {
        "action" : "CLIENT_QUERY_ACTION",
        "messageId" : uuid(16, 16),
        "jsonMessage" : JSON.stringify(jsonMessage)
    };
    ep.once(`ep_result_message_${clientJson.messageId}`, function(data) {
        callbackFun(data);
    });
    try{
        ws.send(JSON.stringify(clientJson));
    }catch(e) {
        console.log(e);
    }
}

/**
 * 发送消息给用户
 * @param message
 * @param userId
 * @param channel
 * @param groupName
 * @param callbackFun
 */
function sendUserMessage(message, userId, channel, groupName, callbackFun) {
    if (!isFunction(callbackFun)) {
        throw new Error('cb is not a function');
    }
    if(ws == null) {
        connect();
    }
    if (ws != null) {
        var jsonMessage = {
            "userId": userId,
            "channel": channel,
            "group": {'groupName':groupName},
            "content": message
        };
        var clientJson = {
            "action" : "SEND_MESSAGE_USER_ACTION",
            "messageId" : uuid(16, 16),
            "jsonMessage" : JSON.stringify(jsonMessage)
        };
        // 发送到后端之前，根据msgId自定义监听事件名称，onMessage会自动触发此事件，然后执行cb回调，可以达到异步回调效果
        // once 是只监听一次这个事件，执行后自动解绑
        console.log("read send message with messageId:" + clientJson.messageId);
        ep.once(`ep_message_${clientJson.messageId}`, function(data) {
            callbackFun(data);
        });
        try{
            ws.send(JSON.stringify(clientJson));
        }catch(e) {
            console.log(e);
        }

    }
}


/**
 * 设置用户端对端消息通信信息处理方法
 * @param callbackFun
 */
function setSendMessageUserActionCallbackFunction(callbackFun) {
    if (!isFunction(callbackFun)) {
        throw new Error('setSendMessageUserActionCallbackFunction param "callbackFun" is not a function');
    }
    if(!sendUserMessageListenerFlag) {
        sendUserMessageListenerFlag = true;
        ep.on('ep_message_SEND_MESSAGE_USER_ACTION', function(data) {
            callbackFun(data);
        });
    }

}

/**
 * 设置接收业务端推送消息处理方法
 * @param callbackFun
 */
function setReceivePushMessageCallbackFunction(callbackFun) {
    if(!isFunction(callbackFun)) {
        throw new Error('setReceivePushMessageCallbackFunction "callbackFun" is not a function');
    }
    ep.on('SERVER_PUSH_MESSAGE_TRIGGER', function (data) {
        callbackFun(data);
    });
    setReceivePushMessageCallbackFunctionFlag = true;
}


// 监听窗口事件，当窗口关闭时，主动断开websocket连接，防止连接没断开就关闭窗口，server端报错
window.onbeforeunload = function(){
    console.log("websocket closing...");
    ws.close();
    clearTimeout(heartBeat.serverTimeoutObj);
}

// 心跳检测, 每隔一段时间检测连接状态，如果处于连接中，就向server端主动发送消息，来重置server端与客户端的最大连接时间，如果已经断开了，发起重连。
var heartBeat = {
    timeout: 180000,        // 3分钟发一次心跳，比server端设置的连接时间稍微小一点，在接近断开的情况下以通信的方式去重置连接时间。
    serverTimeoutObj: null,
    reset: function(){
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function(){
        var self = this;
        this.serverTimeoutObj = setInterval(function(){
            console.log(Date.now())
            if(ws.readyState == 1){
                console.log("连接状态，发送消息保持连接");
                pingMsg.messageId = uuid(16, 16);
                heartBeatPackage.messageId = pingMsg.messageId;
                heartBeatPackage.flag = true;
                ws.send(JSON.stringify(pingMsg));
                heartBeat.reset().start();    // 如果获取到消息，说明连接是正常的，重置心跳检测
            }else{
                console.log("断开状态，尝试重连");
                connectWithAuthStr();
            }
        }, this.timeout)
    }

}


function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

function isArray(o){
    return Object.prototype.toString.call(o)=='[object Array]';
}

function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
}
