import { IEnum, IEMap, TEUnion, IVMap, IFeildConf, IArgLastConfig, IConf, TEValue } from "./typeing";
import { isType, deepClone, isEmpty } from "./utils/index";

/**
 * 获取配置参数
 * @param {*} args
 * @returns
 */
function getConfigParams(args) {
  let config = { labelKey: "label", valueKey: "value", arguType: "key" }; // 选项参数配置
  const lastArgu = args[args.length - 1];
  if (isType(lastArgu, "object")) {
    config = { ...config, ...lastArgu };
    args = args.slice(0, args.length - 1);
  }
  return [config, args];
}

/**
 * 判断枚举key列表是否有效
 * @param {*} args
 * @returns {Boolean}
 */
function judgEnumKeys(keys): boolean {
  return !isEmpty(keys) && keys.every((key) => typeof key === "string");
}

/**
 * 枚举类
 * @param {Object} enumMap 枚举对象
 * 枚举格式：
 * {
 *    枚举key1: [枚举值1，枚举描述1],
 *    枚举key2: [枚举值2，枚举描述2]
 * }
 */
class Enum<T extends IEMap> {
  private __enumMap__: T;
  private __enumValueMap__;
  private __enumNameMap__;
  private __valueNameMap__;

  /**
   * @param {Object} enumMap 枚举map
   */
  constructor(enumMap: T) {
    if (!isType(enumMap, "object")) {
      throw new TypeError("初始化参数值必须是一个object！");
    }
    this.#init(deepClone(enumMap));
  }

