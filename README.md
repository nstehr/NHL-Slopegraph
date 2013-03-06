# NHL Standings Slopegraph
===========
Visualization of NHL standings as a modified [slopegraph](http://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0003nk).
I call it a modified slopegraph, as it doesn't follow the true definition of having both sides basically on the same scale.
My two sides are currently independent, and ordered based on ranking/points.  I chose independent scales for each side so that
the teams on either side basically line up, and the slopes represent just a pure change in position.  Also, the number of points
will always go up through time, so if I felt if they shared a scale the slopes would always be positive, which wouldn't really
capture what I wanted to represent....

![screenshot](https://raw.github.com/nstehr/NHL-Slopegraph/master/screenshot.png)

## Author

Nathan Stehr - [laserdeathstehr.com](http://laserdeathstehr.com)

## Data Sources

* NHL Standings data: [Shrp Sports](http://www.shrpsports.com/nhl/).

##TODO

* Tweak layout algorithm
* Fix magic numbers in visualize.js code