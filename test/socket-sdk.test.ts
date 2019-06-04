/**
 * @jest-environment jsdom
 */

import SocketClient, { SocketConfig } from '../src/index';
import { post } from './../src/core/fetch';

const ENDPOINT = 'socket-server-test01.1ziton.com';
const AUTH_URL = `http://${ENDPOINT}/api/message/getAuthStr`;
const WS_URL = `ws://${ENDPOINT}/echo`;

const userId = '15000000000';
const channel = 'CMP';
let authToken = '';
let wsInstance: SocketClient;
/**
 * SocketClient test
 */
describe('SocketClient test', () => {
  it('getAuthToken is success', async () => {
    let result: any = await post(AUTH_URL, null, {
      userId,
      channel
    });
    authToken = result.desc;
    console.log(`token=${authToken}`);
    expect(authToken).toBeTruthy();
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
    expect(url).toBe(WS_URL);
  });

  it('queryHistoryPushMessage is success', () => {
    wsInstance.queryHistoryPushMessage({ page: 1, size: 20 }, (result: any) => {
      const { code, data, first } = result;
      expect(code).toBe(2000);
      expect(data).toBeInstanceOf(Array);
      expect(first).toBeTruthy();
    });
  });
});
