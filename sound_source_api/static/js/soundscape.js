
class SoundScaper{
    constructor(rowThreshold){
        /* 
        Parameters:
            rowThreshold, Integer: Y-coordinate amount that is used to select the elements, whose audio volume is increased to indicate them being on the same Y-coordinate level.
                                    Decision is made with the following check: 
                                        If targetElement.y - rowThreshold <= mouse pointer's client Y-coordinate <= targetElement.y + rowThreshold
            
        Sets the provided and default configuration values 
        Starts the listener for Ctrl+s combination to start the soundscape

        Returns:
            -
        */
        this.listenForStartUp();
        this.serverURL = ""; //URL for sound API
        this.elements = []; //List of user provided elements
        this.mouseURL = "" //URL for sound of mouse from sound API
        this.soundscape = []; //List for created Audio/Panner elements
        this.mousePanner = undefined; //Panner element of mouse pointer
        this.rowThreshold = rowThreshold || 110;
    }

    listenForStartUp(){
        /*
        Parameters:
            -
        
        Starts the listener for keyboard initiation combination Ctrl+s
        Keyboard combination starts the main loop of the Soundscaper

        Returns:
            -
        */
        document.addEventListener("keydown", (event) => {
            event.preventDefault();
            if (event.ctrlKey && event.key == "s"){
                this.mainLoop();
            }
        })
    }

    mainLoop(){
        /*
        Parameters:
            -
        
        Main-loop that creates and plays the sound elements from configured elements and mouse pointer

        Returns:
            -

        */
        this.audioContext =  new window.AudioContext();
        const listener = this.audioContext.listener;
        const posX = window.innerWidth / 2;
        const posY = window.innerHeight / 2;
        const posZ = 300;
        listener.setPosition(posX, posY, posZ);
        this.initiateMouseFollow(this.mouseURL);
        this.setupSoundScape();
        this.audioContext.resume();
        for (const element of this.soundscape){
            element["audio"].play();
        }
        console.log(this.soundscape);
    }

    setTargetElements(listOfElements, mouse=""){
        /* 
        Parameters:
            listOfElements, Array[Object["element":Element, "sound":String]]: List of Element-objects to be soundscaped and their associated sound files
                                                                                sound -> Used like: this.serverURL+"/"+<sound>
            mouse, String: URL for the target sound of mouse pointer
    
        Sets the to be used DOM-elements and defines their associated sound to be fetched
        from backend and played on target elements XY-coordinate
    
        Returns:
            setElements, Array[Object["element":Element, "sound":String(URL for target sound)]]: Elements succesfully taken into use
        */
       this.elements = listOfElements;
       this.mouseURL = mouse;
       return this.elements
    }

    setServerURL(targetURL){
        /*
        Parameters: 
            targetURL, String: URL prefix to be used for fetching the sounds
        
        Configures the used backend

        Example: 
            http://localhost:8000 -> will be used with provided sounds like -> http://localhost:8000/<sound>
            http://localhost:8000/static -> will be used with provided sounds like -> http://localhost:8000/static/<sound>
    
        Returns:
            true, If succesfully set
        */
       this.serverURL = targetURL;
       return true;
    }

    createListener(){
        /*
        Parameters:
            -
        
        Creates a Listener-object with default centering

        Returns:
            Listener-object, preconfigured listening node for 3D audio
        */
        const listener = this.audioContext.listener;
        const posX = window.innerWidth / 2;
        const posY = window.innerHeight / 2;
        const posZ = 300;
        listener.positionX.value = posX;
        listener.positionY.value = posY;
        listener.positionZ.value = posZ;
        return listener;
    }

    setupSoundScape(){
        /*
        Parameters: 
            -
        
        Populates this.soundscape with {"audio":<audioelement>, "panner":<PannerNode>, "target_element":Element} received from this.setupSound() 
        for all configured sound in this.elements

        Returns:
            -
        */
        for (const soundInfo of this.elements){
            this.soundscape.push(this.setupSound(soundInfo));
        }
    }

