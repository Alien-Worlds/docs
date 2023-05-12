
# Multi Signature Transactions 

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="msig.worlds"/>

This smart contract manages and executes multisig transactions on behalf of the DAOs. It functions very similar to the native `eosio.msig` smart contract with the main exception that it allows Wax Cloud Wallet accounts to call the actions on this contract which are blocked on `eosio.msig`. 
For our own needs with the DAOs, we have added some additional functionality including:
* Blocking specific actions that the planet DAOs should not be permitted to execute
* Retaining proposals after they have been executed or cancelled so they be seen for historical purposes  (`eosio.msig` automatically removes all proposals once they have been completed for any purpose).
* Proposals are grouped by the `dac_id` for the DAO rather than the creator.

## Actions:
---
### Propose a transaction <BlockExplorerActionLinks contract="msig.worlds" action="propose"/>

A proposal can only be proposed a current custodian for a DAO to avoid spam proposals. 
The proposal must include:
* Account name of the proposer - a current custodian
* A name for the proposal - must be a `name` type
* The requested permissions required to approve the transaction
* dac_id for the DAO associated with the proposal - this helps with sorting in the tables
* Metadata - free form key/value storage that can be associated with the proposal
* The transaction to be executed upon approval. This must be satisfiable by the requested permissions and should be encoded into a hex format in the same way as is required for `eosio.msig` proposals.

### Approve a proposal <BlockExplorerActionLinks contract="msig.worlds" action="approve"/>
Each proposal must be approved with a sufficient threshold before being executed. The allowed approvers are only the current custodians for the DAO related to the proposal. They must specify the `proposal_ name`, the permission `level` being used to approve the proposal and the `dac_id` to disambiguate the same `proposal_name` from proposals with the same name on other DAOs.

### Unapprove a proposal <BlockExplorerActionLinks contract="msig.worlds" action="unapprove"/>
If a proposal has previously been approved by one of the custodians but now they have changed their mind. They may unapprove to remove their approval as long as they do so before the proposal has been executed. If the proposal has since expired, the proposal will not be able to be executed.

### Cancel a propsal <BlockExplorerActionLinks contract="msig.worlds" action="cancel"/>
If a proposal has been created in error it can be cancelled before the transaction expiry by the creator of the proposal with this action. No one else will be permitted to cancel the proposal.

### Execute the proposal transaction <BlockExplorerActionLinks contract="msig.worlds" action="exec"/>

Once there has been sufficient approval granted to the proposal, it can be executed. This will perform all the actions listed in the encoded transaction. If there is any logic causing an assertion in the execution (eg. insufficient funds for a transfer), the transaction will remain in a  pending state until it can be executed or it expires.

### Block specific actions <BlockExplorerActionLinks contract="msig.worlds" action="blockaction"/>
The block action feature allows for specific actions from specific contracts to be blocked from being able to be executed for specified DAO. This is reserved for admin use and can help prevent the DAOs from performing dangerous actions.

## Tables
---
### Proposals <BlockExplorerTableLinks contract="msig.worlds" table="proposals"/>
This table holds all the core data for a proposal. This follows closely the format of the system MSIG contract at <BlockExplorerTableLinks contract="eosio.msig" table="proposal"/> but adds some fields suit the needs of the DAOs. 

The fields included are:
* id (uint64) - unique identifier for the proposal
* proposal_name (name) - potentially human readable name for a proposal
* proposer (name) - the account of the account who has created this proposal
* packed_transaction (bytes) - the packed transaction data that would be executed upon approval of the MSIG transaction
* earliest_exec_time (optional<time_point>) - This is the earliest the transaction could be executed derived from the `wait` permissions on the packed transaction.
* modified_date (time_point_sec) - Tracks when the proposal has had an update such as a vote to approve.
* state (uint8) - The state of the proposal - PENDING = 0, EXECUTED = 1, CANCELLED = 2
* metadata (array of string-string pairs) - open key/value storage that could be added to the MSIG proposal.

### Approvals <BlockExplorerTableLinks contract="msig.worlds" table="approvals"/>
This table holds all the requested and granted approvals for a proposal. This follows closely the format of the system MSIG contract at <BlockExplorerTableLinks contract="eosio.msig" table="approvals"/> but with a small but important difference - the requested approval on this contract can be the permission that needs to be satisfied rather than the explicit permissions that must sign. This enables the DAOs to create a proposal and then change the signers before the proposal is approved. This is not possible on the `eosio.msig` contract.

The fields included are:
* proposal_name (name) - unique for a proposal
* requested_approvals (array of permissions) - The permissions that must be satisfied on the proposal for it to be executable.
* provided_approvals (array of permissions) - The permissions that have approved this transaction proposal.

### Blocked Actions <BlockExplorerTableLinks contract="msig.worlds" table="blockedactns"/>
This table holds the details of actions that should not be allowed to be executed by the DAO scoped to the `dac_id` of the DAO. This is a ways to prevent some damaging actions from being executed by the DAO custodians.

The fields included are:
* id (uint64) - unique identifier for the blocking rule
* account (name) - The permissions that must be satisfied on the proposal for it to be executable.
* action (name) - The name of the action from the contract account that should be blocked.
