//transfer all the user input into data so that the system can retrieve
document.getElementById("startPauseFlow").addEventListener("click", () => {
    const breakDuration = parseInt(document.getElementById("breakDuration").value);
    const workInterval = parseInt(document.getElementById("workInterval").value);
    const videoChoice = document.getElementById("videoChoice").value;
    const musicChoice = document.getElementById("musicChoice").value;

    //and store them in chrome storage API
    chrome.storage.sync.set({breakDuration, workInterval, videoChoice, musicChoice}, () => {
        //test if store correctly
        console.log("setting:", {breakDuration, workInterval, videoChoice, musicChoice});
        alert("🪷 PauseFlow settings saved! 🪷");
        chrome.runtime.sendMessage({action:"startCountdown", workInterval});
        window.close();
    });
})