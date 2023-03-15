# User Points Proxy

Within the suite of Alien Worlds Smart contracts, one of them is responsible for the rewarding of alien.worlds NFTs as determined by non-transferrable user points. The user points are intended to be distributed to users for performing various game-related activities in the Alien Worlds metaverse. But this is also an avenue for malicious actors to be able to potentially get free NFTs if this mechanism is not well protected from bad actors.
Up until now, the only use case to be rewarded user points has been mining activity with the plan to gradually add other Alien Worlds activities but still within the safe boundaries of the Alien Worlds suite of smart contracts. With the Points Proxy Smart Contract, we are introducing an open way for 3rd parties to be able to add user points in a safe and regulated way. This would be regulated in the form of trusted accounts being granted the ability to distribute a given budget of points to any chosen user's accounts over a chosen time period. Once that budget has been exceeded for the given time period that trusted account will not be able to add any more points until that time window has expired. Each trusted account could have its configuration set such that the points can be scaled with a multiplier factor and could be set to send the points directly into the core user points contract or to send them in batches to provide another layer of control for the trusted account before passing the points directly to AlienWorlds User points.

An example could be: a trusted account `gamebuilder1` is granted permission to distribute 100,000 points every 30 days. 
Through their game called “PointyBlocks” users earn in-game points in PointyBlocks which they want to be able to share with AlienWorlds  users as User points. Via their trusted mechanism they can prepare and send an action called `addpoints` to `ptpxy.worlds` on WAX blockchain. This action will need to be signed by the trusted account `gamebuilder1` and would specify the WAX account to receive the points and the number of points the account should receive.
Each trusted account could be configured to either send points on synchronously to the core user points contract or to send points in batches via a `processbatch` action that would be called periodically by the trusted account `gamebuider1`. If the batch option is set then the added points will get accumulated in a points table within the Points Proxy contract scoped to the trusted account. In this case, the budget and multiplier will only be enforced at the point of trying to run `processbatch`.
Each trusted account can be configured to run in debug mode which will allow them to test the workflow with test accounts that will send `testaddpnts` actions to the core userpoints contract to help with testing and debugging.
All the configurations will only be managed by Alien Worlds to grant the budget and switch between debug and active modes

## Contract details:
import {BlockExplorerContractLinks, BlockExplorerActionLinks} from '@site/src/components/BlockExplorerLinks';

UserPoints <BlockExplorerContractLinks contract="uspts.worlds"/>

User Points Proxy <BlockExplorerContractLinks contract="ptpxy.worlds"/>

``` ts
// Point Proxy config/state details for each trusted account:
struct config {
    bool           active        = false; // If true addpoints will work
    bool           debug_mode    = false; // if true send testaddpnts
    float          multiplier    = 1; // multiplier to apply to points -> uspts.worlds
    bool           batchProcess  = true; // Send points in batches with processbatch
    uint64_t       running_total = 0; // global total of points for trusted account
    uint64_t       period_total  = 0; // running total for the current period
    uint64_t       period_budget = 0; // limit of allowable points per period
    time_point_sec period_end; // timestamp when to reset the period time.
    uint32_t       period_duration = 30 * 24 * 60 * 60; // duration of period.
}
```

## Contracts
![](https://lucid.app/publicSegments/view/a27a2c28-27b2-44bf-bea0-12b695123739/image.png)

[Edit Diagram](https://lucid.app/lucidchart/68bd385a-f393-4e9b-bff0-c7d6ed69fad7/edit?page=0&v=772&s=612)