  /**
   * 初始化
   * @param {Object} enumMap 枚举对象
   * @private
   */
  #init(enumMap) {
    this.#setEnumMap(enumMap); //处理映射关系
  }

  /**
   * 设置枚举间的映射
   * @param {Object} enumMap
   * @private
   */
  #setEnumMap(enumMap) {
    const enumValueMap = {};
    const enumNameMap = {};
    const valueNameMap = {};
    Object.keys(enumMap).forEach((key) => {
      const item = enumMap[key];
      if (!Array.isArray(item)) {
        throw new TypeError("初始化参数对象字段的值必是一个array！");
      }
      enumValueMap[key] = item[0];
      enumNameMap[key] = item[1];
      valueNameMap[item[0]] = item[1];
    });
    this.__enumMap__ = Object.freeze(enumMap);
    this.__enumValueMap__ = Object.freeze(enumValueMap);
    this.__enumNameMap__ = Object.freeze(enumNameMap);
    this.__valueNameMap__ = Object.freeze(valueNameMap);
  }

  /**
   * 获取枚举值
   * @param {String} key 枚举KEY
   * @return {Number} 枚举值
   */
  public getVal(key: TEUnion<T>): TEValue<T> {
    return this.__enumValueMap__[key];
  }

  /**
   * 获取多个枚举值
   * @param {Array} param 多个枚举KEY
   * @return {Array} {[枚举值]}
   */
  public getValList(...args: TEUnion<T>[]): TEValue<T>[] {
    let keys = Object.keys(this.__enumMap__) as TEUnion<T>[]; // 不传递返回所有
    if (judgEnumKeys(args)) {
      keys = Array.from(args);
    }
    return keys.map((key) => this.getVal(key));
  }

  /**
   * 获取多个枚举值Map
   * @param {Array} param 多个枚举KEY，如果不传递则返回所有
   * @return {Object} {[枚举key]:枚举值}
   */
  public getValMap<V extends TEUnion<T>>(...args: V[]) {
    let keys = Object.keys(this.__enumMap__) as V[]; // 不传递返回所有
    if (judgEnumKeys(args)) {
      keys = Array.from(args);
    }
    return keys.reduce((wrap, key) => {
      wrap[key] = this.getVal(key);
      return wrap;
    }, {} as IVMap<V, T>);
  }

  /**
   * 获取枚举名称
   * @param {String} keyOrVal 枚举KEY或枚举值
   * @param {String} arguType 枚举KEY的类型，key|value
   * @return {String} 枚举名称
   */
  public getName<U extends { arguType?: "key" }>(keyOrVal: TEUnion<T>, _config?: U): string;
  public getName<U extends { arguType: "value" }>(keyOrVal: TEValue<T>, _config?: U): string;
  public getName(keyOrVal, _config?) {
    const [config] = getConfigParams([_config]);
    if (config.arguType === "key") {
      return this.__enumNameMap__[keyOrVal];
    } else if (config.arguType === "value") {
      return this.getNameByValue(keyOrVal);
    } else {
      throw new TypeError("参数arguType的值类型不为 key|value ！");
    }
  }

  /**
   * 通过枚举值获取枚举名称
   * @param {String|Nunber} val
   * @return {String|Null}
   */
  public getNameByValue(val: TEValue<T>): string {
    return this.__valueNameMap__[val];
  }

  /**
   * 通过枚举KEY或枚举值获取列表选项
   * @param  {Array} param 多个枚举KEY或枚举值，如果不传递则返回所有。最后一位可以为选项的配置项
   * @returns {Array} 选项名称、选项值的列表
   */
  public getOptions<U extends TEUnion<T>[]>(..._args: U): { label: string; value: TEValue<T> }[];
  public getOptions<U extends [...TEUnion<T>[], { arguType?: "key" } & IFeildConf]>(..._args: U): IArgLastConfig<U, T>[];
  public getOptions<U extends [...TEValue<T>[], { arguType: "value" } & IFeildConf]>(..._args: U): IArgLastConfig<U, T>[];
  public getOptions(..._args) {
    const [config, args] = getConfigParams(_args);
    if (config.arguType === "key") {
      let keys = Object.keys(this.__enumMap__); // 不传递返回所有
      if (judgEnumKeys(args)) {
        keys = Array.from(args);
      }
      return keys.map((key) => {
        const value = this.getVal(key);
        const name = this.getName(key);
        return { [config.valueKey]: value, [config.labelKey]: name } as any;
      });
    } else if (config.arguType === "value") {
      return this.getOptionsByValues(..._args);
    } else {
      throw new TypeError("参数arguType的值类型不为 key | value ！");
    }
  }

  /**
   * 通过枚举值获取列表选项
   * @param  {Array} param args 多个枚举值，如果不传递则返回所有。最后一位可以为选项的配置项
   * @returns {Array} 选项名称、选项值的列表
   */
  public getOptionsByValues<U extends [...TEValue<T>[], IFeildConf]>(..._args: U): IArgLastConfig<U, T>[];
  public getOptionsByValues<U extends [...TEValue<T>[]]>(..._args: U): { label: string; value: TEValue<T> }[];
  public getOptionsByValues(..._args) {
    const [config, args] = getConfigParams(_args);
    let values = Object.values(this.__enumValueMap__); // 不传递返回所有
    if (!isEmpty(args)) {
      values = Array.from(args);
    }
    return values.map((value) => {
      const name = this.getNameByValue(value);
      return { [config.valueKey]: value, [config.labelKey]: name };
    });
  }

  /**
   * 检测字段类型
   * @param {Number} typeVal 类型
   * @param {String} typeKey 类型key
   * @return {Boolean}
   */
  public check(typeVal, typeKey: TEUnion<T>) {
    return this.getVal(typeKey) === typeVal;
  }
}

/**
 * 创建枚举
 * @param {Object} enumMap
 * @param {String} description
 * @returns
 */
const createEnum = <T extends IEMap>(enumMap: T): IEnum<T, Enum<T>> => {
  const enumInstance = new Enum<T>(enumMap); // 返回实例
  const e = Object.create(enumInstance);
  for (const key in enumMap) {
    e[key] = enumMap[key]?.[0];
  }
  return Object.freeze(e);
};

export { createEnum };
