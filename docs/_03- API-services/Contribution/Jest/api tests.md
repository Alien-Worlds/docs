
# How to write API tests

What do we mean by API tests?
-----------------------------

The API tests are integration tests but not at the e2e level. In this case, we limit testing to a concrete service. They are used to confirm that after making major changes the requests sent to a specific service are still performed correctly and return the expected results. This does not exempt from performing unit tests, it only allows for validation from a wider perspective. Tests of this kind should be part of the pipeline as a stage performed before the release of a new version.

  

Where to write API tests?
-------------------------

Since the test API does not directly reference specific code pairs, test files are saved in the `./tests/ api` directory and not directly in the source code. The file name should be adequate to the resource we want to test and include the prefix `api.test` - for easy recognition.

```plain
./src/
./tests/
  |_ api/
      |_ mines.api.test.ts
      |_ asset.api.test.ts
      ...
```

  

How to write API tests?
-----------------------

The rules are similar to writing unit tests. You should remember about grouping tests, using the established naming convention. Check the guidelines in the sections [How to write Unit tests](https://app.clickup.com/18330827/v/dc/hfd6b-9788/hfd6b-4681), [How to write tests with Jest](https://app.clickup.com/18330827/v/dc/hfd6b-9788/hfd6b-4621) if you haven't already.

An important aspect is not to use the web frameworks directly in your tests. In the future, the framework may be replaced by another one. If that happens and you setup web framework directly in the test file, you will do yourself extra work replacing it with a new one. A better solution is to use test environments which you just need to import and initialize. In the minimal case it's about 3 lines of code that you add in each test, and if necessary, you can make changes in the environment itself.

  

```typescript
// sample use of the API test environment

import { createApiTestEnvironment } from '../environments'

const environment = createApiTestEnvironment();
environment.initialize();

describe('Testing GET method of /some-resource', () => {
    it('should return 200', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/some-resource'
        });
        expect(response.statusCode).toEqual(200);
    });
});
```

  

In chapter [How](https://app.clickup.com/18330827/v/dc/hfd6b-9788/hfd6b-4741) [to create a test environment](https://app.clickup.com/18330827/v/dc/hfd6b-9788/hfd6b-4741) you will learn how to use different test environments and how to create your own. In the case of API tests, as I wrote earlier, it is better not to refer to a specific web framework, so we suggest you use the `createApiTestEnvironment` function, which will return you a properly configured environment with the server. Inside this environment, setup and teardown actions are also defined to initialize and remove the server, respectively, before and after testing. So you don't have to worry about it.

  

How to run API tests?
---------------------

To execute API tests, run the following command:

```plain
yarn test:api
```

  

When to run API tests?
----------------------

Apart from being able to run them locally, API tests should be part of the deployment pipeline.
