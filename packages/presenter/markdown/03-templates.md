<!-- @CenterHeader clear skip -->
# TEMPLATES

<!-- @Prompt -->
Templates. A Template is essentially a blue print for a folder.

<!-- @Gears clear -->
```json
[
    { 
        "endpoint": "file-browser"
    },
    {
        "name": "JV101_sq14_sc02",
        "type": "folder",
        "contents": [
            {
                "type": "folder",
                "name": "Harmony",
                "open": false,
                "contents": []
            },
            {
                "type": "folder",
                "name": "Previews",
                "contents": [
                    {
                        "name": "image",
                        "type": "file",
                        "ext": "png"
                    },
                    {
                        "name": "video",
                        "type": "file",
                        "ext": "mov"
                    }
                ]
            },
            {
                "type": "file",
                "name": "gears",
                "ext": "json"
            }
        ]
    }
]
```
<!-- @Prompt -->
When we imagine an asset as it exists on the Asset Manager right now, we can also describe the exact same thing with a folder.

<!-- @Prompt -->
Looking at good old *JV101_sq14_sc02* over here, if it were a folder on the file system instead of an entry on the asset manager, what would it consist of? 
- A harmony folder, *NOT* a .zip.
- A preview folder, with a couple of previews inside, a video, an image.
- A *gears.json* file, which would contain any data that doesn't fit into a file by itself: `Priority`, `Episode`, etcetera.

<!-- @Section clear -->

## Hypothetical Asset Configuration

```json
{
    "name": "Asset",
    "type": "template",
    "data": {
        "status": {
            "type": "union",
            "values": ["low", "medium", "high"]
        },
        "episode": {
            "type": "string"
        }
    },
    "structure": [
        {
            "name": "Previews",
            "type": "folder",
            "structure": [
                {
                    "many": true,
                    "type": [".mov", ".png", ".jpeg", ".jpg", ".mpeg", ".m4v"]
                }
            ]
        },
        {
            "name": "Harmony",
            "type": "folder",
            "structure": [
                {
                    "loose": true,
                }
            ]
        },
    ]
}
```

<!-- @Prompt -->

So, if Brodie were setting up `Gears` for *Bird Girl Season 3*, he'd ask Ben to create a template called an `Asset`. An Asset must consist of a Preview folder, which can contain images or video files. An asset must have a Harmony folder, consisting of harmony files. He'd declare a couple of data types, say `Priority`, `Episode`.

<!-- @Section clear -->

## Hypothetical Scene Configuration

```json
{
    "name": "Scene",
    "type": "template",
    "data": {
        "status": {
            "type": "union",
            "values": [ "low", "medium", "high" ]
        },
        "episode": {
            "type": "string"
        },
        "frame-count": {
            "type": "number",
            "min": 0
        }
    },
    "structure": [
        {
            "name": "Previews",
            "type": "folder",
            "structure": [
                {
                    "many": true,
                    "type": [".mov", ".png", ".jpeg", ".jpg", ".mpeg", ".m4v"]
                }
            ]
        },
        {
            "name": "Harmony",
            "type": "folder",
            "structure": [
                {
                    "loose": true,
                }
            ]
        }
    ]
}
```

<!-- @Prompt -->
Then he might clone that `Asset` template, and call it a `Scene`, and then he'd add a data type to it called `Frame Count`.

With these template schematics, you can imagine how you could define a number of different structures that would apply to different projects. 

<!-- @Section clear -->

```json
{
    "name": "Character",
    "type": "template",
    "data": {
        "quality": {
            "type": "union",
            "values": [ "low", "medium", "high" ]
        }
    },
    "structure": [
        {
            "name": "walk-cycle",
            "type": [".mov"]
        },
        {
            "name": "Spine",
            "type": "folder",
            "structure": [
                {
                    "loose": true,
                }
            ]
        }
    ]
}
```

<!-- @Prompt -->
For example, if Gears were being used for Scribbles and Ink Season 3, instead of an Asset or a Scene, you might have a Character. A character might have a Spine subfolder, with where the Spine animation files would be held, and it might have a walk-cycle.mov that gears would use as a preview, and it might have a "quality" entry in the gears.json to delineate weather this was a rig for high quality or low quality builds.

<!-- @Prompt -->
The idea is that defining a template for a structure related to a unit of work encapsulates all of the information needed about that structure for use elsewhere, in a format that is more or less universally accessible.

<!-- @Prompt -->
One would have all of the files related to a template instance on their hard drive, and the Gears app would visualize the asset online very similar to how it's visualized now on the Asset Manager.

<!-- @Section clear -->

# Nesting

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
Templates can be nested. Currently, in the Asset Manager, a project is a specific data structure, and asset is another. In Gears, all structures would be the same thing. They'd be templates, and some templates would be configured to contain instances of other templates.

<!-- @Prompt -->
A project would consist, say, of a design folder, which contains only `asset` instances. Then an Animation folder, consisting of `episode` instances. An `episode` would a template that consist of a Scenes folder, full of `scene` instances and a premiere project file.

<!-- @Prompt -->
A project, which is the equivalent of a root folder on drop box might have some arbitrary meta data associated with it, such as `job-code`, or `end-date`, or `client`, or what have you.

<!-- @Prompt -->
A project might have a Production folder that doesn't contain any assets or scenes or sub templates of any kind, but only contains deal memos or producer related files.

<!-- @Prompt -->
So, all this sounds pretty intuitive, but how would Gears go about keeping something like `Jam Van` organized any better than Drop Box? How would Editors and Animators interact with template instances?