/**
 * @jest-environment jsdom
 */

import { post } from './../src/core/fetch';

const ENDPOINT = 'socket-server-test01.1ziton.com';
const AUTH_URL = `http://${ENDPOINT}/api/message/getAuthStr`;

const userId = '15000000000';
const channel = 'CMP';
let authToken = '';

/**
 * AuthToken test
 */
describe('AuthToken test', () => {
  it('getAuthToken is success', async () => {
    let result: any = await post(AUTH_URL, null, {
      userId,
      channel
    });
    authToken = result.desc;
    console.info(`token=${authToken}`);
    expect(authToken).toBeTruthy();
  });
});
