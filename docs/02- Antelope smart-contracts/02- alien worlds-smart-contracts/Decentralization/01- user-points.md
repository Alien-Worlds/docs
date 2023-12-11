# User Points

## White list management
import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

The user points system is being opened up to allow more games and dapps to distribute, user points (AKA Shards) from sources beyond the current mining activity which is the main use case for earning user points. Details of this is covered [here.](./02-%20userpoints-proxy.md)
For community developers, being able to listen and append smart contract logic to each of these events, within the same bloackchain transaction opens up a lot of potential to integrate 3rd parties closely into the core logic of the user points system. This can be achieved by adding smart contract accounts to a list of accounts that would receive and inline action every time any account receives userpoints. But with the capability there comes a risk, since any smart contract added to the list of accounts would be able to run their own logic, they would also be able to assert during the logic execution which would have the effect of canceling the actions associated with the adding of the user points eg. an associated mine action. Of course, this would be undesirable in almost any circumstance. Therefore, in adding this capability to add accounts to be notified we need to include careful management of the number of accounts that can be added so it's not a free-for-all.

This capability will be managable by the DAO groups so that each group has a limited quota that can be added to the whitelist (starting with one account each). Then whenever an account receives userpoints, all the accounts on the whitelist will each be notified of the event and have the opportunity to implement their own logic when receiving the notification.

The inline notification action will be called on each smart contract account and the following is a good starting point to implement the custom logic:

```C
 ACTION notify(name user, uint32_t points) {
            check(get_sender() == "uspts.worlds"_n, "only uspts.worlds can call this action");
        }
```

:::warning
 It's important to ensure the sender is only from `uspts.worlds` to ensure that the custom logic could not be faked from an impersonating user points account.
:::


### Add to the whitelist <BlockExplorerActionLinks contract="uspts.worlds" action="addwhitelist"/> 

This action adds an account to the whitelist. It requires the parameter for the `account` to be added and the `authorizer` to be specified. The action requires the authorization of the `authorizer` for the execution to succeed and since this action is linked to the a custom `whitelist` permission on the contract it also requires the permission of `uspts.worlds@whitelist` when the MSIG proposal is created. Here is an example MSIG proposal with the correct auths in place. https://wax.bloks.io/msig/ameet.worlds/testpwhite
Notice there two authorizations specifed. The reason the authorizer needs to be specifed and requiring the extra auth is because each DAO has a very limited quota of accounts they can add and it is important that a different DAO is not able to consume that quota unauthorized from another DAO.

### Remove from the whitelist <BlockExplorerActionLinks contract="uspts.worlds" action="rmvwhitelist"/> 

To remove an account from the whitelist only the `account` to be removed needs to be specified in the MSIG proposal action. This allows any DAO to remove any account from the whitelist if necessary. Once removed the account will no longer receive notifications about userpoints and the quota for the DAO that added the account will be increased by one.

## Manage Premint NFT Offers
Userpoints (shards) can be redeemed for either new NFTs via the Outpost feature in the Alien Worlds UI, which will mint a new NFT for a given offer, or they could redeem points for an already existing NFT (AKA Community Offers). Up until now both of these offers have been managed by Dacoco to ensure the userpoints and NFT economy stays in balance. Now we are are opening up the community NFT offers to the DAOs to enable existing NFTs to be made available for user point redemption. A lot of the details about the preminted NFTs process already exists and is descibed in [here](../04-%20user-points.md). The new part, relevent to the DAOs, is added new capability for them to manage new offers.

### Create new offer <BlockExplorerActionLinks contract="uspts.worlds" action="crtpreoffer"/>

Selected DAOs can add NFT offers for pre-existing NFTs. This can be achieved by first calling this action to create a new offer.
Each offer can only be managed by the creator of the offer. 

Each offer must have:
* a unique numeric `offer_id` 
* `collection_name` for the the atomic assets collection for the NFT on offer
* `template_id` for the NFT to offer.
* the `required` number of points required to redeem that NFT.
* a `message` string to display to the user when they redeem.
* an optional `callback` to enable the offer creator to attach smart contract logic to the offer redemption. If the `callback` specified is a valid account it will be called via an inline action during the redeem action.
  
See below for details about the callback inline action.

Once the offer is created, NFT assets matching the offer `collection_name` and `template_id` can be added to the offer by transferring the assets to `uspts.worlds` with a specific memo to match the `offer_id`. eg. To add an asset to `offer_id` with id `123` the memo should contain only "123"
This will result in an offer's `available_count` being incremented and the `next_asset_id` being set to the lowest asset id matching the offer.

To create a new premint offer an MSIG proposal must be created which includes the fields as descibed above. This action requires the authorization of the creator (ie. one of the DAOs) and the auth of `uspts@preoffer` that has been linked to the action. Here is an example proposal https://wax.bloks.io/msig/ameet.worlds/testpreoffer

:::note
there are 2 authorizations that are required in the action.
:::

### Update an offer <BlockExplorerActionLinks contract="uspts.worlds" action="updpreoffer"/>

Updating a premint offer allows the creator to update some of the properties for an existing offer without needing to remove and add the entire offer again. 
The properties that can be updated include:
* `required` amount of points to redeem
* the `message` associated with the offer.
* the `callback` account to change or remove the existing callback details.

### Inline callback action during redemption

When a valid `callback` is specified for a premint offer the inline action will be called on the `callback` account. The below is a good starting point to implement the custom logic. It's a good idea to ensure the sender of te action is `uspts.worlds` to ensure random user are not able to call directly into the custom callback logic.

```C
    ACTION logredeemnft(const name redeemer, const uint64_t asset_id, const string message) {
            check(get_sender() == "uspts.worlds"_n, "only uspts.worlds can call this action");
        }
```