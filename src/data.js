
plok.data = function(data) {
  // data is a list of [ts, value] pairs
  this.data = data || [];

  this.append = function(ts, value) {
    this.data.push([+ts, value]);
  };
  this.insert = function(ts, value) {
    throw 'not implemented';
  };

  this.get_range = function(start, stop) {
    // return array of [timestamp, value] enties
    // where the first timestamp is <= start
    // and the last timestamp is < end
    var data = this.data;
    var n = data.length;
    start = +start;
    stop = +stop;
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
      // if (_i++ > 1000) {
      //   throw 'infinite loop';
      // }
    }

    var v;
    var d = [];
    for (; s < data.length; s++) {
      v = data[s];
      if (v[0] >= stop) {
        break;
      }
      d.push(v);
    }
    return d;
  };

  this.get_value = function(ts, dfl) {
    var v = this.get_range(ts, ts);
    if (v.length) {
      return v[0][1];
    }
    return dfl;
  };

};
