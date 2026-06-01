let songIndex = 0;
let audioElement = new Audio('songs/1.mp3');
let masterPlay =  document.getElementById('masterPlay');

let myProgressBar = document.getElementById('myProgressBar');
let gif = document.getElementById('gif');
let masterSongName = document.getElementById('masterSongName');
let songItems = Array.from(document.getElementsByClassName('songItem'));

let songs = [
    {songName: "wacced out murals", filePath: "songs/1.mp3" , coverpath: "covers/1.jpg"},
    {songName: "squabble up", filePath: "songs/2.mp3" , coverpath: "covers/2.jpg"},
    {songName: "luther", filePath: "songs/3.mp3" , coverpath: "covers/3.jpg"},
    {songName: "man at the garden", filePath: "songs/4.mp3" , coverpath: "covers/4.jpg"},
    {songName: "hey now", filePath: "songs/5.mp3" , coverpath: "covers/5.jpg"},
    {songName: "reincarnated", filePath: "songs/6.mp3" , coverpath: "covers/6.jpg"},
    {songName: "tv off", filePath: "songs/7.mp3" , coverpath: "covers/7.jpg"},
    {songName: "dodger blue", filePath: "songs/8.mp3" , coverpath: "covers/8.jpg"},
    {songName: "peekaboo", filePath: "songs/9.mp3" , coverpath: "covers/9.jpg"},
    {songName: "heart pt.6", filePath: "songs/10.mp3" , coverpath: "covers/10.jpg"},
    {songName: "gnx", filePath: "songs/11.mp3" , coverpath: "covers/11.jpg"},
    {songName: "gloria", filePath: "songs/12.mp3" , coverpath: "covers/12.jpg"},
]

songItems.forEach((element , i)=>{
    element.getElementsByTagName("img")[0].src = songs[i].coverpath;
    element.getElementsByClassName('songName')[0].innerText = songs[i].songName;
})




masterPlay.addEventListener('click', ()=>{
    if(audioElement.paused || audioElement.currentTime<=0){
        audioElement.play();
        masterPlay.classList.remove("fa-play-circle");
        masterPlay.classList.add("fa-pause-circle");
        gif.style.opacity = 1;
    }
    else{
        audioElement.pause();
        masterPlay.classList.remove("fa-pause-circle");
        masterPlay.classList.add("fa-play-circle");
        gif.style.opacity = 0;
    }
})

audioElement.addEventListener("timeupdate", ()=>{
        progress = parseInt((audioElement.currentTime/audioElement.duration)*100);
        myProgressBar.value = progress;
})

myProgressBar.addEventListener('change', ()=>{
    audioElement.currentTime = myProgressBar.value * audioElement.duration/100;
})

const makeAllPlays = ()=>{
    Array.from(document.getElementsByClassName('songItemPlay')).forEach((element)=>{
        element.classList.remove("fa-pause-circle");
        element.classList.add("fa-play-circle");
    })
}

// Array.from(document.getElementsByClassName('songItemPlay')).forEach((element)=>{
//     element.addEventListener('click', (e)=>{
//         songIndex = parseInt(e.target.id);
//         e.target.classList.remove('fa-play-circle');
//         e.target.classList.add('fa-pause-circle');

//         audioElement.src = `songs/${songIndex+1}.mp3`
//         masterSongName.innerText = songs[songIndex].songName;
//         audioElement.currentTime = 0;
//         audioElement.play();
//         gif.style.opacity = 1;
//         masterPlay.classList.remove('fa-play-circle');
//         masterPlay.classList.add('fa-pause-circle');
//     })
// })

Array.from(document.getElementsByClassName('songItemPlay')).forEach((element) => {
    element.addEventListener('click', (e) => {
        songIndex = parseInt(e.target.id);

        // If the audio is currently playing, pause it
        if (audioElement.paused || audioElement.currentTime === 0) {
            e.target.classList.remove('fa-play-circle');
            e.target.classList.add('fa-pause-circle');

            audioElement.src = `songs/${songIndex + 1}.mp3`;
            masterSongName.innerText = songs[songIndex].songName;
            audioElement.currentTime = 0;
            audioElement.play();
            gif.style.opacity = 1;

            masterPlay.classList.remove('fa-play-circle');
            masterPlay.classList.add('fa-pause-circle');
        } else {
            // If the audio is already playing, pause it
            e.target.classList.remove('fa-pause-circle');
            e.target.classList.add('fa-play-circle');
            
            audioElement.pause();
            gif.style.opacity = 0;
            
            masterPlay.classList.remove('fa-pause-circle');
            masterPlay.classList.add('fa-play-circle');
        }
    });
});



document.getElementById('next').addEventListener('click', ()=>{
    if(songIndex>=11){
        songIndex = 0;
    }
    else{
        songIndex +=1; 
    }
    audioElement.src = `songs/${songIndex+1}.mp3`
    masterSongName.innerText = songs[songIndex].songName;
    audioElement.currentTime = 0;
    audioElement.play();
    masterPlay.classList.remove('fa-play-circle');
    masterPlay.classList.add('fa-pause-circle');
})


document.getElementById('previous').addEventListener('click', ()=>{
    if(songIndex<=0){
        songIndex = 0;
    }
    else{
        songIndex -=1; 
    }
    audioElement.src = `songs/${songIndex+1}.mp3`
    masterSongName.innerText = songs[songIndex].songName;
    audioElement.currentTime = 0;
    audioElement.play();
    masterPlay.classList.remove('fa-play-circle');
    masterPlay.classList.add('fa-pause-circle');
})