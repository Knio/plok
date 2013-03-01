
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
