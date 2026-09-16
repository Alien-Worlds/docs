# Teleport Oracle Service

Overview
--------

The Teleport oracle service is a collection of scripts that should run continuously as a single instance per oracle. Each instance of the script will be configured to watch for TLM transactions that should move token value from one chain to another. The support pairs for transfer include:

*   Wax -> BSC
*   Wax -> Eth
*   Eth -> Wax
*   BSC -> Wax

The oracle scripts watch for specific `teleport` actions on the appropriate chain and use those events as triggers to sign and execute transactions on the destination chain for the teleport action.

For the teleport action to be confirmed and completed a sufficient number of oracles (currently 3) need to also sign that they observed and agree with the intended teleport action. This happens automatically in the oracle scripts if all is running correctly.

For each of the pairs listed a different instance of the appropriate script should be running with specific chain details and signing keys configured for that instance. The scripts each run as their process in a continuous loop.

Technical details
-----------------

Each of the scripts is written in Javascript in the oracle folder of the teleport repo. `oracle-eos.js` watches from teleport transactions initiated on the WAX (or any future EOSIO) chain and by reading the destination chainId of the teleport signs and commits a transaction to the corresponding destination chain to the destination address. `oracle-eth.js` handles teleport actions in the opposite direction with separate instances required to watch BSC chain teleports or Eth chain teleports.

In parallel other oracles are doing the same actions watching and committing transactions to the intended destination chains. Within the smart contracts of each destination chain, there is a threshold configuration that determines how many oracles need to also commit and sign before a teleport can be considered complete. Only oracles that have been registered with their public keys by the contract owner can sign transactions and if an oracle attempts to sign the same transaction multiple times it is rejected as an error by the contracts.

For Teleports with a destination of either BSC or Eth an entry is added to the `teleports` table on WAX contract for the teleport each time an oracle signs. once the signing threshold has been reached the owner of the destination account needs to `claim` the teleport transaction amount on either BSC or Eth. This is required to cover the gas fees on the Solidity based chains. Otherwise, the last signing oracle would need to cover the gas fees - which could be substantial on Eth. Once claimed the teleport is marked as claimed to prevent it from being claimed twice. For Teleports landing on WAX an entry is added to the `receipts` table for the teleport. It is easier for the user since as soon as there are enough signatures in the receipt row for the teleport the contract will send the tokens to the destination account. This is possible since WAX doesn’t have the same gas-based transaction fee model and the cost of each signing or transfer action is effectively free.

  

In addition to the primary oracle scripts running continuously, there are helper scripts to find incomplete transactions `incomplete-eos.ts` and `incomplete-eth.js` . Each of these scripts read tables from the WAX blockchain smart contract, ( `receipts` or `teleports` ) and compiles a list of teleports with insufficient signatures to complete.

  

Lastly, if a teleport action has remained in the teleport table for more than 30 days it is considered expired and the sender will be able to cancel and receive back the TLM from the sending contract.

  

Highest priority tasks
----------------------

1.  Convert scripts from javascript to Typescript to enforce type safety and maintainability
2.  wrap in unit tests
3.  move configurations into ENV vars so the scripts can be run and re-configured without needing to change any source code.
4.  Dockerise the scripts to make them more portable for both servers and cloud platforms

  

Technical roadmap
-----------------

1.  Ensure all keys can be safely injected as ENV variables to minimise security risks of leaked keys
2.  Build CI/CD pipeline into the Github repo to facilitate safe deployable changes
3.  Refactor helper scripts to include a DB so incomplete transactions can be readily highlighted with running through the entire teleport history.
4.  Build a simple React UI which admins can use to identify missed teleports that need more oracle signatures
5.  Change the `owner` key on the BSC and ETH teleport smart contracts to be Multi-sig keys to increase the security around being able to change the current oracles.

  

Git repo(s)
-----------

[https://github.com/Alien-Worlds/alienteleport](https://github.com/Alien-Worlds/alienteleport)

  

Links to Clickup
----------------

No board or tickets yet other than for the UI

  

Context of relevant accounts/keys/permissions
---------------------------------------------

*   Sends actions to the WAX blockchain via a Wax nodeos node:
    *   eg. [https://wax.eosdac.io](https://wax.eosdac.io)
*   Reads for contract actions from Eth and BSC blockchains via relevant APIs
    *   [https://bsc-dataseed.nariox.org/](https://bsc-dataseed.nariox.org/) for BSC
    *   [https://ropsten.infura.io/v3](https://ropsten.infura.io/v3) for ETH
*   Requires private keys for oracles as registered on Eth and BSC.
    *   This should be kept as secrets by each oracle
*   Requires permission for the oracle as registered on WAX (most likely a private key too)
    *   This should be kept as a secret by each oracle but can be changed by the oracle using EOSIO permissions without needing to re-register the oracle key
*   Requires the contract address for the Teleport contract on WAX
    *   `other.worlds`
*   Requires the contract address of the TLM contract on BSC
    *   [https://bscscan.com/address/0x2222227E22102Fe3322098e4CBfE18cFebD57c95](https://bscscan.com/address/0x2222227E22102Fe3322098e4CBfE18cFebD57c95)
*   Requires the contract address of the TLM contract on ETH
    *   [https://etherscan.io/address/0x888888848b652b3e3a0f34c96e00eec0f3a23f72](https://etherscan.io/address/0x888888848b652b3e3a0f34c96e00eec0f3a23f72)

  

Test instances
--------------

None active

  

Metatdata related to service
----------------------------

All activities for these services are read directly from blockchain events

Running instances
-----------------

The process is currently configured for running with 3 keys in each direction on the `veles` server. Ideally, these keys should be reduced to one being owned by AW in case of emergency and decentralise this responsibility to 3rd party oracle entities with their own private keys.

New Relic monitoring
--------------------

NA, since this should be run and monitored by each oracle independently.
