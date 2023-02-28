
# Escrow 

import {BlockExplorerContractLinks, BlockExplorerActionLinks} from '@site/src/components/BlockExplorerLinks';

## escrw.worlds <BlockExplorerContractLinks contract="escrw.worlds"/>


This contract is responsible for holding the secured funds for worker proposals until the elected custodians or an agreed arbitrator releases the funds to the receiver or the escrow time limit expires which would allow returning of funds to the sender. The intention is that this contract would be locked to even prevent code modification from malicious custodians. This would be achieved by deleting the owner and active keys on the account after the contract code has been set. This desire for immutability is another reason for this contract to be separate and simple from the other code contracts in the code. The hope is that this code never needs to be modified. In the unfortunate (and hopefully very unlikely) scenario that this code does need to be modified the custodians would need to get the required agreement from the current block producers to reset the owner key for this account.

## Actions:
---
### Initialise an escrow transaction - `init`

An escrow transaction must be initialised specifying all the required fields including the sender, intended receiver, expiry time, arbitrator, memo for the eventual transfer action. There is also an optional external key which can be used as a cross-contract reference key rather than only relying on the internal auto-incrementing key which would otherwise lead to key collisions in time.

### Transfer funds for an escrow - `transfer` 

Funds for an escrow would need to be transferred to escrow contract using the usual `transfer` action as seen and replicated by most EOS based token contracts. This contract’s code relies on the built-in notifications that the transfer action directs to both the sender and receiver of accounts of the transfer. When a transfer notification is received by the escrow contract the `transfer` action implementation will verify the sender has an empty escrow record and assigns the amount transferred into that escrow record for later processing by the other actions in the escrow contract code. An initialised escrow record may be cancelled with the `cancel` action provided it is called before the transfer action has populated the escrow.

### Approval or un-approval of an escrow - `approve` and `unapprove` 
Once an escrow has been initialised and populated with a transfer action the next step would be to approve the escrow either by the sender, the nominated arbitrator or receiver. Two approvals are required from any of these three accounts to allow the `claim` action to be performed. `unapprove` may be subsequently called to remove an existing approval by the relevant actor.

### Claim an approved escrow payment - `claim` 

The claim action can only be executed by the intended receiver for an escrow payment and will only succeed with the correct approval state for the escrow record. At this point, the escrowed amount will be transferred to the nominated service company account so that payments can be processed to the intended receiver.

_Note: The service company step is not included for technical reasons but is a legal requirement to have sufficient interfacing with the traditional legal world. As much as we would like to perform all actions in the safety of cryptographically secured smart contract environment the world is not ready :( ._

### Refund after expiry - `refund` 

While the funds in the escrow account must be locked up for a certain duration they must also be available after expiry time has passed if there has not been sufficient approval from the sender or the arbitrator otherwise there could be funds locked in the account permanently. The `refund` action provides this mechanism and can only be called by the sender if the expiry time has passed. Then the escrowed amount will be transferred back the sender and the escrow record will be removed to prevent a double refund scenario.
