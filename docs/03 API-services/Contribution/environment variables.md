# How to use environment variables

What are environment variables?
-------------------------------

Environment variables are predefined values that are used to provide the ability to configure a value in your code from outside of your application. An environment variable is made up of a name/value pair stored in a file named with some kind of variation of `.env`.

```plain
// .env example

HOST=localhost
PORT=8080
SOME_KEY=1234567
...
```

  

How to prepare application to use environment variables?
--------------------------------------------------------

The first thing we need is a library so that we can read .env files. One of the best known is [dotenv](https://www.npmjs.com/package/dotenv) and that's why we'll use it.

Install it with command

```plain
yarn add dotenv
```

  

Remember to add `.env*` to your `.gitignore` and `.dockerignore` files to not send any env files to the git repository or docker image.

  

The next step is to prepare a special Config class that you will use in your code instead of referring to `process.env.*`. Creating such a class will simplify the use of environment variable and will also be the main place to configure them

  

Inside `src` create a configuration directory and place there these files

```typescript
// config.types.ts
export type Config = {
  host: string;
  port: number;
  ...
}

// app-config.ts
export default class AppConfig implements Config {
  constructor(
    public readonly host: string = process.env.HOST,
    public readonly port: number = Number(process.env.PORT),
    ...
  ) { }
}

// index.ts
import { existsSync, statSync } from "fs";
import AppConfig from "./app-config";

const envPath = process.env.NODE_ENV
  ? `./.env-${process.env.NODE_ENV}`
  : `./.env`;

if (!existsSync(envPath)) {
  throw new Error(`Configuration file not found. Please check path: ${envPath}`);
}

const envStats = statSync(envPath);

if (!envStats.isFile()) {
  throw new Error(`The given path is not a file. Please check path: ${envPath}`);
}

require('dotenv').config({ path: envPath });

export default new AppConfig();
export { Config } from "./config.types";
```

  

`app-config.ts` and `config.types.ts` do not need to be explained. However, pay attention on what is happening on `index.ts`. First, we define the path to the env file - based on the `NODE_ENV` value. If `NODE_ENV` is not specified, the script will take the standard path to the `.env` file.

Later, based on the env file, we configure `dotenv` and export the instance of the `AppConfig` and general `Config` interface.

  

If anything goes wrong, an error will be thrown.

  

Now you can provide `NODE_ENV` before you run your app. If you are using docker add these lines line below `FROM` in your `Dockerfile`

```plain
ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV}
```

  

Then if you build/run the service via `docker compose`, add `NODE_ENV` as follows:

```typescript
// build with develop variables
NODE_ENV=develop docker compose build

// running with develop variables
NODE_ENV=develop docker compose up
```

  

Locally, you can also specify `NODE_ENV` to start the service or `export` your variable first:

```typescript
// export variable
export NODE_ENV=develop
yarn your_command

// direct
NODE_ENV=develop yarn your_command
```

  

If you do not specify `NODE_ENV` as shown in the above code snippets, the application will use the default values.

  

How to use environment variables?
---------------------------------

After setting up your configuration file. All you have to do is import the `config` object and use the variables defined in it. With _TypeScript_ it will be much more intuitive and you won't need to remember all the key names stored in the env file.

  

```typescript
import config from '../../config';

class SomeService {
  private host: string = config.host;
  private port: number = config.port;
  ...
}

 
How to generate .env files?
---------------------------

As we know env files must not be kept in public spaces, so these files must be generated. In the `./scripts/` directory you will find the file `create-env.js`, which at the moment only mocks it's original behaviour. This or a similar script should retrieve the appropriate values based on the given environment type (production, develop, test) and create an `env` file on the fly.

This script should be part of your application build processes.

  

We have to decide where and how we want to store the variables and how we want to retrieve them Locally for development purposes you can manually create your own version of env.
