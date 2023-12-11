# Mining

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## <BlockExplorerContractLinks contract="m.federation"/>

If you're reading this you are probably familiar with the mechanism of mining in Alien Worlds. The details are covered in the technical blueprint and the technical docs related to the [mining contract](../03-%20mining.md). It is possibly the most called action of any blockchain game in the world and therefore a rich source of data and opportunity to extend with futher composable logic from other smart contracts on the same Wax blockchain. For security reasons this capability is reduced to the general public, since we have seen some evidence of abuse in this area in the early days of the mining. However, in blocking this capability from abuse, we also blocked this capability from useful additions from the community. Therefore we are providing a mechanism to selectively allow some 3rd party smart contracts to participate in composable smart contract logic via an inline action attached to the mine action. This is facilitate by adding an optional parameter to the mine action <BlockExplorerActionLinks contract="m.federation" action="mine" /> where a user can specify a `notify` parameter which would trigger an inline `logmine` action at the end of the mine action to the account named in the `notify` parameter. The same shape of action can be seen in any current mine action being sent to `notify.worlds` for a sample. In a custom smart contract a user could implement an action in the form of:

``` C
        ACTION logmine(const name miner, const mining_data &params, const asset bounty, const uint64_t land_id,
            const name planet_name, const name landowner, const std::vector<uint64_t> &bag_items, const uint32_t offset,
            const asset landowner_share, std::map<string, asset> &pool_amounts) {
            check(get_sender() == "m.federation"_n, "only m.federation can call this action");
            // custom logic here...
        }
```

The `mining_data` type is used internally in the mining logic with the following structure:

```C
struct mining_data {
    uint8_t     invalid;
    std::string error;        // an optional parameter if there was an error raised during the mine
    uint16_t    delay;        // Delay added between current mine and previous mine
    uint8_t     difficulty;   // Reduction in pow difficulty (higher number means more is accepted for 5th word)
    uint16_t    ease;         // Percentage of mining pool which is received
    uint16_t    luck;         // increase in probability of receiving a random nft
    uint16_t    commission;   // commission to landowner (percentage)
    std::vector<std::pair<std::string, uint16_t>> eases; // the eases of the tools used for the mine
};
```

:::note
It's advisable to check the sender is `m.federation` to ensure your custom logic is not being called by anyone, bypassing the mine action.
:::

## Whitelisting mine notifications
To prevent anyone from being able to abuse the mining game by adding themselves to any mine action, there is now a whitelist functionality to allow selected accounts to be authorized to receive inline notify actions from a mine. Authorized DAO/MSIG groups will be allowed to add and remove accounts from the whitelist. Each planet has a unique whitelist so there may be different functionality dependng on which planet a user is mining on.

### <BlockExplorerActionLinks contract="m.federation" action="addnotify" />
This action adds a new account to the whitelist for specified planet. It can be either called by the controlling planet DAO (eg. `eyeke.dac`) or by an authorized global DAO (eg. `megalos.dac`) as specified by the `authorizer` param. In all cases the planet would need to be specified in the form of `<planet>.world` eg. `eyeke.world`. And, of course, the account to be added to the planet whitelist must be specified. An authorized global DAO can add an account to any planet but each planet can only add to their own whitelist.
To propose this action as an MSIG requires the auth of the DAO/MSIG performing the action (matching the `authorizer` param). In addition, when the action is proposed by a global group, that is not the planet DAO, and additional auth of `m.federation@whitelist` must be added to the MSIG proposal for it to succeed.

### <BlockExplorerActionLinks contract="m.federation" action="rmvnotify" />
This action removes a new account from the whitelist for specified planet. It can be either called by the controlling planet DAO (eg. `eyeke.dac`) or by an authorized global DAO (eg. `megalos.dac`) as specified by the `authorizer` param. In all cases the planet would need to be specified in the form of `<planet>.world` eg. `eyeke.world`. And, of course, the account to be remoed from the planet whitelist must be specified. An authorized global DAO can remove an account from any planet but each planet can only removee from their own whitelist.
To propose this action as an MSIG requires the auth of the DAO/MSIG performing the action (matching the `authorizer` param). In addition, when the action is proposed by a global group, that is not the planet DAO, and additional auth of `m.federation@whitelist` must be added to the MSIG proposal for it to succeed.

## Whitelist Table

### <BlockExplorerTableLinks contract="m.federation" table="whitelist"/>
Holds all the whitelisted accounts for each planet along with the authorizer of the group that added the account to the whitelist. This table is scoped to each planet name eg. `eyeke.world`.
  * name: account
  * name: authorizer

