/**
 * 宽化字面量类型
 */
type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;

/**
 * 枚举 Map 约束类型：{ KEY: [value, label, extra?] }
 */
type IEMap = Readonly<Record<string, readonly [any, any, any?]>>;

/**
 * 枚举 Key 联合类型
 */
type TEUnion<T extends IEMap> = keyof T;

/**
 * 枚举 Value 联合类型
 */
type TEValue<T extends IEMap> = T[keyof T][0];

/**
 * 根据 Key 获取 Value 类型
 */
type TValue<K, T extends IEMap> = WidenLiteral<T[K & keyof T][0]>;

/**
 * 根据 Key 获取 Label 类型
 */
type TULabel<K, T extends IEMap> = WidenLiteral<T[K & keyof T][1]>;

/**
 * 根据 Value 获取 Label 类型
 */
type TVLabel<V, T extends IEMap> = WidenLiteral<
  Extract<T[keyof T], readonly [V, any, any?]>[1]
>;

/**
 * 根据 Key 获取 Extra 类型
 */
type TUExtra<K, T extends IEMap> = WidenLiteral<T[K & keyof T][2]>;

/**
 * 根据 Value 获取 Extra 类型
 */
type TVExtra<V, T extends IEMap> = WidenLiteral<
  Extract<T[keyof T], readonly [V, any, any?]>[2]
>;

/**
 * 根据 Value 反查 Key 类型
 */
type TKeyOfValue<V, T extends IEMap> = {
  [K in keyof T]: T[K][0] extends V ? K : never;
}[keyof T];

/**
 * Option 项类型
 */
type TOption<K extends keyof T, T extends IEMap> = {
  value: TValue<K, T>;
  label: TULabel<K, T>;
  extra: TUExtra<K, T>;
};

/**
 * 排除指定 Key 后的枚举类型
 */
type TOmitEnum<T extends IEMap, K extends keyof T> = Omit<T, K> extends infer R
  ? R extends IEMap
    ? R
    : never
  : never;

/**
 * 选取指定 Key 的枚举类型
 */
type TPickEnum<T extends IEMap, K extends keyof T> = Pick<T, K> extends infer R
  ? R extends IEMap
    ? R
    : never
  : never;

/**
 * 最终暴露的枚举实例类型
 */
type IEnum<T extends IEMap> = { readonly [K in keyof T]: T[K][0] } & Enum<T>;

class Enum<T extends IEMap> {
  protected readonly __enumMap__: T;
  protected readonly __enumLabelMap__: Record<string | number, unknown>;
  protected readonly __enumExtraMap__: Record<string | number, unknown>;
  protected readonly __valueKeyMap__: Record<string | number, string>;

  constructor(enumMap: T) {
    if (
      enumMap === null ||
      typeof enumMap !== "object" ||
      Array.isArray(enumMap)
    ) {
      throw new TypeError("初始化参数值必须是一个 object！");
    }

    const enumLabelMap: Record<string | number, unknown> = {};
    const enumExtraMap: Record<string | number, unknown> = {};
    const valueKeyMap: Record<string | number, string> = {};

    const keys = Object.keys(enumMap);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = enumMap[key];
      if (!Array.isArray(item)) {
        throw new TypeError(
          `初始化参数对象字段 "${key}" 的值必须是一个 array！`,
        );
      }
      (this as any)[key] = item[0];
      enumLabelMap[key] = item[1];
      enumLabelMap[item[0] as string | number] = item[1];
      enumExtraMap[key] = item[2];
      enumExtraMap[item[0] as string | number] = item[2];
      valueKeyMap[item[0] as string | number] = key;
    }

