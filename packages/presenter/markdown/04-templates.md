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
                    "many": true,
                }
            ]
        },
    ]
}
```

<!-- @Prompt -->
So, if Brodie were setting up `Gears` for *Bird Girl Season 3*, he'd declare a template called an `Asset`. He'd say an Asset must consist of a Preview folder, which can contain images or video files. He'd say it must have a Harmony folder, consisting of harmony files, and he'd declare a couple of data types, say `Priority`, `Episode`.

<!-- @Section clear -->

## Hypothetical Scene Configuration

```json
{
    "name": "Scene",
    "type": "template",
    "data": {
        "status": {
            "type": "union",
            "values": ["low", "medium", "high"]
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
                    "many": true,
                }
            ]
        }
    ]
}
```

<!-- @Prompt -->
Then he might clone that `Asset` template, and call it a `Scene`, and then he'd add a data type to it called `Frame Count`.

<!-- @Section clear -->