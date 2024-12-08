//run after dom load
document.addEventListener("DOMContentLoaded", () => {
    //get break setting data from chrome storage
    chrome.storage.local.get("currentBreak", ({currentBreak}) => {
        console.log("break data are:", currentBreak);
        const {breakDuration, videoChoice, musicChoice} = currentBreak;
        console.log("test-2 break data are:", currentBreak);

        //put user chosen video and music in media container
        const mediaContainer = document.getElementById("mediaContainer");
        mediaContainer.innerHTML=`
            <video src="${videoChoice}" autoplay loop style="width:100%; height:100%; object-fit:cover;"></video>
            <audio src="${musicChoice}" autoplay loop></audio>
        `;

        //put user chosen break time in countdown
        let remainingBreakTime = breakDuration * 60;
        const remainingTimeElem = document.getElementById("remainingBreakTime");

        const interval = setInterval(() => {
            remainingBreakTime--;
            const minutes = Math.floor(remainingBreakTime / 60);
            const seconds = remainingBreakTime % 60;
            remainingTimeElem.innerText = `Break Time Left: ${minutes}:${seconds.toString().padStart(2, "0")}`;

            //close window when time finish
            if (remainingBreakTime <= 0) {
                clearInterval(interval);
                window.close();
            }
        }, 1000);

        //end session manually button
        document.getElementById("endSession").addEventListener("click", () => {
            clearInterval(interval);
            chrome.runtime.sendMessage({ action: "endBreakEarly" });
            window.close();
        });
    });
})