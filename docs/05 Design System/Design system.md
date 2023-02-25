# Design System

UI components should be reusable throughout the Alien Worlds metaverse and each component consists of a combination of deconstructable components that eventually break down into reusable atomic units that can no longer be deconstructed (eg. colours, fonts and image assets). A further aspect of the atoms is how they are described and defined so they can be effectively re-used, maintained and be easily translated to the development team without ambiguity throughout the Alien Worlds metaverse. This is the design system.

  

_\*\*_**_Disclaimer_**_: All these ideas are coming from a developer's perspective as gathered through experience as a mobile developer. These should be seen as starting points for conversations between developers, designers and product owners as we work towards an agreed system that is sustainable and useful for all involved stakeholders._

Requirements
============

Semantic Colours
----------------

Colours should describe their purpose rather than how they look. eg. `PrimaryHighlight` is preferred over `BrightRed`. This facilitates selecting the use of colours based on each functional use case and makes it much easier to change the colour palate later with confidence that the naming of colours will still make sense.

  

Limit the variations of colours and fonts
-----------------------------------------

Having too many colours and fonts could create inconsistency in the UI and make it difficult for multiple component designers to know when to select specific fonts and colours for different use cases. In addition, too many colours and font variations will increase complexity when trying to translate the designs to development reliably.

  

Measurements
------------

Measurements of components and gaps between each component should be clearly thought out and defined in such a way that UI developers can adapt a design into code without ambiguity and needing to code in "Magic number" exceptions into composed UIs. Details of the system should be agreed upon and aligned between the designers and dev team so the system can be maintained from both sides reliably. The UI should follow a common measurement system to allow for reliable scaling keeping consistent proportions between components.

  

Library structure
-----------------

Components should be thoughtfully grouped together into libraries that facilitate maintainability, modularisation, discoverability and a pragmatic amount of customizability in UI modules. This is a very hard balance to get right for any single team so should be developed and iterated upon as a collaborative effort between the designers and developers.

  

Design tooling
==============

*   Should facilitate the sharing of designs and brainstorming of ideas.
*   Collaboration and communication between designers and product stakeholders should be easy so product prototypes can be thoroughly explored and understood **before** front-end developers start coding the solution.
*   There should be one source of "truth" and a robust versioning system available to ensure there is no ambiguity about the "correct" version to use.
*   Collections of components should be structured into libraries following [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) principles from software development. Getting it wrong here will lead to poorly structured code down the pipe.
*   Design artifacts should be able to be conveniently handed off to developers on various platforms (web presently but possibly mobile in the future) without minimal manual entry of values for developers. Ideally, it should be possible to change styling in the design tools and have those changes propagated through to the published UI without developers needing to code any design changes by hand.
*   Permissioned access to designs to be customisable, both for editing and viewing. The tool should make it possible to keep incomplete designs hidden and share selected libraries within the team or for public consumption with the wider community.

Tooling
=======

Tools to explore and assess

*   *   [Figma](https://www.figma.com/) - Includes points above plus allows plugin extensions for more
    *   [Sketch](https://www.sketch.com/) - Includes points above plus allows plugin extensions for more
    *   [Adobe Creative Cloud](https://www.adobe.com/uk/creativecloud.html) - Integrated suite for design and asset sharing
    *   [Storybook](https://storybook.js.org/) - Developer focused tool for isolated component development
    *   [Bit.dev](https://bit.dev/) - Team focused tool to for isolated component development and management.
