<!-- @CenterHeader clear skip -->
# Current State

<!-- @Prompt -->
See, I was attempting to build Gears in a manner I thought would look fantastic on a resume.

<!-- @Prompt -->
Other than Scribbles and Ink, of which are code bases I am not proud of, and the current Asset Manager, which is a code base that I am not proud of, I have very little to show for this 11 years of experience that I allegedly have. 

One of my packages on GitHub has 150 stars, that’s about it.

<!-- @Prompt -->
I really wanted to leave you with something that works for you, because I know what your needs are, and I think the model that I've just presented would suit fantastically. 

But also, the fact that I had built software that an animation company was currently using to run their pipeline? That’s going to look fantastic on a resume. 

Also, the possibility of it being an enterprise piece of software? I’m highly incentivized.

<!-- @Prompt -->
But, if it is going to be an enterprise level piece of software, the code can’t be public, so I can’t use it for a resume. 

However, on the other side, if this doesn't end up being an enterprise piece of software, and it's only used at Global Mechanic, I need stuff that will demonstrate my efficacy as a developer, because you wouldn't need me very much. 

I’m sure there will be feature changes over time, change this, bug here, color there, etc, but it wouldn't have been a full time job, I’d need to work elsewhere.

<!-- @Section clear -->

# @benzed-ts public modules:
- **app** *ecs for building client and server application routing and commands*
- **array** *utility and convenience methods for working with arrays*
- **async** *Promise and async related utilities and classes*
- **file-service** *file upload/download/queueing/model/preview management and authentication for the file system and aws*
- **fs** *file system utilities*
- **history-scribe** *data version history tracking and management*
- **immutable** *traits, methods and utilities for dealing with immutable data*
- **is** *fluent and composable data validation and type guard library*
- **logger** *logging utility*
- **math** *extended and overridden math functions and utilities*
- **node** *relational data structure traits and classes*
- **pipe** *method chaining data structure*
- **renderer** *ffmpeg renderer and queue*
- **schema** *abstract typesafe structural immutable data validation classes*
- **signature-parser** *utility for providing methods with diverse signatures*
- **string** *utility and convenience methods for working with strings*
- **traits** *Mixins that behave basically like runtime interfaces*
- **util** *miscellanous helper utilities, methods types and classes*

<!-- @Prompt -->
So, my plan then, was to write many of the public dependencies that gears would rely on. 

And when I say public dependencies, I mean for things like data validation, or a file server, or queuing asynchronous tasks, or rendering, or structuring server commands. All stuff that I'm capable of writing, and could use much of the thousands of lines of code I've written at GM as a reference to make.

Stuff that isn’t business sensitive, the kind of stuff you use public modules for. Instead of **express** or **feathers**, I'd use **@benzed/app**, instead of **zod**, I'd use **@benzed/is**. Instead of **immer** I'd use **@benzed/immutable**.

Also, if I’m the author of all of it’s dependencies, then they’d be maintained as well, and keeping gears updated along with major version bumps would be much much easier.

<!-- @Prompt -->
I have details of how these public modules work, they’re not well documented and currently they are still incomplete, but I have presentations about many of them and plans for more. I’ve linked these public dependencies in my resume, but I've found out the hard way, that it doesn't seem like job interviews look at your code. So, I've been creating presentations for them.

<!-- @Prompt -->
For one of my public modules: a data validation library that I’m proud of that demonstrates I know the type system extremely well and it’s extremely good for defining database models, objects, specific strings, complex arrays or tuples, etcetera. 

<!-- @Prompt -->
I had prepared a presentation about this library for an interview and they wouldn’t look at it. And then they proceeded to ask me a bunch of questions I didn’t have answers to. I’ve had quite a few interviews in the past four months and of course I have fantastic answers for the problems that I've solved at global mechanic, I’ve had many questions without good answers at all. 

For example, how I would manage a database with hundreds of millions of rows. Apparently "The same way I’d manage a database with 100 thousand rows" is not a good answer.

<!-- @Prompt -->
I now realize that if I were capable of creating Gears in the time allotted, I would have, because I didn't take a break. I didn't put any additional effort into any job search activity, because I felt that completing this project would be sufficient. 

I remember a couple of days into the Christmas Break, something went wrong. I can't even remember what, but I realized that "I am in trouble." Despite all of this effort, and continually being confident that I would have something to deliver, I was still *nowhere* close. All I was hoping to have done was the templating functionality, and that still only exists in theory.

<!-- @Prompt -->
Point is, after 5 or 6 failed interviews I had to accept the reality that perhaps if 5 different companies don’t consider me a senior developer, then perhaps I don’t have the experience of a senior developer. I am not NEARLY the hot shit that I thought was. Don't get me wrong: I'm not bad, but I'm not great. I'm above intermediate level at best, and I've come to since realize that the fact I believed I could pull off this project off all by myself was some pretty rookie shit.

<!-- @Prompt -->
So, coming to this realization shook my confidence quite a bit. For example, the outline I just presented to you; I think it's solid, but how would it have worked with Jam Van? That project alone was 10 Terabytes. It is organized pretty well, but what kinds of things that I'm unaware of could have gone wrong?

<!-- @Prompt -->
Despite that fact that I've been doing this so long, and have been very pro-active in my learning, from my perspective, the unknown unknowns killed me. I'm intermediate level, and nobody is hiring 38 year old intermediate level developers. I have had a lot of people look at me like I'm a fucking moron. I'm starting at the casino next week, I'm not joking.

<!-- @Prompt -->
So, my current plan is to slang cards while doing skills development and research. I've already done quite a bit of research in the past couple of months, and it's already influenced the plan for gears. I cut down on a lot of features that never had a hope in hell of being accomplished. 

<!-- @Prompt -->
For example, I was writing this extremely complex rendering functionality, where remote machines could log into gears and receive render tasks from the main server. `AWS` Lambda is way way WAY more superior, and much much much simpler to implement.

I had spun my wheels for... almost an entire month trying to plan a way for this to integrate with AWS S3 AND Drop Box, because I felt that would be a beneficial enterprise feature if it were going to be licensed by other companies. Terrible idea.

<!-- @Prompt -->
Anyway, as it stands, these public modules that Gears would depend on are incomplete. Your team could wait while I keep working on them, but progress has been extremely slow since January, so I imagine they'll probably want to fork them and make their own changes instead. 

They're not well documented, but I am more than happy to communicate with whoever you have replacing me and answer any questions they might have. I have to create documentation for them anyway, so it benefits me to do so.
