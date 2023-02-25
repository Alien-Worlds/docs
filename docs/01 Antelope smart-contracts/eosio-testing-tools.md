# EOSIO Testing Tools

## Lamington

After exploring a few ideas on how to create automated tests to verify the behaviour of EOSIO smart contracts it was pretty clear that mature and reliable tooling in this crucial area of software development was lacking with EOSIO.

Early explorations started with Bash calling into `cleos` . This was difficult to write tests in since Bash shell scripts do not have the same flexibility compared to languages like Ruby, JS/TS or Java.

Next, I tried writing Rspec tests that wrapped `cleos` commands but provided the testing structure of RSpec test cases (context nesting etc.). This was an improvement but was quite brittle to maintain and also
