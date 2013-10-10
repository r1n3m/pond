function LevelBar(width) {
  this.colors = []
  this.height = 6
  this.width = width
  this.thickness = 2
  this.canv = document.createElement('canvas')
  this.canv.width = this.width
  this.canv.height = this.height
  this.ctx = this.canv.getContext('2d')
  if(!isMobile) {
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    this.ctx.shadowBlur = 10
    this.ctx.shadowOffsetY = -5
    this.ctx.shadowOffsetX = -5
  }
  this.ctx.lineWidth = this.thickness
  this.percent = 0
  this.x = this.canv.width * this.percent
  this.targetX = this.x
  this.y = 0

  this.updating = false
}
LevelBar.prototype.resize = function(width, height) {
  this.width = width
  this.canv.width = this.width
  this.canv.height = this.height
  this.ctx = this.canv.getContext('2d')
  this.ctx.lineWidth = this.thickness
  if(!isMobile) {
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    this.ctx.shadowBlur = 10
    this.ctx.shadowOffsetY = -5
    this.ctx.shadowOffsetX = -5
  }
  this.x = this.canv.width * this.percent
  this.targetX = this.x
}
LevelBar.prototype.toParticles = function(target) {
  return particalize.call(this, target, 0, 10, 0.6)
}
LevelBar.prototype.addColor = function() {
  var color = randColor(this.colors[this.colors.length-1])
  this.colors.push({col: color, loaded: 0})
  this.percent += 0.1
  this.targetX = this.canv.width * this.percent
}
LevelBar.prototype.physics = function() {
  if(this.x < this.targetX) {
    this.x += 1
  }
  for(var i=0;i<this.colors.length;i++) {
    if(this.colors[i].loaded < 1) {
      this.colors[i].loaded += 0.012
    }
  }
  var loadedSum = this.colors.reduce(function sumLoaded(sum, col){
    return sum + col.loaded
  }, 0)

  if(loadedSum >= 10) {
    // create orb
    return true
  }
  return false
}
LevelBar.prototype.draw = function(outputCtx) {
  var ctx = this.ctx
  if(isMobile) ctx.clearRect(0, 0, this.width, this.height)
  if(!this.colors.length) return
  var widthSum = this.colors.reduce(function(sum, color){
    return sum + color.loaded
  }, 0)
  var totalWidth = this.x
  var widths = this.colors.map(function normalize(color, i) {
    return color.loaded / widthSum * totalWidth
  })

  var x = 0
  for(var i=0;i<this.colors.length;i++) {
    var color = this.colors[i]
    ctx.strokeStyle = color.col.rgb()
    ctx.strokeRect(x, this.y, widths[i], this.height)
    x += widths[i]
  }
  outputCtx.drawImage(this.canv, 0, 0)
}
