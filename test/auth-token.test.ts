/**
 * @jest-environment jsdom
 */

import { post } from './../src/core/fetch';

const AUTH_URL = `http://workorder-test01.1ziton.com/api/workOrder/v1/manage/message/getAuthToken`;

const userCode = '13714004401';
const sourceChannel = 'CMP';
let authToken = '';

/**
 * AuthToken test
 */
describe('AuthToken test', () => {
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
});
