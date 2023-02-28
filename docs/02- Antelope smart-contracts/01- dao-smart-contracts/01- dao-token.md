# DAO Token

import {BlockExplorerContractLinks, BlockExplorerActionLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="token.worlds"/>

This is where it all started. The EOSDAC Token is held in this smart contract. It started as a clone from the main `eosio.token` contract code which is used for the EOS token and most likely the starting point for all the tokens that are running on all the EOS chains. We added some functionality to this contract to suit our needs for the launching of the DAO and the initial airdrop including the following:

## Ability to create a token in a locked state

The purpose of this was so that when we did the initial airdrop to the holders of the original Ethereum based tokens, back in June 2018, we could do thorough testing of the balances of the receiving accounts to ensure they matched the expected balances from the Ethereum snapshot before users could start trading the token. We take testing very seriously :) .

EOSDAC was one of the very first tokens to do an airdrop on the chain so there were many unknowns. Once the airdrop was completed and tested we could unlock the token to allow transfers. Importantly, there is no ability to lock a token again once it has been unlocked to ensure the token owner has full control of the token from the perspective of the token contract.

## Membership terms and conditions

Agreeing to terms of use as part of the DAO was seen by us as a fundamental core feature of the DAO smart contracts and therefore it is included in the token contract functionality. A DAO would set the member terms in the contract which will have it's version tracked and includes a reference to the content stored off-chain in a content addressable format such as IPFS.

The terms would be agreed to by a user in order for them to become a member via performing the `memberreg` action on the contract.
This action has the option to supply a hash which must match the hash of the latest memberterms version registered with the DAO for extra integrity guarentees.

In the interest of saving RAM usage for all the end users, the contract only stores a reference to the hash of the accepted terms stored once in the contract rather than storing a copy of the accepted hash for each user. This means each user only needs to store the version of accepted terms (8 bytes) and not the whole hash (32 bytes) and since RAM on-chain is expensive every little saving helps.

The state of each member’s acceptance of the latest terms is referred to repeatedly throughout the DAO smart contracts to ensure users are not able to perform actions on the DAO without agreeing to the latest terms, including in the future when the terms are updated.

## Staking
The token  contract also includes an optional generic staking functionality. This enables locking up the liquidity of the token for a user selected time. The range of available times that can be set are determined by the `stakeconfig` for the DAO. The staking here has no other function other than preventing transfers but the tables within this contract are used by other smart contracts with the DAO to enable stake-weighted voting.