<!-- @CenterHeader clear skip -->
# TASKS

<!-- @Prompt -->
So, in the current version of the Asset Manager, tracking is difficult because there's not really a record of the work that has been done to an asset. There's a record of who was assigned to an asset and what stage it was in through it's various versions, but it's not very easy to get a picture of the progress being made by an artist, or a way to describe their current workload.

<!-- @Section clear -->

- Happy Fun Time `brodie-project`
    - *gears.json*
    - Legal
        - *...cease-and-desist.pdf*
    - Ideas
        - *...loose*
    - Reviews 
        - Frozen `review`
        - Frozen 2 `review`
        - Frozen 3 `review`
        - Pinocchio `review`
        - Frozen: The Reckoning `review`

<!-- @Prompt -->
In our previous example, Kyle was given access to a Brodie's review instances, and he went ahead and checked them out.

An editor with sufficient permissions could do this, but more commonly, a *Task* would would have to be issued for an artist or remote worker to be able to check something out. 

<!-- @Section clear -->

## Anatomy of a Task

- Assigner -> User
- Assignee -> User
- Description
- Target -> Template Instance
- Timeline -> [ Date, Date ]
- Difficulty -> Number
- Priority -> [ "Low", "Medium", "High", "Urgent" ]
- Status
    - Pending
    - Submitted
    - Approved
    - Rejected

<!-- @Prompt -->
Tasks are a separate data structure that Gears tracks than Template instances. They're not configurable, but they don't have to be. A task has data that you'll recognize from the Asset Manager.

<!-- @Prompt -->
- A task has an assigner, which for Happy Fun Time would be Brodie.
- A task has an assignee, Kyle.
- A task has a description, such as "Edit Frozen: The Reckoning" or "Prepare JamVan Seq01Sc01 Posing"
- Timeline, which is simply the date it was issued versus the date it's due.
- Difficulty, which is an indicator or a point value for how difficult a task is expected to be. It defaults to the number of days between the start and end date of a task. So, if Brodie issues a task on monday and it's due friday, it has a difficulty of 5.
- A priority and a status. Tasks can bounce between submitted and rejected for a while until they're approved. Once approved, the target instance would typically not be able to be checked out by the assignee, unless they have advanced permissions.

<!-- @Prompt -->
Unlike the current asset manager, task related data persists between assignments. So, if an artists is assigned multiple tasks for an Asset, taking it through it's various stages, that data persists. This makes tracking a whole heck of a lot easier.

<!-- @Prompt -->
Tasks are also versioned 

<!-- @Prompt -->
Producers wouldn't be syncing much files to their system, save for say templates related to production. Producers would use the Gears app to visualize data related to tasks and instances, much like the current Asset Manager.
