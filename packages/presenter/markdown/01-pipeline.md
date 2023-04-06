<!-- @CenterHeader clear skip -->
# PIPELINE

<!-- @Prompt -->
Okay, so, let's talk about the Global Mechanic pipeline.

<!-- @Section clear -->
# PIPELINE PROS
---

## Dropbox
- Real Time Syncing
- Version Tracking
- Scoped Sharing

<!-- @Prompt -->
There's dropbox. Dropbox is great.

- Real Time Syncing: Dropbox allows users to sync project folders. If one person changes a file, other consumers of that file are made aware of those changes.
- Version Tracking: Dropbox maintains a list of versions. If a breaking change is made, there are tools available that allow you to revert or recover previous versions.
- Scoped Sharing: Specific folders can be made visible to specific users.

<!-- @Section -->
---
## Asset Manager


- Working File
- Meta Data
    - Stage
    - Tags
    - Status
    - Comments
    - Assignments
    - Priority
    - Episode
- Previews

<!-- @Prompt -->
There's the Asset Manager. What we currently call Gears, but is really just the fourth version of the original Asset Manager built by DNS. It has improved a great deal since the first version.

- For an asset to exist, it needs to have a working file, for which versions are tracked. This working file can be anything; .psd file, image, a zipped harmony folder, whatever.
- The Asset Manager allows meta-data to be associated with a project. Episode, Stages and Statuses, configurable by project. Comments and tags can be added. We can see who an asset is assigned to, what priority is has, etcetera. 
- The Asset Manager allows for previews to be uploaded. Images or video. There's a secondary system that tracks all of these images and videos and compresses into web friendly formats so the animator doesn't have to.

<!-- @Prompt -->
Now, Global Mechanic gets along with these systems more or less fine, but there are problems that recur with every project that everyone is familiar with:

<!-- @Section clear -->
# PIPELINE CONS

---
# Dropbox

- Traffic Backups
- Accidental Deletions
- Scoped Sharing is Limited to Root Folders
- File Organization

<!-- @Prompt -->
Real time syncing of every file can lead to a lot of traffic. Very frequently we're stuck waiting for large files or large numbers of them to be uploaded or downloaded.
<!-- @Prompt -->
Related: How many times has a root folder gone missing that results in costly wait times or duplication of efforts?
<!-- @Prompt -->
In dropbox, unlike google drive, sharing a folder is limited to folders in the root directory, or at least it was the last time I checked. This makes things fundamentally much harder to organize.
<!-- @Prompt -->
On organization, a reoccurring problem is folder structure. As we've seen, coming up with a folder structure that applies to all projects doesn't really work. There will often be long meetings to establish a folder structure, which is fine in theory, but in practice it's very difficult to get everyone to remember to stick to them. Especially when we're bringing on remote workers. Every project incurs a great deal of temporal debt in the form of organizing and archiving projects, and this debt goes up with each project as opposed to down.

<!-- @Section -->

---
# Asset Manager
- Files are inherently rigid
- Meta Data is not universal
- Metrics and Tracking are severely underpowered
- Files are decoupled from their DropBox counterparts

<!-- @Prompt -->
In the Asset Manager, an asset is a single file. It can be a zip, sure, but this is inherently pretty rigid. To update the version of something, an entire zip folder needs to be uploaded. This makes for an unfriendly user experience.

<!-- @Prompt -->
You can have either an image preview or a video preview, which sounds like it should be sufficient, but what if the asset is a .pdf? What if the project is interactive? What if it's a 3D asset, and you want to provide multiple angles, or different variations? 

<!-- @Prompt -->
In the most recent version of the Asset Manager Meta data is much more configurable than previous versions, which is nice, but every time a new project comes along we discover deficiencies. Not every asset type has a Stage. Scenes might have frame counters, character rigs might not. The adaptability of the Asset Manager has increased with each iteration, but it is still not good enough.

<!-- @Prompt -->
Tracking is almost impossible. The Asset Manager has that CSV aggregating capability, but it pretty crude, and there is a lot of overhead placed on producers to sift through data manually.

<!-- @Prompt -->
Files related to an asset exist on the Asset Manager, and they also exist in part in dropbox. This separation of data is inherently disorganized, and adds to the temporal debt I spoke of when handling archiving. Imagine a newly hired producer down the line being tasked with going back and finding meta data that only exists on the Asset Manager related to a scene or an asset in dropbox. 

<!-- @Prompt -->
So, what kind of pipeline could one imagine - or, perhaps bang their head against the wall repeatedly - to address these problems?