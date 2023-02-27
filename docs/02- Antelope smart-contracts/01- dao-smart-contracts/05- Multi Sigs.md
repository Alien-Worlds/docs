
# Multi Signature Transactions 

import BlockExplorerLinks from '@site/src/components/BlockExplorerLinks';

## msig.worlds <BlockExplorerLinks contract="msig.worlds"/>

This smart contract manages and executes multisig transactions on behalf of the DAOs. It functions very similar to the native `eosio.msig` smart contract with the main exception that it allows Wax Cloud Wallet accounts to call the actions on this contract which are blocked on `eosio.msig`. 
For our own needs with the DAOs we have added some additional functionality including:
* Blocking specific actions that the planet DAOs should not be permitted to execute
* Retaining proposals after they have been executed or cancelled so they be seen for historical purposes. `eosio.msig` automatically removes all proposals once they have been completed for any purpose.
* Proposals are grouped by the `dac_id` for the DAO rather than the creator.

## Actions:
---
### Propose a transaction - `propose`

A proposal can only be proposed a current custodian for a DAO to avoid spam proposals. 
The proposal must include:
* account name of the proposer - a current custodian
* a name for the proposal - must be a `name` type
* The requested permissions required to approve the transaction
* dac_id for the DAO associated with the proposal - this helps with sorting in the tables
* metadata - free form key/value storage that can be associated with the proposal
* The transaction to be executed upon approval. This must be satisfiable by the requested permissions and should be encoded into a hex format in the same way as is required for `eosio.msig` proposals.

### Approve a proposal - `approve`
Each proposal must be approved with a sufficient threshold before being executed. The allowed approvers are only the current custodians for the DAO related to the proposal. They must specify the `proposal_ name`, the permission `level` being used to approve the proposal and the `dac_id` to disambiguate the same `proposal_name` from proposals with the same name on other DAOs.

### Unapprove a proposal - `unapprove`
If a proposal has previously been approved by one of the custodians but now they have changed their mind. They may unapprove to remove their approval as long as they do that before the proposal has been executed. If the proposal has since expired, then the proposal will not be able to be executed anyway.

### Cancel a propsal - `cancel`
If a proposal has been created in error it can be cancelled before the transaction expiry by the creator of the proposal with this action. No one else will be permitted to cancel the proposal.

### Execute the proposal transaction - `exec`

Once there has been sufficient approval granted to the proposal it can be executed. This will perform all the actions listed in the encoded transaction. If there is any logic causing an assertion in the execution eg. insufficient funds for a transfer, the transaction will remain in a  pending state until it can be executed or it expires.

### Block specific actions - `blockaction`
The block action feature allows for specific actions from specific contracts to be blocked from being able to be executed for specified DAO. This is reserved for admin use and can help prevent the the DAOs performing dangerous actions.