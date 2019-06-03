/**
 * @jest-environment jsdom
 */

import SocketClient from '../src/index';

/**
 * Dummy test
 */
describe('SocketClient test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('SocketClient is instantiable', () => {
    expect(
      new SocketClient({
        url: '',
        authToken: ''
      })
    ).toBeInstanceOf(SocketClient);
  });
});
