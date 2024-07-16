import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
const name = "create-enum";

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: `./dist/${name}.cjs.js`,
        format: "cjs",
      },
      {
        file: `./dist/${name}.es.js`,
        format: "es",
      },
      {
        file: `./dist/${name}.umd.js`,
        format: "umd",
        name: "$Enum",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json", //导出声明文件
        declaration: true,
        //类型目录
        declarationDir: "types",
        //输出目录
        outDir: "dist",
      }),
    ],
  }, // 第二步将esm打包出的文件再打包到index.d.ts中去
  {
    input: "./dist/types/index.d.ts",
    output: [{ file: "./dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
