# Federation

Central administrator of common management behaviour across all planets and NFTs

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

import PlayersFields from '@site/docs/_abi/federation/players.mdx';

## <BlockExplorerContractLinks contract="federation"/>

Each of the planets in the Alien Worlds federation contributes and competes in a wider ecosystem where each planet and member involved in each planet can win or earn Trilium tokens or NFTs as well as performing various exchange interactions with their planet specific token. In order to govern the rules and common behaviour between all the planets the Federation performs some key roles to hold everything together, including:

* Managing the creation and updating of planets in the game.
* Managing the admission of users into the ecosystem and associating them with a planet.
* Managing the creation and distribution of Trilium tokens to planets through mining rewards and inflation
* Managing land ownership on planets and the associated profit share from mining on that land.
* Managing the staking of Trilium tokens for staking rewards.

## Actions

This smart contract is responsible for many of the admin features relevant to all of the planets and will not be called by the end users directly:

---
### Managing Planets

### <BlockExplorerActionLinks contract="federation" action="addplanet"/>
Create a new planet in the Alien Worlds federation.

### <BlockExplorerActionLinks contract="federation" action="updateplanet"/>
Updates metadata or active for a planet.

### <BlockExplorerActionLinks contract="federation" action="removeplanet"/>
Removes a planet from the federation

### <BlockExplorerActionLinks contract="federation" action="setmap"/>
Set a map point for the planet

### <BlockExplorerActionLinks contract="federation" action="setavatar"/>
Set an avatar NFT for a user (either using a provided one or create a default one if the user is new)

### <BlockExplorerActionLinks contract="federation" action="settag"/>
Set a tag (string less than 19 characters long) for a user.

### <BlockExplorerActionLinks contract="federation" action="miningstart"/>
Start mining from the Mining contract. mint a standard shovel for a new user(receiver) to the game.

### <BlockExplorerActionLinks contract="federation" action="setprofitshr"/>
Set profit share on land NFT as set by the owner of the land NFT only.

### <BlockExplorerActionLinks contract="federation" action="setlandnick"/>
Set Nickname on land NFT

---
### Manage staking of TLM 
Once TLM is staked to the Fed contract planet DAC tokens are issued and given in exchange

### <BlockExplorerActionLinks contract="federation" action="stake"/>
Stake to a particular planet, `account` should have also transferred the required amount of Trilium to this account before this action is called. Mints planet related tokens in exchange for the staking at the planet DAC token exchange rate. The transfer and staking could be called together in one EOSIO transaction to allow complete transaction rollback on any failure in either action.

### <BlockExplorerActionLinks contract="federation" action="withdraw"/>
Withdraws any deposited tokens that have not yet been exchanged for planet DAC tokens for the given account.

### <BlockExplorerActionLinks contract="federation" action="refund"/>
refund unstaked tokens to the player

---
### Handle daily planet claims 
weighted by staking and number of NFTs held by planet and in total

### <BlockExplorerActionLinks contract="federation" action="claim"/>
Used by planets to claim their rewards based on staked Trilium and NFTs held with the planet. Also ensure enough is held aside for a daily claim amount for Binance separately from all other planets.

### <BlockExplorerActionLinks contract="federation" action="filllandpot` "/>
distribute daily Trilium (TLM) tokens to land owners pot. WIP

### <BlockExplorerActionLinks contract="federation" action="logclaim"/>
  log the claim action as an inline action for logging off-chain.

---
### General utlity actions

### <BlockExplorerActionLinks contract="federation" action="logtransfer"/>
to keep a registry of all land owners based on NFT minting and transfers

### <BlockExplorerActionLinks contract="federation" action="miningnft"/>
Update a NFT related time-weighted multiplier for the related planet which is then used as part of the mining calculation.

### <BlockExplorerActionLinks contract="federation" action="awardnft"/>
award NFTs based on game results.

### <BlockExplorerActionLinks contract="federation" action="agreeterms"/>
Capture agreement from users to terms

## Tables

This contract stores the state relevent to all the planets, Land ownership, users and token staking related to the game.

### State Singleton <BlockExplorerTableLinks contract ="federation" table="state"/> 
stores some global values that are needed by various contract actions.
  * int64: total stake
  * uint32: nft genesis
  * uint64: nft total
  * timepointsec: last land fill
  * uint64: land rating total
### User terms <BlockExplorerTableLinks contract ="federation" table="userterms"/> 
stores which versions of the terms and conditions each user has agreed to.
  * name: account
  * int16: terms id
  * checksum256: terms hash
  * 
### Planet table  <BlockExplorerTableLinks contract ="federation" table="planets"/> 
stores planet specific global values used for various actions involving specif planets.
  * name: planet name
  * string: title
  * string: metadata
  * symbol: dac\_symbol
  * bool: active
  * int64: total stake
  * int64: nft multiplier
  * time point sec: last claim

### Land registry  <BlockExplorerTableLinks contract ="federation" table="landregs"/> 
stores the ownership of different land parcels used for mining profit shares.
  * uint64: id;
  * name: owner


### Map <BlockExplorerTableLinks contract ="federation" table="maps"/> 
 stores details of NFTs as linked to map coordinates.
  * uint16: x
  * uint16: y
  * uint64: asset\_id

### Deposits <BlockExplorerTableLinks contract ="federation" table="deposits"/> 
Temporary store of deposits during staking process.
  * name: account
  * asset: quantity

### Refunds <BlockExplorerTableLinks contract ="federation" table="refunds"/> 
Holds refunds during the unstaking process
  * uint64: id;
  * name: account;
  * asset: quantity;
  * time point sec: refund time;
  * name: planet name

### Players <BlockExplorerTableLinks contract ="federation" table="players"/> 
stores common details about all players.

<PlayersFields />
