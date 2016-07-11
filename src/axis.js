
plok.topaxis = function(parent_selector, view) {
  view = this.view = view || window._view;
  view.subscribe(this);


  var scale = d3.scaleTime();
  var axis = d3.axisTop();
  var _ax;

  var parent = document.querySelector(parent_selector);
  var w = parent.clientWidth;
  var svg = this.dom =
    document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var d = d3.select(svg);
  d.attr('width', w).attr('height', 20).attr('class', 'plok-axis');
  _ax = d.append('g').attr('transform', 'translate(0, 20)');
  parent.appendChild(svg);

  this.update = function() {
    w = parent.clientWidth;
    d.attr('width', w);

    var stop = view.end;
    var start = stop - view.scale * w;

    scale.domain([start, stop]);
    scale.range([0, w]);
    axis.scale(scale);
    _ax.call(axis);
  };

  this.focus = function() { };
};
