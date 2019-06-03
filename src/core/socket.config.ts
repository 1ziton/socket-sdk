/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 18:26:50
 * @description:
 */
export interface SocketConfig {
  /**
   * Server URL to connect to.
   * Example: ws://127.0.0.1:15674/ws
   */
  url: string;
  /** How often to incoming heartbeat?
   * Interval in milliseconds, set to 0 to disable
   *
   * Typical value 0 - disabled
   */
  heartbeat: number;

  /**
   * Wait in milliseconds before attempting auto reconnect
   * Set to 0 to disable
   *
   * Typical value 5000 (5 seconds)
   */
  reconnect_delay: number;

  /** Enable client debugging? */
  debug: boolean;
}
