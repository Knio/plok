var plok = window.plok = {};

var FILL_COLORS = [
  'hsla(32,  70%, 80%, 0.2)',
  'hsla(167, 70%, 80%, 0.2)',
  'hsla(302, 70%, 80%, 0.2)',
  'hsla(77,  70%, 80%, 0.2)',
  'hsla(122, 70%, 80%, 0.2)',
  'hsla(257, 70%, 80%, 0.2)',
  'hsla(212, 70%, 80%, 0.2)',
  'hsla(347, 70%, 80%, 0.2)'
];


var COLORS = [
  'hsla(32,  70%, 70%, 1.0)',
  'hsla(167, 70%, 70%, 1.0)',
  'hsla(302, 70%, 70%, 1.0)',
  'hsla(77,  70%, 70%, 1.0)',
  'hsla(122, 70%, 70%, 1.0)',
  'hsla(257, 70%, 70%, 1.0)',
  'hsla(212, 70%, 70%, 1.0)',
  'hsla(347, 70%, 70%, 1.0)'
];

plok.view = function(end) {
  this.end = +end || +(new Date());
  this.scale = 10.0; // miliseconds per pixel
  this.max = -1;
  this.min =  0;
  this.timer = null;
  this.subscribers = [];

  this.clear = function() {
    this.subscribers = [];
  }

  this.subscribe = function(g) {
    this.subscribers.push(g);
  };

  this.set = function(x) {
    this.end = x;
    this.update();
  };

  this.scroll = function(d) {
    this.stopanimate();
    var x = this.end + d * this.scale * 16;
    if (this.max === -1) {
      var now = +(new Date());
      if (x > now) {
        x = now;
        this.animate();
      }
    } else if (this.max) {
      x = Math.min(x, this.max);
    }
    if (this.min) {
      x = Math.max(x, this.min);
    }
    this.set(x);
  };

  this.animate = function(d) {
    this.stopanimate();
    d = d || this.scale;
    var t = this;
    this.timer = window.setInterval(function() {
      t.set(+(new Date()));
      t.update();
    }, d);
  };

  this.stopanimate = function() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  this.update = function() {
    for (var i = 0; i < this.subscribers.length; i++) {
      this.subscribers[i].update();
    }
  }

};
var _view = new plok.view();


plok.data = function(data) {
  // data is a list of [ts, value] pairs
  this.data = data || [];

  this.append = function(ts, value) {
    this.data.push([+ts, value]);
  };
  this.insert = function(ts, value) {

  };

  this.get_range = function(start, stop, step) {
    // returns array of length [step],
    // of data values between [start, stop)
    var data = this.data;
    var n = data.length;
    start = +start;
    stop = +stop;
    step = +step;
    var s = 0;
    var e = n;
    var m, t;

    var _i = 0;

    while (s < e - 1) {
      m = Math.floor((s + e) / 2);
      t = data[m][0];
      if (t < start) {
        s = m;
      } else {
        e = m;
      }
      if (_i++ > 1000) {
        throw 'infinite loop';
      }
    }

    data.push([stop + 1, 0]);
    var d = [];

    s--;
    // data[s][0] is <= start
    // s may be -1

    var v = 0;
    var t1 = 0;
    var t2 = data[s + 1][0];

    if (s >= 0) {
      v = data[s][1];
      t1 = data[s][0];
    }

    // if multiple data values overlap the range [i, i+1),
    // average them
    for (var i = start; i < stop; i += step) {
      var a = 0;
      var x = i + step;
      t1 = i;
      while (t2 < x) {
        a += (t2 - t1) * v;
        s++;
        v = data[s][1];
        t1 = t2;
        t2 = data[s + 1][0];
      }
      a += (x - t1) * v;
      d.push(a / step);

    }

    data.pop();

    return d;

  }

};


plok.topaxis = function(view, w) {
  view = this.view = view || _view;
  view.subscribe(this);

  var svg = this.dom =
    document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'plok-axis');

  var scale = d3.time.scale();
  var axis = d3.svg.axis();
  var _ax;
  axis.orient('top');

  var d = d3.select(svg);
  d.attr('width', w).attr('height', 20).attr('class', 'axis');
  _ax = d.append('g').attr('transform', 'translate(0, 20)');

  this.update = function() {
    var stop = view.end;
    var start = stop - view.scale * w;

    scale.domain([start, stop]);
    scale.range([0, w]);
    axis.scale(scale);
    _ax.call(axis);
  };

};

plok.chart = function(view, data) {
  view = this.view = view || _view;
  view.subscribe(this);


  var canvas = this.dom = this.canvas = document.createElement('canvas');

  var w = canvas.width  = 480;
  var h = canvas.height = 240;

  // this.container = document.createElement('div');
  // this.container.setAttribute('class', 'plok-chart-root');
  // this.container.appendChild(this.canvas);

  // this.append = function(dom) {
  //   if (typeof dom === 'string') {
  //     dom = document.getElementById(dom);
  //   }
  //   dom.appendChild(this.container);
  // };

  this.canvas.addEventListener('mousewheel', function(e) {
    view.scroll(e.wheelDeltaY / 120.);
  }, false);

  var ctx = this.ctx = this.canvas.getContext('2d');


  this.update = function() {
    draw();
  }

  var draw = function() {
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -h);
    ctx.clearRect(0, 0, w, h);

    var stop = view.end;
    var start = stop - view.scale * w;
    var step = (stop - start) / w;
    // hope this results in exactly w entries
    var d = data.get_range(start, stop, step);

    var y;
    ctx.fillStyle = FILL_COLORS[0];
    for (var x = 0; x < w; x++) {
      y = d[x];
      ctx.fillRect(x, 0, 1, y);
    }
    var p = null;
    var e, s;
    ctx.fillStyle = COLORS[0];
    for (var x = 0; x < w; x++) {
      y = d[x];
      if (p === null) { p = y; }
      s = Math.min(p, y);
      e = Math.abs(p - y) + 2;
      p = y;
      ctx.fillRect(x, s, 1, e);
    }

    ctx.restore();
  };
};
