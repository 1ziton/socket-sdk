/**
 * @jest-environment jsdom
 */

import SocketClient, { SocketConfig } from '../src/index';
import { post } from './../src/core/fetch';

const ENDPOINT = 'uatsocket.1ziton.com';
// const ENDPOINT = 'socket-test01.1ziton.com';
const AUTH_URL = `https://uatworkorder.1ziton.com/api/workOrder/v1/manage/message/getAuthToken`;
const WS_URL = `wss://${ENDPOINT}/echo`;

const userCode = 'CYSA201709898';
const sourceChannel = 'CMP';
let authToken = '';
let wsInstance: SocketClient;
/**
 * SocketClient test
 */
describe('SocketClient test', () => {
  it('getAuthToken is success', async () => {
    let result: any = await post(AUTH_URL, null, [
      {
        userCode,
        sourceChannel
      }
    ]);
    authToken = result.content;
    // console.log(result);
    console.info(`token=${authToken}`);
    expect(result.resultCode).toBe(200);
  });

  it('SocketClient is instantiable', () => {
    const config: SocketConfig = {
      url: WS_URL,
      authToken
    };
    wsInstance = new SocketClient(config);
    expect(wsInstance).toBeInstanceOf(SocketClient);
  });

  it('Server URL is normal', () => {
    const url = wsInstance.url;
    expect(url).toBeTruthy();
  });
  /* it('DeviceCode is  Unique', () => {
    const config: SocketConfig = {
      url: WS_URL,
      authToken
    };
    let wsInstance2 = new SocketClient(config);
    expect(wsInstance.deviceCode.length).toEqual(32);
    expect(wsInstance2.deviceCode.length).toEqual(32);
    expect(wsInstance2.deviceCode).not.toEqual(wsInstance.deviceCode);
  }); */
});

describe('API test', () => {
  it('queryHistoryPushMessage is success', done => {
    wsInstance.queryHistoryPushMessage({ page: 1, size: 20, status: 'UNREAD' }, (result: any) => {
      const { code, data, first } = result;
      // console.log(code, data, first);
      expect(code).toBe(2000);
      expect(data).toBeInstanceOf(Array);
      expect(first).toBeTruthy();
      done();
    });
  });
  it('messageStatistics is success', done => {
    wsInstance.messageStatistics({ userId: userCode, channel: sourceChannel }, (result: any) => {
      const { code, data = {} } = result;
      expect(code).toBe(2000);
      expect(data.totalCount).not.toBeNull();
      expect(data.readCount).not.toBeNull();
      expect(data.unreadCount).not.toBeNull();
      done();
    });
  });
});
