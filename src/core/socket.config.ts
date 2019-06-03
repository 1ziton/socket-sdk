/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 18:26:50
 * @description:
 */
export class SocketConfig {
  /**
   * Server URL
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
  heartbeat?: number;

  /**
   * Wait in milliseconds before attempting auto reconnect
   * Set to 0 to disable
   *
   * Typical value 5000 (5 seconds)
   */
  reconnectDelay? = 5000;

  /** Enable client debugging? */
  debug? = false;
}
