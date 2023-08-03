# Alien Worlds REST API Tools

The REST API tools consist of a number of libraries focused on specific functions that are designed to work together to track and manipulate data derived from various blockchain smart contracts in order to serve data in a readily consumable format for front-end consumers.

## Libraries

The following libraries are included in the Alien Worlds core library collection:

### **[aw-history-dao](01-aw-history-dao/README.md)**: 
The DAO History Tools tie together various tools to collect and process block history for smart contracts related to the DAOs. They are built on top of the History Tools Starter Kit, which uses MongoDB and Antelope. The entire operational logic of the DAO History Tools is implemented through dependencies, meaning that this repository only contains scripts that execute individual processes and processors necessary for data processing.
### **[aw-api-starter-kit](02-Components/01-aw-api-starter-kit/README.md)**: 
A boilerplate project that can be used to create a new API using the included component libraries as used in the `aw-history-dao`.
### **[aw-core](02-Components/02-aw-core/README.md)**: 
The core library containing common code components and types used in other libraries.
### **[aw-storage-mongodb](02-Components/03-aw-storage-mongodb/README.md)**: 
A storage adapter for the API that uses MongoDB as a backing store.
### **[aw-antelope](02-Components/04-aw-antelope/README.md)**: 
A library containing the Antelope-specific processes that work together to read raw and manage raw block content from an Antelope blockchain.
### **[aw-workers](02-Components/05-aw-workers/README.md)**: 
A library to manage a pool of workers for the API to facilitate parallel processing of a large amount of block content into a consumable format for the exposed API endpoints.
### **[aw-broadcast](02-Components/06-aw-broadcast/README.md)**: 
A tool for broadcasting messages between processes. This allows different instances of the APIs to share data from work already done while achieving this through loose coupling between running instances
### **[aliengen](https://raw.githubusercontent.com/Alien-Worlds/aliengen/master/README.md)**: 
This is a command line tool to process the raw ABI (Application Binary Interface) for each smart contract into Typescript files. Each smart contract has multiple integration points, including, reading tables and executing actions. These can be performed by reading directly into the blockchain node state or by interacting with the history tools that process data from the blockchain logs. The code generated with this tool reduces the amount of manual code that needs be written to perform the integrations - while also reducing the potential of introducing human error into the system.

### **aw-contracts**: 
Each smart contract has code generated using the `aliengen` tool which are then used within the history tools for mapping and processing raw data into usable data in the APIs. These provide a foundational starting point where further custom mapping can be achieved with modifications to the generated code. 
The current contracts that have generated code and are used in the history tools include:
  * [alien.worlds](https://github.com/Alien-Worlds/aw-contract-alien-worlds) The TLM token smart contract
  * [dao.worlds](https://github.com/Alien-Worlds/aw-contract-dao-worlds) The election smart contract
  * [escrw.worlds](https://github.com/Alien-Worlds/aw-contract-escrw-worlds) The escrow smart contract used for proposals
  * [msig.worlds](https://github.com/Alien-Worlds/aw-contract-msig-worlds) The MSIG smart contract used for all proposals
  * [prop.worlds](https://github.com/Alien-Worlds/aw-contract-prop-worlds) The long form proposal smart contract
  * [index.worlds](https://github.com/Alien-Worlds/aw-contract-index-worlds) The smart contract to manage the DAOs at an admin level
  * [ref.worlds](https://github.com/Alien-Worlds/aw-contract-ref-worlds) The referendum smart contract
  * [stkvt.worlds](https://github.com/Alien-Worlds/aw-contract-stkvt-worlds) The contract used to manage token staking for election vote power
  * [token.worlds](https://github.com/Alien-Worlds/aw-contract-token-worlds) The Token contract for all the planet tokens (KAV, NER, NAR, VEL, EYE, MAG)

## How the libraries work together

The API core libraries are designed to work together without duplicating code between tools and give flexibility so the required features can be mixed and matched as required. For example, the `aw-history-dao` uses the `aw-storage-mongodb` to store data that has been processed using parts from the `aw-core` and `antelope` libraries process and manage the DAO states. The libraries can be used to store block data in a more efficient and scalable way and allow for custom data retrieval independent from the data structure in the blockchain smart contracts. Because there can be so much data to process, the `aw-workers` library can be used to parallelize the processing of block ranges quickly.

```mdx-code-block
import DocCardList from '@theme/DocCardList';

<DocCardList />
```