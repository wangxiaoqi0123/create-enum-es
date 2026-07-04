import createEnum from "../src/index";

// 基础用法
const Status = createEnum({
  ACTIVE: [1, "激活", { color: "green" }],
  INACTIVE: [0, "未激活", { color: "gray" }],
  PENDING: [2, "待审核", { color: "orange" }],
} as const);

// 直接通过 Key 取值
Status.ACTIVE; // 1
Status.INACTIVE; // 0

// value / label / extra
Status.value("ACTIVE"); // 1
Status.label("ACTIVE"); // '激活'
Status.label(1); // '激活'（通过 value 取 label）
Status.extra("ACTIVE"); // { color: 'green' }

// keyOf：通过 value 反查 key
Status.keyOf(1); // 'ACTIVE'
Status.keyOf(0); // 'INACTIVE'

// has：判断一个值是否属于该枚举
Status.has(1); // true
Status.has(99); // false

// check：判断值是否等于某个 key 的值
Status.check(1, "ACTIVE"); // true
Status.check(1, "INACTIVE"); // false

// size
Status.size; // 3

// keys / values
Status.keys(); // ['ACTIVE', 'INACTIVE', 'PENDING']
Status.values(); // [1, 0, 2]
Status.values("ACTIVE", "PENDING"); // [1, 2]

// options：适配 Select/Radio 等组件
Status.options();
// [
//   { value: 1, label: '激活', extra: { color: 'green' } },
//   { value: 0, label: '未激活', extra: { color: 'gray' } },
//   { value: 2, label: '待审核', extra: { color: 'orange' } },
// ]
Status.options("ACTIVE", "PENDING");
// 只取指定项

// pick / omit：派生新枚举
const ActiveOnly = Status.pick("ACTIVE");
ActiveOnly.ACTIVE; // 1

const WithoutPending = Status.omit("PENDING");
WithoutPending.ACTIVE; // 1
WithoutPending.INACTIVE; // 0

// filter：按条件过滤
Status.filter((value) => value !== 0);
// [{ value: 1, label: '激活', ... }, { value: 2, label: '待审核', ... }]

// forEach：遍历
Status.forEach((value, label, key, extra) => {
  console.log(`${String(key)}: ${value} - ${label}`, extra);
});

// for...of 迭代
for (const item of Status) {
  console.log(item.key, item.value, item.label);
}

// toMap / toRecord：转换格式
Status.toMap(); // Map { 1 => '激活', 0 => '未激活', 2 => '待审核' }
Status.toRecord(); // { 1: '激活', 0: '未激活', 2: '待审核' }
