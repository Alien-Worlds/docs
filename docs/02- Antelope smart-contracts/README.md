
# Smart Contracts

The Alien Worlds platform has a decentralised architecture facilitated by blockchain technology - specifically using the WAX blockchain, with smart contracts written in C++, and Ethereum and Binance Chain (BNB), with smart contracts written in Solidity. Using multiple blockchains allows for the platform to benefit from the superior throughput, performance and cheap blockchain actions available on WAX while, at the same time, being able to benefit from the additional industry exposure and trading liquidity available on Ethereum and BNB Chain. While the critical application and value data is stored on underlying blockchains the users of the game will interact via web-based user interfaces that are designed to abstract the blockchain complexity away from the end-user.

While this requires users to trust the intermediate web layer written by the Alien Worlds team, the underlying blockchain data is available for anyone to audit since all transactions are recorded on public blockchain ledgers (WAX, BNB and Ethereum). The core features of the platform are separated into multiple smart contracts. This allows for each to be modified separately which has the benefit of reducing the risk of causing damage through software update bugs and also makes the evolution of features easier since there is a loose coupling between features. Loose coupling between software components in any software system is considered good practice for continual maintenance and evolution.

The EOSIO blockchain protocol (Now called Antelope, the underlying blockchain technology of WAX), has the added benefit of extremely powerful and secure permissions mechanisms built directly into the blockchain protocol. These mechanisms ensure that all the permissions to perform each of the smart contract actions, including updating the smart contract code and the permissions can be enforced with the utmost confidence at a protocol level.

Solidity based blockchains (Ethereum and BNB) have more industry acceptance based on user numbers and media exposure and therefore has gained more trust from this avenue. From a technical perspective, while smart contracts are not upgradable on Ethereum and BNB which poses a higher risk for being able to patch bugs at a later time, the immutability provides deterministic guarantees that nothing can ever be changed in the future.

### Smart Contracts/Actor interactions

This diagram shows all the interactions between the contracts

![](https://t18330827.p.clickup-attachments.com/t18330827/cee8a060-e3c8-445b-989b-803d8e3a4285/Alien%20World%20Arch.png)
