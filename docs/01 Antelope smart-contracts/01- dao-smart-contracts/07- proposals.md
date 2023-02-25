# Proposals

import BlockExplorerLinks from '@site/src/components/BlockExplorerLinks';

## prop.worlds <BlockExplorerLinks contract="prop.worlds"/>

This contract is responsible for managing the project proposals related to the DAO. It is once again built for configurability rather than just to suit our immediate needs in EosDAC.

The general idea is that potential worker will have a piece of work they would like to propose to add value to the DAO in exchange for being paid in an amount of EOS based tokens. The proposal would be voted for approval for commencement and then completion by the current custodians and these actions would trigger payments to the proposer.

## Actions:
---
### Create proposal - `createprop`

A proposing worker would create a proposal and submit it to the blockchain for the review and voting by the current DAO custodians. To proposal would need to include the following:

* `title` (String): to identify the proposal
* `summary` (String): a brief summary of the purpose of the worker proposal
* `arbitrator` (EOS Account name): the account name of an independent arbitrator who may be called upon to satisfy disputes in the completion of a worker proposal.
* `pay_amount` (EOSAsset): an amount of EOS based tokens requested as the pay amount for the worker proposal.
* `content_hash` (ChecksumHash): a content hash to ensure details of a proposal stored off-chain are not modified after a proposal has been agreed to. This allows for much more extensive detail that would not be stored on-chain while still maintaining data integrity.

For each proposal, minimal content data is required to be stored in the contract state and is instead only passed through for data integrity via transaction logs. Only the account and payment data is stored for utilisation in later actions within this contract.

### Voting for a proposal - `voteprop`

Once a proposal has been created it would be in a state waiting for the current custodians to vote either ‘proposal\_approve’ or ‘proposal\_deny’ for a proposal with the required number of votes and number of ‘yes’ votes to be configurable in the contract. At this time there may be refinements to the proposal with cancelling `cancel` of existing proposals and resubmitting changes based on feedback from the custodians until the proposals get to the ready and positively-voted-for position.

### Start work on an accepted proposal - `startwork`

It there have been sufficient positive votes for a proposal the proposer will be able to call this action to confirm that they will agree to work on the agreed proposal with the agreed terms, payment etc. At this point, the agreed payment amount is transferred into an escrow account to ensure the funds can and will be paid to the proposer when the work is complete as approved by the custodians or the agreed arbitrator for the proposal.

The locking of funds in an escrow account is a crucial step to protect the worker from potentially malicious custodians who could reverse an earlier proposal acceptance because they have a trusted arbitrator on the proposal to also be able to release the funds.

### Signal completion of work - `completework`

After a worker has completed their work they would signal to the custodians that work is believed to be complete and the custodians would need to assess the work before approving via another vote using `voteprop` but this time with a different choice of vote values to indicate `claim_approve` or `claim_deny`.

### Claim payment for completed work - `claim`

If there have been sufficient positive votes for the completed work from the custodians based on the current configurations then the proposer can call the action which will trigger the transfer of token payments to the worker. In practice for EosDAC, the funds are sent to a service company account but effectively they are paid directly to the worker for their services.

### Contract configuration - `updateconfig`

Various options are configurable for this contract including:

* `service_account` (Eos account name)
* `proposal_threshold` number of required votes to participate in voting for a proposal.
* `proposal_approval_threshold_percent` required percentage of positive votes to approve a proposal
* `claim_threshold` number of required votes to participate in voting for completing a proposal.
* `claim_approval_threshold_percent` required percentage of positive votes to approve a proposal claim.
* `escrow_expiry` the expiry time set on the created escrow transaction (number of seconds). This has a default value of 30 days.

## Tables:
---
### proposals