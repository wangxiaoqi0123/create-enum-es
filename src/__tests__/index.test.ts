import { describe, it, expect } from "vitest";
import createEnum from "../index";

const Status = createEnum({
  ACTIVE: [1, "激活", { color: "green" }],
  INACTIVE: [0, "未激活", { color: "gray" }],
  PENDING: [2, "待审核", { color: "orange" }],
} as const);

const Simple = createEnum({
  YES: [1, "是"],
  NO: [0, "否"],
} as const);

describe("createEnum", () => {
  describe("初始化", () => {
    it("应正确创建枚举实例", () => {
      expect(Status).toBeDefined();
      expect(Object.isFrozen(Status)).toBe(true);
    });

    it("参数不是对象时应抛出 TypeError", () => {
      expect(() => createEnum(null as any)).toThrow(TypeError);
      expect(() => createEnum([] as any)).toThrow(TypeError);
      expect(() => createEnum("abc" as any)).toThrow(TypeError);
      expect(() => createEnum(123 as any)).toThrow(TypeError);
    });

    it("字段值不是数组时应抛出 TypeError", () => {
      expect(() => createEnum({ A: "invalid" } as any)).toThrow(TypeError);
      expect(() => createEnum({ A: 123 } as any)).toThrow(TypeError);
    });
  });

  describe("直接取值（属性访问）", () => {
    it("应通过 Key 直接获取 Value", () => {
      expect(Status.ACTIVE).toBe(1);
      expect(Status.INACTIVE).toBe(0);
      expect(Status.PENDING).toBe(2);
    });
  });

  describe("value()", () => {
    it("应通过 Key 获取 Value", () => {
      expect(Status.value("ACTIVE")).toBe(1);
      expect(Status.value("INACTIVE")).toBe(0);
      expect(Status.value("PENDING")).toBe(2);
    });
  });

  describe("values()", () => {
    it("不传参时返回所有值", () => {
      expect(Status.values()).toEqual([1, 0, 2]);
    });

    it("传参时返回指定 Key 的值", () => {
      expect(Status.values("ACTIVE", "PENDING")).toEqual([1, 2]);
    });

    it("单个参数也应正常工作", () => {
      expect(Status.values("INACTIVE")).toEqual([0]);
    });
  });

  describe("keys()", () => {
    it("应返回所有枚举 Key", () => {
      expect(Status.keys()).toEqual(["ACTIVE", "INACTIVE", "PENDING"]);
    });

    it("简单枚举也应正确返回", () => {
      expect(Simple.keys()).toEqual(["YES", "NO"]);
    });
  });

  describe("label()", () => {
    it("通过 Key 获取 Label", () => {
      expect(Status.label("ACTIVE")).toBe("激活");
      expect(Status.label("INACTIVE")).toBe("未激活");
      expect(Status.label("PENDING")).toBe("待审核");
    });

    it("通过 Value 获取 Label", () => {
      expect(Status.label(1)).toBe("激活");
      expect(Status.label(0)).toBe("未激活");
      expect(Status.label(2)).toBe("待审核");
    });

    it("不存在的 Key/Value 应返回 undefined", () => {
      expect(Status.label("UNKNOWN" as any)).toBeUndefined();
      expect(Status.label(99 as any)).toBeUndefined();
    });
  });

  describe("extra()", () => {
    it("通过 Key 获取 Extra", () => {
      expect(Status.extra("ACTIVE")).toEqual({ color: "green" });
      expect(Status.extra("INACTIVE")).toEqual({ color: "gray" });
    });

    it("通过 Value 获取 Extra", () => {
      expect(Status.extra(1)).toEqual({ color: "green" });
      expect(Status.extra(0)).toEqual({ color: "gray" });
    });

    it("没有 extra 的枚举应返回 undefined", () => {
      expect(Simple.extra("YES")).toBeUndefined();
      expect(Simple.extra(1)).toBeUndefined();
    });
  });

  describe("keyOf()", () => {
    it("通过 Value 反查 Key", () => {
      expect(Status.keyOf(1)).toBe("ACTIVE");
      expect(Status.keyOf(0)).toBe("INACTIVE");
      expect(Status.keyOf(2)).toBe("PENDING");
    });

    it("不存在的 Value 应返回 undefined", () => {
      expect(Status.keyOf(99 as any)).toBeUndefined();
    });
  });

  describe("check()", () => {
    it("值匹配时返回 true", () => {
      expect(Status.check(1, "ACTIVE")).toBe(true);
      expect(Status.check(0, "INACTIVE")).toBe(true);
    });

    it("值不匹配时返回 false", () => {
      expect(Status.check(1, "INACTIVE")).toBe(false);
      expect(Status.check(99, "ACTIVE")).toBe(false);
    });
  });

  describe("has()", () => {
    it("存在的值返回 true", () => {
      expect(Status.has(1)).toBe(true);
      expect(Status.has(0)).toBe(true);
      expect(Status.has(2)).toBe(true);
    });

    it("不存在的值返回 false", () => {
      expect(Status.has(99)).toBe(false);
      expect(Status.has(-1)).toBe(false);
      expect(Status.has("ACTIVE")).toBe(false);
    });
  });

  describe("size", () => {
    it("应返回枚举项数量", () => {
      expect(Status.size).toBe(3);
      expect(Simple.size).toBe(2);
    });
  });

  describe("options()", () => {
    it("不传参时返回所有选项", () => {
      expect(Status.options()).toEqual([
        { value: 1, label: "激活", extra: { color: "green" } },
        { value: 0, label: "未激活", extra: { color: "gray" } },
        { value: 2, label: "待审核", extra: { color: "orange" } },
      ]);
    });

    it("传参时只返回指定项", () => {
      expect(Status.options("ACTIVE", "PENDING")).toEqual([
        { value: 1, label: "激活", extra: { color: "green" } },
        { value: 2, label: "待审核", extra: { color: "orange" } },
      ]);
    });

    it("没有 extra 时 extra 为 undefined", () => {
      expect(Simple.options()).toEqual([
        { value: 1, label: "是", extra: undefined },
        { value: 0, label: "否", extra: undefined },
      ]);
    });
  });

  describe("pick()", () => {
    it("应返回仅包含指定 Key 的新枚举", () => {
      const picked = Status.pick("ACTIVE", "PENDING");
      expect(picked.ACTIVE).toBe(1);
      expect(picked.PENDING).toBe(2);
      expect((picked as any).INACTIVE).toBeUndefined();
    });

    it("新枚举应该是独立的冻结实例", () => {
      const picked = Status.pick("ACTIVE");
      expect(Object.isFrozen(picked)).toBe(true);
      expect(picked.size).toBe(1);
    });

    it("新枚举的 options 应正确", () => {
      const picked = Status.pick("ACTIVE");
      expect(picked.options()).toEqual([
        { value: 1, label: "激活", extra: { color: "green" } },
      ]);
    });
  });

  describe("omit()", () => {
    it("应返回排除指定 Key 的新枚举", () => {
      const omitted = Status.omit("PENDING");
      expect(omitted.ACTIVE).toBe(1);
      expect(omitted.INACTIVE).toBe(0);
      expect((omitted as any).PENDING).toBeUndefined();
    });

    it("新枚举应该是独立的冻结实例", () => {
      const omitted = Status.omit("ACTIVE", "INACTIVE");
      expect(Object.isFrozen(omitted)).toBe(true);
      expect(omitted.size).toBe(1);
    });

    it("排除所有项后应返回空枚举", () => {
      const empty = Simple.omit("YES", "NO");
      expect(empty.size).toBe(0);
      expect(empty.keys()).toEqual([]);
    });
  });

  describe("filter()", () => {
    it("应返回满足条件的选项列表", () => {
      const result = Status.filter((value) => value !== 0);
      expect(result).toEqual([
        { value: 1, label: "激活", extra: { color: "green" } },
        { value: 2, label: "待审核", extra: { color: "orange" } },
      ]);
    });

    it("无匹配时返回空数组", () => {
      const result = Status.filter(() => false);
      expect(result).toEqual([]);
    });

    it("可以根据 extra 过滤", () => {
      const result = Status.filter(
        (_v, _l, _k, extra) => (extra as any)?.color === "green",
      );
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(1);
    });
  });

  describe("forEach()", () => {
    it("应遍历所有枚举项", () => {
      const items: Array<[unknown, unknown, unknown, unknown]> = [];
      Status.forEach((value, label, key, extra) => {
        items.push([value, label, key, extra]);
      });
      expect(items).toEqual([
        [1, "激活", "ACTIVE", { color: "green" }],
        [0, "未激活", "INACTIVE", { color: "gray" }],
        [2, "待审核", "PENDING", { color: "orange" }],
      ]);
    });
  });

  describe("toMap()", () => {
    it("应返回 value => label 的 Map", () => {
      const map = Status.toMap();
      expect(map).toBeInstanceOf(Map);
      expect(map.get(1)).toBe("激活");
      expect(map.get(0)).toBe("未激活");
      expect(map.get(2)).toBe("待审核");
      expect(map.size).toBe(3);
    });
  });

  describe("toRecord()", () => {
    it("应返回 { [value]: label } 的对象", () => {
      const record = Status.toRecord();
      expect(record).toEqual({
        1: "激活",
        0: "未激活",
        2: "待审核",
      });
    });
  });

  describe("[Symbol.iterator]", () => {
    it("应支持 for...of 迭代", () => {
      const items: Array<{
        key: unknown;
        value: unknown;
        label: unknown;
        extra: unknown;
      }> = [];
      for (const item of Status) {
        items.push(item);
      }
      expect(items).toEqual([
        { key: "ACTIVE", value: 1, label: "激活", extra: { color: "green" } },
        {
          key: "INACTIVE",
          value: 0,
          label: "未激活",
          extra: { color: "gray" },
        },
        {
          key: "PENDING",
          value: 2,
          label: "待审核",
          extra: { color: "orange" },
        },
      ]);
    });

    it("应支持展开运算符", () => {
      const items = [...Simple];
      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({
        key: "YES",
        value: 1,
        label: "是",
        extra: undefined,
      });
    });
  });

  describe("字符串 Value 的枚举", () => {
    const Direction = createEnum({
      UP: ["up", "向上"],
      DOWN: ["down", "向下"],
      LEFT: ["left", "向左"],
      RIGHT: ["right", "向右"],
    } as const);

    it("应正确处理字符串类型的 Value", () => {
      expect(Direction.UP).toBe("up");
      expect(Direction.value("DOWN")).toBe("down");
      expect(Direction.label("up")).toBe("向上");
      expect(Direction.keyOf("left")).toBe("LEFT");
      expect(Direction.has("up")).toBe(true);
      expect(Direction.has("diagonal")).toBe(false);
    });
  });
});
