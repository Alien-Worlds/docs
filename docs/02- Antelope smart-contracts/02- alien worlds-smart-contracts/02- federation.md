# Federation

Central administrator of common management behaviour across all planets and NFTs

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

import PlayersFields from '@site/docs/_abi/federation/players.mdx';
import UsertermsFields from '@site/docs/_abi/federation/userterms.mdx';
import FedPlanetsFields from '@site/docs/_abi/federation/planets.mdx';
import StateFields from '@site/docs/_abi/inflt.worlds/state.mdx';
import MapsFields from '@site/docs/_abi/plnts.worlds/maps.mdx';
import LandregsFields from '@site/docs/_abi/awlndratings/landregs.mdx';
import DepositsFields from '@site/docs/_abi/stake.worlds/deposits.mdx';

## <BlockExplorerContractLinks contract="federation"/>

Each of the planets in the Alien Worlds federation contributes and competes in a wider ecosystem where each planet and member involved in each planet can win or earn Trilium tokens or NFTs as well as performing various exchange interactions with their planet specific token. In order to govern the rules and common behaviour between all the planets the Federation performs some key roles to hold everything together, including:

* Managing the creation and updating of planets in the game.
* Managing the admission of users into the ecosystem and associating them with a planet.
* Managing the creation and distribution of Trilium tokens to planets through mining rewards and inflation
* Managing land ownership on planets and the associated profit share from mining on that land.
* Managing the staking of Trilium tokens for staking rewards.

## How this functionality is split across contracts

The Federation began as a single contract holding most cross-planet administration. Much of that
surface has since been split out into dedicated contracts, and **the `federation` account itself
now exposes only four actions**. The sections below are grouped by the contract that actually owns
each action today, so the explorer links point at the right place.

| Concern | Contract |
| --- | --- |
| Users, avatars, terms | `federation` |
| Planet records and map | `plnts.worlds` |
| TLM staking to planets | `stake.worlds` |
| Daily inflation claims | `inflt.worlds` |
| Land ownership and profit share | `awlndratings` |

## Actions

### Users and terms

These remain on the Federation contract itself.

#### <BlockExplorerActionLinks contract="federation" action="setavatar"/>
Set an avatar NFT for a user (either using a provided one or create a default one if the user is new)

#### <BlockExplorerActionLinks contract="federation" action="settag"/>
Set a tag (string less than 19 characters long) for a user.

#### <BlockExplorerActionLinks contract="federation" action="agreeterms"/>
Capture agreement from users to terms

#### <BlockExplorerActionLinks contract="federation" action="maintenance"/>
Administrative maintenance action, callable only by the contract itself.

---

### Managing planets

Planet records moved to the planets contract.

#### <BlockExplorerActionLinks contract="plnts.worlds" action="addplanet"/>
Create a new planet in the Alien Worlds federation.

#### <BlockExplorerActionLinks contract="plnts.worlds" action="updateplanet"/>
Updates metadata or active for a planet.

#### <BlockExplorerActionLinks contract="plnts.worlds" action="removeplanet"/>
Removes a planet from the federation

#### <BlockExplorerActionLinks contract="plnts.worlds" action="setmap"/>
Set a map point for the planet

---

### Staking TLM to a planet

Staking moved to the staking contract. Once TLM is staked, planet DAC tokens are issued in exchange.

#### <BlockExplorerActionLinks contract="stake.worlds" action="stake"/>
Stake to a particular planet, `account` should have also transferred the required amount of Trilium to this account before this action is called. Mints planet related tokens in exchange for the staking at the planet DAC token exchange rate. The transfer and staking could be called together in one EOSIO transaction to allow complete transaction rollback on any failure in either action.

#### <BlockExplorerActionLinks contract="stake.worlds" action="withdraw"/>
Withdraws any deposited tokens that have not yet been exchanged for planet DAC tokens for the given account.

---

### Daily planet claims

Inflation and the daily planet claim moved to the inflation contract. Claims are weighted by
staking and by the number of NFTs held by the planet and in total.

#### <BlockExplorerActionLinks contract="inflt.worlds" action="claim"/>
Used by planets to claim their rewards based on staked Trilium and NFTs held with the planet. Also ensure enough is held aside for a daily claim amount for Binance separately from all other planets.

#### <BlockExplorerActionLinks contract="inflt.worlds" action="logclaim"/>
Logs the claim action as an inline action for logging off-chain.

#### <BlockExplorerActionLinks contract="inflt.worlds" action="inflate"/>
Mints new Trilium according to the inflation schedule.

---

### Land ownership and profit share

Land moved to the land ratings contract.

#### <BlockExplorerActionLinks contract="awlndratings" action="setprofitshr"/>
Set profit share on land NFT as set by the owner of the land NFT only.

#### <BlockExplorerActionLinks contract="awlndratings" action="setlandnick"/>
Set Nickname on land NFT

---

### Removed actions

These were documented on the Federation contract but are **not present in any deployed contract**,
so they have no explorer links. They are listed because readers coming from older material or from
historical transactions will still encounter them.

- `miningstart` — started mining from the Mining contract and minted a standard shovel for a new user.
- `miningnft` — updated an NFT time-weighted multiplier used in the mining calculation.
- `awardnft` — awarded NFTs based on game results.
- `logtransfer` — kept a registry of land owners based on NFT minting and transfers.
- `filllandpot` — distributed daily TLM to the land owners pot. Was never more than work in progress.
- `refund` — refunded unstaked tokens to the player. The staking contract now uses `deldeposit`.

## Tables

The Federation contract itself stores users, the terms they have agreed to, and per-planet
aggregates. Tables that moved out with their actions are listed under their current contract.

### Players <BlockExplorerTableLinks contract="federation" table="players"/>
stores common details about all players.

<PlayersFields />

### User terms <BlockExplorerTableLinks contract="federation" table="userterms"/>
stores which versions of the terms and conditions each user has agreed to.

<UsertermsFields />

### Planets <BlockExplorerTableLinks contract="federation" table="planets"/>
stores planet specific global values used for various actions involving specific planets.

<FedPlanetsFields />

### State singleton <BlockExplorerTableLinks contract="inflt.worlds" table="state"/>
stores some global values that are needed by various contract actions. Moved to the inflation
contract along with the claim actions.

<StateFields />

### Map <BlockExplorerTableLinks contract="plnts.worlds" table="maps"/>
stores details of NFTs as linked to map coordinates.

<MapsFields />

### Land registry <BlockExplorerTableLinks contract="awlndratings" table="landregs"/>
stores the ownership of different land parcels used for mining profit shares.

<LandregsFields />

### Deposits <BlockExplorerTableLinks contract="stake.worlds" table="deposits"/>
Temporary store of deposits during the staking process.

<DepositsFields />

### `refunds` (removed)
Held refunds during the unstaking process. Not present in any deployed contract, so there is no
explorer link.
