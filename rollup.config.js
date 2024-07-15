import typescript from "@rollup/plugin-typescript";
const name = "create-enum";

export default {
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
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
};
