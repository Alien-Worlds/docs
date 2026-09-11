---
sidebar_position: 2
---

# Token and inflation

import {BlockExplorerContractLinks, BlockExplorerActionLinks, BlockExplorerTableLinks} from '@site/src/components/BlockExplorerLinks';

Where TLM comes from, and the path it takes to reach players and planet treasuries.

## The contracts involved

| Contract | Role |
| --- | --- |
| <BlockExplorerContractLinks contract="alien.worlds"/> | The TLM token itself. Also the name of the NFT collection. |
| <BlockExplorerContractLinks contract="inflt.worlds"/> | Mints new TLM on a schedule and distributes it. |
| <BlockExplorerContractLinks contract="token.worlds"/> | Per-planet DAC tokens, issued in exchange for staked TLM. |

## How new TLM enters circulation

Inflation is the only source of new TLM. The inflation contract mints it and then splits it two
ways: planets claim a share weighted by how much TLM is staked to them, and the mining pot is
topped up so players can mine it out.

```mermaid
sequenceDiagram
    participant INF as inflt.worlds
    participant TOK as alien.worlds
    participant PLN as plnts.worlds
    participant MIN as m.federation

    INF->>TOK: issue (mint new TLM)
    Note over INF: inflate, on the daily schedule
    INF->>PLN: read planet stake weights
    INF->>TOK: transfer planet share
    Note over INF,TOK: claim, per planet
    INF->>MIN: fill
    Note over MIN: mining pot topped up<br/>for players to mine out
    INF->>INF: logclaim
```

The `logclaim` step does no on-chain work. It exists so that off-chain indexers have a clean,
structured record of each claim to read, rather than having to infer it from token transfers.

### Actions

#### <BlockExplorerActionLinks contract="inflt.worlds" action="inflate"/>
Mints new TLM according to the inflation schedule.

#### <BlockExplorerActionLinks contract="inflt.worlds" action="claim"/>
A planet claims its share, weighted by staked TLM and NFTs held.

#### <BlockExplorerActionLinks contract="inflt.worlds" action="logclaim"/>
Emits the claim as an inline action purely so it can be read off-chain.

#### <BlockExplorerActionLinks contract="inflt.worlds" action="pause"/> <BlockExplorerActionLinks contract="inflt.worlds" action="unpause"/>
Halt and resume inflation. The `pausable` table holds that state.

## The daily cap is a constant in the source

The inflation ceiling is compiled in, not configured on chain:

```cpp
// Inflation amount on 26th October 2025 was 829,029.5660 TLM
static constexpr int64_t DAILY_INFLATION_CAP_UNITS = 8'290'295'660;
```

Changing it requires recompiling and redeploying the contract. If you are reasoning about
long-term supply, this is the number to look at, and its comment records when it was last set.

## Planet voting tokens are locked TLM

There is only one token of value in the system: **TLM**. When you stake TLM to a planet, that TLM
is locked, and you receive that planet's voting token in return.

Technically the planet token is a separate symbol on `token.worlds`, but it is best understood as
a **receipt for locked TLM that carries a vote**. It is not a second currency to trade or earn:

- It is issued only in exchange for TLM being locked, and burned when that TLM is released.
- Its only real use is voting weight in that planet's DAO.
- Its supply is therefore a direct measure of how much TLM is committed to that planet.

So staking is one act with two effects: your TLM is locked behind a planet — which is what
directs inflation to it — and while it is locked you hold a vote there. The
[staking page](./04-%20planets-and-staking.md) covers the mechanics and
[DAO governance](./05-%20dao-governance.md) covers the vote.

## Tables

#### <BlockExplorerTableLinks contract="inflt.worlds" table="state"/>
Global inflation state. This table used to live on the `federation` contract and moved here with
the claim actions.

#### <BlockExplorerTableLinks contract="inflt.worlds" table="payouts"/> <BlockExplorerTableLinks contract="inflt.worlds" table="dacpayouts"/>
Payout records, overall and per DAC.

#### <BlockExplorerTableLinks contract="inflt.worlds" table="reserve"/>
Amounts held back from distribution.
