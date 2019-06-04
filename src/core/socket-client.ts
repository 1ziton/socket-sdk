/**
 * @author: @liangjingmin
 * @maitainby @giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 18:06:57
 * @description: 封装 Socket client
 */
// tslint:disable:no-empty
import EventProxy from './event';
import { DEVICECODE, SERVER_PUSH_MESSAGE_TRIGGER } from './constants';
import { HeartBeat } from './heartbeat';
import {
  BussinessParams,
  ClientMessage,
  HeartBeatPackage,
  PingMessage,
  UserMessageParams
} from './interfaces';
import { Logger } from './logger';
import { SocketAction } from './socket-action';
import { SocketConfig } from './socket-config';
import { isFunction, isSupportWebsocket } from './util';
import { uuid } from './uuid';
//

export default class SocketClient extends HeartBeat {
  private watchForUserReceiptFlag = false;

  private watchForReceiptFlag = false;

  private heartBeatPackage: HeartBeatPackage = {
    messageId: '',
    flag: false
  };

  private config: SocketConfig;
  private readonly ep = new EventProxy();

  ws: WebSocket | any;

  constructor(config: SocketConfig) {
    super(config);
    this.config = config;
    this.initAndConnect();
  }

  get url(): string {
    return this.config.url;
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
    try {
      this.ws = new WebSocket(
        `${this.config.url}?authStr=${this.config.authToken}&deviceCode=${DEVICECODE}`
      );
      this.initEventHandler();
    } catch (e) {
      this.reconnect(() => {
        this.connect();
      });
      throw e;
    }
  }

  /**
   * It will disconnect from the scoket.
   */
  disConnect(): void {
    if (this.ws != null) {
      this.ws.close();
      this.ws.onclose = null;
      this.ws.onopen = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws = null;
    }
  }

  initEventHandler() {
    this.ws.onopen = (event: any) => {
      this.onOpenHandler(event);
    };

    this.ws.onclose = (event: any) => {
      this.onWebSocketClose(event);
    };

    this.ws.onerror = (event: any) => {
      this.onWebSocketError(event);
    };

    this.ws.onmessage = (event: any) => {
      this.onMessageHandler(event);
      // 如果获取到消息，心跳检测重置
      // 拿到任何消息都说明当前连接是正常的
      this.heartCheck();
    };
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
      this.ws.send(JSON.stringify(clientJson));
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
    if (this.ws === null) {
      this.connect();
    }

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
      this.ws.send(JSON.stringify(clientJson));
    } catch (e) {
      Logger.getInstance('sendUserMessage').error(e);
    }
  }

  /**
   * 查询收到业务端推送历史消息
   * @param pageInfo
   * @param callback
   */
  queryHistoryPushMessage(pageInfo: { page: number; size: number }, callback: Function) {
    const jsonMessage = {
      bussinessAction: SocketAction.QUERY_HISTORY_MESSAGE,
      ...pageInfo
    };
    const clientJson = {
      action: SocketAction.CLIENT_QUERY,
      messageId: uuid(16, 16),
      jsonMessage: JSON.stringify(jsonMessage)
    };
    this.ep.once(`ep_result_message_${clientJson.messageId}`, (data: any) => {
      callback(data);
    });
    try {
      let msg = JSON.stringify(clientJson);
      // this.ws.send(JSON.stringify(clientJson));
      this.send(msg, () => {
        Logger.getInstance(SocketAction.QUERY_HISTORY_MESSAGE).debug('发送成功！');
      });
    } catch (e) {
      Logger.getInstance(SocketAction.QUERY_HISTORY_MESSAGE).error(e);
    }
  }

  /**
   * send messages via a proxy function that waits for the readyState to be 1
   * @param message
   * @param callback
   */
  send(message: string, callback: Function = () => {}) {
    this.waitForConnection(() => {
      this.ws.send(message);
      if (isFunction(callback)) {
        callback();
      }
    }, 1000);
  }

  /**
   * waits for the readyState to be 1
   * @param callback
   * @param interval
   */
  waitForConnection(callback: Function, interval: number) {
    if (this.ws.readyState === 1) {
      if (isFunction(callback)) {
        callback();
      }
    } else {
      // optional: implement backoff for interval here
      setTimeout(() => {
        this.waitForConnection(callback, interval);
      }, interval);
    }
  }

  /**
   * websocket message receive handler
   * @param event
   */
  private onMessageHandler(event: any) {
    let message = event.data;
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
        /* if (!this.heartBeatPackage.flag) {
          return;
        }
        if (msgObj.messageId === this.heartBeatPackage.messageId) {
          this.heartBeatPackage.messageId = msgObj;
          this.heartBeatPackage.flag = false;
        } else {
          this.disConnect();
          this.connect();
        } */
        this.debug('PING', message);
      } else if (action === SocketAction.REGISTER_GROUP) {
        let jsonResult = JSON.parse(msgObj.jsonResult);
        // ep.trigger(`ep_message_${msgId}`, jsonResult);
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
            `>> watchForReceiptFlag function not set the value, pass deal with push message.${jsonResult}`
          );
        }
        this.debug(action, jsonResult);
      }
    } catch (e) {
      Logger.getInstance('onMessageHandler').error(e);
    }
  }

  heartCheck() {
    this.heartReset();
    this.heartStart();
  }

  heartStart() {
    let pingMsg: PingMessage = {
      action: SocketAction.CLIENT_PING,
      messageId: '',
      jsonMessage: 'ping'
    };
    // No reconnection, no heartbeat
    if (this.forbidReconnect) return;
    this.pingTimeoutId = setTimeout(() => {
      // 这里发送一个心跳，后端收到后，返回一个心跳消息，onmessage拿到返回的心跳就说明连接正常
      pingMsg.messageId = uuid(16, 16);
      this.ws.send(JSON.stringify(pingMsg));
      // 如果超过一定时间还没重置，说明后端主动断开了
      this.pongTimeoutId = setTimeout(() => {
        // 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
        this.ws.close();
      }, this.opts.pongTimeout);
    }, this.opts.pingTimeout);
  }

  private debug(action: string, ...args: any[]) {
    if (this.config.debug) {
      Logger.getInstance(action).debug(args);
    }
  }

  private onOpenHandler(event: any) {
    Logger.getInstance('websocket status').info('Opening a connection...');
    // heartBeat.reset().start();
  }
  private onWebSocketClose(event: any) {
    // 服务器端主动断开
    Logger.getInstance('websocket status').info('websocket onclose event, connect again');
  }

  private onWebSocketError(event: any) {
    Logger.getInstance('websocket status').error(event.data);
  }
}