    this.__enumMap__ = Object.freeze(enumMap);
    this.__enumLabelMap__ = Object.freeze(enumLabelMap);
    this.__enumExtraMap__ = Object.freeze(enumExtraMap);
    this.__valueKeyMap__ = Object.freeze(valueKeyMap);
  }

  /**
   * 获取所有枚举 Key 列表
   */
  public keys(): TEUnion<T>[] {
    return Object.keys(this.__enumMap__) as TEUnion<T>[];
  }

  /**
   * 获取枚举值
   * @param key 枚举 Key
   */
  public value<K extends TEUnion<T>>(key: K): TValue<K, T> {
    return (this as any)[key];
  }

  /**
   * 获取多个枚举值，不传参则返回所有
   * @param args 枚举 Key 列表
   */
  public values<K extends TEUnion<T>>(...args: K[]): TValue<K, T>[] {
    const keys = args.length > 0 ? args : (this.keys() as K[]);
    return keys.map((key) => this.value(key));
  }

  /**
   * 获取枚举选项列表（适配 Select/Radio 等组件），不传参则返回所有
   * @param args 枚举 Key 列表
   */
  public options<K extends TEUnion<T>>(...args: K[]): TOption<K, T>[] {
    const keys = args.length > 0 ? args : (this.keys() as K[]);
    return keys.map((key) => ({
      value: this.value(key),
      label: this.label(key),
      extra: this.extra(key),
    }));
  }

  /**
   * 获取枚举名称（通过 Key 或 Value）
   * @param keyOrVal 枚举 Key 或 Value
   */
  public label<K extends TEUnion<T>>(key: K): TULabel<K, T>;
  public label<V extends TEValue<T>>(val: V): TVLabel<V, T>;
  public label(keyOrVal: string | number): unknown {
    return this.__enumLabelMap__[keyOrVal];
  }

  /**
   * 获取枚举附加数据（通过 Key 或 Value）
   * @param keyOrVal 枚举 Key 或 Value
   */
  public extra<K extends TEUnion<T>>(key: K): TUExtra<K, T>;
  public extra<V extends TEValue<T>>(val: V): TVExtra<V, T>;
  public extra(keyOrVal: string | number): unknown {
    return this.__enumExtraMap__[keyOrVal];
  }

  /**
   * 通过 Value 反查 Key
   * @param val 枚举 Value
   */
  public keyOf<V extends TEValue<T>>(val: V): TKeyOfValue<V, T> {
    return this.__valueKeyMap__[val as string | number] as TKeyOfValue<V, T>;
  }

  /**
   * 检测值是否等于指定枚举 Key 对应的值
   * @param val 待检测的值
   * @param key 枚举 Key
   */
  public check<K extends TEUnion<T>>(val: unknown, key: K): boolean {
    return this.value(key) === val;
  }

  /**
   * 检测值是否属于该枚举的任意一个值
   * @param val 待检测的值
   */
  public has(val: unknown): val is TEValue<T> {
    return this.__valueKeyMap__.hasOwnProperty(val as string | number);
  }

  /**
   * 获取枚举项数量
   */
  public get size(): number {
    return Object.keys(this.__enumMap__).length;
  }

  /**
   * 排除指定 Key，生成新的枚举实例
   * @param args 要排除的 Key 列表
   */
  public omit<K extends TEUnion<T>>(
    ...args: K[]
  ): Readonly<IEnum<TOmitEnum<T, K>>> {
    const newMap: Record<string, readonly [any, any, any?]> = {};
    const excludeSet = new Set(args as unknown as string[]);
    const keys = Object.keys(this.__enumMap__);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!excludeSet.has(key)) {
        newMap[key] = this.__enumMap__[key];
      }
    }
    return createEnum(newMap as unknown as TOmitEnum<T, K>);
  }

  /**
   * 选取指定 Key，生成新的枚举实例
   * @param args 要保留的 Key 列表
   */
  public pick<K extends TEUnion<T>>(
    ...args: K[]
  ): Readonly<IEnum<TPickEnum<T, K & string>>> {
    const newMap: Record<string, readonly [any, any, any?]> = {};
    for (let i = 0; i < args.length; i++) {
      const key = args[i] as unknown as string;
      if (this.__enumMap__.hasOwnProperty(key)) {
        newMap[key] = this.__enumMap__[key];
      }
    }
    return createEnum(newMap as unknown as TPickEnum<T, K & string>);
  }

  /**
   * 遍历枚举项
   * @param callback 回调函数 (value, label, key, extra) => void
   */
  public forEach(
    callback: (
      value: TEValue<T>,
      label: unknown,
      key: TEUnion<T>,
      extra: unknown,
    ) => void,
  ): void {
    const keys = Object.keys(this.__enumMap__);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as TEUnion<T>;
      callback(
        this.value(key) as TEValue<T>,
        this.__enumLabelMap__[key as string],
        key,
        this.__enumExtraMap__[key as string],
      );
    }
  }

  /**
   * 将枚举转为 Map 对象 { value => label }
   */
  public toMap(): Map<TEValue<T>, unknown> {
    const map = new Map<TEValue<T>, unknown>();
    const keys = Object.keys(this.__enumMap__);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = this.__enumMap__[key];
      map.set(item[0], item[1]);
    }
    return map;
  }

  /**
   * 将枚举转为 Record 对象 { [value]: label }
   */
  public toRecord(): Record<string | number, unknown> {
    const record: Record<string | number, unknown> = {};
    const keys = Object.keys(this.__enumMap__);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = this.__enumMap__[key];
      record[item[0] as string | number] = item[1];
    }
    return record;
  }

  /**
   * 过滤枚举项，返回满足条件的 options
   * @param predicate 过滤函数
   */
  public filter(
    predicate: (
      value: TEValue<T>,
      label: unknown,
      key: TEUnion<T>,
      extra: unknown,
    ) => boolean,
  ): TOption<TEUnion<T>, T>[] {
    const result: TOption<TEUnion<T>, T>[] = [];
    const keys = Object.keys(this.__enumMap__);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] as TEUnion<T>;
      const value = this.value(key) as TEValue<T>;
      const label = this.__enumLabelMap__[key as string];
      const extra = this.__enumExtraMap__[key as string];
      if (predicate(value, label, key, extra)) {
        result.push({ value, label, extra } as TOption<TEUnion<T>, T>);
      }
    }
    return result;
  }

  /**
   * 支持 for...of 迭代
   */
  public [Symbol.iterator](): Iterator<{
    key: TEUnion<T>;
    value: TEValue<T>;
    label: unknown;
    extra: unknown;
  }> {
    const keys = Object.keys(this.__enumMap__);
    let index = 0;
    const self = this;
    return {
      next() {
        if (index < keys.length) {
          const key = keys[index++] as TEUnion<T>;
          return {
            done: false,
            value: {
              key,
              value: self.value(key) as TEValue<T>,
              label: self.__enumLabelMap__[key as string],
              extra: self.__enumExtraMap__[key as string],
            },
          };
        }
        return { done: true, value: undefined as any };
      },
    };
  }
}

/**
 * 创建枚举实例
 * @param enumMap 枚举定义对象，格式：{ KEY: [value, label, extra?] as const }
 *
 * @example
 * const Status = createEnum({
 *   ACTIVE:   [1, '激活', { color: 'green' }],
 *   INACTIVE: [0, '未激活', { color: 'gray' }],
 * } as const);
 *
 * Status.ACTIVE          // 1
 * Status.value('ACTIVE') // 1
 * Status.label('ACTIVE') // '激活'
 * Status.label(1)        // '激活'
 * Status.extra('ACTIVE') // { color: 'green' }
 * Status.keyOf(1)        // 'ACTIVE'
 * Status.has(1)          // true
 * Status.has(99)         // false
 * Status.options()       // [{ value: 1, label: '激活', extra: {...} }, ...]
 * Status.pick('ACTIVE')  // 新枚举，仅包含 ACTIVE
 * Status.omit('INACTIVE')// 新枚举，排除 INACTIVE
 */
const createEnum = <T extends IEMap>(enumMap: T): Readonly<IEnum<T>> => {
  const enumInstance = new Enum<T>(enumMap);
  return Object.freeze(enumInstance) as unknown as Readonly<IEnum<T>>;
};

export default createEnum;
