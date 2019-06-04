/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 18:26:50
 * @description: config
 */
export class SocketConfig {
  /**
   * Server URL. Example: ws://127.0.0.1:15674/ws
   */
  url = '';

  /**
   * auth string
   */
  authToken = '';

  /**
   * How often to incoming heartbeat?
   * Interval in milliseconds, set to 0 to disable
   *
   * Typical value 0 - disabled
   */
  pingTimeout? = 15000;
  /**
   * How often to outcoming heartbeat?
   * Interval in milliseconds, set to 0 to disable
   *
   * Typical value 0 - disabled
   */
  pongTimeout? = 10000;

  /**
   * Wait in milliseconds before attempting auto reconnect
   * Set to 0 to disable
   *
   * Typical value 5000 (5 seconds)
   */
  reconnectDelay? = 1000 * 60 * 8;

  pingMsg? = 'heartbeat';

  repeatLimit? = 20;
  /** Enable client debugging? */
  debug? = false;
}
