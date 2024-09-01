
/* 
TARGET ELEMENTS
*/
//navigation links
const homelink = document.getElementById("homelink");
const loginlink = document.getElementById("loginlink");
const aboutuslink = document.getElementById("aboutuslink");
const contactlink = document.getElementById("contactlink");


//login form
const usernameInput = document.getElementById("usernameinput");
const passwordInput = document.getElementById("passwordinput");


/* 
SOUNDSCAPE CONFIGURATION
*/
const soundscape = new SoundScaper(20);
soundscape.setServerURL("static/sound_library");

const soundInfo = [
    {
        "element":usernameInput,
        "sound":"usernameinput_unselected.mp3"
    },
    {
        "element":passwordInput,
        "sound":"passwordinput_unselected.mp3"
    }
]

soundscape.setTargetElements(soundInfo, mouse="mouse.mp3");

/*
FUNCTIONS
*/
function linkClicked(event){    
    event.preventDefault();
}

function setSelected(event){
    const targetElement = event.target;
    const targetElementId = targetElement.id;

    if (event.type == "focus"){
        soundscape.modifySound({
            "element":targetElement,
            "sound":`${targetElementId}_selected.mp3`
        });
    } else if (event.type == "focusout"){
        soundscape.modifySound({
            "element":targetElement,
            "sound":`${targetElementId}_unselected.mp3`
        });
    }
}


/* 
EVENT LISTENERS
*/
homelink.addEventListener("click", linkClicked)
aboutuslink.addEventListener("click", linkClicked)
loginlink.addEventListener("click", linkClicked)
contactlink.addEventListener("click", linkClicked)

usernameInput.addEventListener("focus", setSelected)
passwordInput.addEventListener("focus", setSelected)
usernameInput.addEventListener("focusout", setSelected)
passwordInput.addEventListener("focusout", setSelected)
