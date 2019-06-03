import { uuid } from './uuid';

export const DEVICECODE = uuid(32, 16);

// 重试次数
export const RETRY_COUNT = 10;

export const QUERY_ACTION = 'CLIENT_QUERY_ACTION';

export const SERVER_PUSH_MESSAGE_TRIGGER = 'SERVER_PUSH_MESSAGE_TRIGGER';
