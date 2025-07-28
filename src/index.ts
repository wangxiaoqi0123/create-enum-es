import cloneDeep from "lodash-es/cloneDeep";
import isArray from "lodash-es/isArray";
import isEmpty from "lodash-es/isEmpty";
import isPlainObject from "lodash-es/isPlainObject";

/**
 * 宽化类型
 */
type WidenLiteral<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

/**
 * 约束传参类型
 */
type IEMap = Readonly<Record<any, readonly [any, any, any?]>>;
/**
 * 枚举建
 */
type TEUnion<T extends IEMap> = keyof T;
/**
 * 枚举值（联合类型）
 */
type TEValue<T extends IEMap> = T[TEUnion<T>][0];
/**
 * 值
 */
type TValue<V, T extends IEMap> = WidenLiteral<T[V][0]>;
/**
 * 标签
 */
type TULabel<V, T extends IEMap> = WidenLiteral<T[V][1]>;
type TVLabel<V, T extends IEMap> = WidenLiteral<Extract<T[keyof T], readonly [V, any, any?]>[1]>;
/**
 * 额外
 */
type TUExtra<V, T extends IEMap> = WidenLiteral<T[V][2]>;
type TVExtra<V, T extends IEMap> = WidenLiteral<Extract<T[keyof T], readonly [V, any, any?]>[2]>;
/**
 * 枚举类型
 */
type IEnum<T extends IEMap> = { readonly [K in keyof T]: T[K][0] } & Enum<T>;

/**
 * 判断枚举key列表是否有效
 * @param {*} args
 * @returns {Boolean}
 */
function judgEnumKeys(keys): boolean {
  return !isEmpty(keys) && keys.every((key) => typeof key === "string");
}

class Enum<T extends IEMap> {
  protected __enumMap__: T;
  protected __enumLabelMap__;
  protected __enumExtraMap__;

  /**
   * @param {Object} enumMap 枚举map
   */
  constructor(enumMap: T) {
    if (!isPlainObject(enumMap)) {
      throw new TypeError("初始化参数值必须是一个object！");
    }
    this.#setEnumMap(cloneDeep(enumMap));
  }

  /**
   * 设置枚举间的映射
   * @param {Object} enumMap
   * @private
   */
  #setEnumMap(enumMap) {
    const enumLabelMap = {};
    const enumExtraMap = {};
    Object.keys(enumMap).forEach((key) => {
      const item = enumMap[key];
      if (!isArray(item)) {
        throw new TypeError("初始化参数对象字段的值必是一个array！");
      }
      this[key] = item[0];
      enumLabelMap[key] = item[1];
      enumLabelMap[item[0]] = item[1];
      enumExtraMap[key] = item[2];
      enumExtraMap[item[0]] = item[2];
    });
    this.__enumMap__ = Object.freeze(enumMap);
    this.__enumLabelMap__ = Object.freeze(enumLabelMap);
    this.__enumExtraMap__ = Object.freeze(enumExtraMap);
  }

  /**
   * 获取枚举值
   * @param {String} key 枚举KEY
   * @return {Number} 枚举值
   */
  public value<V extends TEUnion<T>>(key: V): TValue<V, T> {
    return this[key as string];
  }

  /**
   * 获取多个枚举值
   * @param {Array} param 多个枚举KEY
   * @return {Array} {[枚举值]}
   */
  public values<V extends TEUnion<T>>(...args: V[]): TValue<V, T>[] {
    let keys = Object.keys(this.__enumMap__) as TEUnion<T>[]; // 不传递返回所有
    if (judgEnumKeys(args)) {
      keys = Array.from(args);
    }
    return keys.map((key) => this.value(key));
  }

  /**
   * 获取多个枚举值Map
   * @param {Array} param 多个枚举KEY，如果不传递则返回所有
   * @return {Object} {[枚举key]:枚举值}
   */
  public options<V extends TEUnion<T>>(...args: V[]) {
    let keys = Object.keys(this.__enumMap__) as V[]; // 不传递返回所有
    if (judgEnumKeys(args)) {
      keys = Array.from(args);
    }
    return keys.map((key) => ({
      value: this.value(key),
      label: this.label(key),
      extra: this.extra(key),
    }));
  }

  /**
   * 获取枚举名称
   * @param {String} keyOrVal 枚举KEY或枚举值
   * @return {String} 枚举名称
   */
  public label<V extends TEUnion<T>>(key: V): TULabel<V, T>;
  public label<V extends TEValue<T>>(val: V): TVLabel<V, T>;
  public label(keyOrVal: any): any;
  public label(keyOrVal) {
    return this.__enumLabelMap__[keyOrVal];
  }

  /**
   * 获取枚举关联参数
   * @param {String} keyOrVal 枚举KEY或枚举值
   * @return {String} 枚举名称
   */
  public extra<V extends TEUnion<T>>(key: V): TUExtra<V, T>;
  public extra<V extends TEValue<T>>(val: V): TVExtra<V, T>;
  public extra(keyOrVal: any): any;
  public extra(keyOrVal) {
    return this.__enumExtraMap__[keyOrVal];
  }

  /**
   * 检测字段类型
   * @param {Number} typeVal 类型
   * @param {String} typeKey 类型key
   * @return {Boolean}
   */
  public check(typeVal, typeKey: TEUnion<T>) {
    return this.value(typeKey) === typeVal;
  }
}

const createEnum = <T extends IEMap>(enumMap: T): Readonly<IEnum<T>> => {
  const enumInstance = new Enum<T>(enumMap);
  return Object.freeze(enumInstance) as Readonly<IEnum<T>>;
};

export default createEnum;
