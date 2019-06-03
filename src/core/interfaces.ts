export interface HeartBeatPackage {
  messageId: string;
  flag: boolean;
}

export interface PingMessage {
  action: string;
  messageId: string;
  jsonMessage: string;
}

export interface ClientMessage {
  action: string;
  messageId: string;
  jsonMessage: string;
}

export interface SocketConfig {
  /**
   * Server URL
   */
  url: string;

  /**
   * auth string
   */
  authToken: string;

  /**
   * How often to incoming heartbeat?
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
