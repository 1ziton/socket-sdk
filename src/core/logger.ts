/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 17:42:13
 * @description: Logger class
 */

import { formatTime, isFunction, isNil, isNotNil } from './util';

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

  debug(...args: any[]) {
    if (isNotNil(window) && window.console && isFunction(console.debug)) {
      console.debug(this.id, `${this.getTime()}ms`, ...args);
    } else {
      this.info(...args);
    }
  }

  getTime(): string {
    // return `${Date.now() - this.start}ms`;
    return formatTime(new Date());
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
      // throw new Error(`No logger instance found witdh id ${id}`);
      this.create(id);
      return Logger.instances[id];
    }
    return instance;
  }

  info(...args: any[]) {
    if (isNotNil(window) && window.console && isFunction(console.info)) {
      console.info(this.id, `${this.getTime()}`, ...args);
    }
  }

  error(...args: any[]) {
    if (isNotNil(window) && window.console && isFunction(console.error)) {
      console.error(this.id, `${this.getTime()}`, ...args);
    } else {
      this.info(...args);
    }
  }

  log(...args: any[]) {
    if (isNotNil(window) && window.console && isFunction(console.log)) {
      console.log(this.id, `${this.getTime()}`, ...args);
    }
  }
}
