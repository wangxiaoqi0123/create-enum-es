```ts
import { createEnum } from 'create-enum-es';

const enum1 = createEnum({
  On: [1, '开启'],
  Off: [0, '关闭'],
} as const);

console.log(enum1.getVal('On')) // 1
console.log(enum1.getValList('On', 'Off')) // [1, 0]
console.log(enum1.getValList('On')) // [1]
console.log(enum1.getValList()) // [1, 0]


console.log(enum1.getValMap('On', 'Off')) // {On: 1, Off: 0}
console.log(enum1.getValMap('Off')) // {Off: 0}
console.log(enum1.getValMap()) // {On: 1, Off: 0}


console.log(enum1.getName('On')) // 开启
console.log(enum1.getNameByValue(enum1.Off)) // 关闭
console.log(enum1.getName(enum1.On, { arguType: 'value' })) // 开启


console.log(enum1.getOptions())
// [
//     {
//         "value": 1,
//         "label": "开启"
//     },
//     {
//         "value": 0,
//         "label": "关闭"
//     }
// ]
console.log(enum1.getOptions({ labelKey: 'name', valueKey: 'key' }))
// [
//     {
//         "key": 1,
//         "name": "开启"
//     },
//     {
//         "key": 0,
//         "name": "关闭"
//     }
// ]
console.log(enum1.getOptions('On'))
// [
//     {
//         "value": 1,
//         "label": "开启"
//     }
// ]
console.log(enum1.getOptions(enum1.On, { arguType: 'value' }))
// [
//     {
//         "value": 1,
//         "label": "开启"
//     }
// ]
console.log(enum1.getOptionsByValues())
// [
//     {
//         "value": 1,
//         "label": "开启"
//     },
//     {
//         "value": 0,
//         "label": "关闭"
//     }
// ]
console.log(enum1.getOptionsByValues(enum1.On, { labelKey: 'name', valueKey: 'key' }))
// [
//     {
//         "key": 1,
//         "name": "开启"
//     }
// ]

console.log(enum1.check(enum1.On, 'On')) // true
```

