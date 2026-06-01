let currentSongs = new Audio();
let songs;
let currFolder;




function secondstoMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }



    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songs.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
        <div class ="info">
        <div>${song.replaceAll("%20", "")}</div>
        <div>Deuspeu</div>
        </div>
        <div class="playnow">
        <span>Play now</span>
        <img class="invert" src="img/play.svg" alt="">
        </div></li>`;

    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}


const playMusic = (track, pause = false) => {
    currentSongs.src = `/${currFolder}/${track}`; // Set the source on currentSongs
    if (!pause) {
        currentSongs.play().catch(error => {
            console.error("Playback failed:", error);
        });
        document.querySelector("#play").src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    console.log("Displaying Albums");

    try {
        let response = await fetch(`/songs/`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        // Convert HTMLCollection to Array for easier manipulation
        let array = Array.from(anchors);

        array.forEach(e => {
            let folderPath = new URL(e.href).pathname.split("/").filter(Boolean);
            console.log("URL Segments:", folderPath); // Log the segments to see their structure

            // Check if we're in the 'songs' directory and get the folder name
            if (folderPath.length > 1 && folderPath[folderPath.length - 2] === 'songs') {
                let folder = folderPath[folderPath.length - 1];

                // Check if it's a valid folder (not a file)
                if (!folder.includes(".")) {
                    console.log("Folder:", folder);

                    // Fetch the info.json for this folder
                    fetch(`/songs/${folder}/info.json`)
                        .then(res => {
                            if (!res.ok) {
                                throw new Error(`HTTP error! status: ${res.status}`);
                            }
                            return res.json();
                        })
                        .then(jsonResponse => {
                            console.log("Fetched JSON:", jsonResponse);
                            cardContainer.innerHTML += `
                                <div data-folder="${folder}" class="card">
                                    <div class="play">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                                  stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                    <img src="/songs/${folder}/cover.jpg" alt="">
                                    <h2>${jsonResponse.title}</h2>
                                    <p>${jsonResponse.description}</p>
                                </div>`;
                        })
                        .catch(err => {
                            console.error("Error fetching JSON for folder:", folder, err);
                        });
                } else {
                    console.error("Detected a file instead of a folder:", folder);
                }
            } else {
                console.error("Folder could not be determined or is not in the 'songs' directory.");
            }
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}








async function main() {


   

    

    await getSongs("songs/kenny")
    playMusic(songs[0], true)



    await displayAlbums()


    const playButton = document.querySelector("#play");
    if (playButton) {
        playButton.addEventListener("click", () => {
            if (currentSongs.paused) {
                currentSongs.play();
                playButton.src = "img/pause.svg";
            } else {
                currentSongs.pause();
                playButton.src = "img/play.svg";
            }
        });
    }

    currentSongs.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondstoMinutesSeconds(currentSongs.currentTime)} / ${secondstoMinutesSeconds(currentSongs.duration)}`;
        document.querySelector(".circle").style.left = (currentSongs.currentTime / currentSongs.duration) * 100 + "%";
    });

    const seekbar = document.querySelector(".seekbar");
    if (seekbar) {
        seekbar.addEventListener("click", e => {
            const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSongs.currentTime = (currentSongs.duration * percent) / 100;
        });
    }

    const hamburger = document.querySelector(".hamburgerContainer");
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });
    }

    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        });
    }

    const previousButton = document.querySelector("#previous");
    if (previousButton) {
        previousButton.addEventListener("click", () => {
            currentSongs.pause();
            const index = songs.indexOf(currentSongs.src.split("/").pop());
            if (index > 0) {
                playMusic(songs[index - 1]);
            }
        });
    }

    const nextButton = document.querySelector("#next");
    if (nextButton) {
        nextButton.addEventListener("click", () => {
            currentSongs.pause();
            const index = songs.indexOf(currentSongs.src.split("/").pop());
            if (index < songs.length - 1) {
                playMusic(songs[index + 1]);
            }
        });
    }

    const volumeInput = document.querySelector(".range input");
    if (volumeInput) {
        volumeInput.addEventListener("change", (e) => {
            currentSongs.volume = parseInt(e.target.value) / 100;
            document.querySelector(".volume > img").src = currentSongs.volume > 0 ? "img/volume.svg" : "img/mute.svg";
        });
    }

    const volumeButton = document.querySelector(".volume > img");
    if (volumeButton) {
        volumeButton.addEventListener("click", e => {
            if (currentSongs.volume > 0) {
                currentSongs.volume = 0;
                volumeInput.value = 0;
                e.target.src = "img/mute.svg";
            } else {
                currentSongs.volume = 0.1; // Set a default volume level
                volumeInput.value = 10;
                e.target.src = "img/volume.svg";
            }
        });
    }
}


main()