    initiateMouseFollow(targetSound){
        /*
        Parameters:
            targetSound, String: Filename to be fetched for mouse sound
                                    Combined with this.serverURL -> this.serverURL+"/"+<targetSound>

        Sets up the mouse to be soundscaped with the provided soundfile.
        Sets this.mousePanner

        Sets mouse related functionalities like 
            - Mouse volume increase/decrease by mouse pointer's Y-coordinate value
            - Soundscape element volume increase if mouse pointer's Y-coordinate value is between the activation thresholds

        Returns:
            -
        */
        const mouseAudioElement = this.createAudioElement(`${this.serverURL}/${targetSound}`);
        this.mousePanner = this.createPannerNode(0, 0, mouseAudioElement);

        let mousePanner = this.mousePanner;

        function followMouse(e, soundscaper) {
            mousePanner.positionX.value = e.clientX ;
            mousePanner.innerCone = "15";
            mousePanner.outerCone = "30";
            mousePanner.positionY.value = e.clientY;
            
            //Mouse Audio Volume
            soundscaper.soundscape[0]["audio"].volume = soundscaper.getVolumeByCoordinate(e.screenY, 1);

            
            for (const conf of soundscaper.soundscape){
                const targetElement = conf["target_element"];
                const targetAudio = conf["audio"];
                if (targetElement == undefined){
                    continue
                }
                const boundingBox = targetElement.getBoundingClientRect();
                const targetY = boundingBox.y;
                
                const targetMinY = targetY - soundscaper.rowThreshold;
                const targetMaxY = targetY + soundscaper.rowThreshold;

                if (targetMinY <= e.clientY && e.clientY <= targetMaxY){
                    targetAudio.volume = 1;
                } else {
                    targetAudio.volume = soundscaper.getElementDefaultVolume(targetElement);
                }
            }
        }
        document.addEventListener("mousemove", (event) => {followMouse(event, this)});
        this.soundscape.push(
            {
                "audio":mouseAudioElement, 
                "panner":this.mousePanner
            });
    }

    setupSound(soundInfo){
        /*
        Parameters:
            soundInfo, Object: {"element":Element, "sound":String}: Configuration info that maps the new target element with the provided audio
                                                                        sound -> Used like: this.serverURL+"/"+<sound>

        Performs the following preparations for new Soundscape element:
            - Creates the AudioElement
            - Creates the PannerNode
            - Sets event listeners for mouseover and mouseout to handle the playback rate increase when the target element is pointed with mouse and decrease when mouse is not longer pointing at the element

        Returns:
            Object[
                "audio":AudioElement,       || Audio-element that has the configured soundfile
                "panner":PannerNode,        || Node that produces the 3D Audio effects of the audio in AudioElement
                "target_element":Element    || Target HTML Element whose coordinates are used when producing the 3D audio effect with the specified audio file
            ]
        */
        const targetElement = soundInfo.element;
        const targetFile = soundInfo.sound;
        let audioElement = this.createAudioElement(`${this.serverURL}/${targetFile}`);
        audioElement.volume = 0.5;
        const rect = targetElement.getBoundingClientRect();
        const panner = this.createPannerNode(rect.x, rect.y, audioElement);
        targetElement.addEventListener("mouseover", (event) => {
            audioElement.playbackRate = 2
        })
        targetElement.addEventListener("mouseout", (event) => {
            audioElement.playbackRate = 1
        })
        return {
            "audio":audioElement, 
            "panner":panner, 
            "target_element":targetElement
        };
    }

    addSound(soundInfo) {
        /* 
        Parameters:
            audioInfo, Object["element":Element, "sound":String]: Configuration info that maps the new target element with the provided audio
                                                                        sound -> Used like: this.serverURL+"/"+<sound>

        Sets up a new soundscape element to be included in the Soundscape 3D audiospace.
        Uses the provided sound from the server and uses the provided 'element' to define the XY-coordinates of the spatial sound.
        
        Returns:
            -
        */
        const preparedAudio = this.setupSound(soundInfo);
        preparedAudio["audio"].play();
        this.soundscape.push(preparedAudio);
    }

    removeSound(targetElement) {
        /* 
        Parameters:
            targetElement, Element: Target HTML Element to remove from Soundscape 3D audiospace

        Removes the element from Soundscape:
            - Stops the audio playback
            - Removes the audioelement from DOM
            - Removes the configuration from this.soundscape

        Returns:
            -
        */
        let removableIndex = undefined;
        for (const i in this.soundscape){
            const configuration = this.soundscape[i];

            const storedTargetElement = configuration["target_element"];
            if (storedTargetElement == targetElement){
                const audioElement = configuration["audio"];
                audioElement.pause();
                audioElement.remove();
                removableIndex = i;
                break;
            }
        }
        if (removableIndex !== undefined){
            this.soundscape.splice(removableIndex, 1);
        }
    }

