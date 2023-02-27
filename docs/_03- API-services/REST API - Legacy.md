

The Alien Worlds API consists of four processes that work together to track actions the executed on the Wax blockchain that are required in some form to be presented through the UI. Ideally data should be read directly from the blockchain nodes following principles of decentralisation, ensuring data cannot be manipulated and to provide the smallest latency between on-chain events and what is observable via an API. In practice reading and storing all data on the blockchain in smart contracts RAM state can add significant load to the limited, shared blockchain resources. Therefore hosting an API service which reads and processes actions from the blockchain and massages the data into a form ready for the consuming UI provides a pragmatic middle-ground between decentralisation and performance. In addition this API doesn't perform and or hold any data that cannot be derived again from another launched instance of the API in a completely detached location. In effect this API could be regarded as a convenience extension to the underlying blockchain providing a means of horizontal scalability for consumers of the blockchain data.

The raw action data are processed to be inserted into a local database in a form that can be exposed in a RESTful API as required by the front-end services.

Technical details
-----------------

All the code for these processes is written in Typescript, compiled to Javascript and is currently executed via pm2 on the servers managing each service (relaunching in case of crashes etc).

To facilitate multithreaded and resilient processing the API is separated into multiple process components.

These include:

*   **Mongo DB** - for persistent storage of processed actions
*   **RabbitMQ -** facilities asynchronous processing of data between the four processes to reduce processing bottlenecks.
*   **Filler** - process to read raw action data from blockchain nodes and enqueue into RabbitMQ
*   **Processor -** to asynchronously process raw data captured by the Filler process from RabbitMQ and insert the data into MongoDB
*   **BlockRangeFiller -** coordinates parallel instances of the Filler to be able quickly catch up filling blocks into MongoDB which otherwise only be performed serially. The BlockRange is generally used as a one-off event when an API instance is started and is sufficiently behind the blockchain head that parallel filling would be beneficial.

//TODO: Add a diagram

  

The most accurate data available to the front-end would be to read directly from blockchain smart contract tables. Examples of such data include token balances and NFTs held by a specific account. Data that is transient within the blockchain smart contract logic, expensive to store in smart contract RAM or data that may only be useful to the user (or other off-chain processes) historically make sense to captured and processed by an off-chain API like this. A primary example of such data is player mining actions. There are huge numbers of these events every hour that are collected and aggregated for purposes off-chain such as NFT drops from rewarded based on aggregated actions over time windows of a day or longer. Attempting to store all these records in tables on chain would quickly cause problems to the wider shared network and can be just as effectively processed off-chain in a service like this one.

  

Highest priority tasks
----------------------

Because this repo consists of multiple services it is difficult to replicate and run locally for development. Therefore the following work is needed:

1.  Refactor code to have stricter typing and very minimal use of `any` types.
2.  Dockerise so an instance can be easily launched on other hardware or in the cloud.
3.  Configs should all be abstracted into ENV vars to make it easy to launch and configure without source code changes
4.  Functionality needs to be wrapped in automated tests (This will involve some careful refactoring)
5.  Refactor NFT attributes reading to reduce any need on AtomicAssetsAPI

  

Technical roadmap
-----------------

1.  Refactor to enable more generic consumption of the API (Possibly GraphQL rather than REST)
2.  Consider how the API could work together with other API's, eg. Missions API ([https://share-docs.clickup.com/d/h/hfd6b-9788/49593a316fe4392/hfd6b-3768](https://share-docs.clickup.com/d/h/hfd6b-9788/49593a316fe4392/hfd6b-3768)), to work with GraphQL Federation to minimise client-side data joins.
3.  Build CI/CD pipeline into the Github repo to facilitate safe deployable changes

New Relic monitoring
--------------------
[https://onenr.io/0z7wkGgLlwL](https://onenr.io/0z7wkGgLlwL)


Git repo(s)
-----------

[https://github.com/Alien-Worlds/alienworlds-api](https://github.com/Alien-Worlds/alienworlds-api)
