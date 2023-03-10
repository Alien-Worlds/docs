# Mining
Used by all planets for controlling the mining actions and mining rewards so that users are able to earn tokens or NFTs from the land within each planet.

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="m.federation"/>

A key activity within their Alien Worlds universe is mining. Users must perform computational work to guess a large number that solves a mathematical puzzle within a particular number range as determined difficulty factors within this contract. This is similar to the Proof of Work mining algorithm as utilised in Bitcoin.

Miners would run the algorithm on their local machines until they get a result that would satisfy the difficulty set in the contract. Once they have a satisfactory result they would submit it to the contract. Then once it has been checked to be satisfactory in the contract code it would add the rewards as Trilium to the miner and the landowner. 

The amount is calculated based on the rarities of the tools used for mining. Each rarity has a different pool that it will draw from for the mining rewards and the percentage share for each rarity from each planet's mining rewards can be be configured individually.

The miner would also earn Userpoints based on the attributes of the mining tools used to enable them to later claim NFT rewards. The level of difficulty varies based on ease factors with the land, the ease factor of the NFTs. These different factors provide creative avenues for users to form strategies to maximise the chances of winning the most Trilium or NFT User points.

While the most frequently run actions on this contract will be mining there are some other actions to support the mining, such as setting parameters, filling the available Trilium and NFTs that could be mined, processing the random values required for part of the mining algorithm.

## Actions

### <BlockExplorerActionLinks contract="m.federation" action="setparam" />
updating arbitary values in the mining contract for its inner workings.

### <BlockExplorerActionLinks contract="m.federation" action="setbag" />
Set miner's tool bag (with a max of 3 tools)

### <BlockExplorerActionLinks contract="m.federation" action="setland" />
Set the current land to mine on for a given miner (mint a tool if the miner is new)

### Mine action <BlockExplorerActionLinks contract="m.federation" action="mine" />

* miner must have preselected Land to mine on
* the land must have something to mine (ease > 0)
* land commission must be less than 25%
* mining ease (when combined with land.ease and a global multiplier < 80%
* mining delay (when combined with land.delay and a global multiplier) should have elapsed enough time from previous mine. Previous mining time is taken from the most recent of the `miner.prev_mine` time or the `last_time` of each the tools in the mining bag.
* mining difficulty (from land difficulty) < 15
* hash the {account}{time}{nonce} from miner and check the result has leading 0's. (easier if they have a `.wam` account.
* if the miner as > 0 luck then request a random number for them to be able to get an NFT and lock their NFT bag.
* Checks to see if the miner is a bot ( not sure what is happening here)
* fill the mine bucket with TLM based on time since last mine and the fill rate.
* separate the profit share from the mining reward.
* send reward to miner
* if landowner is not one the key alien worlds accounts send commission to the owner.
* log the mining event results.
* Update the mining times for tools in the current bag.

### <BlockExplorerActionLinks contract="m.federation" action="fill" />
Updates the amount of available TLM that can be mined for a planet based on previously deposited TLM amount in the deposits table for this account.

### <BlockExplorerActionLinks contract="m.federation" action="claimcomms" />
Called by the landowner to claim their accumulated land commissions. This can be called as infrequently as the landowner likes to avoid  micro-transations on every mine event. Once claimed the landowner's `landcomms` record will be cleared.

### <BlockExplorerActionLinks contract="m.federation" action="claimmines" />
Called by miners to claim their accumulated mine rewards. This can be called as infrequently as the miner likes to avoid  micro-transations on every mine event. Once claimed the miner's `minerclaim` record will be cleared.

## Tables

### <BlockExplorerTableLinks contract="m.federation" table="miners"/>
stores details about each miner's recent mining activity and current mining location.
  * name: miner
  * checksum256: last mine tx
  * time point sec: last mine
  * uint64: current land
  
### <BlockExplorerTableLinks contract="m.federation" table="bags"/>
stores all the NFTs owned and locked by an account while they are used mining. This relates to te cooldown of mining tools.
  * name: account
  * vector: items
  * bool: locked

### <BlockExplorerTableLinks contract="m.federation" table="deposits"/>
stores temporary transfers as a deposit for filling the mining bucket per planet.
  * name: account
  * asset: quantity

### <BlockExplorerTableLinks contract="m.federation" table="state3"/>
singleton to store planet specific shared values related to mining. scoped by planet name eg. `neri.world`
  * time point: last fill time
  * double: fill rate
  * asset: bucket total
  * asset: mine bucket

### <BlockExplorerTableLinks contract="m.federation" table="claims"/>
stores template ids that have been chosen, they must be claimed and minted in a separate tx so that the user cannot block the minting and get different nfts to game the system. - This is a legacy feature that is no longer active.
  * name: miner
  * vector: template ids

### <BlockExplorerTableLinks contract="m.federation" table="config"/>
stores general purpose configs used within the contract logic. Can hold an array of arbitary key/value pairs.
  * number: key
  * any: value

### <BlockExplorerTableLinks contract="m.federation" table="landcomms"/>
accumulates the Land commisions for each Landholder. This now accumulates here to prevent spamming the chain with tiny transfers after very single mine action.
  * name: landowner
  * asset: comms amount of TLM that can be claimed.
  * timestamp: timestamp to be reserved for future use.

### <BlockExplorerTableLinks contract="m.federation" table="minerclaim"/>
accumulates the mining rewards for each. This now accumulates here to prevent spamming the chain with tiny transfers after very single mine action.
  * name: miner
  * asset: amount of TLM that can be claimed.
  * timestamp: timestamp to be reserved for future use.

### <BlockExplorerTableLinks contract="m.federation" table="pools"/>
accumulates the mining rewards for each. This now accumulates here to prevent spamming the chain with tiny transfers after very single mine action.
  * rates: array of name/value pairs showing the percentage rewards to each pool for each rarity 
  * pool_buckets: amount of TLM that can be claimed.
  * timestamp: timestamp to be reserved for future use.
