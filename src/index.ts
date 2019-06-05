/*--------------------------------------------------------------
 *  Copyright (c) 1ziton<developer@1ziton.com>. All rights reserved.
 *  Licensed under the MIT License.
 *  Github: https://github.com/1ziton
 *-------------------------------------------------------------*/

// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import SocketClient from './core/socket-client';

export * from './core/socket-action';
export * from './core/socket-config';

export default SocketClient;
