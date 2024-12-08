let countdownInterval; //countdown in chrome badge for working interval
let breakTimeout; //end break after specific time
let breakWindowId; //the break window

//listen for msg to start countdown/break
//use chrome.runtime API as a tool in my codes (see chrome extensions > reference > API for details)
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "startCountdown") {
        startIntervalCountdown(message.workInterval);
    }

    if (message.action === "endBreakEarly") {
        endBreakEarly();
    }
});

//when interval countdown start
function startIntervalCountdown(workInterval) {

    //clear any existing stuff so that countdown starts from beginning
    clearInterval(countdownInterval); 
    clearTimeout(breakTimeout);

    //default badge color by using chrome badge API (this will show on the extension icon, very cute)
    chrome.action.setBadgeBackgroundColor({color:"#edf1f6"});

    //when only 3 mins left, change color (use if statement)
    //when only 10 secs left, change color again (use if statement)
    //when 0 secs left, start break session and open window
    let remainingTime = workInterval * 60; //convert mins to seconds
    countdownInterval = setInterval(() => {
        remainingTime--;
  
        if (remainingTime === 180) {
            chrome.action.setBadgeBackgroundColor({ color: "#FFD700" });
        }
  
        if (remainingTime === 10) {
            chrome.action.setBadgeBackgroundColor({ color: "#FF4500" });
        }
  
        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            startBreakSession();
        }

        //update badge time number every second so that it does countdown
        //use padstart for correct countdown formatting
        chrome.action.setBadgeText({
            text: `${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, "0")}`
        });
    }, 1000);
}

//start break session here
//get user's settings (break time, video choice, music choice, work time)
//open the pop up window with the user's settings
//after (break time), the window automatically closes
//restart the work interval countdown in badge (recall function)
//i've asked chatgpt to help me to format my code in a more organized way
function startBreakSession() {
    chrome.storage.sync.get(
        ["breakDuration", "videoChoice", "musicChoice", "workInterval"],
        (settings) => {
            const breakDuration = settings.breakDuration;
            const videoChoice = settings.videoChoice;
            const musicChoice = settings.musicChoice;
            const workInterval = settings.workInterval;

            //test if it uses the user's settings correctly here, i'm debugging...
            console.log("Using settings in startBreakSession:", { videoChoice, musicChoice });
            chrome.storage.local.set(
                { currentBreak: { breakDuration, videoChoice, musicChoice } },
                () => {
                    if (chrome.runtime.lastError) {
                        console.error("Failed to store break data:", chrome.runtime.lastError.message);
                    } else {
                        console.log("Stored break data:", { breakDuration, videoChoice, musicChoice });
                    }
                }
            );
    
            //a new popup chrome window is created by using API chrome.windows
            //the windowObj refers to (literally) the window object and holds info about the window
            chrome.windows.create(
                {
                    url: "break.html",
                    type: "popup",
                    width: 1700,
                    height: 1000,
                },
                (windowObj) => {
                    if (chrome.runtime.lastError) {
                        //im testing if it actually create window successfully here
                        console.error("Failed to create window:", chrome.runtime.lastError.message);
                        return;
                    }

                    //since break window is essencially the window object created
                    breakWindowId = windowObj.id;
        
                    breakTimeout = setTimeout(() => {
                        //test if restart work properly
                        console.log("break end. start work interval countdown with:", workInterval);
                        chrome.windows.remove(breakWindowId, () => {
                            //testing if the window is closed as i wanted
                            if (chrome.runtime.lastError) {
                            console.warn("break window already closed:", chrome.runtime.lastError.message);
                            }
                            startIntervalCountdown(workInterval);
                        });
                    }, breakDuration * 60 * 1000);
        
                    chrome.windows.onRemoved.addListener(function handleWindowClose(windowId) {
                    if (windowId === breakWindowId) {
                        clearTimeout(breakTimeout);
                        chrome.windows.onRemoved.removeListener(handleWindowClose);
                        startIntervalCountdown(workInterval);
                    }
                    });
                }
            );
        }
    );
}
  
//if user manually closes the window
//clear the break time (to 0 secs)
//restart the work interval countdown in badge (recall function)
function endBreakEarly() {
    clearTimeout(breakTimeout);

    if (breakWindowId) {
        chrome.windows.remove(breakWindowId, () => {
            if (chrome.runtime.lastError) {
                console.warn("break window already closed:", chrome.runtime.lastError.message);
            }

            chrome.storage.sync.get(["workInterval"], (settings) => {
                const workInterval = settings.workInterval
                startIntervalCountdown(workInterval);
            });
        });
    }
}