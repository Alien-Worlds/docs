# Spaceship missions Utility

Overview
--------
The Spaceship mission utility service is a wrapper around truffle that deploys missions to the spaceship missions smart contract on BSC blockchain. Each month there is an approximate budget of 4 million TLM that can be deployed via the missions smart contract to mission explorers. This process controls the deployment of each mission according to a pre-calculated schedule. Each mission has a set of parameters which explorers can strategise with to determine where and when they would like to deploy (stake) their TLM tokens. Once a user joins a mission by staking an amount of their TLM those tokens will be locked up for the duration of the mission. As a reward the user will get a share of the reward associated with that mission and an NFT dropped to them at the end of the mission. Longer missions with higher TLM joining requirements have greater TLM rewards to be shared and reward more scarce NFTs.

Technical details
-----------------

All the code in the Spaceship Missions Utility is written in Javascript/Typescript. Multiple mission types are created with the intention that they are deployed periodically across the month in a repeating time delayed pattern. Eg. Mission type 1 with a set of parameters should deploy every 10 hours while Mission type 2 with a different set of parameters should deploy every 18 hours.

Due to reliability and stability issues on BSC the process should handle errors and keep trying to deploy after an error and then schedule the next mission to deploy x hours later according to the schedule to minimise many missions deploying simultaneously after an outage.

The parameters to configure each each mission schedule include:

*   Mission Name
*   Mission Description
*   Mission Type (Courier, Supply, Scouting, Recovery, Battle, Explore, Artifact or Liberation)
*   NFT rarity (Common, Rare, Epic or Legendary)
*   Reward pot (amount to shared between all mission participants)
*   Spaceship costs (determines the multiple of amounts that users can stake)
*   Boarding time (Time window that users have to join a mission)
*   Interval (how often this schedule should re-deploy)
*   offset from genesis (time difference from the first deployment of each mission so they don't all start together)
*   NFT JSON hash (IPFS address to get the JSON metadata for the NFT)
*   NFT Image Hash (IPFS address to get the NFT image)

Initially all these parameters were manually coded into a JSON configuration file to feed the script process. But that is now being refactored to ingest the data from a CSV file since the data is configured in Google sheets. Further more there is extra error handling and parsing being added to the ingestion from CSV since the Google sheet is human created and maintained.

To track the progress and to be able to recover from an error. The state and activity logs are written to files inside the project folder structure. This was chosen as a temporary measure until it was more understood where and how much data needed storing and if it justified the extra overhead of a dedicated database system.

Highest priority tasks
----------------------

1.  Convert from javascript with Truffle to Typescript with Hardhat
2.  Parse data in from CSV rather than manual JSON creation
3.  Unit tests

Technical roadmap
-----------------
1.  Dockerise everything
2.  Ensure all keys can be safely injected as ENV variables to minimise security risks of leaked keys
3.  Build CI/CD pipeline into the Github repo to facilitate safe deployable changes
4.  switch the file-based database to use Mongo to simplify management of configs and data.
5.  Build a simple React UI which admins can use to create and schedule new mission types without google sheets or CSV (human error pools)

Git repo(s)
-----------

[https://github.com/Alien-Worlds/spaceship-mission-utility](https://github.com/Alien-Worlds/spaceship-mission-utility)

Context of relevant accounts/keys/permissions
---------------------------------------------

*   Sends actions to the BSC blockchain via Truffle/HardHat through a chosen BSC node:
    *   [https://bsc-dataseed.nariox.org/](https://bsc-dataseed.nariox.org/)
*   Requires a private key for the mission deployer account that has TLM balance an has been authorised to create missions on the mission contract.
    *   This is kept as a secret
*   Requires the contract address of the missions contract on BSC
    *   [0xBea8302e8b0F8d4ee45f7CA9161C4A2e4f255123](https://bscscan.com/address/0xbea8302e8b0f8d4ee45f7ca9161c4a2e4f255123)
*   Requires the contract address for the TLM ERC-20 contract of BSC
    *   [https://bscscan.com/address/0x2222227E22102Fe3322098e4CBfE18cFebD57c95](https://bscscan.com/address/0x2222227E22102Fe3322098e4CBfE18cFebD57c95)
*   Requires the contract address for the NFT contract on BSC ERC-721
    *   [https://bscscan.com/address/0xF3857306a37264f15a19ad37DA8A9485e5f7CfB3](https://bscscan.com/address/0xF3857306a37264f15a19ad37DA8A9485e5f7CfB3)

Test instances
--------------
There is a test instance on the Binance server that is pushing events to the BSC test net. It is managed by pm2 to keep the service alive but the scheduling between missions is managed in precess using sleep time in a loop and reading the next scheduled time from the config files.

It should be run in a similar way to the production instance but has test configs rather the production configs active.

Metadata related to service
---------------------------

The mission configurations and schedules are derived from this google sheet. In future this should be consolidated into a mission creator UI as mentioned above.

That sheet is internal and is not linked here.

Running instances
-----------------

The process is currently running on the Binance server adjacent to the test instance. It is also managed with pm2 to keep the service running and alive after any crashes or problems.

New Relic monitoring
--------------------

Monitored in New Relic. The dashboard link is internal and is not published here.
