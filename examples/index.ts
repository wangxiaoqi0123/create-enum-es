import createEnum from "../src/index";

const enumInstance = createEnum({
  A: ["value1", "A-", { a: "axx" }],
  B: ["value2", "B-", 1],
} as const);

const enumInstance2 = createEnum({
  A: [11, true],
  B: ["value2", "B-"],
} as const);

const extraa = enumInstance.extra('B')




