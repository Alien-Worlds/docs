# User Points Proxy
import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';


The userpoints distribution is being opened up to be controlled by the new DAOs (within some safe limits). Each DAO will be allocated a budget of user points that can be distributed within a given time period. With this allocation can choose to distribute this one one or multiple games/dapps with a time cadence of their choosing. They can also choose to withdraw the budget and reallocate it to another group if they are not happy with the behaviour of given group, as long as the group has not already exceeded the amount they are attempting to withdraw for the given time period.

Eg. DAO 1 with a budget rate of 1000,000 points every 30 days may choose to give:
* 500,000 points to Group A on a 30 days cycle
* 500,000 to Group B for a 60 day cycle
* and finally 125,000 points to another Group C a 15 day cycle

This would add to a total of 1000,000 points every 30 days.

If Group C was not performing as expected the allocation could be withdrawn and given to another group on the same or different time cycle as long as the total rate is still within the DAO's allocated budget.
The budget is stored and calculated as Number_of_Points/Seconds and the DAOs can determine how best to allocate these budgets. In practice the smart contract actions will return a error if the budget is exceeded. And while it may seem complicated, the purpose is to ensure the NFT point allocation system stays in balance while giving the DAOs the freedom and flexibility to manage point allocations how they like.

### Authorized Parties
Actions related to this feature will be authorized by the following:
* <BlockExplorerContractLinks contract="megalos.dac"/>
* <BlockExplorerContractLinks contract="trilara.dac"/>
* <BlockExplorerContractLinks contract="synthar.dac"/>
* <BlockExplorerContractLinks contract="khaurex.dac"/>

## Contract details:

### Set Budgets <BlockExplorerActionLinks contract="ptpxy.worlds" action="setbudget"/>
A DAO with an allocation of user points can set a budget for a game/dapp using this action. The required params include:
* The `allocator` - the account name for the DAO allocating points.
* `points_manager` - the account from the game/dapp that would managing the point distribution for the game/dapp.
* `budget` - the number of points allocated to the points_manager to be distributed every n days.
* `n_days` - to represent the number of days before the budget of the point_manager is reset. The budget doesn't roll over do they should use it within their given time frame of `n_days`
* `batch_process` - is a boolean flag to allow the budget allocation to work in a batch processing form. This is described in more detail [here.](../05-%20userpoints-proxy.md)

If successful the the allocated budget for the DAO will be reduced by `budget/(n_days * seconds_in_day)`

After this action, the allocated `points_manager` will be populated and will be`active` with `debug_mode` set to true. This allows the new `points_manager` to test their system to add points without real user points being distributed. The test adding of user points can be observed by looking at the inline actions within the `addpoints` action from this contract. There should be a `testaddpnts` action to `uspts.worlds` with the intended account and points if all is working well. 

Once testing is complete the `exitdebug` action can be called by the `points_manager`. This may fail if the `points_manager` is set to batch process and has pending points that need the `processbatch` action to flush out the pending points.

To execute this acrion as a DAO an MSIG transaction needs to be proposed with the authorizer set as the `<DAO>@active`with allocator also being set to the DAO account eg. megalos.dac. 

Here is an example: https://wax.bloks.io/msig/ameet.worlds/budgseteg

### Add to existing budget <BlockExplorerActionLinks contract="ptpxy.worlds" action="addbudget"/>
An existing `points_manager` can have their budget increased by a DAO using this action. This will only succeed if a budget has been previously set for the `points_manager` and the DAO has enough allocation to distribute. It will be based on the existing timeframe for the `points_manager`. 

To execute this action as a DAO an MSIG transaction needs to be proposed with the authorizer set as the `<DAO>@active`with allocator also being set to the DAO account eg. megalos.dac.

Here is an example: https://wax.bloks.io/msig/ameet.worlds/addbudgeteg

### Withdraw existing budget <BlockExplorerActionLinks contract="ptpxy.worlds" action="withdrawbudg"/>
An existing `points_manager` can have their budget decreased by a DAO using this action. This will only succeed if the `points_manager` has not allocated more than the budget that is being withdrawn. If the optional value for the budget to withdraw is not set (`null`), then this action will withdraw all the available budget from the points_manager and add that allocation to the allocating DAO.

To execute this action as a DAO an MSIG transaction needs to be proposed with the authorizer set as the `<DAO>@active`with allocator also being set to the DAO account eg. megalos.dac.

Here is an example: https://wax.bloks.io/msig/ameet.worlds/withdrbudgeg
