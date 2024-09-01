# Soundscape


## Background

This project contains a **proof-of-concept JavaScript-library** for **audio-based user interface** to support the browser usage of 
**users with low vision**.

This project aims to **ease the usage** with the following approaches:
    
    - DOM Elements that are included in the Soundscape have their own configured audio played in 3D audiospace by taking their position on the web page into account and giving their sound source origin direction according to their position on the web page.

    - Mouse Pointer has its own sound on the 3D audiospace that updates its sound direction based on the mouse position on the page.

    - Elements included in the Soundscape that are pointed by the mouse pointer, have their audio playback speed increased to indicate the pointed element for the user.

    - Elements that are in the threshold space defined by their Y-coordinate on the page in relation to mouse pointer's Y-coordinate, have their audio volume increased to enable user to scan the page and better pinpoint its elements by moving mouse on Y-axis to find the level of the wanted element, which can then be located and navigated to with the information received through 3D audio direction

    - Elements' Y-coordinate value is further indicated by their audio volume


This project **does not aim to perform the functionalities of screen readers** or related software, but instead enable the developers of the websites to 
potentially increase the usability of the website 

by selecting the elements that they deem **important for the overall navigation or general scanning** of the page like:
    
    - Links
    - Buttons
    - Other interaction elements
    - Section Headers (To enable end-user to 'scan' the page headers without the need to sequentially scroll through them with screen reader)


The functionalities provided by this project aim to be **undisruptive for users that are using the graphic elements** of the browser with the following approaches:

    - Audio playback is initiated with keyboard combination 'Ctrl+s'. (No auto playback)

    - Processing is performed with JavaScript on the background and users need to explicitly activate the functionalities before the usage begins


The functionalities provided by this project aim to be **straigth-forward to deploy** to use with already largely used JavaScript APIs like: 

```shell
document.getElementById();
```


## Demo Deployment

**Make sure to use headphones**

1. Navigate to 'sound_source_api'

2. Install the contents of requirements.txt

3. Start the demo server with the command:

```shell
python3 demo_server.py
```

4. Open the browser in http://localhost:5000

5. Start the Soundscape with Ctrl+s

Currently the demo uses static predefined audio files. However by hosting an API that can be used to generate dynamic audio files with input from authenticated user,
Soundscape can also be used with dynamically generated content if the configured sound is either generated with the configured URL suffix or it is already existing before Soundscape fetches it.

## Software

Soundscape library found in 'sound_source_api/static/js/soundscape.js'

'Developer' usage demo found in 'sound_source_api/static/js/demo.js' and 'sound_source_api/static/index.html'


