

# Few words about our APIs

It seems very complicated at first, but it is not that bad. The problem is the lack of documentation, used style, tools, etc. and our mission is to change that: standardize and develop.

  

Let's start with the fact that both the alien-worlds API and eosdac API code contain components that can be divided into two groups "API" and "tools for extracting data from the blockchain and saving them in the database".

  

The API code can be found in the **_api_** or **_api-handlers_** directory, depending on the repository and branch you are looking in, you will find a new or old version of the code. In the future, we want to separate the API from these tools in every repository.

  

In both repositories we use the docker and all API and the rest of the processes are run together, even though they are not directly related to each other

  

API
---

  

API is obvious. The frontend part communicates with the database and other third-party sources through requests sent to routes provided by our API.

The API code is based on the [Fastify framework](https://www.fastify.io/), but at the time of writing these words, we have already taken the first steps to separate the logic from the framework.

  

Most of the APIs are written in JS and we rewrite them to TypeScript but you will find API written in other languages like GoLang used in missions-api.

  

For instructions on how to run the api data, please read [Readme.md](http://Readme.md). It may seem strange but at first you must follow all the steps described there in order to have all the necessary files and be able to create a complete image. We use the watch option (by default - but we gonna make it optional) in the API written in TS, so each change in the code will refresh the image.

  

Feel free to check the code and read the API / Services documentation to have a better picture of what's going on. Do not hesitate to ask questions.

  

History Tools
-------------

  

With **history tools** (this is how we will call the second group) its a bit different story. Of course just like API it was written in JS and we rewrote it to TypeScript with an emphasis on using specific types avoiding **_any_** like fire.

  

These tools include the following processes: **_filler_**, **_block-range_** and **_processor_**.

They are all run simultaneously in the container and each of these processes (let's call them **_programs_**) has its own options that we define in environment variables or directly in call commands. These options may be slightly different in other repositories.

  

### Filler

  

Depending on the options, the task of the filler is to prepare a list (in the form of amq jobs/messages or entries in the database) of sub-ranges of the selected block range grouped sequentially. We do this in order to improve and easily resume scanning data from the blockchain. For example, if we want to retrieve a month of history, the processing of this data will take a long time and in order not to start over at each error, it is easier and more efficient to start from the smaller currently analyzed sub-range.

  

Filler (still) has a code that is almost identical to the block range program, which is executed if we do not want to parse a specific slice of the history data, but we want to run it from a specific point (block) to the last unchangeable block.

  

Options:

  

*   **start-block**: Start at this block
*   **end-block**: end block (exclusive)
*   **replay**: Force replay (ignore head block). This option will populate a blockrange queue (must specify start block too)
*   **scan-key**: used with replay mode to set unique ID for your scan task
*   **test**: Test mode, specify a single block to pull and process

  

### Block range

  

Block range is a process that is also used in the filler process. It has been specially separated in order to use more threads and easy to dispose of them. In the alien worlds repository, block range process searches / waits for the block range scan entries in the database. Each of the specified number of threads takes one of the entries and runs a state history plugin that retrieves data from a given sub-range block by block. After completing the work on the current sub-range, another unscanned/available sub-range is downloaded and so on until the end, i.e. until all scan entries of the selected block-range are deleted.

  

The Block range program retrieves data for each block in the selected range. Depending on the type of data contained in this block, it creates subsequent tasks (in the form of AMQ events, database entries) that will be taken over by the processor program.

  

The alien worlds block range depends on the Filler program, in case there are no entries for the selected range. Block range will close all threads and end the program.

  

### Processor

  

Processor, as the name suggests, deals with data parsing. After appropriate processing, the results are saved in the appropriate form / collections in the database.

  

The processor program is basically amq event listeners. Each event or entry contains data that needs to be deserialized and is then transformed accordingly. There are many hard-coded conditions here that still need to be analyzed whether they are sufficient (or not) or redundant.

  

The result of the work of this program are entries in the database collections: nfts, mines, atomic transfers etc.

Based on this data, we perform operations on requests sent to the API.
