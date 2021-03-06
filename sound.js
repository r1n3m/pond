var muted = false
popSound = document.createElement('audio')
popSound.src='assets/drop1.ogg'
popSound.volume = 0.4

if(localStorage.muted === 'true') toggleMute()

function toggleMute(){
  if(!muted) {
    popSound.volume = 0
    muted = true
    localStorage.muted = 'true'
    drawSoundControl()
  } else {
    popSound.volume = 0.6
    muted = false
    localStorage.muted = 'false'
    drawSoundControl()
  }
}

function playPop() {
  popSound.play()
}

function drawSoundControl() {
  if(typeof ctx === 'undefined') return
  //ctx.fillStyle='#111'
  //ctx.fillRect($canv.width - 25, 10, 16, 22)
  if(muted)
    ctx.drawImage(ASSETS.soundOff, $canv.width - 25, 10)
  else
    ctx.drawImage(ASSETS.soundOn, $canv.width - 25, 10)
}
