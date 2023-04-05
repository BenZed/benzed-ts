<!-- @CenterHeader clear skip -->
# TEMPLATES

<!-- @Prompt -->
Templates. A Template is essentially a blue print for a folder. A 

<!-- @Section clear -->

## Hypothetical Asset Folder

**JV101_sq14_sc02**
- *gears.json*
- **Previews**
    - *jv101_sq14_sc02.mov*
    - *jv101_sq15_sc02.png*
- **Harmony**
    - `...nested sub folder of harmony assets...`

<!-- @Prompt -->
When we imagine an asset as it exists on the Asset Manager right now, we can also describe the exact same thing with a folder.

<!-- @Prompt -->
Looking at good old *JV101_sq14_sc02* over here, what does it consist of? 
- A harmony folder, *NOT* a .zip.
- A preview folder, with a couple of previews inside, a video, an image.
- A *gears.json* file, which every template has. The *gears.json* file would contain any data that doesn't fit into a file by itself: `Priority`, `Episode`, etcetera.

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
So, if Brodie were setting up `Gears` for *Bird Girl Season 3*, he'd ask Ben to create a template called an `Asset`. An Asset must consist of a Preview folder, which can contain images or video files. An asset must have a Harmony folder, consisting of harmony files. We're not going to go and validate the entire harmony file structure, so he'd just say declare the folder as loose, meaning it'll take anything. He'd declare a couple of data types, say `Priority`, `Episode`.

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
Templates can be nested. Currently, in the Asset Manager, a project is a specific data structure, and asset is another. In Gears, jam-van would be a folder structure, with a `project` template. 

<!-- @Prompt -->
A project would consist, say, of a design folder, which contains only `asset` instances. Then an Animation folder, consisting of `episode` instances. An `episode` would a template that consist of a Scenes folder, full of `scene` instances and a premiere project file.

<!-- @Prompt -->
A project might have some arbitrary meta data associated with it, such as `job-code`, or `end-date`, or `client`, or what have you.

<!-- @Prompt -->
A project might have a Production folder that doesn't contain any assets or scenes or sub templates of any kind, but only contains deal memos or producer related files.

<!-- @Prompt -->
So, all this sounds pretty intuitive, but how would Gears go about keeping something like `Jam Van` organized any better than Drop Box? How would Producers and Animators interact with template instances?