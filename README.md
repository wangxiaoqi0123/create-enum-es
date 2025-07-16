```ts
import createEnum from "create-enum-es";

const base = createEnum({
  AA: [11, "AA-"],
  BB: [22, "BB-"],
} as const);

console.log("base.AA :>> ", base.AA);
// 11

console.log("base.BB :>> ", base.BB);
// 22

console.log("base.options() :>> ", base.options());
// [
//   {
//     "value": 11,
//     "label": "AA-"
//   },
//   {
//     "value": 22,
//     "label": "BB-"
//   }
// ]

const enumInstance = createEnum({
  A: [1, "A-", { a: "axx" }],
  B: [2, "B-", { b: "bxx" }],
} as const);

const value = enumInstance.value("A");
console.log("value :>> ", value);
// 1

const values = enumInstance.values();
console.log("values :>> ", values);
// [1, 2]

const options = enumInstance.options();
console.log("options :>> ", options);
// [
//   {
//     "value": 1,
//     "label": "A-",
//     "extra": {
//       "a": "axx"
//     }
//   },
//   {
//     "value": 2,
//     "label": "B-",
//     "extra": {
//       "b": "bxx"
//     }
//   }
// ]

const label = enumInstance.label("A");
console.log("label :>> ", label);
// 'A-'

const extra = enumInstance.extra("A");
console.log("extra :>> ", extra);
// {"a": "axx"}

const check = enumInstance.check(1, "A");
console.log("check :>> ", check);
// true
```
