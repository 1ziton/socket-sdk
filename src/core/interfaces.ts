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
