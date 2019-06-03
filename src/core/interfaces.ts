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

export interface BussinessParams {
  bussinessAction: string;
  contentId: string;
}

export interface Group {
  groupName: string;
  [key: string]: string;
}
export interface UserMessageParams {
  userId: string;
  channel: string;
  group: Group;
  content: string;
}
