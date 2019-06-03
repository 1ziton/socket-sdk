$.ajaxSetup({
    contentType: "application/json; charset=utf-8"
});

function demoConnect() {
    // var userId = $("#userId").val();
    // var channel = $("#channel").val();
    var address = $("#address").val();

    console.log("afdsafa")
    if(!address) {
        address = "socket-server-test01.1ziton.com";
    }
    this.setWsUrl(address);
    //获取连接websocket校验字符串
    // var url = "http://" + address + "/api/message/getAuthStr";
    connectWithAuthStr();
    //设置端对端消息处理方法 -- pass
    setSendMessageUserActionCallbackFunction(function (data) {
        var gn  = data.group != null ? data.group.groupName : "";
        var msgStr = "channel:" + data.channel + " userId:" + data.userId + " group:" + gn + " say:  " + data.content;
        log(msgStr);
    });
    //设置接收消息推送处理方法
    setReceivePushMessageCallbackFunction(function (data) {
        log(JSON.stringify(data));
    });
    /*$.post( url,JSON.stringify({
        "userId" : userId,
        "channel" : channel
    }),function( data ) {
        connectWithAuthStr();
        $("#connect-status").text("已连接");
        setSendMessageUserActionCallbackFunction(function (data) {
            var gn  = data.group != null ? data.group.groupName : "";
            var msgStr = "channel:" + data.channel + " userId:" + data.userId + " group:" + gn + " say:  " + data.content;
            log(msgStr);
        })
        // this.setAuthStr(data.desc);
        // this.connect();
    }, "json");*/

}

/**
 * 获取校验字符串,测试使用，请走自己业务后端获取
 */
function getAuthStr() {
    var userId = $("#userId").val();
    var channel = $("#channel").val();
    var address = $("#address").val();
    var url = "http://" + address + "/api/message/getAuthStr";

    var result = null;

    $.ajax({
        url : url,
        type : "post",
        dataType: 'json',
        data : JSON.stringify({
            "userId" : userId,
            "channel" : channel
        }),
        async : false,
        success : function(data) {
            result = data.desc;
        }
    });
    console.log("get authStr="+ result);
    return result;
    // $.post( url,JSON.stringify({
    //     "userId" : userId,
    //     "channel" : channel
    // }),function( data ) {
    //     return data.desc;
    // });
}

function listenUserMessage(data) {
    var gn  = data.group != null ? data.group.groupName : "";
    var msgStr = "channel:" + data.channel + " userId:" + data.userId + " group:" + gn + " say:  " + data.content;
    log(msgStr);
}

function demoDisconnect() {
    this.disConnect();
    $("#connect-status").text("");
}

function setGroup() {
    var groupNames = $("#groupName").val();
    this.registerGroups(groupNames.split(','));
    console.log("groupNames:" + groupNames);
}

/**
 * 发送端对端消息--pass
 */
function demoSendUserMessage() {
    var demoMessage = $("#demoMessage").val();
    var recvUserId = $("#recvUserId").val();
    var recvChannel = $("#recvChannel").val();
    var recvGroup = $("#recvGroup").val();
    this.sendUserMessage(demoMessage, recvUserId, recvChannel, recvGroup, function (data) {
        console.log("recvResponse result:" + data);
        var gn  = data.group != null ? data.group.groupName : "";
        var msgStr = "channel:" + data.channel + " userId:" + data.userId + " group:" + gn + " say:  " + data.content;
        log(msgStr);
    });
}

/**
 * 查询历史消息列表
 */
function demoQueryHistoryMessage() {
    queryHistoryPushMessage(1,20,function(data){
        console.log("demo query history response data:" + JSON.stringify(data));
    })
}


/**
 * 已读消息触发
 */
function demoMessageRead() {
    var receiveId = $("#receiveId").val();
    messageReadAction(receiveId, function(data){
        console.log("message read action response:" + data);
    });
}


function log(message)
{
    console.log(message);
    var consl = document.getElementById('logging');
    var p = document.createElement('p');
    // try {
    //     var mobj = JSON.parse(message);
    //     if(typeof mobj == 'object' && mobj ){
    //         if (mobj.action) {
    //             if (mobj.action === "SEND_MESSAGE_USER_ACTION") {
    //                 //{"action":"SEND_MESSAGE_USER_ACTION","messageId":"HFG3UV71","code":4000,"desc":null,"jsonResult":"{\"userId\":\"U100\",\"channel\":\"C100\",\"group\":null,\"content\":\"hello\"}"}
    //                 var contObj = JSON.parse(mobj.jsonResult);
    //                 var gn  = contObj.group != null ? contObj.group.groupName : "";
    //                 message = "channel:" + contObj.channel + " userId:" + contObj.userId + " groupName:" + contObj.group + " say:" + contObj.content;
    //             }
    //         }
    //     }
    //
    // }catch (e) {
    //     console.log(e);
    // }
    p.appendChild(document.createTextNode(message));
    // consl.appendChild(p);
    // var lastend = document.getElementById('lastend');
    var firstChild = document.getElementById("logging").children[0];
    consl.insertBefore(p,firstChild);
}


