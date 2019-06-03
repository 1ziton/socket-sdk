/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 18:06:57
 * @description: 封装 Socket client
 */

import { DEVICECODE, SERVER_PUSH_MESSAGE_TRIGGER } from './constants';
import { BussinessParams, ClientMessage, HeartBeatPackage, UserMessageParams } from './interfaces';
import { Logger } from './logger';
import { SocketAction } from './socket-action';
import { SocketConfig } from './socket.config';
import { isFunction, isSupportWebsocket } from './util';
import { uuid } from './uuid';

const EventProxy = require('eventproxy');

let ws: WebSocket | any;

// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
export default class SocketClient {
  private watchForUserReceiptFlag = false;

  private watchForReceiptFlag = false;

  private heartBeatPackage: HeartBeatPackage = {
    messageId: '',
    flag: false
  };

  private config: SocketConfig;
  private readonly ep = new EventProxy();

  constructor(config: SocketConfig) {
    this.config = config;
    this.initAndConnect();
  }

  initAndConnect() {
    if (!isSupportWebsocket()) {
      Logger.getInstance('websocket status').error(
        '您的浏览器不支持Websocket通信协议，请使用Chrome或者Firefox浏览器！'
      );
      return;
    }
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
        this.onWebSocketClose(event);
      };
      ws.onerror = (event: any) => {
        this.onWebSocketError(event);
      };
    } else {
      Logger.getInstance('websocket status').debug(`state-${ws.readyState}`);
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
    let message = '';
    try {
      let msgObj = JSON.parse(event.data) || {};
      if (!(msgObj && msgObj.action)) {
        return;
      }
      const action = msgObj.action;
      if (action === SocketAction.SEND_MESSAGE_USER) {
        // 端对端消息
        // {"action":"SEND_MESSAGE_USER_ACTION","messageId":"HFG3UV71","code":4000,"desc":null,"jsonResult":"{\"userId\":\"U100\",\"channel\":\"C100\",\"group\":null,\"content\":\"hello\"}"}
        let jsonResult = JSON.parse(msgObj.jsonResult);
        const { group = {}, channel, userId, content } = jsonResult;
        const { groupName = '' } = group;
        message = `channel:${channel}，userId:${userId}，groupName:${groupName}， say:${content}`;
        // 根据msgId唯一触发执行的事件，并传送数据data
        this.ep.trigger(`ep_message_${SocketAction.SEND_MESSAGE_USER}`, jsonResult);
        this.debug(action, message);
      } else if (action === SocketAction.CLIENT_PING) {
        // let content = JSON.parse(msgObj.jsonResult);
        if (this.heartBeatPackage.flag) {
          if (msgObj.messageId === this.heartBeatPackage.messageId) {
            this.heartBeatPackage.messageId = msgObj;
            this.heartBeatPackage.flag = false;
          } else {
            this.disConnect();
            this.connect();
          }
        }
        this.debug('PING', message);
      } else if (action === SocketAction.REGISTER_GROUP) {
        let content = JSON.parse(msgObj.jsonResult);
        // 根据msgId唯一触发执行的事件，并传送数据data
        // ep.trigger(`ep_message_${msgId}`, content);
        this.debug(action, message);
      } else if (action === SocketAction.QUERY_RESULT) {
        let jsonResult = JSON.parse(msgObj.jsonResult);
        this.ep.trigger(`ep_result_message_${msgObj.messageId}`, jsonResult);
        this.debug(action, jsonResult);
      } else if (action === SocketAction.SERVER_PUSH_MESSAGE) {
        // 业务端推送消息
        let jsonResult = JSON.parse(msgObj.jsonResult);
        if (this.watchForReceiptFlag) {
          this.ep.trigger(SERVER_PUSH_MESSAGE_TRIGGER, jsonResult);
        } else {
          Logger.getInstance('onMessageHandler').info(
            '>> watchForReceiptFlag function not set the value, pass deal with push message.' +
              jsonResult
          );
        }
        this.debug(action, jsonResult);
      }
    } catch (e) {
      Logger.getInstance('onMessageHandler').error(e);
    }
  }

  /**
   * 设置用户端对端消息通信信息处理方法
   * @param callback
   */
  watchForUserReceipt(callback: Function) {
    if (!isFunction(callback)) {
      throw new Error('watchForUserReceipt param "callback" is not a function');
    }
    if (!this.watchForUserReceiptFlag) {
      this.watchForUserReceiptFlag = true;
      this.ep.on(`ep_message_${SocketAction.SEND_MESSAGE_USER}`, (data: any) => {
        callback(data);
      });
    }
  }

  /**
   * 设置接收业务端推送消息处理方法
   * @param callback
   */
  watchForReceipt(callback: Function) {
    if (!isFunction(callback)) {
      throw new Error('watchForReceipt "callback" is not a function');
    }
    // Will be called after server acknowledges
    this.ep.on(SERVER_PUSH_MESSAGE_TRIGGER, (data: any) => {
      callback(data);
    });
    this.watchForReceiptFlag = true;
  }

  /**
   * 消息已读动作
   * @param contentId
   * @param callback
   */
  markMessageAsRead(contentId: string, callback: Function) {
    const jsonMessage: BussinessParams = {
      bussinessAction: SocketAction.MESSAGE_READ,
      contentId: contentId
    };
    const clientJson: ClientMessage = {
      action: SocketAction.CLIENT_QUERY,
      messageId: uuid(16, 16),
      jsonMessage: JSON.stringify(jsonMessage)
    };
    this.ep.once(`ep_result_message_${clientJson.messageId}`, (data: any) => {
      callback(data);
    });
    try {
      ws.send(JSON.stringify(clientJson));
    } catch (e) {
      Logger.getInstance('markMessageAsRead').error(e);
    }
  }

  /**
   * 发送消息给用户
   * @param options {Object}
   * @param callback {Function}
   */
  sendUserMessage(options: any, callback: Function) {
    const { message, userId, channel, groupName } = options;
    if (!isFunction(callback)) {
      throw new Error('cb is not a function');
    }
    if (ws == null) {
      this.connect();
    }
    if (ws != null) {
      const jsonMessage: UserMessageParams = {
        userId: userId,
        channel: channel,
        group: { groupName: groupName },
        content: message
      };
      const clientJson: ClientMessage = {
        action: SocketAction.SEND_MESSAGE_USER,
        messageId: uuid(16, 16),
        jsonMessage: JSON.stringify(jsonMessage)
      };
      // 发送到后端之前，根据msgId自定义监听事件名称，onMessage会自动触发此事件，然后执行cb回调，可以达到异步回调效果
      // once 是只监听一次这个事件，执行后自动解绑
      Logger.getInstance('sendUserMessage').info(
        `read send message with messageId:${clientJson.messageId}`
      );
      this.ep.once(`ep_message_${clientJson.messageId}`, (data: any) => {
        callback(data);
      });
      try {
        ws.send(JSON.stringify(clientJson));
      } catch (e) {
        Logger.getInstance('sendUserMessage').error(e);
      }
    }
  }

  private debug(action: string, ...args: any[]) {
    if (this.config.debug) {
      Logger.getInstance(action).debug(args);
    }
  }

  private onOpenHandler(event: any) {
    console.log('websocket connected.');
    // heartBeat.reset().start();
  }
  private onWebSocketClose(event: any) {
    //服务器端主动断开
    Logger.getInstance('websocket status').info('websocket onclose event, connect again');
  }

  private onWebSocketError(event: any) {
    Logger.getInstance('websocket status').error(event.data);
  }
}
