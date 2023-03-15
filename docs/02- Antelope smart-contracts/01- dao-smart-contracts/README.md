# DAO Smart Contracts
The DAO system comprises a collection of smart contracts that operate representative voting for DAOs (Decentralised Autonomous Organisations). Having the system architected across multiple smart contracts opens up tremendous opportunity for customization and feature evolution. It also follows the software industry's best practice of avoiding large monolithic codebases.
In the pursuit of creating decentralized systems all the business logic occurs in smart contracts on-chain.
Key features include:
* Token management used to represent vote power
* Token Staking for variable timeframe used to scale vote power
* Representative DAO structure (Token holders vote for a group of leaders for the DAO)
* Timeboxed governance periods to facilitate changing the voted-in DAO leaders
* Secured management of DAO-owned assets, ensuring authorized transfers only with DAO consensus.
* Complex Proposal system, managing lifecycles from the start, completion  and dispute resolution
* Referendum system, as a separate feature to facilitate occasional decisions that warrant wider community engagement

```mdx-code-block
import DocCardList from '@theme/DocCardList';

<DocCardList />
```

# DAO Launch History
On Nov 03, 2022 11:50:31 PM UTC the Alien Worlds Planetary DAOs sprung to life for the first decentralised automated election process in a blockchain game. This moment had been a long time coming packed full of excitement, and apprehension and with years of hard-earned lessons in how to build decentralised autonomous organisations (DAOs) on a blockchain. We knew it would get used, but we were prepared for it to be abused and gamified. We welcomed the challenges as they came our way.

The concept of creating DAOs had begun approximately 5 years earlier as blockchain technology achieved a milestone that allowed low latency, high throughput and cheap execution of arbitrary code logic to be run autonomously on a decentralised blockchain environment. This was based on the technology, now referred to as Antelope and we were launching on the EOS blockchain for the EOSDAC project. For the first time, it was possible to run logic at a production scale that could be immune to corruption by a single controlling entity. 

The idea of a DAO was to equip a group of people sharing a common cause with the tools to manage consensus in a secure, decentralised way. Decentralisation was such a driving force that the governing and control of the building and management of the tools itself was to be controlled by the DAO tools we were building on the blockchain. The Antelope blockchain technology provided the platform on which to build those tools, leveraging protocol-level features to securely control decentralisation.

## Architectural rationale

During the building process, the real learning began. We first needed to accept some boundary conditions inherent to any decentralised blockchain environment. 

