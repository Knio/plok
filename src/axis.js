
plok.topaxis = function(parent_selector, view) {
  view = this.view = view || window._view;
  view.subscribe(this);


  var scale = d3.time.scale();
  var axis = d3.svg.axis();
  var _ax;
  axis.orient('top');

  var parent = d3.select(parent_selector)[0][0];
  var w = parent.clientWidth;
  console.log(parent);
  var svg = this.dom =
    document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var d = d3.select(svg);
  d.attr('width', w).attr('height', 20).attr('class', 'plok-axis');
  _ax = d.append('g').attr('transform', 'translate(0, 20)');
  parent.appendChild(svg);

  this.update = function() {
    var stop = view.end;
    var start = stop - view.scale * w;

    scale.domain([start, stop]);
    scale.range([0, w]);
    axis.scale(scale);
    _ax.call(axis);
  };
};
