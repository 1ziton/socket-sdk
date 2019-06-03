import { DEVICECODE } from './constants';
import { HeartBeatPackage } from './interfaces';
import { SocketConfig } from './socket.config';

const EventProxy = require('eventproxy');

declare let ws: WebSocket | any;
/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 18:06:57
 * @description: 封装 Socket client
 */

// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
export default class SocketClient {
  private sendUserMessageListenerFlag = false;
  private setReceivePushMessageCallbackFunctionFlag = false;
  private heartBeatPackage: HeartBeatPackage = {
    messageId: '',
    flag: false
  };
  private readonly ep = new EventProxy();
  config: SocketConfig;
  constructor(config: SocketConfig) {
    this.config = config;
  }

  initAndConnect() {
    this.disConnect();
    this.connect();
  }

  connect() {
    if (ws == null || ws.readyState !== 1) {
      ws = new WebSocket(
        `${this.config.url}?authStr=${this.config.authToken}&deviceCode=${DEVICECODE}`
      );
      ws.onopen = (event: any) => {
        this.onOpenHandler(event);
      };

      ws.onmessage = (event: any) => {
        this.onMessageHandler(event);
      };

      ws.onclose = (event: any) => {
        this.onCloseHandler(event);
      };
      ws.onerror = (event: any) => {
        this.onErrorHandler(event);
      };
    } else {
      console.log('ws state-' + ws.readyState);
    }
  }
  /**
   * It will disconnect from the scoket.
   */
  disConnect(): void {
    if (ws != null) {
      ws.close();
      ws.onclose = null;
      ws.onopen = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws = null;
    }
  }

  private onMessageHandler(event: any) {
    let message = event.data;
    try {
      let mobj = JSON.parse(message) || {};
      if (mobj && mobj.action) {
        if (mobj.action === 'SEND_MESSAGE_USER_ACTION') {
          // 端对端消息
          // {"action":"SEND_MESSAGE_USER_ACTION","messageId":"HFG3UV71","code":4000,"desc":null,"jsonResult":"{\"userId\":\"U100\",\"channel\":\"C100\",\"group\":null,\"content\":\"hello\"}"}
          let contObj = JSON.parse(mobj.jsonResult);
          let gn = contObj.group != null ? contObj.group.groupName : '';
          message = `channel:${contObj.channel}userId:${contObj.userId}groupName:${gn} say:${
            contObj.content
          }`;
          console.log('recv msg:' + message);
          //
          // 根据msgId唯一触发执行的事件，并传送数据data
          this.ep.trigger('ep_message_SEND_MESSAGE_USER_ACTION', contObj);
        } else if (mobj.action === 'CLIENT_PING_ACTION') {
          // let contObj = JSON.parse(mobj.jsonResult);
          console.log('ping return message:' + message);
          if (this.heartBeatPackage.flag) {
            if (mobj.messageId === this.heartBeatPackage.messageId) {
              this.heartBeatPackage.messageId = mobj;
              this.heartBeatPackage.flag = false;
            } else {
              this.disConnect();
              this.connect();
            }
          }
        } else if (mobj.action === 'REGISTER_GROUP_ACTION') {
          console.log('register group action return : ' + message);
          let contObj = JSON.parse(mobj.jsonResult);
          // 根据msgId唯一触发执行的事件，并传送数据data
          // ep.trigger(`ep_message_${msgId}`, contObj);
        } else if (mobj.action === 'QUERY_RESULT_ACTION') {
          let contObj = JSON.parse(mobj.jsonResult);
          console.log('query_result_action result: ' + contObj);
          this.ep.trigger(`ep_result_message_${mobj.messageId}`, contObj);
        } else if (mobj.action === 'SERVER_PUSH_MESSAGE_ACTION') {
          // 业务端推送消息
          let contObj = JSON.parse(mobj.jsonResult);
          console.log('SERVER_PUSH_MESSAGE_ACTION result: ' + contObj);
          if (this.setReceivePushMessageCallbackFunctionFlag) {
            this.ep.trigger('SERVER_PUSH_MESSAGE_TRIGGER', contObj);
          } else {
            console.log(
              'setReceivePushMessageCallbackFunction function not set the value, pass deal with push message.' +
                contObj
            );
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  private onOpenHandler(event: any) {
    console.log('websocket connected.');
    // heartBeat.reset().start();
  }
  private onCloseHandler(event: any) {
    console.log('websocket connected.');
    // heartBeat.reset().start();
  }

  private onErrorHandler(event: any) {
    console.log('websocket connected.');
    // heartBeat.reset().start();
  }
}
