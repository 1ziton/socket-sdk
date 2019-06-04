# socket-sdk

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![NPM version](https://img.shields.io/npm/v/socket-sdk.svg?style=flat-square)](https://www.npmjs.com/package/socket-sdk)
[![Greenkeeper badge](https://badges.greenkeeper.io/1ziton/socket-sdk.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/1ziton/socket-sdk.svg?branch=master)](https://travis-ci.org/1ziton/socket-sdk)
[![Coveralls](https://img.shields.io/coveralls/1ziton/socket-sdk.svg)](https://coveralls.io/github/1ziton/socket-sdk)

Socket sdk for javascript, library create template base on [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter)

### Usage

```bash
npm install socket-sdk
```

#### Importing library

You can import the generated bundle to use the whole library generated by this starter:

```javascript
import SocketClient from 'socket-sdk';
```

Additionally, you can import the transpiled modules from `dist/lib` in case you have a modular library:

```javascript
import SocketClient from 'socket-sdk/dist/lib/socket-sdk';
```

### API

[API Document](http://fex.1ziton.com/socket-sdk/)

### NPM scripts

- `npm t`: Run test suite
- `npm start`: Run `npm run build` in watch mode
- `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
- `npm run test:prod`: Run linting and generate coverage
- `npm run build`: Generate bundles and typings, create docs
- `npm run lint`: Lints code
- `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

### Git Hooks

There is already set a `precommit` hook for formatting your code with Prettier :nail_care:

By default, there are two disabled git hooks. They're set up when you run the `npm run semantic-release-prepare` script. They make sure:

- You follow a [conventional commit message](https://github.com/conventional-changelog/conventional-changelog)
- Your build is not going to fail in [Travis](https://travis-ci.org) (or your CI server), since it's runned locally before `git push`

This makes more sense in combination with [automatic releases](#automatic-releases)

### Contributing

[CONTRIBUTING.md](https://github.com/1ziton/socket-sdk/blob/master/CONTRIBUTING.md)
