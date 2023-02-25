
# How to write tests with Jest

Writing tests is an essential part of creating any application, as we know, thanks to testing, we can be sure at the end of our work that all components are still working as they should and generate the expected result or warn us that our changes have damaged the logic or data flow.

  

General suggestions on how to write tests?
------------------------------------------

1.  This may sound like a challenge, but write your tests in such a way that _every line of code is tested_. We want the highest code coverage possible.
2.  Write _more negative tests_ and _at least one positive test_. What does it mean?
    1.  _Negative testing_ ensures that your code can gracefully handle invalid input or unexpected user behaviour.
    2.  _Positive testing_ determines that your code works as expected. If an error is encountered during positive testing, the test fails.
3.  _Test the whole set of possibilities for your functionality_. If it involves an enumerated type, test the functionality with every one of the items in the enumeration.
4.  _Tests should never depend on each other_.
5.  _Explain what you are testing in the name of the test_. As you are doing one assert per test, each test can end up being very specific. Thus, don’t be hesitant to use a long, complete test name, like: `'should return the UserEntity instance after passing the "user" enum'`.
6.  _Do not use_ **_if()_** _statements in your tests_. If you are using if() in your test it means that you should divide this test into several.
7.  Divide your tests into the appropriate categories:
    1.  _API_: testing all possible requests and their responses
    2.  _Unit_: testing individual units of code - mostly functions/ methods
    3.  _Integration_: testing if modules/ components of the service work correctly when they are connected to each other.
    4.  _E2E_: testing the entire software product from beginning to end to ensure the application flow behaves as expected. It defines the product’s system dependencies and ensures all integrated pieces work together as expected.
8.  _Use the data prepared for the test scenario_. Create separate data files (fixtures) that you want to use in the test. Do not create them inside a test code block unless they are required to test a specific case.
9.  _Setup and teardown the scope of your test cases_. Jest framework provides functions like: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`. Use these functions to bring your application to a state in which you can run the tests correctly and then clean up after the test.
10.  _Group your tests_. In Jest you can use `describe` for that. Break your test suite into components. Depending on what you are testing you might have a describe for each module, class or function. The idea is to keep your tests in the correct order / sections to make them readable.
11.  _Arrange, Act, Assert_ is a common pattern when unit testing. As the name implies, it consists of three main actions:
    1.  _Arrange_ your objects, creating and setting them up as necessary.
    2.  _Act_ on an object.
    3.  _Assert_ that something is as expected.

  

Jest testing framework
----------------------

For our services written in TypeScript/JavaScript for test runner, mocking, assertion and code coverage we are using [Jest](https://jestjs.io/). It is the most common testing framework with a large community and support.

  

### How to install Jest (for TypeScript)?

Install these packages as a dev dependencies:

```plain
yarn add --dev jest @types/jest babel-jest @babel/preset-typescript @babel/core @babel/preset-env
```

  

Based on your project, Jest will ask you a few questions and will create a basic configuration file `jest.config.*` with a short description for each option:

```plain
jest --init
```

  

In our projects, we have separate configuration files for each type of test:

*   `jest.config.js`
*   `jest.config.unit.js`
*   `jest.config.api.js`

  

`jest.config.js` is our common configuration file which contains basic setup, the rest correspond to the _unit_ and _api_ tests.

```javascript
// jest.config.api.js
const { config } = require('./jest.config');

module.exports = {
  ...config,
  collectCoverage: false,
  testEnvironment: 'jest-environment-node',
  testMatch: ["**/tests/api/**/*.api.test.ts"]
};

// jest.config.unit.js
const { config } = require('./jest.config');

module.exports = {
  ...config,
  testEnvironment: 'jest-environment-node',
  testMatch: ["**/__tests__/**"]
};


```

  

To record code coverage, remember to add the following options to the basic configuration:

```javascript
// jest.config.js
...
collectCoverage: true,
coverageDirectory: "coverage",
...
```

  

To be able to write tests in TypeScript, you still need to add babel configurations. If you copied the installation command mentioned above, you should have it already installed.

```javascript
// babel.config.js
module.exports = {
    presets: [
      ['@babel/preset-env', {targets: {node: true}}],
      '@babel/preset-typescript',
    ],
  };
```
