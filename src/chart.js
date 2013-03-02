
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
  'hsla(32,  70%, 60%, 1.0)',
  'hsla(167, 70%, 60%, 1.0)',
  'hsla(302, 70%, 60%, 1.0)',
  'hsla(77,  70%, 60%, 1.0)',
  'hsla(122, 70%, 60%, 1.0)',
  'hsla(257, 70%, 60%, 1.0)',
  'hsla(212, 70%, 60%, 1.0)',
  'hsla(347, 70%, 60%, 1.0)'
];


plok.data_adapter = function(data, color_idx) {
  var that = this;
  this.color_idx = color_idx || 0;
  this.data = data;

  this.get_values = function(start, stop, step) {
    var data = this.data.get_range(start, stop);
    var d = [];
    if (data.length == 0) {
      return {data: d, max_value: 0};
    }

    // index of first data point where ts <= start
    // may be invalid (-1)
    var s = data[0][0] <= start ? 0 : -1;

    data.push([stop + 1, 0]);

    var v = 0;                // current value
    var t1 = 0;               // current ts
    var t2 = data[s + 1][0];  // next ts

    if (s >= 0) {
      v = data[s][1];
      t1 = data[s][0];
    }

    var d_max = 0;

    // if multiple data values overlap the range [i, i+1),
    // average them
    for (var i = start; i < stop; i += step) {
      var a = 0;
      var x = Math.min(i + step, stop);
      t1 = i;
      while (t2 < x) {
        a += (t2 - t1) * v;
        s++;
        v = data[s][1];
        t1 = t2;
        t2 = data[s + 1][0];
      }
      a += (x - t1) * v;
      a /= step;
      d_max = Math.max(Math.abs(a), d_max);
      d.push(a);
    }

    return {data: d, max_value: d_max};
  };

  this.renderer = function(ctx, w, h, start, stop) {

    var step = (stop - start) / w;
    var values = that.get_values(start, stop, step);
    var data = values.data;
    this.max_value = values.max_value;

    this.render_background = function(scale) {
      var x;
      var y;
      ctx.fillStyle = FILL_COLORS[that.color_idx];
      for (x = 0; x < w; x++) {
        y = data[x] * scale;
        if (y >= 0) {
          ctx.fillRect(x, 0, 1, y);
        } else {
          ctx.fillRect(x, h, 1, y);
        }
      }
    };

    this.render_foreground = function(scale) {
      var x;
      var y;
      var p = null;
      var e;
      var s;
      ctx.fillStyle = COLORS[that.color_idx];
      for (x = 0; x < w; x++) {
        y = data[x] * scale;
        if (p === null) { p = y; }
        s = Math.min(p, y);
        e = Math.abs(p - y) + 1;
        p = y;
        if (e >= 0) {
          ctx.fillRect(x, s, 1, e);
        }
        if (s <= 0) {
          ctx.fillRect(x, h + s, 1, e);
        }
      }
    };
  }
};

plok.chart = function(parent_selector, view) {
  view = this.view = view || window._view;
  view.subscribe(this);

  var parent = d3.select(parent_selector)[0][0];
  var canvas = this.dom = this.canvas = document.createElement('canvas');

  var w = canvas.width  = parent.clientWidth;
  var h = canvas.height = parent.clientHeight;

  canvas.addEventListener('mousewheel', function(e) {
    e.preventDefault();
    view.scale_by(1 - (e.wheelDeltaY / 1200.));
  }, false);

  (function() {
    var down = 0;
    var x = 0;

    canvas.addEventListener('mousedown', function(e) {
      e.preventDefault();
      down = 1;
    }, false);

    canvas.addEventListener('mouseup', function(e) {
      e.preventDefault();
      down = 0;
    }, false);


    canvas.addEventListener('mousemove', function(e) {
      e.preventDefault();
      if (e.which === 0) { down = 0; }
      var dx = x - e.screenX;
      x = e.screenX;
      if (down) {
        view.scroll(dx);
      }
    }, false);
  })();


  parent.appendChild(canvas);

  var ctx = this.ctx = canvas.getContext('2d');

  var data_adapters = [];
  this.add_data = function(data) {
    var a = new plok.data_adapter(data, data_adapters.length % COLORS.length);
    data_adapters.push(a);
  };

  for (var i = 2; i < arguments.length; i++) {
    this.add_data(arguments[i]);
  }

  this.update = function() {
    w = canvas.width  = parent.clientWidth;
    h = canvas.height = parent.clientHeight;
    draw();
  }

  var draw = function() {
    var stop = view.end;
    var start = stop - view.scale * w;

    var i;
    var renderers = [];
    var maxes = [1e-5];
    for (i = 0; i < data_adapters.length; i++) {
      var r = new data_adapters[i].renderer(ctx, w, h, start, stop);
      renderers.push(r);
      maxes.push(r.max_value);
    }

    // find nice scale value
    var max = Math.max.apply(this, maxes) * 1.05;
    var base = Math.pow(10, Math.floor(Math.log(max) / Math.log(10)));
    var scale = (1 + Math.floor(max / base)) * base;

    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -h);
    ctx.clearRect(0, 0, w, h);

    for (i = 0; i < renderers.length; i++) {
      ctx.save();
      renderers[i].render_background(h / scale);
      ctx.restore();
    }

    for (i = 0; i < renderers.length; i++) {
      ctx.save();
      renderers[i].render_foreground(h / scale);
      ctx.restore();
    }
    ctx.restore();

  };
};
