# Proposals

import {BlockExplorerContractLinks, BlockExplorerActionLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="prop.worlds"/>

This contract is responsible for managing the project proposals related to a DAO. It is once again built with many configuration options to be customised for each DAO.

The general idea is that potential worker will have a piece of work they would like to propose to add value to the DAO in exchange for being paid in an amount of Antelope based tokens. The proposal would be voted for approval for commencement and then voted again at completion by the current custodians and these actions would trigger payments to the proposer. Between these  voting events, while the worker is doing the work, the agreed tokens for the work will be locked up an escrow contract to prevent future custodians being able to easily withdraw their approval or spend all the token elsewhere. The proposal system also has provision for disagreement through an independent artbitrator who will be agreed upon at the creation of the proposal. In the event of disagreement upon the completion of the work, the pre-agreed arbitrator would be able to step in and would be authorised to release the agreed tokens to the worker or back to the DAO. If either the DAO or the worker disagree with the arbitrator's decisions they should have been more careful about agreeing to the proposal with that arbitrator included initially.
This smart contract also supports the categorisation of proposals to allow delegation of voting between custodians for more domain specific experts. For example, a proposal categorised as a technical project may be something that one non-technical custodian is not comfortable to vote on. Instead they may choose to delegate their vote to a known technical custodian either per proposal or for any proposal that matches that category. Having this built in to the proposal contract logic encourages more on-chain transparency rather than off-chain follow-the-leader dynamics which would likely occur anyway.
Each proposal will have an expiry time that specifies how long proposal has to get approval before it expires. This time is based on a configuration setting for the DAO. Each proposal will also have a job duration which is used to determine how long the escrow should be locked up for before it can automatically be claimed back by the DAO from the escrow account. To allow time for dispute resolution, the escrow lock time is set to double the time of the expected job duration. This protect the worker and still ensure the DAO will get their tokens in a time relative to the duration of proposal they once approved.

## Actions:
---
### Create proposal - `createprop`

A proposing worker would create a proposal and submit it to the blockchain for the review and voting by the current DAO custodians. To create a proposal would need to include the following:

* `title` (String): to identify the proposal
* `summary` (String): a brief summary of the purpose of the worker proposal
* `arbitrator` (EOS Account name): the account name of an independent arbitrator who may be called upon to satisfy disputes in the completion of a worker proposal.
* `proposal_pay` (EOSAsset): an amount of EOSIO based tokens requested as the pay amount for the worker proposal.
* `arbitrator_pay` (EOSAsset): an amount of EOSIO based tokens agreed to pay the nominated arbitrator if the proposal is disuputed and they are required to resolve the case.
* `content_hash` (ChecksumHash/IPFS): a content hash to ensure details of a proposal stored off-chain are not modified after a proposal has been agreed to. This allows for much more extensive detail that would not be stored on-chain while still maintaining data integrity.
* `id` (EOSIO Name) value to use as the unique identifier for the proposal
* `category` (uint16_t) a numeric category to group the proposal to help with delegating of votes
* `dac_id` (EOSIO Name) the id of the DAO that this proposal should be associated with.

For each proposal, minimal content data is required to be stored in the contract state and is instead only passed through for data integrity via transaction logs. Only the account and payment data is stored for utilisation in later actions within this contract.

### Voting for a proposal to begin  - `voteprop`

Once a proposal has been created it would be in a state waiting for the current custodians to vote either ‘proposal\_approve’ or ‘proposal\_deny’ for a proposal with the required number of votes and number of ‘yes’ votes to be configurable in the contract. At this time there may be refinements to the proposal with cancelling `cancel` of existing proposals and resubmitting changes based on feedback from the custodians until the proposals get to the ready and positively-voted-for position.

### Cancel a proposal before starting work - `cancelprop`
Duration the early phase of a proposal there could be feedback and disagreement as to why the custodians will not approve a proposal. The worker may also decide against pursuing the proposal. This action will cancel and remove the proposal from the pending proposals as well as any approval that have already been applied to the proposal.

### Start work on an accepted proposal - `startwork`

It there have been sufficient positive votes for a proposal the proposer will be able to call this action to confirm that they will agree to work on the agreed proposal with the agreed terms, payment etc. At this point, the agreed payment amount is transferred into an escrow account to ensure the funds can and will be paid to the proposer when the work is complete as approved by the custodians or the agreed arbitrator for the proposal.

The locking of funds in an escrow account is a crucial step to protect the worker from potentially malicious custodians who could reverse an earlier proposal acceptance because they have a trusted arbitrator on the proposal to also be able to release the funds.

### Cancel a proposal after starting work - `cancelwip`

Once the worker has commenced work on a proposal there still could be reasons to cancel the worker proposal. This action will cancel and remove the proposal from the pending proposals as well as any approval that have already been applied to the proposal. But it will not be able to refund the escrow associated with the proposal since the tokens have already been locked up until the expiration time. This is deliberately difficult to incentivise the DAO and the worker to resolve their differences otherwise they will both loose out. For the associated escrow to be released back to the DAO they must wait for the expiry time (double the job duration) or ask the worker to `dispute` the escrow. After which the nominated arbitrator will be able to `disapprove` the escrow which will refund the payment back to the DAO minues the arbitrator's fee.

### Signal completion of work - `completework`

After a worker has completed their work they would signal to the custodians that work is believed to be complete with this action. The proposal must be in a state of `Work_in_progress` and this action would transition the proposal into a state of `Pending_finalize`. Then the custodians would need to assess the work before approving via another vote using `votepropfin`.

### Voting for a proposal to complete - `votepropfin`

Once a proposal has been completed by the worker (after calling `completework`) it would be in a state of `Pending_finalize` waiting for the current custodians to vote either ‘finalize_approve’ or ‘finalize_deny’ for the proposal with the required number of votes and number of approval votes to be configurable in the contract. At this point the proposal must be in a state of `Pending_finalize` for these vote actions to be possible.

### Dispute an unapproved proposal - `dispute`
If a worker believes they have completed their work but has failed to convince the custodians to approve the proposal the worker can call this action which will place it in a state of dispute. Within this action it will check that the escrow has also been disputed so it needs to have that action called first (suggested to keep it in the same transaction). Then only the nominated arbitrator for the proposal can step in to rule either way.

### Finalize a proposal for completed work - `finalize`

If there have been sufficient approval votes for the completed work from the custodians based on the current configurations then this action can called by anyone to trigger the transfer of token payments to the worker. This will also refund the arbitrator pay amount to the DAO since the arbitrator's services were not required for the proposal

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