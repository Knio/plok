// want a view of a fixed range
// want a view tracking the current time, plus some time in the past

plok.view = function(start, stop) {
  this.end = +start || +(new Date());
  this.scale = 25.0; // miliseconds per pixel

  var static_mode = (start && stop);
  var timer = null;
  var subscribers = [];

  this.destroy = function() {
    subscribers = [];
    this.stopanimate();
  }

  this.subscribe = function(g) {
    subscribers.push(g);
  };

  this.update = function() {
    for (var i = 0; i < subscribers.length; i++) {
      subscribers[i].update();
    }
  }

  this.set = function(x) {
    this.end = +x;
    this.update();
  };

  this.scale_by = function(x) {
    this.scale *= x;
    this.update();
  };

  this.scroll = function(d) {
    this.stopanimate();

    d *= this.scale;
    d *= 32;

    var x = this.end + d;

    if (static_mode) {
      x = Math.min(Math.max(start, x), stop);
    } else {
      var now = +(new Date());
      x = Math.min(Math.max(0, x), now);
      if (x == now) {
        this.animate();
      }
    }
    this.set(x);
  };

  this.animate = function(d) {
    this.stopanimate();
    d = d || this.scale;
    var t = this;
    timer = window.setInterval(function() {
      t.set(+(new Date()));
      t.update();
    }, d);
  };

  this.stopanimate = function() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }
};

window._view = new plok.view();
