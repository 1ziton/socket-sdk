/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2019-06-03 18:02:07
 * @description: utils 函数
 */
declare var window: any;

export function isFunction(val: any): boolean {
  return Object.prototype.toString.call(val) === '[object Function]';
}

export function isArray(val: any): boolean {
  return Object.prototype.toString.call(val) === '[object Array]';
}

export function isNotNil(value: any): boolean {
  return typeof value !== 'undefined' && value !== null;
}

export function isNil(value: any): value is null | undefined {
  return typeof value === 'undefined' || value === null;
}

export function isInteger(value: string | number): boolean {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

export function isEmpty(element: HTMLElement): boolean {
  const nodes = element.childNodes;
  for (let i = 0; i < nodes.length; i++) {
    if (filterNotEmptyNode(nodes.item(i))) {
      return false;
    }
  }
  return true;
}

export function filterNotEmptyNode(node: Node): Node | null {
  if (node) {
    if (node.nodeType === 1 && (node as HTMLElement).outerHTML.toString().trim().length !== 0) {
      // ELEMENT_NODE
      return node;
    } else if (node.nodeType === 3 && node.textContent!.toString().trim().length !== 0) {
      // TEXT_NODE
      return node;
    }
    return null;
  }
  return null;
}

export function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value !== '';
}

export function isSupportWebsocket(): boolean {
  let isSupport = false;
  // tslint:disable-next-line:no-extra-boolean-cast
  if (!!window.WebSocket && window.WebSocket.prototype.send) {
    isSupport = true;
  } else {
    isSupport = false;
  }
  return isSupport;
}

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};
// 时间格式化
export const formatTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join('-') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  );
};
