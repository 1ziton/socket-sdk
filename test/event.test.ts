/**
 * @jest-environment jsdom
 */

import EventEmitter from '../src/core/event';

const ep = new EventEmitter();

/**
 * AuthToken test
 */
describe('EventEmitter test', () => {
  it('once listener is tigger once', async () => {
    let count = 0;
    ep.once('evt_once', info => {
      count++;
      console.log(info);
    });
    ep.fire('evt_once', 'once监听');
    ep.fire('evt_once', 'once监听');
    expect(count).toBe(1);
  });

  it('once listener is tigger once', async () => {
    let count = 0;
    ep.on('evt_on', info => {
      count++;
      console.log(info);
    });
    ep.fire('evt_on', 'on监听');
    ep.fire('evt_on', 'on监听');
    expect(count).toBe(2);
  });
});
