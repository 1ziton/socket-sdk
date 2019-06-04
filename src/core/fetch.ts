require('es6-promise').polyfill();
require('isomorphic-fetch');

/**
 * GET 请求
 * @param url
 * @param headers
 */
export const get = (url: string, headers = {}) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      ...headers
    }
  });
};

/**
 * POST 请求
 * @param url 地址
 * @param headers
 * @param body 参数
 */
export const post = (url: string, headers: HeadersInit | null, body: any) => {
  headers = headers || {};
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        ...headers
      },
      body: JSON.stringify(body)
    })
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.match(/application\/json/)) {
          return response.json();
        }
        return [];
      })
      .then(json => {
        if (!json) {
          return reject(json);
        }
        return resolve(json);
      })
      .catch(err => {
        console.log('接口请求异常');
        return reject(err);
      });
  });
};
