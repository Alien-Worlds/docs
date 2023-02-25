
# How to create a test environment

In this section, you will learn what test environments are, what they are for and how to create one.

  

What is a test environment?
---------------------------

As you already know, tests run in the scope: global or grouped by description. Each of them has its own processes that run unchangeably - because it is defined by the framework. You also learned that, apart from running tests, there are also setup and teardown functions like: `beforeAll`, `afterEach` ...

It is good practice to use these helpers for initialization, checking and cleaning after. However, it is a bad idea to copy this code to different test files. Therefore, each commonly used process is saved in the form of the environment which can then be imported and initialized directly in the test file.

Treat it as predefined actions that you code once and you don't have to copy them.

  

How to write a test environment?
--------------------------------

It's very simple in the `./tests/environments` folder you will find the `test-environment.ts` file which contains the interface. All you have to do is create a class of your environment and implement this interface.

```typescript
export type TestHooks = {
    beforeAll?: Function,
    beforeEach?: Function,
    afterAll?: Function,
    afterEach?: Function,
}

export interface TestEnvironment {
    initialize(hooks?: TestHooks): void;
}


```

  

### Test environment examples

One of the environments we have created to support the Fastify framework - for our API tests - will serve as an example here.

```typescript
// api-test-environment.ts
export interface TestEnvironmentServer {
    inject<T>(options: {
        url: string,
        method: string,
        payload?: T,
    })
}

export interface ApiTestEnvironment extends TestEnvironment {
    get server(): TestEnvironmentServer;
    initialize(hooks?: TestHooks): void;
}

// fastify-environment.ts

import { buildAPI } from "../../src/api";
import { TestHooks } from "./test-environment";
import { ApiTestEnvironment, TestEnvironmentServer } from "./api-test-environment";

export class FastifyTestEnvironment implements ApiTestEnvironment {
  private _server;

  get server(): TestEnvironmentServer {
    return this._server;
  }

  initialize(hooks?: TestHooks) {
    beforeAll(async () => {
      this._server = await buildAPI();
      if (!!hooks?.beforeAll) {
        await hooks.beforeAll();
      }
    });

    if (!!hooks?.beforeEach) {
      beforeEach(async () => await hooks.beforeEach());
    }

    if (!!hooks?.afterEach) {
      afterEach(async () => await hooks.afterEach());
    }

    afterAll(async () => {
      if (!!hooks?.afterAll) {
        await hooks.afterAll();
      }
      if (!!this._server) {
        await this._server.close();
      }
    });
  }
}
```

  

How to use test environments
----------------------------

It's also not complicated just import your environment, create instances and initialize it.

If in a given test file you need additional actions that should be run in one of the helpers, you can also define them as in the example below

```typescript
// some basic test file
import { SomeCommonEnvironment } from '../environments'

const environment = new SomeCommonEnvironment();
environment.initialize({
  beforeAll: () => {
    //..
  },
});
```

  

For an API test environment, use `createApiTestEnvironment` function to avoid directly referencing a specific web framework.

```typescript
// some api test file
import { createApiTestEnvironment } from '../environments'

const environment = createApiTestEnvironment();
environment.initialize({
  beforeAll: () => {
    //..
  },
});

describe('GET /foo', () => {
    it('should return 200', async () => {
        const response = await environment.server.inject({
            method: 'GET',
            url: '/foo'
        });
        expect(response.statusCode).toEqual(200);
    });
});
```
