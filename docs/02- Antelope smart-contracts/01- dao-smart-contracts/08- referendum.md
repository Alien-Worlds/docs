# Referendum

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="ref.worlds"/>

This smart contract provides the ability for DAOs to run referendums for all token holders in the DAO. This provides an alternative voting protocol for specific key decisions that can be justified to run as a referendum. It's expected these will be for big decisions that would be more for conscientious voting rather than pragmatic business-as-usual voting.

Referendums have 3 types which determine the effectiveness of referendum outcome:
* **Non-binding** - This simply captures the group opinion of the DAO. It doesn't lead to the execution of any logic.
* **Binding** - This requires an associated transaction that will get executed if the referendum reaches a positive consensus through voting. It will have no intervention by the custodians or provide any mechanism for the custodians to intervene if they disagree with the outcome.
* **Semi-binding** - Similar to the binding referendum, this requires a transaction that *could* be executed if the referendum reaches a positive consensus but rather than being executed it will be referred to the custodians as a proposal to make the final decision via voting before executing. Given it would have passed the consensus of the DAO community to get to this point it would be likely that the DAO would approve but may have a valid reason not to. This would open opportunity for interesting DAO politics to play out.

There are 2 types of counting methods
* **Token** The staked token balance will be used
* **Account** There will be 1 vote per account.
:::note
  Please note that `Account` counting method can be subjected to Sybil attack.
:::

## Permissions

When executing actions directly, the referendum contract must satisfy those permissions by itself.
When submitting a multisig for approval to the custodians, the contract will use the permission `[authority]@admin`. This is a permission that must be added under `@one` and be linked to `[msig.worlds]::propose`.

## Fees

A fee is configurable for each type of referendum, this must be sent to the referendum contract before proposing the referendum. The fee can be in any currency, but the contract can only hold a single deposit currency at a time while waiting for the proposal. In most cases the payment and the proposal will be sent together so this will not matter.

## Actions
---
### Configuration <BlockExplorerActionLinks contract="ref.worlds" action="updateconfig"/>

The contract takes a number of configuration variables, most are sent as maps with the key being the type of referendum, this means we can have different fees and thresholds for different types of referendum.

- **fee** The amount to charge for submitting a proposal, must be an extended asset and can be 0.
- **pass** The pass percentage as an integer with 2 decimal places. eg. 1000 = 10%
- **quorum_token** The quorum of token votes which must be met if the count type is token
- **quorum_account** The quorum of account votes which must be met if the count type is account
- **allow_per_account_voting** Set to 1 to allow account-based counting for each referendum type

### Propose <BlockExplorerActionLinks contract="ref.worlds" action="propose"/>
This action is used to create a new referendum for as DAO to consider. It must include some details about the referendum to configure it for the display in the UI for users to see and vote on and configuratons about how the logic of the referendum should play out. Details include the type of the referendum ()`binding`, `semibinding` or `opinion`) the vote counting type (account or token) and the content related to the referendum. If it's a binding or semi-binding referendum then an array of actions also need to be included so they can be executed in the even of a positive outcome. Some other checks are performed to ensure the referendum propsoal is valid according to the DAO settings and that the proposer has made a sufficent deposit to this account to cover the configured fee for the DAO treasury to receive.

### Voting <BlockExplorerActionLinks contract="ref.worlds" action="vote"/>
Once a referendum has been proposed it will be open for anyone in the DAO to start voting on. Members of the DAO will be able to vote with a permitted vote type for each referendum. A voter can vote on a maximum for 20 referendums at the same time per dao. Each DAO will have it's own token so the same user could be voting within multiple DAOs and multiple referendums. The reason for the limitation for the number of simultaneous referendums is that all the votes for a user's voted referendums get updated when stakes are updated for each token type. To be able to safely update all the referendums without timing out in the transaction a safe limit of 20 per DAO has been chosen.
Voting for each proposal can be either `yes`, `no` or `abstain`. Members will also be allowed to remove a vote entirely.
All votes count towards the quorum, if this is met then the percentage of `yes` votes is calculated and compared to the required limit.
Once the proposal has met the pass threshold the status will be changed and the proposal can be executed by anyone.
If a quorum is reached, but not the pass threshold then the status will be set to alert the custodians to it.

### Cancel <BlockExplorerActionLinks contract="ref.worlds" action="cancel"/>
A referendum may only be cancelled by the creator at anytime. This will remove the referendum but will leave the votes in place for the voter to clean up in their own time.

### Execute <BlockExplorerActionLinks contract="ref.worlds" action="exec"/>
This action would be run at the completion of voting for a referendum. For a `binding` referendum type this will execute the actions defined in the referendum eg. transfer tokens. If it's a `semi-binding` referendum type this will propose an MSIG proposal for the custodians to approve with the enclosed referendum actions. The current custodians can then make the final judgement if they would like to execute the actions. For an `opinion` type there are no actions to execute. For all types this action will do a final update of the status and then call an inline action with the final results of the referendum to `publresult`. This action has no other logic other than to log the full results through an onchain action that canbe read by off-chain history tools. Finally the referendum will be erased from the contract RAM state to free up the RAM.

### Clean votes <BlockExplorerActionLinks contract="ref.worlds" action="clean"/>
Once a referendum has been completed or cancelled the votes will still be present for the voter for each of the referenda they have voted on. This could mean they are unable to vote on a new referendum without first running this action. Therefore this should be run often and could possibly be run before each `vote` action.

