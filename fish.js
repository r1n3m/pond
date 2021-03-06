function Fish(AI, x, y, size, dir, frame) {
  var randCol = randColor()

  this.dir = dir || 0 // radians
  this.AI = AI || false
  this.targetDir = dir
  this.arcSpeed = 0.07
  this.canv = document.createElement('canvas')
  this.circles = Array.apply([], new Array(6)).map(function(cir, i){
    return {
      x: this.x,
      y: this.y,
      r: 1
    }
  })

  this.AIDir = 1
  this.setSize(size || 20)

  this.frame = frame || 0
  this.ossilation = Math.sin(frame/5)
  this.curv = 0

  // loaded percent is used for new colors that have been added and need to grow
  this.colors = [
    {col: randColor().rgb(), thick: 4, loaded: 1}
  ]

  this.x = x || 0
  this.y = y || 0
  this.dying = false // death animation
  this.dead = false // remove this entity
  this.deathParticles = []
  this.bodyColor = randCol.rgb()
  this.bodyOutline = randCol.rgb()

  // is the user currently pressing a button to move?
  this.isInput = AI ? true : false

  // defined if user input is touch
  this.targetPos = null

  this.velocity = [0, 0]
  this.accel = [0, 0]
  this.maxSpeed = this.AI ? 1 : 3

}
Fish.prototype.draw = function(outputCtx) {
  if(this.dying) return this.drawDeath(outputCtx)
  var ctx = this.ctx
  ctx.clearRect(-this.canv.width, -this.canv.height, this.canv.width*2, this.canv.height*2)
  var size = this.size

  ctx.beginPath()

  // draw main body
  this.drawBody()

  // draw inner colors
  this.drawColors()

  // output to main canvas
  outputCtx.save()
  outputCtx.translate(this.x, this.y)
  outputCtx.rotate(this.dir)
  outputCtx.drawImage(this.canv, -this.canv.width/2 - size, -this.canv.height/2)
  outputCtx.restore()

  if (debug) {
      // collision body
      var ctx = outputCtx

      ctx.strokeStyle = '#0f0'
      ctx.fillStyle = '#0f0'
      ctx.lineWidth  = 2
      ctx.beginPath()
      ctx.save()
      if(!this.dying) {
        for(var i=0;i<this.circles.length;i++) {
          var cir = this.circles[i]
          ctx.arc(cir.x, cir.y, cir.r, 0, 2 * Math.PI, false)
        }
      }

    // draw collision body circles

    ctx.strokeStyle='#0f0'
    ctx.stroke()
    ctx.closePath()


    // draw dir as line, and target dir as line
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size*2*Math.cos(this.dir), this.y+this.size*2*Math.sin(this.dir))
    ctx.strokeStyle='#ff0'
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size*2*Math.cos(this.targetDir), this.y+this.size*2*Math.sin(this.targetDir))
    ctx.strokeStyle='#f00'
    ctx.stroke()
    ctx.closePath()

    if(this.targetPos){
      ctx.fillRect(this.targetPos.x, this.targetPos.y, 10,10)
    }
    ctx.restore()
  }

}
Fish.prototype.drawBody = function() {
  var fish = this
  var size = this.size
  var ctx = this.ctx
  var curv = this.curv
  var o = this.ossilation
  ctx.strokeStyle = fish.bodyOutline
  ctx.lineWidth = 4

  for(var i = -1; i < 2; i+=2){
    ctx.moveTo(size, 0)
    ctx.bezierCurveTo(size * (14/15), i*size + size/30*o + curv/3, -size/2, i*size + size/30*o + curv/2, -size*2, i*size/3 + size/15*o + curv)
    ctx.bezierCurveTo(-size * 2.5, i*size/6 + size/10*o + curv, -size*3, i*size/4 - size/15*o + curv/2, -size*3, -size/15*o + curv/3)
  }
  ctx.stroke()

}
Fish.prototype.drawColors = function() {
  // inner colors
  var fish = this
  var size = this.size
  var ctx = this.ctx
  var curv = this.curv
  var o = this.ossilation
  ctx.lineWidth = 2

  var colorSize = size - size/4
  var colors = fish.colors

  var thicknessSum = 0
  var color;
  for(var i=0, l=colors.length; i < l; i++) {
    color = colors[i]
    thicknessSum += color.thick * color.loaded
  }
  
  var width = []
  for(var i=0, l=colors.length; i < l; i++) {
    width.push(colors[i].thick / thicknessSum * colorSize)
  }

  for(var c = 0, l=colors.length; c < l && colorSize >= 0; c++){
    ctx.beginPath()
    var col = colors[c].col
    var thick = width[c]
    var percent = colors[c].loaded
    for (var i = -1; i < 2; i += 2) {
      ctx.moveTo(colorSize, 0)
      ctx.bezierCurveTo(colorSize * (14/15), i*colorSize + size/30*o + curv/3, -colorSize/2, i*colorSize + size/30*o + curv/2, -colorSize * 2.75, size/15*o*percent + curv)
    }

    ctx.strokeStyle = col
    ctx.stroke()


    // resize for next color drawn (outside -> in)
    colorSize -= thick
  }
}
Fish.prototype.drawDeath = function(outputCtx) {
  var ctx = outputCtx
  for(var i=0;i<this.deathParticles.length;i++) {
    this.deathParticles[i].draw(ctx)
  }
}
Fish.prototype.collide = function (fish) {

  // the fish has been killed and is being removed
  if (this.dying || fish.dying || distance(this, fish) > this.size * 5 + fish.size*5) {
    return false
  }

  // there are 6 circles that make up the collision box of each fish
  // check if they collide
  var c1, c2
  for (var i=-1, l = this.circles.length; ++i<l;) {
    c1 = this.circles[i]

    for (var j=-1, n = fish.circles.length; ++j < n;) {
      c2 = fish.circles[j]

      // check if they touch
      if(distance(c1, c2) <= c2.r + c1.r) {
      //if ( Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2) <= Math.pow(c2.r + c1.r, 2)) {
        return true
      }
    }
  }

  return false
}
Fish.prototype.killedBy = function(target) {
  this.dying = true
  if(!this.AI || !target.AI) playPop()
  this.deathParticles = this.toParticles(target)
}
Fish.prototype.toParticles = function(target) {
  var particles = []

  var pixels = this.ctx.getImageData(0,0,this.canv.width, this.canv.height).data
  for(var i = 0; i < pixels.length; i += 36 * Math.ceil(this.size/20) * (isMobile ? 6 : 1)) {
    var r = pixels[i]
    var g = pixels[i + 1]
    var b = pixels[i + 2]

    // black pixel - no data
    if(!r && !g && !b){
      continue
    }

    var x = i/4 % this.canv.width
    var y = Math.floor(i/4 / this.canv.width)
    x -= this.canv.width/2 + this.size
    y -= this.canv.height/2
    var relativePos = rot(x, y, this.dir)
    x=this.x + relativePos[0]
    y=this.y + relativePos[1]

    var col = new Color(r, g, b)
    var dir = directionTowards({x: x, y: y}, this)
    particles.push(new Particle(x, y, col, target, Math.PI*Math.random()*2 - Math.PI, this.size/20))
  }
  return particles
}
Fish.prototype.physics = function(){

  this.ossilation = Math.sin(this.frame/5)
  var ossilation = this.ossilation

  var t1 = this.dir
  var t2 = this.targetDir
  var moveDir = 1
  var diff = 0
  if(Math.abs(t1-t2)>Math.PI) {
    moveDir = -1
  }
  if(t1 > t2) {
    diff = t1-t2*moveDir
  } else if(t1 < t2) {
    diff = t2-t1*moveDir
  }
  var curv = this.size/15 * diff
  this.curv = curv || 0

  // grow inner colors
  for(var i=0, l=this.colors.length; i<l; i++) {
      if(this.colors[i].loaded < 1) {
          this.colors[i].loaded += 0.01
      }
  }

  // fish is now particles
  if(this.dying) {
    for(var i=this.deathParticles.length-1;i>=0;i--){
      var p = this.deathParticles[i]
      var dist = p.physics()
      if(dist < p.target.size/8+10) {
        this.deathParticles.splice(i,1)

        p.target.setSize(p.target.size+0.001 * (isMobile ? 6 : 1))
        if(this.colors.length > 0) {
          for(var i=this.colors.length-1;i>=0;i--) {
            this.colors[i].loaded = 0
            p.target.colors.push(this.colors.pop())
          }
        }
      }
    }
    if (!this.deathParticles.length) {
        this.dead = true
    }
  } else {
    // update collision circles
    for(var i=0, l=this.circles.length;i<l;i++) {
      var cir = this.circles[i]
      var relativePosition = this.circleMap[i]
      var pos = rot(relativePosition[0], relativePosition[1]*ossilation, this.dir)
      cir.x = pos[0] + this.x
      cir.y = pos[1] + this.y
    }

    // movement

    // mouse/touch input has a target location
    if(this.targetPos) {
        this.targetDir = directionTowards(this.targetPos, this)
    }

    if(this.AI) {

      // random walk
      if(Math.random() < 0.01) this.AIDir *= -1 // 1% chance to change directions every frame
      var diff = Math.random()/100 * this.AIDir
      this.targetDir = this.targetDir + diff
      this.targetDir %= Math.PI

    }

    var t1 = this.dir
    var t2 = typeof this.targetDir === 'undefined' ? this.dir : this.targetDir
    var arcSpeed = this.arcSpeed

    var moveDir = 1
    if(Math.abs(t1-t2)>Math.PI) {
      moveDir = -1
    }

    if(t1 > t2) {
       this.dir -= moveDir * Math.min(arcSpeed, Math.abs(t1-t2))
    } else if(t1 < t2) {
      this.dir += moveDir * Math.min(arcSpeed, Math.abs(t1-t2))
    }
    if(this.dir>Math.PI){
      this.dir = this.dir - Math.PI*2
    }
    if(this.dir<-Math.PI){
      this.dir = this.dir + Math.PI*2
    }

    if(!this.isInput) {

      // user is not applying input
      this.accel = [0, 0]
    } else {
      this.accel = [
        Math.cos(this.dir),
        Math.sin(this.dir)
      ]
    }

    // update velocity vector
    this.velocity[0] += this.accel[0]
    this.velocity[1] += this.accel[1]

    this.velocity[0] = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity[0]))
    this.velocity[1] = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity[1]))

    // apply friction
    var friction = 0.1
    if (this.velocity[0] > 0) {
      this.velocity[0] -= Math.min(friction, this.velocity[0])
    }
    if (this.velocity[0] < 0) {
      this.velocity[0] -= Math.max(-friction, this.velocity[0])
    }
    if (this.velocity[1] > 0) {
      this.velocity[1] -= Math.min(friction, this.velocity[1])
    }
    if (this.velocity[1] < 0) {
      this.velocity[1] -= Math.max(-friction, this.velocity[1])
    }

    // update position vector
    this.x += this.velocity[0] * Math.abs(Math.cos(this.dir))
    this.y += this.velocity[1] * Math.abs(Math.sin(this.dir))
  }

  this.frame++
}
Fish.prototype.updateInput = function(input, isTouch) {
  // remember that up is down and down is up because of coordinate system
  var pi = Math.PI
  var dirMap = {
    'up':         -pi/2,
    'right up':   -pi/4,
    'right':      0,
    'down right': pi/4,
    'down':       pi/2,
    'down left':  3*pi/4,
    'left':       pi,
    'left up':    -3*pi/4
  }
  if(isTouch) {

    // touch input
    var xDelta= input[0]
    var yDelta = input[1]

    var valid = !(typeof xDelta === 'undefined' || typeof yDelta === 'undefined')

    if (!valid) {
      this.isInput = false
      this.targetPos = null
      return this.targetDir = this.dir
    }
    this.isInput = true
    this.targetDir = directionTowards({x: this.x + xDelta, y: this.y + yDelta}, this)
    //this.targetPos = {x: targetX, y: targetY}
  } else {

    // keyboard input
    var inputDirection = input.slice(0,2).sort().join(' ')
    var valid = typeof dirMap[inputDirection] !== 'undefined'
    if(!valid) this.isInput = false
    else this.isInput = true

    this.targetDir =  valid ? dirMap[inputDirection] : this.dir

    // remove pos from touch
    this.targetPos = null
  }

}
Fish.prototype.setSize = function(size) {
  this.size = size
  this.canv.width = this.size*4.4
  this.canv.height = ~~this.size*2.3
  this.ctx = this.canv.getContext('2d')
  this.ctx.translate(this.canv.width/2 + this.size, this.canv.height/2)

  var ratios =  [11/14, 12/15, 10/15, 7/15, 4/14, 3/15]
  for(var i=0;i<this.circles.length; i++) {
    this.circles[i].r = this.size * ratios[i]
  }

  this.circleMap = [
    [this.size/5, this.size/40],
    [-this.size/3, this.size/30],
    [-this.size, this.size/20],
    [-this.size*1.6, this.size/15],
    [-this.size*2.2, this.size/12],
    [-this.size*2.8, -this.size/30]
  ]
}
