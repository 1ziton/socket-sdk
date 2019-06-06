var client;
var SocketClient = socketSdk.default;
$.ajaxSetup({
  contentType: 'application/json; charset=utf-8'
});
demoConnect();
function demoConnect() {
  var address = $('#address').val();

  if (!address) {
    address = 'socket-server-test01.1ziton.com';
  }
  getAuthStr(address);
}

function createSocket(token, address) {
  client = new SocketClient({
    url: `ws://${address}/echo`,
    authToken: token,
    pingTimeout: 480500,
    pongTimeout: 460000,
    reconnectDelay: 5000,
    debug: true
  });
  //设置接收消息推送处理方法
  client.watchForReceipt(function(data) {
    console.log('watchForReceipt');
    log(JSON.stringify(data));
  });
}

/**
 * 获取校验字符串,测试使用，请走自己业务后端获取
 */
function getAuthStr() {
  var userId = $('#userId').val();
  var channel = $('#channel').val();
  var address = $('#address').val();
  var url = 'http://' + address + '/api/message/getAuthStr';

  var result = null;

  $.ajax({
    url: url,
    type: 'post',
    dataType: 'json',
    data: JSON.stringify({
      userId: userId,
      channel: channel
    }),
    async: false,
    success: function(data) {
      result = data.desc;
      createSocket(result, address);
    }
  });
  console.log('get authStr=' + result);
  return result;
}

function listenUserMessage(data) {
  var gn = data.group != null ? data.group.groupName : '';
  var msgStr =
    'channel:' +
    data.channel +
    ' userId:' +
    data.userId +
    ' group:' +
    gn +
    ' say:  ' +
    data.content;
  log(msgStr);
}

function demoDisconnect() {
  client.disConnect();
  $('#connect-status').text('');
}

function setGroup() {
  var groupNames = $('#groupName').val();
  this.registerGroups(groupNames.split(','));
  console.log('groupNames:' + groupNames);
}

/**
 * 发送端对端消息--pass
 */
function demoSendUserMessage() {
  var demoMessage = $('#demoMessage').val();
  var recvUserId = $('#recvUserId').val();
  var recvChannel = $('#recvChannel').val();
  var recvGroup = $('#recvGroup').val();
  this.sendUserMessage(demoMessage, recvUserId, recvChannel, recvGroup, function(data) {
    console.log('recvResponse result:' + data);
    var gn = data.group != null ? data.group.groupName : '';
    var msgStr =
      'channel:' +
      data.channel +
      ' userId:' +
      data.userId +
      ' group:' +
      gn +
      ' say:  ' +
      data.content;
    log(msgStr);
  });
}

/**
 * 查询历史消息列表
 */
function demoQueryHistoryMessage() {
  client.queryHistoryPushMessage({ page: 1, size: 20 }, function(data) {
    console.log('demo query history response data:' + JSON.stringify(data));
  });
}

/**
 * 已读消息触发
 */
function demoMessageRead() {
  var receiveId = $('#receiveId').val();
  client.markMessageAsRead(receiveId, function(data) {
    console.log('message read action response:' + data);
  });
}

function log(message) {
  console.log(message);
  var consl = document.getElementById('logging');
  var p = document.createElement('p');

  p.appendChild(document.createTextNode(message));
  var firstChild = document.getElementById('logging').children[0];
  consl.insertBefore(p, firstChild);
}
