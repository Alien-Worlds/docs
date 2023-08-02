# API Starter Kit

This repository contains the basic structure for an API, along with all the necessary code to initialize and run it. It serves as a starting point for building APIs using Node.js, Typescript, Express and MongoDB.

## Dependencies

The API Starter Kit relies on the following dependencies:

- [@alien-worlds/aw-core](https://github.com/Alien-Worlds/api-core): Core package providing common functionality for APIs.
- [Express](https://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js.
- [@alien-worlds/aw-storage-mongodb](https://github.com/Alien-Worlds/storage-mongodb): MongoDB storage adapter for the API.

Additionally, it integrates with [New Relic](https://newrelic.com/) for application performance monitoring.

## Installation

1. Clone this repository:

   ```shell
   git clone https://github.com/Alien-Worlds/api-starter-kit.git
   ```

2. Install the dependencies:

   ```shell
   yarn
   ```

3. Configure the API by setting up environment variables or editing the configuration files as needed.

4. Start the API:

   ```shell
   yarn start
   ```

## Endpoints

### Health Endpoint

- **URL:** `/health`
- **Method:** GET
- **Description:** Retrieves information about the API's health, including statistics, database connection status, and dependency versions.

### Ping Endpoint

- **URL:** `/ping`
- **Method:** GET
- **Description:** A quick endpoint to check if the API is responding. It can be used for basic connectivity testing.

For more details on how to write your API using this starter kit, please refer to the [How to Write API](./tutorials/how-to-write-api.md) guide.

## Helpful links:

- [How to create an API? (using starter kit)](./tutorials/how-to-write-api.md)
- [API Core tutorials](https://github.com/Alien-Worlds/api-core/tree/main/tutorials)
- [History Tools Starter Kit tutorials](https://github.com/Alien-Worlds/history-tools-starter-kit/tree/main/tutorials)

## Contributing

We welcome contributions from the community. Before contributing, please read through the existing issues on this repository to prevent duplicate submissions. New feature requests and bug reports can be submitted as an issue. If you would like to contribute code, please open a pull request.

## License

This project is licensed under the terms of the MIT license. For more information, refer to the [LICENSE](./LICENSE) file.
