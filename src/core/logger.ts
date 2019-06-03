/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 17:42:13
 * @description: 日记类
 */

import { isNotNil, isFunction, isNil } from './util';

export class Logger {
  static instances: {
    [key: string]: Logger;
  } = {};

  private readonly id: string;
  private readonly start: number;

  constructor(id: string) {
    this.id = id;
    this.start = Date.now();
  }

  debug(...args: any) {
    if (isNotNil(window) && window.console && isFunction(console.debug)) {
      console.debug(this.id, `${this.getTime()}ms`, ...args);
    } else {
      this.info(...args);
    }
  }

  getTime(): number {
    return Date.now() - this.start;
  }

  static create(id: string) {
    Logger.instances[id] = new Logger(id);
  }

  static destroy(id: string) {
    delete Logger.instances[id];
  }

  static getInstance(id: string): Logger {
    const instance = Logger.instances[id];
    if (isNil(instance)) {
      throw new Error(`No logger instance found witdh id ${id}`);
    }
    return instance;
  }

  info(...args: any) {
    if (isNotNil(window) && window.console && isFunction(console.info)) {
      console.info(this.id, `${this.getTime()}ms`, ...args);
    }
  }

  error(...args: any) {
    if (isNotNil(window) && window.console && isFunction(console.error)) {
      console.error(this.id, `${this.getTime()}ms`, ...args);
    } else {
      this.info(...args);
    }
  }

  log(...args: any) {
    if (isNotNil(window) && window.console && isFunction(console.log)) {
      console.log(this.id, `${this.getTime()}ms`, ...args);
    }
  }
}
