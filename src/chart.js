
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

plok.chart = function(parent_selector, view, data) {
  view = this.view = view || window._view;
  view.subscribe(this);

  var parent = d3.select(parent_selector)[0][0];
  var canvas = this.dom = this.canvas = document.createElement('canvas');

  var w = canvas.width  = parent.clientWidth;
  var h = canvas.height = parent.clientHeight;

  canvas.addEventListener('mousewheel', function(e) {
    e.preventDefault();
    view.scroll(e.wheelDeltaY / 120.);
  }, false);

  parent.appendChild(canvas);

  var ctx = this.ctx = canvas.getContext('2d');

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
