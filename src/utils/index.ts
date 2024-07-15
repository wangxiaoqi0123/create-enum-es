import { ITypeData } from "../typeing";

/**
 * 数据类型
 * @param {*} data
 * @param {String} type
 * @returns {Boolean}
 */
export function isType<T>(data: T, type: ITypeData): boolean {
  const dataType = Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
  return type === dataType;
}

/**
 * 数据是否为空
 * @param {*} data
 * @returns
 */
export function isEmpty<T>(data: T): boolean {
  if (isType(data, "array") || isType(data, "string")) {
    return (data as any).length === 0;
  }
  if (data instanceof Map || data instanceof Set) {
    return data.size === 0;
  }
  if (isType(data, "object")) {
    return Object.keys(data).length === 0;
  }
  return Boolean(data);
}

/**
 * 深度拷贝
 * @param {Object|Array} obj
 * @return {Object|Array}
 */
export function deepClone(obj) {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        //判断ojb子元素是否为对象，如果是，递归复制
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepClone(obj[key]);
        } else {
          //如果不是，简单复制
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}
