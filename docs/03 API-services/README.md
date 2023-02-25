
# API and other Services

There are many services and scripts that have gradually appeared as required throughout the AW platform. They are either sharing data as API endpoints or pushing data/triggers, such as regular cron tasks triggering smart contract actions.

Some of these scripts are performing privileged actions so great care needs to be taken with the key management. The risks associated with sharing some keys outside of their primary use case of the scripts could be very destructive. WAX (or any other EOSIO) blockchain has a sophisticated hierarchical permissions system at the protocol level so this is not as much of a concern - as long as care is taken to ensure child authorities are used with minimal scope to cause harm by leaking the keys.

Over the next few months, these services should be migrated as much as possible to portable containers so they can be deployed easily onto various infrastructure platforms (including bare metal services or cloud in AWS). Secret key management will be easier in platforms like AWS since they natively provide secret management services that can be then injected into the services.

Some of the services should be replicated on multiple instances to provide fail-over redundancy or to provide horizontal scaling under load. periodic actions that trigger events on the blockchain should not be run in multiple instances as this will cause duplicate events hitting the blockchains (eg. Spaceship missions Utility ([https://share-docs.clickup.com/d/h/hfd6b-9788/49593a316fe4392/hfd6b-3888](https://share-docs.clickup.com/d/h/hfd6b-9788/49593a316fe4392/hfd6b-3888)) should not be run multiple concurrent times since this will create duplicate missions.)

Blockchain nodes may not be able to be containerised due to the high resource requirements of those services. In this case, they will remain as Bare Metal instances in dedicated data centres. Examples of these are WAX blockchain nodes and BSC blockchain nodes.

Whenever possible all services should include live monitoring and alerts to be captured in New Relic.