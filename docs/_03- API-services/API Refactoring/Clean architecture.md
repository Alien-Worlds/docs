# Few words about Clean Architecture

With (sort of) **Clean Architecture** which is basically **Onion Architecture** with annotations described by mister Robert C. Martin aka Uncle Bob. It is important to understand that clean architecture is a bundle of organising principles. So therefore everything is open to personal adjustments as long as core ideas are kept intact.(nice sentence taken from the internet)

Architecture means the overall design of a project and it includes aspects such as:

*   organization of code into classes, functions, modules
*   sets the boundaries/ responsibilities - how all these code groups are related to each other
*   what is the file structure
*   where the application performs its basic functionality
*   how this functionality interacts with external elements such as the database, frameworks, UI or other services
*   and of course testable

Now we know that Clean Architecture stands for organizing a project to be understandable and easy to change as the project grows. Later I will post some links about Clean Architecture but for now, let's look at what components we could use in our services so that our colleagues would not break their necks (not sure if it make sense in english) while reading the code.

  

**Router**

Routing refers to determining how an application responds to a client request to a particular endpoint, which is a specific path and HTTP request method (GET, POST, PUT and DELETE).

Router is a mini module/gateway which role is to handle client requests and forward it to appropriate controller. When defining a route in router you need these basic elements: the path, the method, and a handler. It is good to have some optional parameters to define rules, hooks or error handling.

  

**Controller**

The controller is where the fun begins. It is the role of the controller to convert the given information into a format which is most convenient to get the job done. It may have some simple if-then-else or parser logic but we do not want to have any processing logic inside the controller. For that we need something like use cases which controller calls in a fixed order to retrieve expected data and pass it to the response.

  

**Use Case**

Use case orchestrate the flow of data to and from the entities, and direct those entities to use their Critical Business Rules to achieve the goals of the use case. It could be a class with method named like execute or run. It could be also just a function, but important is that use case should return either expected result or failure object. You may know that from Command pattern.

  

**Entity**

Entity can be a simple data structure object that consists of some properties or an object which wraps some business rules as methods over critical business data or properties.

  

**Service**

When entities are simple data objects, services are taking the role of corresponding with third party components / data-sources like database. Services are also useful when putting the logic on a particular entity would break encapsulation and require the entity to know about its surroundings.

  

**Repository**

The idea of repository is to abstract database implementation by defining interaction with it by the interface. You need to be able to use this interface for any database client and that means that it should be free of any implementation details of any database. However, the repository can also be an object that not only separates the data layer from the rest of the application, but can also take over the tasks of mapping input and output data so that the role of the service is to operate only on raw data.

  

**Types**

In our environment, apart from the above-mentioned components, we should remember about one quite important and at the same time obvious point, which is the use of **Types**. Just to be sure, in more complex micro-services, using purely JS may be troublesome due to the lack of types (not including _any_)

  

#### **Ok, now let's think about the pros and cons of writing code this way****_(kinda)_****.**

For some, such a structure unnecessarily complicates something that's supposed to be simple, single-task. The fact that a micro service has one specific task does not mean that the mechanisms needed to perform it are also simple. The use of fixed patterns allows the complexity to be broken down into several smaller elements that can (if well designed) be modified without much interference with the rest of the code. Testing also becomes easier, or at least more structured.

Ok, you will say that instead of all this, you will write a normal function that does the same and you can test it separately and modify its logic without interfering with the rest of the code. This is not exactly how it works. Some functions need to be given an appropriate role. Functions as small parts of the code can be utils, child functions enabling the execution of the task of the parent function, they may also be stages of a pipeline and so on. By not assigning a specific role to functions, it is hard to figure out whether a given function plays an important role or is it just a helper. You shouldn't always read its code to understand its purpose.

My point is that an ordinary function can be turned into a command - one of the patterns :) - a simple thing that gives the function a role and imposes a specific structure in the code. Such a function is not a normal function any more. The commands can be compared to the use cases used in Clean Architecture. Following this path, using a specific file structure will make any programmer familiar with the established standards, will know where to look for specific pieces of code, e.g. command functions.

Ok, I've already talked about the functions, and what about the rest, why do we need some repositories, different data source if we can have everything in one place in the service. You're right, if the service is really simple, maybe there is no need to add additional layers of abstraction, but ... you can use the repository pattern and create an interface in which you will have specific methods, such that will not change regardless of which site you use. Some kind of contract. Thanks to this your code will be more reliable and components independent. Example from real life, you change the database client, let the API be a little different and you have to fly around the code and adapt it to the new one.

Ok next... you may ask why we need a controller if we can call the service directly in the function assigned to the path (router) and perform parsing, validations, etc. Or better... How about doing everything directly in this function? Well, the answer is clear ... too many tasks in one place, you just don't do that, even if you have a hooks in which you can do data validation or parse to the required format on the response. It's always better to have code that is separate - read easily exchangeable - from the API.

Well... easily replaceable, you can think why I should replace something if everything works. However, a simple thought comes to mind that we can be sure that we cannot be sure of anything(oh that's deep) Requirements may change, the package may stop working with a new version of the

NodeJS or simply we want to refactor the code. Clever separation of individual parts of the application will help maintain its stability and transparency, and will also improve its further development. If it is propagated and implemented in different projects of the same company, almost automatically and without problems, each developer can switch to another project - especially in times when we like having squads, special task forces, etc.

Finally, I will repeat that there are quite a lot of variations of architectures or patterns and it does not only limit the design of the code. What I presented is a simplified form that can be used in more or less complex micro services. And as I wrote before, the key is to choose a pattern and stick to it.

Thank you very much for reading this - or scrolling to the end

What is your opinion?

  

Ah yes... I almost forgot... some links:

[https://refactoring.guru/design-patterns](https://refactoring.guru/design-patterns)

[https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

[https://softwareengineering.stackexchange.com/questions/371966/is-clean-architecture-by-bob-martin-a-rule-of-thumb-for-all-architectures-or-i](https://softwareengineering.stackexchange.com/questions/371966/is-clean-architecture-by-bob-martin-a-rule-of-thumb-for-all-architectures-or-i)

[https://pusher.com/tutorials/clean-architecture-introduction](https://pusher.com/tutorials/clean-architecture-introduction)

[https://www.freecodecamp.org/news/a-typescript-stab-at-clean-architecture-b51fbb16a304/](https://www.freecodecamp.org/news/a-typescript-stab-at-clean-architecture-b51fbb16a304/)

[https://www.codeguru.com/csharp/csharp/cs\_misc/designtechniques/understanding-onion-architecture.html#:~:text=Onion%20Architecture%](https://www.codeguru.com/csharp/csharp/cs_misc/designtechniques/understanding-onion-architecture.html#:~:text=Onion%20Architecture%)20is%20comprised%20of,on%20the%20actual%20domain%20models.

[https://martinfowler.com/articles/injection.html](https://martinfowler.com/articles/injection.html)

[https://github.com/labs42io/clean-code-typescript](https://github.com/labs42io/clean-code-typescript)

[https://github.com/microsoft/tsyringe](https://github.com/microsoft/tsyringe)
