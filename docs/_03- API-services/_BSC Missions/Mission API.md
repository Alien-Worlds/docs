# Missions API

Overview
--------

The Missions API consists of two processes that work together to track actions executed on the BSC blockchain that are required in some form to be presented through the Missions UI. Since BSC runs smart contracts that are Solidity-based it does not have the same storage mechanisms as available on Wax blockchain smart contracts. Therefore in order to be able to display missions or actions related to missions this API tracks the actions to derive a UI representable state that is then stored in a Postgress DB. The actions of interest to the API include mission creation, mission joining, and mission reward claiming. The raw action data are processed to be inserted into a local database in a form that can be exposed in a RESTful API as required by the front-end services.

Technical details
-----------------

All the code in the Missions API is written in GoLang. One process (blockchain checker) reads the stream of blocks from the BSC blockchain and injects the processed data into ProstgresQL and another process hosts a RESTful API which is consumed by the Missions React UI.

The two processes along with a PostgreSQL DB docker image have been constructed to run together with Docker-compose making it easy to run on a new server or to run locally on a developer machine with docker installed. Initially, the configuration for the processes was managed via a YAML file which made remote configuration of the processes difficult at the docker-compose level. So that has been recently refactored to move settings into ENV vars but this code needs more cleanup since it was a quick change by @Dallas Johnson with zero GoLang experience at the time.

Highest priority tasks
----------------------
It is common for any blockchain reading system to occasionally miss blocks due to network drop-outs etc. Therefore the blockchain checker should be able to be run from any block number to process missed blocks into the database without corrupting the data integrity. At the moment this is not the case with the Missions API. If the same block is read multiple times and that block has mission joined events in it they will be read as multiple mission joins rather than one for each event and that has the impact of displaying more ships joined to a mission that is known by the smart contract. To fix this mission join events need to de-duplicated before being processed and stored in the DB. This will allow the checker process to be run multiple times over missed ranges of blocks with distorting the data in the DB.

Technical roadmap
-----------------

1.  De-duplicate data read and processed into the DB
2.  Wrap functionality in automated tests
3.  Consider how the API could work together with other API's, eg. the Alien Worlds API, to work with GraphQL Federation to minimize client-side data joins.
4.  Build CI/CD pipeline into the Github repo to facilitate safe deployable changes

Git repo(s)
-----------

[https://github.com/Alien-Worlds/missions-api](https://github.com/Alien-Worlds/missions-api)

Context of relevant accounts/keys/permissions
---------------------------------------------

*   Read-only from a blockchain BSC node - no blockchain keys required to run:
    *   [https://bsc-dataseed.nariox.org/](https://bsc-dataseed.nariox.org/)
*   Block number to start reading from:
    *   Missions started on production at block number _12161915_
*   Requires the contract address of the missions contract on BSC
    *   [0xBea8302e8b0F8d4ee45f7CA9161C4A2e4f255123](https://bscscan.com/address/0xbea8302e8b0f8d4ee45f7ca9161c4a2e4f255123)
*   Requires the event hashes of three contract [events](https://bscscan.com/address/0xbea8302e8b0f8d4ee45f7ca9161c4a2e4f255123#events):
    *   MissionCreated - 0x280fd1c13afdf05ef9c7dbd512eed44cfa4545e4c471c2673baf1d275a3d8fd9
    *   MissionJoined - 0xceb49b5adb5e3737df9e0679d210f1006878fb83bf58974f7279b0c79460898b
    *   RewardWithdrawn - 0x3f0d190fee71fcedf315c1a691ca936a8893467ce62d0bb52e5643ded084fe46

Test instances
--------------

There is a test instance on the Binance server that is reading events from the BSC test net.

*   It's accessible via Cloudflare at [https://test-missions-api.alienworlds.io](https://test-missions-api.alienworlds.io)

Metadata related to service
---------------------------

None - all is derived from the blockchain state from the BSC nodes

The mission configurations are handled by another service (Spaceship missions Utility) that does require metadata details

Running instances
-----------------

*   Load balanced through Cloudflare eg. [missions-api.alienworlds.io/missions](http://missions-api.alienworlds.io/missions)
    *   Binance - eg. [missions-api.alienworlds.io/missions](http://missions-api.alienworlds.io/missions)

New Relic monitoring
--------------------

Monitored in New Relic; the dashboard link is internal and is not published here.