    modifySound(soundInfo) {
        /* 
        Parameters:
            audioInfo, Object["element":Element, "sound":String]: Configuration info that maps the target element with the provided new audio
                                                                        sound -> Used like: this.serverURL+"/"+<sound>

        Changes the audio content for element in the Soundscape 3D audiospace.
        Uses the provided sound from the server and uses the provided 'element' to define the XY-coordinates of the spatial sound.
        
        Returns:
            -
        */

        const providedTargetElement = soundInfo["element"];

        for (const configuration of this.soundscape){
            const loopTargetElement = configuration["target_element"];
            if (loopTargetElement == providedTargetElement){
                const targetAudioElement = configuration["audio"];
                soundInfo["sound"]
                targetAudioElement.src = `${this.serverURL}/${soundInfo["sound"]}`;
                targetAudioElement.play();
                break;
            }
        }
    }

    getElementDefaultVolume(targetElement){
        /* 
        Parameters:
            targetElement, Element: HTML Element to have its default volume calculated
        
        Calculates a default volume for element with the following formula: 
            maxVolume - (elementY/PageY) * maxVolume

        Used for having the element audio's volume be according to its Y-coordinate on the page

        Returns:
            calculatedDefaultVolume, number
        */
        const boundingBox = targetElement.getBoundingClientRect();
        const targetY = boundingBox.y;
        const maxVolume = 0.5;
        const maxHeight = screen.height;
        const calculatedDefaultVolume = maxVolume - ((targetY/maxHeight) * maxVolume);
        return calculatedDefaultVolume;
    }

    getVolumeByCoordinate(targetY, maxVolume){
        /* 
        Parameters:
            targetY, number: Y-coordinate value to be used for calculating the audio volume
            maxVolume, number: maximum volume (0-1) to be used for calculating the audio volume

        Calculates audio volume for element with the following formula: 
            maxVolume - (targetY/PageY) * maxVolume

        Used for having the mouse pointer's audio's volume be according to its Y-coordinate on the page

        Returns:
            calculatedDefaultVolume, number
        */
        const maxHeight = screen.height;
        const calculatedVolume = maxVolume - ((targetY/maxHeight) * maxVolume);
        return calculatedVolume;
    }

    createAudioElement(soundSrc){
        /*
        Parameters:
            soundSrc, String: Filename of the used sound

        Creates a looping AudioElement with the provided audio source
        
        Returns:
            AudioElement: Audio element created to use the provided file from the this.serverURL
        */
        let audioElement = document.createElement("audio");
        audioElement.src = soundSrc;
        audioElement.loop = true;
        return audioElement;
    }

    createPannerNode(x, y, audioElement){
        /*
        Parameters:
            x, Integer: x-coordinate of the element to be pointed to with the sound
            y, Integer: y-coordinate of the element to be pointed to with the sound
            audioElement, Element: <audio> DOM-element to be used with PannerNode

        Returns:
            PannerNode: Node producing the sound with HRTF by utilizing the sound from provided audioElement
        */
        const panningModel = "HRTF";
        const innerCone = 60;
        const outerCone = 90;
        const outerGain = 0.3
        const distanceModel = "linear";
        const maxDistance = 10000;
        const refDistance = 1;
        const rollOff = 10;

        const positionX = x;
        const positionY = y;
        const positionZ = 300;

        const orientationX = 0.0;
        const orientationY = 0.0;
        const orientationZ = -1.0;
        const panner = new PannerNode(this.audioContext, {
            panningModel,
            distanceModel,
            positionX,
            positionY,
            positionZ,
            orientationX,
            orientationY,
            orientationZ,
            refDistance,
            maxDistance,
            rolloffFactor: rollOff,
            coneInnerAngle: innerCone,
            coneOuterAngle: outerCone,
            coneOuterGain: outerGain,
        });
        const track = this.audioContext.createMediaElementSource(audioElement);
        track.crossOrigin = "anonymous";
        track.connect(panner).connect(this.audioContext.destination);
        return panner;
    }
}

