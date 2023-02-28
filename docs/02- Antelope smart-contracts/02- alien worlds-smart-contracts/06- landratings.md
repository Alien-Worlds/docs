# Land Ratings

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="awlndratings"/>

### Problem Statement:

Each day TLM token needs to be distributed to each account that holds a Land NFT. The amount to distribute is calculated based on the balance in the `terra.worlds` wax account divided equally to each Land NFT. If one account holds multiple Land NFTs the share of the TLM should be multiplied accordingly.

```
AmountDueForAccount = (terra.worlds TLM balance) / (the total number of land NFTs) x (number of land NFTs held by account)

```

This daily task has been completed by running an off-chain script for many months that does this calculation and then performs batch transfers to the destination accounts. While this mostly works it has caused the following problems:

* Some batches may quietly fail, leading to manual repairs for the missed payments.
* Some accounts have had overpayments caused by partially missed payment batches one day rolling over to the next day(s) and skewing the daily calculations based on the current (incorrect) account TLM balance.
* Destination accounts can have code on their destination account which could assert or drain CPU resources during the batch transfers
* Requires manual execution because there can be partial errors through the batches which require manual intervention to fix.
* Due to manual running requirements, some days get missed and require running multiple days of DTAL at once. This can lead to inaccurate payments if NFTs are transferred between runs.
* Being run off-chain in a script leaves a security vulnerability where the script executor requires a key to do the transfer with potentially large impacts of mistakes.
* Microforks in the chain during execution lead to scenarios where some payments are believed to have been executed but have not made it into the finalized blocks in the blockchain. Requires manual calculation and repair to resolve.

### Solution:

By encoding this distribution logic in a smart contract all the above problems can be removed entirely or significantly reduced as a risk. There are around 3000 Land NFTs which make the distribution impossible to perform on-chain in one transaction but with state management, it can safely be completed in several batches without being stuck in an inconsistent or partial state between payment cycles.

[https://viewer.diagrams.net/?tags={}\&highlight=0000ff\&edit=\_blank\&layers=1\&nav=1#G1PPLR562m3aIgHWAI9T93q3YEGrCIqFMk](https://viewer.diagrams.net/?tags={}\&highlight=0000ff\&edit=\_blank\&layers=1\&nav=1#G1PPLR562m3aIgHWAI9T93q3YEGrCIqFMk)

* Initially, the configuration needs to be set for the number of Land NFTs that exist, the accounts that should be skipped (possible bots, NFT exchanges or something else) and the threshold balance to determine if a pay cycle should commence. This should only be runnable by an authorized admin account.
* A cron job can trigger a `run` action periodically (every few minutes). This would not need to handle any logic since everything would be handled in the contract state with the following flow:
  * Check the current cycle state to see if the contract is currently processing through batches or waiting for a new incoming transfer to start a new pay cycle.
  * If the contract is not currently processing a pay cycle and there is insufficient balance it asserts and stops at that point.
  * If the contract is not currently processing a pay cycle and there is sufficient balance it starts a new pay cycle.
  * If the contract is currently processing a pay cycle it should process the next batch (determined by the `batchSize` param) of NFT payments records.

Rather than transferring the due amounts during the pay cycle to the destination account the processing creates or adds to the existing payment due amount for the NFT owner. The reason to do it this way is that it prevents a potential problem of a destination account having executable code triggered from the transfer action. If they did they could block the whole batch of transfers or more subtly execute arbitrary code with CPU paid for the DTAL contract. With this approach, the destination account would need to call the `claim` action at their own convenience in order to trigger the transfer to their account. Then if they have executable code on their account they would manage and pay for the CPU/NET for that action. It could also make accounting easier for the DTAL receiver since they would determine when to receive their due TLM.

For landowners to execute the `claim` action the user could do this via [wax.blocks.io](http://wax.blocks.io/) on the smart contract where they would just enter their account as a parameter and then sign the transaction. It could eventually be built into the game UI but since the game UI focuses around Wax cloud wallet whereas many landowners own the land NFTs outside cloud wallets this would make the UI a little confusing. It would be more closely linked to the Teleport UI which support both WCW and Anchor.

The next step to take this approach is to set the code and switch from using the off-chain script version to the smart contract DTAL version. This would need to be an all or nothing switch since the distribution calculation would need to be either in contract or script but could not be partial in both.

This then implies that we need to construct and publish an article for the community to understand and adopt these changes - Landowners will now need to do something to get their DTAL.
