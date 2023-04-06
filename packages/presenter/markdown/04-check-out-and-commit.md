<!-- @CenterHeader clear skip -->
# CHECK OUT AND COMMIT

<!-- @Section clear -->

## Hypothetical Project

- Happy Fun Time `brodie-project`
    - *gears.json*
    - Legal
        - *...cease-and-desist.pdf*
    - Ideas
        - *...loose*
    - Reviews 
        - Pinocchio `review`
        - Frozen `review`
        - Frozen 2 `review`
        - Frozen 3 `review`
        - Frozen: The Reckoning `review`

<!-- @Prompt -->
Unlike DropBox, where files are constantly being synced in real time, Gears has a model that's very familiar to software version control, such as git.

Let's look at a hypothetical project called "Happy Fun Time" that uses the `brodie-project` template. Happy Fun Time is a youtube series where Chris Brodie reviews Disney films. 

<!-- @Prompt -->
The `brodie-project` consists of a Legal folder, which contains .pdfs detailing cease and desists notices that have been sent to him about his work, an Ideas folder, which is loose, and the structure is not validated, where he keeps musings, drawings or mood boards about future episodes. Of course folders like this are not good in theory, but in practice they are *going* to happen, so it's best to prepare for their eventuality before hand.

<!-- @Section -->

- Frozen: The Reckoning `review`
    - *gears.json*
    - Frozen: The Reckoning.prproj
    - Frozen: The Reckoning.mov
    - Assets 
        - *...video, audio, images*

<!-- @Prompt -->
Each review consists of a Premiere project that has the same name as the review, a .mov file that has the same name as the review, and an assets folder that contains video, audio and images that the premiere project uses. Fairly simple project.

<!-- @Prompt -->
Now, Brodie is a busy man. He might create the `review` folder instances, and populate the asset folder instances, but he's not going to do all the editing himself. So he'll give Kyle access to the project. Not the *whole* project, because he doesn't want kyle to see all the cease and desist notices he's been getting or steal his ideas, just individual review instances.

<!-- @Prompt -->
So, with this access in his Gears app, Kyle would see all of the review instances that he has access to, and he could pull them all down to his local machine. Then, Kyle would *check out* instances that he's going to make changes to, say "Frozen: The Reckoning". Only one user can check out a given an instance at once. Anyone who has access to instances can pull changes to them, but only a user who has an instance checked out can push changes up. 

<!-- @Prompt -->
Now, say Kyle goes and makes changes to the reckoning. He changes the premiere project, and creates an .mov out of it. Say he doesn't get the name of the .mov right, or he adds some music assets and doesn't put them in the asset folder. When he tries to push assets up, Gears wouldn't let him. It will warn him that the current structure of the review instance does not match what is specified by the review template, and that a new version cannot be pushed up until these changes are rectified.

<!-- @Prompt -->
Then, he fixes those problems and pushes his changes up and release his checkout. He would be able to specify weather he's made a major version change, or a minor version change. This way, versions are not bound to individual files, but template instances as a whole. Gears would allow you to sync different versions to your local system. And since all the gigantic files aren't going to change with every version, this syncing would be quick.

<!-- @Prompt -->
So, you can imagine how this model solves many problems at once: 
- Traffic; Data is only transferred when it needs to be.
- Organization; The degree by which folders become disorganized over time is greatly reduced. I imagine there will still be junk folders in every project, but at least that's where mess will be localized to.
- Archiving; Archiving is no longer a thing. The only difference between an archived project and a production project is that an archive project will not have anyone with permissions to make changes.
- Versioning; no more incrementing files with the v### syntax. Versions for project folders and their exports are permanently tightly coupled.
- Accidental Deletion; If one deletes a folder and tries to push it up, Gears will say "No, that is not allowed."
- Permissions; Rather than having to create a root folder for each user, users can be given access to only the instances that apply to them.

<!-- @Prompt -->
Now, there is another layer to this. The `brodie-project` is an instance itself, and has it's own versions. The `review` instances create a boundary for files to be associated with the "Happy Fun Time" project. Once Kyle has created new versions for the reviews he's working on, Brodie could then check out the "Happy Fun Time", pull down Kyle's changes, and then push up a new version of "Happy Fun Time". So, in addition to having snapshots of each Review in their individual states, you have snapshots of the project as a whole.

<!-- @Prompt -->
Let's consider how this might affect say, `Jam Van`. The current work flow is for animators to download .zip files from Gears, unzip them, make changes, create video files, upload new video files to gears, mark them as "ready for editor". The editor then has to download these video files, add them to the current edit, press a button on Gears, blah blah blah. 

<!-- @Section clear -->
- Jam Van `project`
    - Design
        - Grumpy GPS Happy Mouthchart `asset`
        - Guitar Wall `asset`
        - ...
    - Animation
        - JV101 `episode`
            - Scenes 
                - JV101_sq01_sc01 `scene`
                - JV101_sq01_sc01a `scene`
                - ...
            - *JV101.prproj*
    - Production
        - *deal-memo.pdf*
        - ...

<!-- @Prompt -->
Within Gears, inside the `episode` template instance, there is a sub folder with scenes. Animators would check out and push up changes to `scene` instances, and editors would check out and push up changes to `episode` instances. Since `scene` are nested in episodes, an Editor could pull down `scene` version changes one at a time, make their changes in premiere, and then push up a new `episode` version. This round trip simplifies things significantly from the current workflow.

<!-- @Prompt -->
Now, this is an intuitive workflow that keeps things organized, but how does it help producers? Producers wouldn't be syncing files to their system, so how does this let them track progress of assets and animators as a whole?