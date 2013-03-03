// want a view of a fixed range
// want a view tracking the current time, plus some time in the past

plok.view = function(start, stop) {
  this.end = +start || +(new Date());
  this.scale = 25.0; // miliseconds per pixel

  var static_mode = (start && stop);
  var timer = null;
  var subscribers = [];
  var focused = null;

  this.destroy = function() {
    subscribers = [];
    this.stopanimate();
  }

  this.subscribe = function(g) {
    subscribers.push(g);
  };

  this.unsubscribe = function(g) {
    var s = [];
    for (var i = 0; i < subscribers.length; i++) {
      if (subscribers[i] === g) { continue }
      s.push(subscribers[i]);
    }
    subscribers = s;
  };

  var update_pending = false;
  this.update = function(now) {
    var do_update = function() {
      for (var i = 0; i < subscribers.length; i++) {
        subscribers[i].update();
      }
      update_pending = false;
    }
    if (now) {
      do_update();
    }
    else if (!update_pending) {
      update_pending = true;
      window.setTimeout(do_update, 10);
    }
  }

  this.focus = function(x) {
    focused = +x;
    for (var i = 0; i < subscribers.length; i++) {
      subscribers[i].focus(focused);
    }
  };

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
      var last = t.end;
      t.set(+(new Date()));
      t.update();
      var f = focused + t.end - last;
      t.focus(f);
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