### Token Weighted Voting
Users can have one or many accounts. We could not prevent users from having multiple votes via multiple accounts (also known as a [Sybil attack](https://en.wikipedia.org/wiki/Sybil_attack)). So we needed to adopt a token-weighted voting system. The tokens would have a limited and tightly controlled supply and when distributed to accounts users' votes would be counted by the number of tokens rather than the number of accounts voting. Of course, a token with utility and a scarce supply would find a market value if it was made available on common crypto trading platforms. Therefore a core component for each DAO was that they would each have a native tradable token used primarily for voting.

### Representative Democracy
What should users be voting for? In a large-scale DAO, there could eventually be millions of individuals voting and if each decision required everyone in the DAO to carefully consider and vote on all decisions put before the DAO, it’s hard to imagine anything would get done. Instead, it’s more productive for the structure of the DAO to be formed in such a way that the DAO members vote for representatives (or custodians) to make efficient decisions on behalf of the members of the DAO. A configurable representative democracy structure can provide a good balance between representation and productivity.

### Continuous Vote Counting
 How should the votes be counted? In the early days, we had very little idea of how many users could ultimately be involved in the voting. It may be less than a hundred but it could be millions. We did not want to box ourselves into a corner that could not possibly scale well on the blockchain. If we counted the votes at the moment of the election we would need to limit the number of voters to a small number (approx 200), or be forced to a compromised, implicitly centralised architecture of having voting off-chain. Therefore, we made the architectural decision early on that the vote counting would be continuous, meaning every time someone voted or changed the token balance, which would also affect the strength of their vote, the vote counts for the custodian candidates would be updated immediately into a sorted index table. And the election would simply take snapshot of that continuously updated table. This turned out to be very scalable for potentially thousands of simultaneous DAOs with thousands of voters, allowed for a constantly up-to-date leaderboard on-chain, and the actual election process was virtually instantaneous because no counting of the votes was required. This performance also meant the DAOs would be able to have elections as frequently as they like without needing to compromise for an architectural limitation. And since the crucial logic was still in smart contracts on-chain, we maintained the decentralised security mission we were pursuing.

How many votes should each token have? The easy and obvious answer would be one but there are advantages to allowing multiple votes for each token, facilitating more complex and interesting governance outcomes and steering the control away from a concentrated few. Further details to follow.

### Everything's configurable
 How many custodians should be voted in to control a DAO and how many votes should each token get? Well, it depends… There is no one right answer to this question. There are several factors to consider, such as how large is the community in the DAO, what type of decisions and mission is the DAO intended for and how often should the election be run for the DAO. Since we couldn’t possibly have a one-size-fits-all answer to these questions, it was pretty clear that we needed a robust ability to change all of the settings in a DAO so they could be customised for a particular DAO’s needs and even changed in an already existing DAO. Continuing the mission of decentralization, these configurations should be built in such a way that the DAO governance system itself would eventually be able to change its own configurations from within its own governance process. This all becomes quite recursive and mind-bending but is necessary to be able to eventually remove a central guiding entity and march on towards decentralisation.

### Multi-tenant Contract Structure
 At a point in the early development of the DAO software, the scalability of maintenance of the DAO code needed to be paused and refactored. There was interest building from communities wanting their own DAOs beyond EOSDAC but the barrier to entry was too high to configure a new DAO. The code was necessarily complex and was fast evolving with bug fixes and additional features being added constantly for EOSDAC. We wanted the new features to be available for all DAOs but trying to propagate all those updates to many existing DAOs was soon going to be prohibitively difficult. So we came up with a scalable architectural approach where we could host many (possibly many thousands) of DAOs in the same smart contract deployments on-chain, separated only by a DAO identifier for each one. Then whenever there was a bug fix or new feature we could deploy that change once and all the DAOs would instantaneously get that same update. Of course, each DAO could have their own custom settings, so having the ability for each DAO to configure various options eg. the number of votes per token, number of candidates, and time duration between elections became crucial settings to be abstracted out of the code, as mentioned earlier.

After many months of code crunching, and debating about features and expected governance behaviours from the community, we had a fairly mature working DAO system. Sure it had bugs and tech debt that had accumulated throughout the building but it was working. The team building the DAO system was operating as a DAO and running as a block producer of EOS the hosting chain. We were eating our own dog food. We configured the DAO to run with 12 elected custodians, voting executed every 7 days and each voting token could vote for up to 5 custodians. 

### Configuring number of votes
 The reason to choose five votes per token was to reduce the likelihood that one token whale would be able to gain majority control of the DAO. A whale voter electing their choice of 5 custodians would still be less than a majority of custodians needed to control the DAO ( 5 is less than 50% of 12 custodians). Therefore if a voter tried to take full control of a DAO with a large bag of tokens they would need to vote in 7 custodians. As they could only vote in 5 with any one token (or bag of tokens) they would need to split their tokens into multiple accounts and thereby half their effective voting power. 

Over the following couple of years, the DAO continued to operate but momentum slowed as the entire crypto market descended into a crypto winter. We continued fixing and refining features. But most importantly, we continued learning about human behaviour in actual running DAO environments in good times and not-so-good times.

## Evolving into Alien Worlds

These lessons were invaluable to bring forward into the Alien Worlds. Alien Worlds has several important elements including mining, land management, NFT strategies, user incentive structures and community-born games. But an important core of the metaverse is the six competing planetary DAOs which were intended to utilise the DAO system from the old days of EOSDAC. However, rather than simply use the same code again we took the limited time opportunity, before they launched,to clean out a lot of accumulated tech debt, improve the test coverage and make some changes from lessons learned running EOSDAC.

### Vote Decay
 Voter apathy can clog up a voting system. In any system where humans need to come to a consensus, there will always be someone unhappy with a certain direction. If they engage in the process of debating and decision-making, consensus will eventually be achieved but if they mentally withdraw and still have active votes in the system they become an obstruction to any progress. For this reason, we needed to build in an element of vote decay. This ensured that if a voter did not engage to vote or at least refresh their existing votes the strength of their votes would effectively decay relative to others who did engage with voting. The approach we adopted was to have existing and untouched votes decay by 50% every 30 days.


### Stake Weighted Voting
 Token distribution tends to gravitate to a small number of token whales. Therefore in a simple token-weighted system, they have an excessive amount of power yet they might be more interested in token price speculation and trading, than in governance. Whereas someone with a smaller token balance may be willing to dedicate their time and sacrifice short-term token liquidity for a greater influence in DAO governance. To tackle this challenge we implemented an added layer to token-weighted voting which is staked-token-weighted voting. This gives the ability for a token holder to choose to lock up their tokens for a chosen time duration (currently between 2 days and 3 months). In exchange for the forgoing of token liquidity, their voting power scales up from 1x for the 2-day minimum, to 4x for the 3-month maximum lock-up. Following the principle of allowing the DAO to configure settings, these configurations will be made available for the DAOs to modify so the lockup time could be further increased with a greater weight multiplier.

### Controlled Budget Allocation
 Aside from the general DAO improvements, the deployment of the DAOs in Alien Worlds had some extra considerations. Each planet had been accumulating large treasuries of tokens, via the mining game, that was to be utilised by each planetary DAO for whatever purpose they could come to a consensus on once the DAOs launched. Over the many months of mining these treasuries now held up to 30 million tokens each. Once again we didn’t know how the community would behave when it comes to governing the DAOs and the available treasuries, so we cautiously, hoped for the best but prepared for the worst. We decided to launch slowly and would gradually release full governing capabilities to the DAOs, allowing time for cultures to establish. After all, this is meant to be a gaming metaverse and should be enjoyable for participants as the first priority while transitioning towards full decentralisation over time. We added safety measures including:
Gradually releasing the treasury to the DAOs each election at a rate of 2% of the planet treasury each election period. Since the DAOs had accumulated up to 30 million tokens each, releasing full access to such a large amount of tokens very early in the lifetime of each DAO, as they were still establishing a culture and vision would have been a great risk.

### Gradual configuration Handover 
DAO settings were restricted from being modified by the DAOs until the culture and understanding of governance by the community has time to mature. Over time the intention is to gradually release the controls to the community as we see more positive signals about them self-governing successfully. We chose sensible initial settings for all of the 6 DAOs including:
5 elected custodians per planet
2 votes per token (less than 50% to reduce the impact of whales voting their chosen candidates in to hold a balance of power)
7 day election cycles.
