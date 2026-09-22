
# Escrow 

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="escrw.worlds"/>


This contract is responsible for holding the secured funds for worker proposals until the elected custodians or an agreed arbitrator releases the funds to the receiver or the escrow time limit expires which would allow returning of funds to the sender. It is designed to be used in close connection with the worker proposal contract but it could be used in isolation or with other contracts that need an escrow function.

## Actions:
---
### Initialise an escrow transaction <BlockExplorerActionLinks contract="escrw.worlds" action="init" />

An escrow transaction must be initialised specifying all the required fields including the sender, intended receiver, expiry time, arbitrator, memo for the eventual transfer action. There is also an optional external key which can be used as a cross-contract reference key rather than only relying on the internal auto-incrementing key which would otherwise lead to key collisions in time.

### Transfer funds for an escrow <BlockExplorerActionLinks contract="escrw.worlds" action="transfer"/>

Funds for an escrow would need to be transferred to escrow contract using the usual `transfer` action as seen and replicated by most EOS based token contracts. This contract’s code relies on the built-in notifications that the transfer action directs to both the sender and receiver of accounts of the transfer. When a transfer notification is received by the escrow contract the `transfer` action implementation will verify the sender has an empty escrow record and assigns the amount transferred into that escrow record for later processing by the other actions in the escrow contract code. An initialised escrow record may be cancelled with the `cancel` action provided it is called before the transfer action has populated the escrow.

### Cancel a new escrow <BlockExplorerActionLinks contract="escrw.worlds" action="cancel"/> 

Once an escrow has been initialised but not yet funded with a transfer, this action will be able to cancel the escrow. Once the escrow has been funded then it can no longer be cancelled and needs to play through the other actions.

### Approval or un-approval of an escrow

<BlockExplorerActionLinks contract="escrw.worlds" action="approve"/> 
<BlockExplorerActionLinks contract="escrw.worlds" action="disapprove"/>

Once an escrow has been initialised and populated with a transfer action, the next step is to
approve it. `approve` is what actually settles the escrow: it pays the arbitrator, transfers the
escrowed amount to the receiver, and erases the escrow record.

Who may approve depends on whether the escrow is disputed. An undisputed escrow is approved by
the **sender**; a disputed one can only be approved by the **arbitrator**, who steps in to
adjudicate. `disapprove` is the arbitrator's counterpart for refusing a disputed escrow.

Neither action can be called directly by those accounts. Both require the escrow contract's own
authority, so settlement is only reachable through the proposals contract sending
`escrow@approve` — the proposals contract treats the presence of the escrow row as the truth
about whether the work is still live, and letting an arbitrator settle an escrow directly would
leave the tracking proposal behind.

### `claim` (removed)

Earlier versions required the receiver to call a separate `claim` action once an escrow had
enough approvals. That action **no longer exists in the deployed contract** — and so has no
explorer link — because `approve` now transfers the funds to the receiver directly as part of
settling the escrow.

### Dispute before expiry <BlockExplorerActionLinks contract="escrw.worlds" action="dispute"/>

If a related proposal is not getting the required approvals to authorise payment to the worker and the worker believes that is not fair then they can dispute the propsal/escrow which will put the escrow into a state of dispute. Once in this state the nominated arbitrator is authorised to step in and make a judgement eaither way and can then direct if the payment should be sent to the worker or back to the DAO.

### Refund after expiry <BlockExplorerActionLinks contract="escrw.worlds" action="refund"/>

While the funds in the escrow account must be locked up for a certain duration they must also be available after expiry time has passed if there has not been sufficient approval from the sender or the arbitrator otherwise there could be funds locked in the account permanently. The `refund` action provides this mechanism and can only be called by the sender if the expiry time has passed. Then the escrowed amount will be transferred back the sender and the escrow record will be removed from the table on chain.

## Tables
---

### Escrow records <BlockExplorerTableLinks contract="escrw.worlds" table="escrows"/>
* key - (name) Primary identifier key for the escrow record
* sender - (name) account paying for the escrow amount
* receiver - (name) account intended to receive the escrow amount
* arb - (name) account of an agreed arbitrator who can resolve disputes
* receiver_pay - (extended_asset) the amount due to be paid
* arbitrator_pay - (extended_asset) the amount to pay the arbitrator if required
* memo - (string) The memo string to insert in the token transfer
* expires - (time_point_sec) The timestamp when the escrow expires and can be refunded back to the sender
* disputed - (bool) a state flag to indicate if it's in dispute and allows the arbitrator to step in.