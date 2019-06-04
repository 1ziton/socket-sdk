/* tslint:disable */
/**
 * 事件式编程
 */
export default class EventEmitter {
  private _debuger_;
  private _callback_;

  fire: (ev: any, ...args: any[]) => this;
  emit: (ev: any, ...args: any[]) => this;
  bind: (ev: any, callback: any) => this;
  on: (ev: any, callback: any) => this;
  unon: (ev: any, callback?: Function | undefined) => this;
  unbind: (ev: any, callback?: Function | undefined) => this;
  unbindAll: (eventName: any) => void;

  constructor(debug = false) {
    this._debuger_ = !!debug;
    this._callback_ = {};
    // 兼容api习惯
    this.fire = this.trigger;
    this.emit = this.trigger;
    this.bind = this.addListener;
    this.on = this.addListener;
    this.unon = this.removeListener;
    this.unbind = this.removeListener;
    this.unbindAll = this.removeAllListeners;
  }

  debug(info) {
    if (!this._debuger_) return;
    console.log(info);
  }

  /**
   * 事件监听
   * @param {string} ev 事件名称
   * @param {function} callback 回调函数
   */
  addListener(ev, callback) {
    this.debug(`Add listener for ${ev}`);
    this._callback_[ev] = this._callback_[ev] || [];
    this._callback_[ev].push(callback);
    return this;
  }

  /**
   * 移除事件监听
   * @param {string} ev 事件名称
   * @param {function} callback 回调函数
   */
  removeListener(ev, callback?: Function) {
    let calls = this._callback_;
    if (!ev) {
      this.debug('Remove all listeners');
      this._callback_ = {};
      return this;
    }
    if (!callback) {
      this.debug(`Remove all listeners of ${ev}`);
      calls[ev] = [];
      return this;
    }
    let list = calls[ev] || [];
    list.forEach((cb, index) => {
      if (cb === callback) {
        this.debug(`Remove all listeners of ${ev}`);
        list[index] = null;
      }
    });
    return this;
  }

  /**
   *  移除所有事件监听
   * @param eventName
   */
  removeAllListeners(eventName) {
    this.removeListener(eventName);
  }

  /**
   * 事件触发器
   * @param {string} ev 事件名称
   * @param {*} data 数据
   */
  trigger(ev, ...args: any[]) {
    let list,
      callback,
      calls = this._callback_;
    if (!ev) return this;
    list = calls[ev] || [];
    list.forEach((cb, i) => {
      if (!(callback = cb)) {
        list.splice(i, 1);
      } else {
        let _args: any = [];
        for (let j = 0; j <= args.length; j++) {
          _args.push(args[j]);
        }
        callback.apply(this, _args);
      }
    });
    return this;
  }

  /**
   * Bind an event like the bind method, but will remove the listener after it was fired.
   * @param {String} ev Event name
   * @param {Function} callback Callback
   */
  once(ev, callback) {
    let self = this;
    let wrapper = function() {
      callback.apply(self, arguments);
      self.unbind(ev, wrapper);
    };
    this.bind(ev, wrapper);
    return this;
  }
}
