export interface HeartBeatPackage {
  messageId: string;
  flag: boolean;
}

export interface QueryMessageParams {
  page: number;
  size: number;
  status?: string;
  dates?: Array<string> | null;
  noticeTime?: Array<string> | null;
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
  contentIds: Array<string>;
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
export interface MessageStatisticsParams {
  userId: string;
  channel: string;
  status?: string;
}
