
# How to write Unit tests

In the parent article you will find general tips for writing tests. In this section we will focus on writing unit tests. It may seem extremely easy because this type of testing is the most basic. This is true, but even when writing unit tests, you can make mistakes that affect the quality and reliability of your tests. To avoid this, we have listed some basic rules, tips on writing unit tests.

  

What to test?
-------------

Absolutely anything - if possible. If you are writing new code, remember to write tests parallel to the code you are creating - or at least test templates. This is not a TDD rule, but many programmers forget to write tests and then reluctantly sit down to write them for already existing "working" code. I used _"_ because another important aspect of parallel test writing is _faster bug finding_. By creating code and testing at the same time, we have a better chance to think about what may not work and to make sure that our code will handle these exceptions in the right way. Writing tests for existing code requires from the programmer to first look at what this code does exactly, whether it does it right or whether all circumstances have been considered.

  

When working on existing code that does not have unit tests written, you must write them. Split your work into batches, don't try to write tests for all files at once. It's better to write your tests longer, but take into account the entire spectrum.

  

Suggestions
-----------

*   Unit Test cases should be independent. In case of any enhancements or change in requirements, unit test cases should not be affected.
*   Test only one code at a time.
*   Follow clear and consistent naming conventions for your unit tests
*   In case of a change in code in any module, ensure there is a corresponding unit test case for the module, and the module passes the tests before changing the implementation
*   Bugs identified during unit testing must be fixed
*   Adopt a "test as your code" approach. The more code you write without testing, the more paths you have to check for errors.

  

Where to write unit tests?
--------------------------

In the case of test units, save them in the `__tests__` folder in the TypeScript source code. Jest framework finds all tests stored in folders with this name and runs them sequentially. Test files must be named the same as tested source code files. Just add the test prefix `test` in the name as follows:

```plain
./src/utils/math.utils.ts
./src/utils/__tests__/math.utils.test.ts
```

  

Saving tests right next to the source is easier and helps to keep order in the paths of imported files. Plus, it's easy to spot where your code is missing tests.

  

How to write a unit test?
-------------------------

```typescript
import SuperHeroRepository from "../super-hero.repository";
import expectedFindHeroByNameList from "__fixtures__/super-hero.repository.fixture";

describe("SuperHeroRepository Unit tests", () => {
  it("should return an array with one item with Bruce Wayne's data when Batman's name is given", async () => {
    
    const repository = new SuperHeroRepository();
    const result = await repository.findByName('Batman');

    expect(result).toEqual(expectedFindHeroByNameList);
  });
  ...
});
```

  

First, see how easy it is to import the code. No long tracks from the `tests` folder to `src` like `../../../../src/data/repositories/`

  

You can define a test using the `it()` or `test()` functions. Inside the group and using the format _should ... action ... when given_ it is better to use `it()`. When writing tests, remember that the entire report should have the same syntax. You can use different formats at different levels (global scope and internal scope).

As for the construction of the test itself, we start with determining the group we want to test, using `describe`.

In the above example, there is only one group that corresponds to the repository class, but you can create much more sub groups or more independent groups. The choice is yours and the bottom line is that, in the end, the tests are organized.

  

```typescript
// an example of creating a test sub-groups

describe("SuperHeroRepository Unit tests", () => {
  describe("Data filtering tests", () => {
    it("should return an array with one item with Bruce Wayne's data when Batman's name is given", async () => {...});
    it("should return an array of all Justice League members", async () => {...});
    ...
  });
  describe("Data modivifaction tests", () => {
    it("should return a modified data of the Justice League member", async () => {...});
    ...
  });
  ...
});
```

  

It is a good practice to create a test group for even one function, if you want to test several scenarios on it - _positive_ and _negative_ tests.

  

### Positive and Negative testing

An example of a positive test could be the code used earlier:

```typescript
...
const repository = new SuperHeroRepository();
const result = await repository.findByName('Batman');
expect(result).toEqual(expectedFindHeroByNameList);
...
```

  

In this test, we take a happy path/case and test the result, knowing that the given data is correct and that the script will do its work without any issues.

