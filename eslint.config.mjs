import next from "eslint-config-next";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "src/generated/**"],
  },
  ...next,
];

export default config;
