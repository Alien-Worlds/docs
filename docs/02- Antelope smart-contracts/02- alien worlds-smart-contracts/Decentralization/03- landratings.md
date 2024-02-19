# Land Ratings

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

## Land commission minimum and maximum management

One of the strategies of the mining game involves selecting the optimal land to mine on and one of the mechanisms employed by land holders is to set the commission of the land to attract miners to mine on their land. In a competetive environment this can lead to race to the bottom, destroying the potential benefits that a commission structure can open up for land holders to reinvest into the mining ecosystem. Being able to control minimum and maximum commission levels is a good candidate to be controlled at a group level - both at a global level and per planet. As part of the decentralization initiative we are opening this up to be controlled by the MSIG/DAOs. Initially this be be controlled at a global level only by the MegaloMSIG/s group and will soon be opened up for the planets to control at a planet level.

With these control in place, when a user mines on a specific land, the commission applied to the mining event will be determined by the greatest value between:
* the global minimum land commission
* the planet minimum land commission - relevent to the planet the land where the planet exists
* the commission set by the land holder

The same logic is also available for the maximum land commissions.

### Authorized Parties
Actions related to this feature will be authorized by the following:
* <BlockExplorerContractLinks contract="megalos.dac"/>
* <BlockExplorerContractLinks contract="eyeke.dac"/> (planet specific)
* <BlockExplorerContractLinks contract="kavian.dac"/> (planet specific)
* <BlockExplorerContractLinks contract="magor.dac"/> (planet specific)
* <BlockExplorerContractLinks contract="naron.dac"/> (planet specific)
* <BlockExplorerContractLinks contract="neri.dac"/> (planet specific)
* <BlockExplorerContractLinks contract="veles.dac"/> (planet specific)

### Set global minimum land commission <BlockExplorerActionLinks contract="awlndratings" action="stgminlndcom"/>
This action requires a single parameter to be set for the global minimum land commission. The parameter represents a percentage with 2 decimal places as an integer. Eg. to set the global minimum to 20% the parameter should 2000.

For this action to be executed as an MSIG action, the authority of the the MSIG group AND the contract of `awlndratings@landcomm` is required. This is due to how the permission is configured on the account and to to make it easy to change later without requiring a smart contract change.
Here is a sample MSIG proposal to set the minimum to 23% for the Megalos group: https://wax.bloks.io/msig/demo.worlds/lndcomingdem

### Set global maximum land commission <BlockExplorerActionLinks contract="awlndratings" action="stgmaxlndcom"/>
This action requires a single parameter to be set for the global maximum land commission. The parameter represents a percentage with 2 decimal places as an integer. Eg. to set the global maximum to 83% the parameter should 8300.

For this action to be executed as an MSIG action, the authority of the the MSIG group AND the contract of `awlndratings@landcomm` is required. This is due to how the permission is configured on the account and to to make it easy to change later without requiring a smart contract change.
Here is a sample MSIG proposal to set the maximum to 83% for the Megalos group: https://wax.bloks.io/msig/demo.worlds/lndcomaxgdem

### Set planet minimum land commission <BlockExplorerActionLinks contract="awlndratings" action="setminlndcom"/>
This action requires the planet to set the minimum for eg. `eyeke.world` and the value minimum land commission. The parameter represents a percentage with 2 decimal places as an integer. Eg. to set the global minimum to 20% the parameter should 2000.

For this action to be executed as an MSIG action, only the authority of the the MSIG group is required.
Here is a sample MSIG proposal to set the minimum to 23% for the eyeke planet group: https://wax.bloks.io/msig/demo.worlds/lndcommindem

:::note
the controlling DAO (`eyeke.dac`) is different than the specified planet (`eyeke.world`). This is because there is a slight technical separation between the the planet blockchain accocunts and the governing DAO for each planet. The `<planet>.world` and `<planet>.dac` patten holds across each planet with the execption of Neri where the dac account is `nerix.dac`
:::

### Set planet maximum land commission <BlockExplorerActionLinks contract="awlndratings" action="setmaxlndcom"/>
This action requires the planet to set the maximum for eg. `eyeke.world` and the value maximum land commission. The parameter represents a percentage with 2 decimal places as an integer. Eg. to set the global maximum to 83% the parameter should 8300.

For this action to be executed as an MSIG action, only the authority of the the MSIG group is required.
Here is a sample MSIG proposal to set the maximum to 83% for the eyeke planet group: https://wax.bloks.io/msig/demo.worlds/lndcommaxdem

:::note
the controlling DAO (`eyeke.dac`) is different than the specified planet (`eyeke.world`). This is because there is a slight technical separation between the the planet blockchain accocunts and the governing DAO for each planet. The `<planet>.world` and `<planet>.dac` patten holds across each planet with the execption of Neri where the dac account is `nerix.dac`
:::