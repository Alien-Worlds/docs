# Testing

The testing framework used for the smart contract unit tests is [lamington](https://github.com/Alien-Worlds/lamington). This facilitates tests that run in a docker container against a newly created EOSIO chain instance for each test run. The tests are executed through [eosjs](https://www.npmjs.com/package/eosjs) NodeJS module as is used by most clients that interact with the smart contracts. Furthermore, the tests interface with the smart contracts via Typescript using interface types that are generated during compilation in Lamington derived from the smart contracts ABI.
