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

plok.view = function() {
  this.end = +(new Date());
  this.scale = 100.0; // miliseconds per pixel
  this.graphs = [];
  this.add_graph = function(g) {
    this.graphs.push(g);
  };
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
    var data = this.data;
    var n = data.length;
    start = +start;
    stop = +stop;
    step = +step;
    var s = 0;
    var e = n;
    var m, t;
    while (s < e - 1) {
      m = Math.floor((s + e) / 2);
      t = data[m][0];
      if (t < start) {
        s = m + 1;
      } else {
        e = m;
      }
    }

    var d = [];
    var v;

    for (var i = start; i < stop; i += step) {
      do {
        var _d = data[s];
        var t = _d[0];
        if (t >= i + step) { break; }
        v = _d[1];
        s++;
      } while (s != n);
      s--;
      d.push(v);
    }
    return d;
  }

};

// TODO: axis
// TODO: multiple data
// TODO: mouse events

plok.chart = function(data, view) {
  view = this.view = view || _view;


  var canvas = this.canvas = document.createElement('canvas');
  var svg    = this.svg    = document.createElement('svg');

  var w = canvas.width  = 480;
  var h = canvas.height = 240;

  var scale = d3.time.scale();
  var axis = d3.svg.axis();
  var _ax;

  (function() {

    var d = d3.select(svg);
    d.attr('width', w).attr('height', 30).attr('class', 'axis');
    _ax = d.append('g').attr('transform', 'translate(0, 0)').call(axis);

  }).call(this);

  this.container = document.createElement('div');
  this.container.setAttribute('class', 'plok-chart-root');
  this.container.appendChild(this.svg);
  this.container.appendChild(this.canvas);

  var ctx = this.ctx = this.canvas.getContext('2d');

  this.append = function(dom) {
    if (typeof dom === 'string') {
      dom = document.getElementById(dom);
    }
    dom.appendChild(this.container);
  };

  this.update = function() {
    var stop = view.end;
    var start = stop - view.scale * w;

    scale.domain([start, stop]);
    scale.range([0, w]);
    axis.scale(scale);
    _ax.call(axis);

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
