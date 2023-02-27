const audioElement = document.querySelector<HTMLMediaElement>("audio");
if (audioElement === null) throw new Error("audio element doesn't exist");

// Player controls and attributes
const playButton = document.querySelector<HTMLElement>(".player-play-btn");
if (playButton === null) throw new Error("player-play-btn class doesn't exist");

const playIcon = playButton.querySelector<HTMLElement>(".player-icon-play");
if (playIcon === null) throw new Error("player-icon-play class doesn't exist");

const pauseIcon = playButton.querySelector<HTMLElement>(".player-icon-pause");
if (pauseIcon === null) throw new Error("player-icon-pause class doesn't exist");

const progress = document.querySelector<HTMLElement>(".player-progress");
if (progress === null) throw new Error("player-progress class doesn't exist");

const progressFilled = document.querySelector<HTMLElement>(".player-progress-filled");
if (progressFilled === null) throw new Error("player-progress-filled class doesn't exist");

const playerCurrentTime = document.querySelector<HTMLElement>(".player-time-current");
if (playerCurrentTime === null) throw new Error("player-time-current class doesn't exist");

const playerDuration = document.querySelector<HTMLElement>(".player-time-duration");
if (playerDuration === null) throw new Error("player-time-duration class doesn't exist");

const volumeControl = document.querySelector<HTMLInputElement>(".player-volume");
if (volumeControl === null) throw new Error("player-volume class doesn't exist");

const playerTrackMetaTitle = document.querySelector<HTMLElement>(".player-track-meta-title");
const playerTrackMetaSubtitle = document.querySelector<HTMLElement>(".player-track-meta-subtitle");

window.addEventListener("load", async () => {

    // Get params
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const titleParam = urlParams.get('title');
    const subtitleParam = urlParams.get('subtitle');
    const song = urlParams.get('song');
    if (!song) throw new Error("song param doesn't exist");

    audioElement.src = song;
    await audioElement.load();

    const audioCtx = new AudioContext();
    const track = audioCtx.createMediaElementSource(audioElement);


    // Change Track Meta content
    if (!titleParam && playerTrackMetaTitle) playerTrackMetaTitle.remove()
    else if (titleParam && playerTrackMetaTitle) playerTrackMetaTitle.innerText = titleParam;


    if (!subtitleParam && playerTrackMetaSubtitle) playerTrackMetaSubtitle.remove()
    else if (subtitleParam && playerTrackMetaSubtitle) playerTrackMetaSubtitle.innerHTML = `<span>${subtitleParam}</span>`;


    const getTime = (date: Date) => {
        let minutes = date.getMinutes().toString();
        if (minutes.length === 1) minutes = '0' + minutes;

        let seconds = date.getSeconds().toString();
        if (seconds.length === 1) seconds = '0' + seconds;

        return `${minutes}:${seconds}`
    }

    // Display currentTime and duration properties in real time
    const setTimes = () => {
        playerCurrentTime.textContent = getTime(new Date(audioElement.currentTime * 1000));
    }

    // Set times after page load
    setTimes();

    // Update progress bar and time values as audio plays
    audioElement.addEventListener("timeupdate", () => {
        progressUpdate();
        setTimes();
    });

    // Play button toggle
    playButton.addEventListener("click", async () => {
        // check if context is in suspended state (autoplay policy)
        // By default browsers won't allow you to autoplay audio.
        // You can overide by finding the AudioContext state and resuming it after a user interaction like a "click" event.
        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
        }

        // Play or pause track depending on state
        if (playButton.dataset.playing === "false") {
            await audioElement.play();

            playButton.dataset.playing = "true";
            playIcon.classList.add("hidden");
            pauseIcon.classList.remove("hidden");
        } else if (playButton.dataset.playing === "true") {
            await audioElement.pause();
            playButton.dataset.playing = "false";
            pauseIcon.classList.add("hidden");
            playIcon.classList.remove("hidden");
        }
    });

    audioElement.addEventListener("canplaythrough", () => {
        playerDuration.textContent = getTime(new Date(audioElement.duration * 1000));
    }, false);

    // if the track ends reset the player
    audioElement.addEventListener("ended", () => {
        playButton.dataset.playing = "false";
        pauseIcon.classList.add("hidden");
        playIcon.classList.remove("hidden");
        progressFilled.style.flexBasis = "0%";
        audioElement.currentTime = 0;
    });

    // Bridge the gap between gainNode and AudioContext so we can manipulate volume (gain)
    const gainNode = audioCtx.createGain();
    volumeControl.addEventListener("change", () => {
        gainNode.gain.value = Number(volumeControl.value);
    });

    track.connect(gainNode).connect(audioCtx.destination);

    // Update player timeline progress visually
    const progressUpdate = () => {
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        progressFilled.style.flexBasis = `${percent}%`;
    }

    // Scrub player timeline to skip forward and back on click for easier UX
    let mousedown = false;

    const scrub = (event: MouseEvent) => {
        audioElement.currentTime = (event.offsetX / progress.offsetWidth) * audioElement.duration;
    }

    progress.addEventListener("click", scrub);
    progress.addEventListener("mousemove", (e) => mousedown && scrub(e));
    progress.addEventListener("mousedown", () => (mousedown = true));
    progress.addEventListener("mouseup", () => (mousedown = false));

    // Track credit: Outfoxing the Fox by Kevin MacLeod under Creative Commons
}, false);