# Alien Worlds token

Contract to handle all token related activities such as creating, issuing, transferring and vesting of fungible tokens on the WAX blockchain.

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="alien.worlds"/>

This smart contract manages the fungible tokens related to Alien Worlds on the WAX blockchain. This is closely equivalent to the ERC20 contract on Ethereum based blockchains. It handles the ability to issue, burn, transfer and vest tokens. While most actions are common to token contracts on many types of blockchains the vesting in Alien worlds has the effect of locking Trilium for a period and provides a mechanism for moving Trilium between the Wax and Ethereum based blockchains.

## Actions
---

### Create and new token <BlockExplorerActionLinks contract="alien.worlds" action="create"/> 
creates a new token specifying the issuer, symbol and max supply. The symbol must be unique for this contract. After created only the issuer can mint tokens of this type.

### Issue new tokens <BlockExplorerActionLinks contract ="alien.worlds" action="issue" />
This action creates and sends new tokens to the `to` account with the specified memo. It can only be called by the creator of the token. Any tokens issued increase the available supply for the token.

### Burn existing tokens <BlockExplorerActionLinks contract ="alien.worlds" action="burn" /> 
This action burns tokens from the `from` account with the specified memo. Must have auth of the `from` account. This does the opposite to issue.

### transfer tokens <BlockExplorerActionLinks contract ="alien.worlds" action="transfer" /> 
This action transfers tokens to the `to` account from the `from` account with the auth of the `from` account. Both the `from` and the `to` get notified of this action, allowing them to add further logic to respond to the transfer.

### Open a balance record for a token <BlockExplorerActionLinks contract ="alien.worlds" action="open" />
This action opens a record to store a balance for the `owner` account with the RAM to be paid by the `ram_payer`. Because storing a balance requires RAM if the receiver doesn't have RAM for this token already this action will allocate enough RAM to store the token balance. Any future change to the balance will not require more RAM.

### close a balance stored for a token <BlockExplorerActionLinks contract ="alien.worlds" action="close" />  
This action is the opposite to the open action in order to free up RAM. The balance must be 0 for this to succeed.

### Add vesting for a user <BlockExplorerActionLinks contract ="alien.worlds" action="addvesting" /> 
This action is for vesting tokens on behalf of a users account. This either creates a new vesting record of modifies an existing record. With a vesting record a user will be restricted for how much they can transfer from their balance. The balance becomes fully vested between the start and end times for the vesting record in a linear progression. eg. for a 12 month vesting of 1000 tokens, a user will have liquid access only to the balance exceeding the 1000 token initally. After 6 months they will have access to everythin above 500 token balance. And after 12 months will have full access.

## Tables:
---

### Accounts <BlockExplorerTableLinks contract ="alien.worlds" table="accounts" />
 table to hold all the token balances for every user scoped to the user's account.
* balance (asset) - the balance data for the token for each account.

### Currency Stats <BlockExplorerTableLinks contract ="alien.worlds" table="stat" />
Currency Stats to store global values about a particular token.
* supply (asset) - current minted supply of a token from the `issue` action.
* max supply (asset) - the maximum number of tokens that can ever exist for this token.
* issuer (asset) - the account that created and has the authority to issue more tokens.
  
### Vesting Table <BlockExplorerTableLinks contract ="alien.worlds" table="vestings" />
Details of tokens that have been vested included amounts and timings and the account the tokens belong to. The details in this table are used to determine how much a user can transfer from theri account.
* account (name) - account for the user that has the vested tokens.
* vesting_start (time_point_sec) - The start date/time for the vesting period.
* vesting_length (uint32) - the duration of the vesting period.
* quantity (asset) - the token quantity that is vested for the account.
