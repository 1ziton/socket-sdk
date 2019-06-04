/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-04 14:54:00
 * @description: 心跳检查
 */
import { isFunction } from './util';

// tslint:disable:no-empty

export interface HeartBeatOption {
  pingTimeout?: number;
  pongTimeout?: number;
  reconnectDelay?: number;
  pingMsg?: string;
  repeatLimit?: number | null;
}

export class HeartBeat {
  opts: HeartBeatOption;
  repeat = 0;
  forbidReconnect = false;
  lockReconnect = false;
  pingTimeoutId: any;
  pongTimeoutId: any;

  constructor(option: HeartBeatOption) {
    this.opts = option;
  }

  // override hook function
  onclose = () => {};
  onerror = () => {};
  onopen = () => {};
  onmessage = () => {};
  onreconnect = () => {};

  heartReset() {
    clearTimeout(this.pingTimeoutId);
    clearTimeout(this.pongTimeoutId);
  }

  close() {
    // if close by manually, fobidden reconnecting
    this.forbidReconnect = true;
    this.heartReset();
  }

  reconnect(cb: Function) {
    // limit repeat times
    if (
      this.opts.repeatLimit &&
      this.opts.repeatLimit > 0 &&
      this.opts.repeatLimit <= this.repeat
    ) {
      return;
    }

    if (this.lockReconnect || this.forbidReconnect) return;
    this.lockReconnect = true;
    // count after lockReconnect, avoid invalid counting
    this.repeat++;
    this.onreconnect();
    // try reconnect util connection,set the delay to avoid too many requests
    setTimeout(() => {
      // create WebSocket in callback function
      if (isFunction(cb)) cb();
      this.lockReconnect = false;
    }, this.opts.reconnectDelay);
  }
}