But what if incorrect data is given or for some reason the operation ends with an error? We should predict this and test it as well. We refer to this type of testing as _negative testing_.

An example of such a test can be checking whether in the case of giving wrong input data, an appropriate exception (`WrongInputDataError`) will be thrown.

  

```typescript
...
try {
  const repository = new SuperHeroRepository();
  const result = await repository.findByName();
} catch (error) {
  expect(error).toBe(WrongInputDataError);
}
...
```

  

### Setup and Teardown your tests

Often while writing tests you have some setup work that needs to happen before tests run, and you have some finishing work that needs to happen after tests run. `Jest` provides helper functions to handle this:

*   `beforeEach` : executes code before each test defined in the scope (description)
*   `afterEach` : executes code after each test in the scope
*   `beforeAll` : executes code one time before starting the tests in the scope
*   `afterAll` : executes code when it completes (successfully or not) all tests in the scope

More detailed information can be found on the Jest page [https://jestjs.io/docs/setup-teardown](https://jestjs.io/docs/setup-teardown)

  

```typescript
// Applies to all tests in this file
beforeAll(() => {
  // runs once before all tests - setup
});
afterAll(() => {
  // runs once after all tests - teardown
});
beforeEach(() => {
  ...
});
afterEach(() => {
  ...
});

test('Some global function returns what is expected', () => {
  ...
});

test('Some other global function returns what is expected', () => {
  ...
});

describe('Other helper functions unit tests', () => {
  // Applies only to tests in this describe block
  beforeEach(() => {
    ...
  });
  afterEach(() => {
    ...
  });

  beforeAll(() => {
    // runs once before all tests - setup
  });
  afterAll(() => {
    // runs once after all tests - teardown
  });
});
```

  

### Using fixtures

A test fixture is a fixed state of a set of objects used as a baseline for running tests. The purpose of the fixture is to ensure that there is a well known and fixed environment in which tests are run so that results are repeatable. Examples of fixtures:

*   Preparation of input data and setup/creation of fake or mock objects
*   Loading a database with a specific, known set of data
*   Copying a specific known set of files creating a test fixture will create a set of objects initialized to certain states.

  

In our TypeScript code, we should save the data in the `__fixtures__` directories next to our tests directories. This name has nothing to do with additional features of the Jest framework, but by using `__` in the name, you clearly separate the data files from the source code.

  

**_Keep in mind:_** As with the `__tests__` and `__mocks__` directories, also here it is important to ignore the `__fixtures__` directory in the TypeScript configuration. So that the test code, data, mocks are not unnecessarily captured and added to the production code.

  

#### Fixture example

```typescript
// ./src/data/repositories/__fixtures__/super-hero.repository.fixture.ts
...
expect const expectedFindHeroByNameList = [
  {
    id: 1,
    first_name: "Bruce",
    last_name: "Wayne",
    nickname: "Batman",
    created_at: "2018-07-25T22:18:13.340Z",
    updated_at: "2018-07-25T22:18:13.340Z"
  }
];


...
```

  

### Mocking

In most cases the tested code will be composite which means it will have dependencies on other modules / classes / functions. To isolate the behaviour of tested code, you want to replace other dependencies with mockups that simulate the behaviour of real code.

All mocks should be created in catalogs `__mocks__` subdirectory immediately adjacent to the module, class or function. The name of the mock file must be the same as the original.

```plain
./src/utils/math.utils.ts
./src/utils/__mocks__/math.utils.ts
```

Check out these pages for all the information you need to know about the mocking and how to use it:

*   [https://jestjs.io/docs/mock-functions](https://jestjs.io/docs/mock-functions)
*   [https://jestjs.io/docs/manual-mocks](https://jestjs.io/docs/manual-mocks)

  

How to run Unit tests?
----------------------

To execute unit tests, run the following command:

```plain
yarn test:unit
```

  

When to run Unit tests?
-----------------------

Unit tests should be run as a stage before uploading files to the repository, in the case of TypeScript projects you can use the [Husky](https://typicode.github.io/husky/#/) package for this purpose. Of course, they should also be a part of the deployment pipeline.
