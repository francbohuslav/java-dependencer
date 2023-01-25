module.exports = {
    extends: ["eslint:recommended"],
    env: {
        es6: true,
        node: true,
    },
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
    },
    rules: {
        "no-unused-vars": "error",
        "no-var": "error",
        "prefer-const": "error",
    },
};
