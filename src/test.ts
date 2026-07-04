type IEMap = Readonly<Record<any, readonly [any, any]>>;
type IEnum<T extends IEMap> = { [K in keyof T]: T[K][0] } & Enum<T>;
type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

class Enum<T extends IEMap> {
  protected __enumMap__;
  protected __enumLabelMap__;

  constructor(enumMap) {
    const enumLabelMap = {};
    Object.keys(enumMap).forEach((key) => {
      const item = enumMap[key];
      this[key] = item[0];
      enumLabelMap[key] = item[1];
      enumLabelMap[item[0]] = item[1];
    });
    this.__enumMap__ = Object.freeze(enumMap);
    this.__enumLabelMap__ = Object.freeze(enumLabelMap);
  }

  public value<K extends keyof T>(key: K): Widen<T[K][0]> {
    return this[key as string];
  }

  public label<K extends keyof T>(key: K): T[K][1];
  public label<V extends T[keyof T][0]>(val: V): Extract<T[keyof T], V>[1];
  public label(keyOrVal) {
    return this.__enumLabelMap__[keyOrVal];
  }

  public option<O extends keyof T>(...args: O[]) {
    let keys = Object.keys(this.__enumMap__) as O[];
    if (args?.length) {
      keys = Array.from(args);
    }
    return keys.map((key) => ({ value: this.value(key), label: this.label(key) }));
  }
}

const createEnum = <T extends IEMap>(enumMap: T) => {
  const enumInstance = new Enum(enumMap);
  return Object.freeze(enumInstance) as Readonly<IEnum<T>>;
};

const instance = createEnum({
  A: [1, "A-"],
  B: [2, "B-"],
} as const);

const a = instance.option()

export default createEnum;
