export type ITypeData =
  | "undefined"
  | "null"
  | "boolean"
  | "number"
  | "string"
  | "symbol"
  | "function"
  | "array"
  | "object"
  | "date"
  | "regexp"
  | "error"
  | "map"
  | "set"
  | "weakmap"
  | "weakset"
  | "arraybuffer"
  | "dataview"
  | "promise"
  | "int8array"
  | "uint8array"
  | "uint8clampedarray"
  | "int16array"
  | "uint16array"
  | "int32array"
  | "uint32array"
  | "float32array"
  | "float64array"
  | "bigint64array"
  | "biguint64array";

export type IEMap = Readonly<Record<any, readonly [any, any]>>;

export type TEUnion<T extends IEMap> = keyof T;
export type TEValue<T extends IEMap> = T[TEUnion<T>][0];

export type IVMap<U extends string | number | symbol, T extends IEMap> = {
  [K in U]: T[K] extends readonly [infer V, infer F] ? V : any;
};

export type IEnum<T extends IEMap, Enum> = {
  readonly [K in keyof T]: T[K] extends readonly [infer V, infer F] ? V : any;
} & Enum;

export interface IArguConf {
  arguType?: "key" | "value";
}

export interface IFeildConf {
  labelKey?: string;
  valueKey?: string;
}

export type IConf = IArguConf & IFeildConf;

export type IArgLastConfig<U, T extends IEMap> = U extends [...infer Rest, infer Last]
  ? Last extends IConf
    ? (Last["labelKey"] extends string
        ? { [K in Last["labelKey"]]: TEValue<T> }
        : { label: string }
      ) & 
      (Last["valueKey"] extends string
        ? { [K in Last["valueKey"]]: any }
        : { value: TEValue<T> }
      )
    : { label: string; value: TEValue<T> }
  : never;
