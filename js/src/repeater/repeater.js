function Repeater(btn, audioTag, canvas, freq = 10) {
  this.mediaRecorder = null;
  this.btn = btn;
  this.audio = audioTag;
  this.chunks = [];
  this.canvas = canvas;
  this.freq = freq;
};

Repeater.prototype.init = function() {
  if (!'mediaDevices' in navigator) return null;
  let self = this,
      constraints = { audio: true };

  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    self.stream = stream;
    self.mediaRecorder = new MediaRecorder(stream);

    self.btn.addEventListener('click', function() {
      self.audio.pause();
      let icon = self.btn.querySelector('.icon');
      if (icon.classList.contains('start')) {
        self.initAudioAnalyze(self.stream);
        self.mediaRecorder.start();
        icon.classList.replace('start', 'stop');
      } else {
        self.stopAudioAnalyze();
        self.mediaRecorder.stop();
        icon.classList.replace('stop', 'start');
      }
    });

    self.mediaRecorder.onstop = function(e) {
      let blob = new Blob(self.chunks, { 'type' : 'audio/ogg; codecs=opus' });
      self.chunks = [];
      let audioURL = URL.createObjectURL(blob);
      self.audio.src = audioURL;
    }

    self.mediaRecorder.ondataavailable = function(e) {
      self.chunks.push(e.data);
    }
  });

  this.initCanvas();
  return this;
};

Repeater.prototype.initAudioAnalyze = function(stream) {
  this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let source = this.audioContext.createMediaStreamSource(stream);
  this.analyser = this.audioContext.createAnalyser();
  this.analyser.smoothingTimeConstant = 0.3;
  this.analyser.fftSize = 128;
  let jsNode = this.audioContext.createScriptProcessor(256);
  jsNode.onaudioprocess = this._throttle(this.analyze.bind(this));

 
  source.connect(this.analyser);
  this.analyser.connect(jsNode);
  // chrome bug. if not connect to destination, onaudioprocess won't fire
  jsNode.connect(this.audioContext.destination);
  this.frequencyBuff =  new Uint8Array(this.analyser.frequencyBinCount);
};

Repeater.prototype.stopAudioAnalyze = function() {
  this.audioContext.close();
}

Repeater.prototype.initCanvas = function() {
  let ctx = this.canvas.getContext("2d");
  let rect = this.canvas.getBoundingClientRect();
  this.dimension = {
    'height': rect.height,
    'width': rect.width
  }

  let gradient = ctx.createLinearGradient(0, 0, 0, this.dimension.height);
  gradient.addColorStop(0, '#b9f6ca');
  gradient.addColorStop(.5, '#00e676');
  gradient.addColorStop(1, '#b9f6ca');
  ctx.fillStyle = gradient;
};

Repeater.prototype.visualize = function(buff) {
  let ctx = this.canvas.getContext("2d");
  ctx.clearRect(0, 0, this.dimension.width, this.dimension.height);
  let barWidth = parseInt(this.dimension.width / buff.length);
  for(let i = 0; i < buff.length; i++ ){
      let value = buff[i];
      ctx.fillRect(i * barWidth, (this.dimension.height - value) / 2, barWidth, value);
  }
};

Repeater.prototype._throttle = function(fn) {
  let allowDiff = 1000 / this.freq;
  let last = Date.now()
  return function() {
    let now = Date.now();
    if (now - last > allowDiff) {
      last = now;
      fn(arguments);
    }
  }
}

Repeater.prototype.analyze = function() {
  this.analyser.getByteFrequencyData(this.frequencyBuff);
  let buff = this.normalize(this.frequencyBuff);
  this.visualize(buff)
};

Repeater.prototype.normalize = function(buff) {
  let rightMost = buff.length - 1;
  while (rightMost > 0 && buff[rightMost] == 0) {
    rightMost--;
  }
  let base = Math.max.apply(this, buff);
  let res = [];
  for (let i = 0; i < buff.length && i <= rightMost; i++) {
    res.push(this.dimension.height * buff[i] / base);
  }
  return res;
}
