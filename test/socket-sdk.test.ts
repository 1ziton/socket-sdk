/**
 * @jest-environment jsdom
 */

import SocketClient, { SocketConfig } from '../src/index';
import { post } from './../src/core/fetch';

const ENDPOINT = 'socket-server-test01.1ziton.com';
// const AUTH_URL = `http://${ENDPOINT}/api/message/getAuthStr`;
const AUTH_URL = `http://workorder-test01.1ziton.com/api/workOrder/v1/manage/message/getAuthToken`;
const WS_URL = `ws://${ENDPOINT}/echo`;

const userCode = '13714004401';
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
    expect(url).toBe(WS_URL);
  });

  it('queryHistoryPushMessage is success', done => {
    wsInstance.queryHistoryPushMessage({ page: 1, size: 20 }, (result: any) => {
      const { code, data, first } = result;
      expect(code).toBe(2000);
      expect(data).toBeInstanceOf(Array);
      expect(first).toBeTruthy();
      done();
    });
  });
});
