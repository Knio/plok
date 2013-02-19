PLOK
====

A Javascript library for interactive visualization of time-series data.

Inspired by [Cubism](https://github.com/square/cubism)


Installation
------------

Download the latest build here:

* <plok.zkpq.ca/plok.min.js>

Or include it on your page directly:

    <script type="text/javascript" src="http://plok.zkpq.ca/plok.min.js"></script>

`plok` may also benefit from using this stylesheet:

* <plok.zkpq.ca/plok.css>

    <link rel="stylesheet" href="http://plok.zkpq.ca/plok.css" type="text/css" />


Example
-------


<div id="plok-example"></div>

<script type="text/javascript" src="http://plok.zkpq.ca/plok.min.js"></script>
<script>
      var view = new plok.view();
      var data = new plok.data();

      var now = +(new Date());
      var x = 100;
      for (var i=now-100000; i<now+100000; i+=100) {
        x += (Math.random() - 0.5) * 5;
        data.append(i, x);
      }

      var dom = document.getElementById('plok-example');
      dom.appendChild((new plok.topaxis(view, dom.clientWidth)).dom);
      dom.appendChild((new plok.chart(view, data)).dom);

      view.animate();
</script>


Usage
-----

TODO

    var view = new plok.view();
    var data = new plok.data();

    // generate some random values
    var now = +(new Date());
    var x = 100;
    for (var i=now-100000; i<now+100000; i+=100) {
        x += (Math.random() - 0.5) * 5;
        data.append(i, x);
    }

    pyy('#content').div({cls:'plok-chart-root'},
    (new plok.topaxis(view, 480)).dom,
    (new plok.chart(view, data)).dom
    );

    view.animate();

