---
tags: 
  - DAO
  - voting
  - smart-contracts
  - DAC
  - Governance
  - Stake Weighted Voting
# slug:
---
# Stake Weighted Voting

import BlockExplorerLinks from '@site/src/components/BlockExplorerLinks';

## stkvt.worlds <BlockExplorerLinks contract="stkvt.worlds"/>

This contract acts as an intermediary between the DAO token contract and the Custodian voting contract to enable custom manipulation of the staked tokens data to suit a specific DAO. The code logic in this contract converts the tokens staked with the time they are staked to provide a vote weight which is then used in the custodian voting contract to determine the vote weight as applied to the voting.

The current formula works as follows:

`Vote_Power = staked_tokens * (1.0 + unstake_delay * time_multiplier / max_stake_time)`

## Actions:
---

## Update the config - `updateconfig`
The configuration for this contract can be updated can be updated via this action with the only parameter that can be updated being the `time_multiplier` as referred in the forumla above. Each DAO can customise this setting to suit each DAO.