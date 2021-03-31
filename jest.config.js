module.exports = {
    "testEnvironment": "node",
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
        "ts",
        "js"
    ],
    "coverageThreshold": {
        "global": {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": -10
        }
    },
    "coveragePathIgnorePatterns": [
        "/node_modules/",
        "tests/",
        "out/",
        "coverage/",
        "examples/",
    ],
    "coverageDirectory": "./coverage/",
    "collectCoverage": true
}
