# create-enum-es

> 零依赖、类型安全的前端枚举工具，为 TypeScript 项目提供完整的枚举管理方案。

## 安装

```bash
npm install create-enum-es
```

## 快速开始

```ts
import createEnum from "create-enum-es";

const Status = createEnum({
  ACTIVE:   [1, "激活", { color: "green" }],
  INACTIVE: [0, "未激活", { color: "gray" }],
  PENDING:  [2, "待审核", { color: "orange" }],
} as const);

Status.ACTIVE;          // 1（直接属性访问）
Status.label("ACTIVE"); // '激活'
Status.label(1);        // '激活'（通过 value 查 label）
Status.extra("ACTIVE"); // { color: 'green' }
```

> **重要：** 定义时需要在对象末尾加上 `as const` 以获得完整的类型推导。

## API

### `createEnum(enumMap)`

创建一个冻结的枚举实例。参数格式：

```ts
{
  KEY: [value, label, extra?] // extra 可选
} as const
```

---

### 属性访问

```ts
Status.ACTIVE   // 1
Status.INACTIVE // 0
```

直接通过 Key 获取 Value，享受完整的类型提示。

---

### `value(key)`

通过 Key 获取 Value。

```ts
Status.value("ACTIVE"); // 1
```

---

### `values(...keys?)`

获取多个枚举值。不传参返回所有值。

```ts
Status.values();                   // [1, 0, 2]
Status.values("ACTIVE", "PENDING"); // [1, 2]
```

---

### `keys()`

获取所有枚举 Key。

```ts
Status.keys(); // ['ACTIVE', 'INACTIVE', 'PENDING']
```

---

### `label(keyOrValue)`

通过 Key 或 Value 获取 Label，支持双向查找。

```ts
Status.label("ACTIVE"); // '激活'
Status.label(1);        // '激活'
```

---

### `extra(keyOrValue)`

通过 Key 或 Value 获取附加数据。

```ts
Status.extra("ACTIVE"); // { color: 'green' }
Status.extra(1);        // { color: 'green' }
```

---

### `keyOf(value)`

通过 Value 反查 Key。

```ts
Status.keyOf(1); // 'ACTIVE'
Status.keyOf(0); // 'INACTIVE'
```

---

### `check(val, key)`

检测一个值是否等于指定 Key 对应的枚举值。

```ts
Status.check(1, "ACTIVE");   // true
Status.check(1, "INACTIVE"); // false
```

---

### `has(val)`

判断一个值是否属于该枚举（类型守卫）。

```ts
Status.has(1);  // true
Status.has(99); // false

// 类型守卫：
const val: unknown = 1;
if (Status.has(val)) {
  // val 在此分支中被收窄为 TEValue<typeof Status>
}
```

---

### `size`

获取枚举项数量。

```ts
Status.size; // 3
```

---

### `options(...keys?)`

获取枚举选项列表，适配 Select/Radio/Checkbox 等 UI 组件。不传参返回所有。

```ts
Status.options();
// [
//   { value: 1, label: '激活', extra: { color: 'green' } },
//   { value: 0, label: '未激活', extra: { color: 'gray' } },
//   { value: 2, label: '待审核', extra: { color: 'orange' } },
// ]

Status.options("ACTIVE", "PENDING");
// 只返回指定项
```

---

### `pick(...keys)`

选取指定 Key，生成新的枚举实例。

```ts
const ActiveOnly = Status.pick("ACTIVE", "PENDING");
ActiveOnly.ACTIVE;  // 1
ActiveOnly.PENDING; // 2
// ActiveOnly.INACTIVE  ← 类型错误，不存在
```

---

### `omit(...keys)`

排除指定 Key，生成新的枚举实例。

```ts
const WithoutPending = Status.omit("PENDING");
WithoutPending.ACTIVE;   // 1
WithoutPending.INACTIVE; // 0
// WithoutPending.PENDING  ← 类型错误，不存在
```

---

### `filter(predicate)`

按条件过滤枚举项，返回满足条件的 options 数组。

```ts
// 过滤掉 INACTIVE
Status.filter((value) => value !== 0);
// [
//   { value: 1, label: '激活', extra: { color: 'green' } },
//   { value: 2, label: '待审核', extra: { color: 'orange' } },
// ]

// 根据 extra 过滤
Status.filter((_v, _l, _k, extra) => extra?.color === "green");
```

回调参数：`(value, label, key, extra) => boolean`

---

### `forEach(callback)`

遍历所有枚举项。

```ts
Status.forEach((value, label, key, extra) => {
  console.log(`${key}: ${value} - ${label}`, extra);
});
```

---

### `for...of` 迭代

枚举实例实现了 `Symbol.iterator`，支持 `for...of` 和展开运算符。

```ts
for (const { key, value, label, extra } of Status) {
  console.log(key, value, label, extra);
}

const items = [...Status]; // 展开为数组
```

---

### `toMap()`

转为 `Map<value, label>`。

```ts
Status.toMap();
// Map { 1 => '激活', 0 => '未激活', 2 => '待审核' }
```

---

### `toRecord()`

转为 `{ [value]: label }` 对象。

```ts
Status.toRecord();
// { 1: '激活', 0: '未激活', 2: '待审核' }
```

---

## TypeScript 类型支持

所有 API 均提供完整的类型推导：

```ts
const Status = createEnum({
  ACTIVE:   [1, "激活", { color: "green" }],
  INACTIVE: [0, "未激活", { color: "gray" }],
} as const);

Status.ACTIVE;          // 类型为 1（字面量）
Status.value("ACTIVE"); // 类型为 number
Status.label("ACTIVE"); // 类型为 string
Status.extra("ACTIVE"); // 类型为 { readonly color: "green" }

// pick/omit 返回类型正确收窄
const picked = Status.pick("ACTIVE");
picked.ACTIVE;   // ✅
picked.INACTIVE; // ❌ 类型错误
```

## 典型场景

### 配合 Select 组件

```tsx
const Status = createEnum({ ... } as const);

// React / Vue
<Select options={Status.options()} />

// 只展示部分选项
<Select options={Status.options("ACTIVE", "PENDING")} />

// 动态过滤
<Select options={Status.filter((v) => v !== 0)} />
```

### 表格列渲染

```tsx
const columns = [
  {
    title: "状态",
    render: (val) => Status.label(val),
  },
];
```

### 条件判断

```ts
if (Status.check(row.status, "ACTIVE")) {
  // ...
}

// 或者
if (row.status === Status.ACTIVE) {
  // ...
}
```

## License

ISC
