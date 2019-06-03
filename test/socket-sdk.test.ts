import SocketClient from '../src/index';

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('DummyClass is instantiable', () => {
    expect(
      new SocketClient({
        url: '',
        authToken: ''
      })
    ).toBeInstanceOf(SocketClient);
  });
});
