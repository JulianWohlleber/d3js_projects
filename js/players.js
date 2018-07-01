
// _________________________1

// var theData = [1,2,3]
// var p = d3.select("body").selectAll("p")
// .data(theData)
// .enter()
// .append("p")
// .text(function (d,i) {
// return "i = " + i + ",    d =" + d
// });

// _________________________2

// var circleRadi = [40,20,10]
// var bodySelection = d3.select("body")
// var svgContainer = bodySelection.append("svg")
//                                 .attr("width", 600)
//                                 .attr("height", 100);
//
// var circles = svgContainer.selectAll("circle")
//                                   .data(circleRadi)
//                                   .enter()
//                                   .append("circle")
//
// var circleAttributes = circles
//                       .attr("cx", 50)
//                       .attr("cy", 50)
//                       .attr("r", function (d){ return d; })
//                       .style("fill", function (d) {
//                         var returnColor
//                         if (d === 40) { returnColor = "blue";
//                       }else if(d === 20){returnColor = "turquoise";
//                       }else if(d === 10){returnColor = "green";
//                       }
//                       return returnColor
//                     });

// _________________________3

// var spaceCircles = [30, 70, 110];
//
//  var svgContainer = d3.select("#chord-diagram").append("svg")
//                                      .attr("width", 200)
//                                      .attr("height", 200);
//
//  var circles = svgContainer.selectAll("circle")
//                            .data(spaceCircles)
//                            .enter()
//                            .append("circle");
//
// var circleAttributes = circles
//                        .attr("cx", function (d) { return d; })
//                        .attr("cy", function (d) { return d; })
//                        .attr("r", 20 )


//*******************************************************************
//  CREATE MATRIX AND MAP
//*******************************************************************
d3.csv('data/passes.csv', function (error, data) {
  var mpr = chordMpr(data);

  mpr
  .addValuesToMap('has')
  .setFilter(function (row, a, b) {
    return (row.has === a.name && row.prefers === b.name)
  })
  .setAccessor(function (recs, a, b) {
    if (!recs[0]) return 0;
    return +recs[0].count;
  });
  drawChords(mpr.getMatrix(), mpr.getMap());
});


//*******************************************************************
//  DRAW THE CHORD DIAGRAM
//*******************************************************************
function drawChords (matrix, mmap) {
  var w = 800, h = 800, r1 = h / 2, r0 = r1 - 100;

  var fill = d3.scale.ordinal()
  .domain(d3.range(3))
  .range(["#eee"]); //colors of each segments

  var chord = d3.layout.chord()
  .padding(.03) //distance between circles
  .sortSubgroups(d3.descending)
  .sortChords(d3.descending);

  var arc = d3.svg.arc()
  .innerRadius(r0)
  .outerRadius(r0 + 12);

  var svg = d3.select("body").append("svg:svg")
  .attr("width", w)
  .attr("height", h)
  .append("svg:g")
  .attr("id", "circle")
  .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");



  var rdr = chordRdr(matrix, mmap);
  chord.matrix(matrix);

  var g = svg.selectAll("g.group")
  .data(chord.groups())
  .enter().append("svg:g")
  .attr("class", "group")
  .on("click", mouseover)
  .on("release", function (d) { d3.select("#tooltip").style("visibility", "hidden") });


  g.append("svg:path")
  .style("fill", function(d) { return fill(d.index); })
  .attr("d", arc);

  g.append("circle")
  .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
  .attr("cx", 30)
  .attr("cy", 30)
  .attr("r", 30)
  .attr("fill", "#eee")
  .attr("transform", function(d) {
    return "rotate(" + (d.angle * 180 / Math.PI-95) + ")"
    + "translate(" + (r0 + 40) + ")"
    // + (d.angle > Math.PI ? "rotate(360)" : "");
  })

  .append("image")
  .attr({
    "xlink:src": "/img/players/player1.png",
    x: 0,
    y: 0,
    width:128,
    height: 128})

    //---------------------------Everything with the chordPath

    var chordPaths = svg.selectAll("path.chord")
    .data(chord.chords())
    .enter().append("svg:path")
    .attr("class", "chord")
    .style("stroke", function(d) { return d3.rgb(fill(d.target.index)).darker(); })
    .style("fill", function(d) { return fill(d.target.index); })
    .attr("d", d3.svg.chord().radius(r0))
    .on("mouseover", function (d) {
      d3.select("#tooltip")
      .style("visibility", "visible")
      .html(chordTip(rdr(d)))
      .style("top", function () { return (d3.event.pageY - 100)+"px"})
      .style("left", function () { return (d3.event.pageX - 100)+"px";})
    })
    .on("mouseout", function (d) { d3.select("#tooltip").style("visibility", "hidden") });


    function chordTip (d) {
      console.log("inside pi");
      var p = d3.format(".2%"), q = d3.format(",.3r")
      return "Chord Info:<br/>"
      + p(d.svalue/d.stotal) + " (" + q(d.svalue) + ") of "
      + d.sname + " prefer " + d.tname
      + (d.sname === d.tname ? "": ("<br/>while...<br/>"
      + p(d.tvalue/d.ttotal) + " (" + q(d.tvalue) + ") of "
      + d.tname + " prefer " + d.sname))
    }

    function groupTip (d) {
      var p = d3.format(".1%"), q = d3.format(",.3r")
      console.log(p);
      return "Group Info:<br/>"
      + d.gname + " : " + q(d.gvalue) + "<br/>"
      + p(d.gvalue/d.mtotal) + " of Matrix Total (" + q(d.mtotal) + ")"
    }

      g.append("svg:text")
      .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .style("font-family", "helvetica, arial, sans-serif")
      .style("font-size", "10px")
      .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
      .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
        + "translate(" + (r0 + 26) + ")"
        + (d.angle > Math.PI ? "rotate(180)" : "");
      })

      function mouseover(d, i) {
        console.log("mouseover");
        chordPaths.classed("fade", function(p) {
          return p.source.index != i
          && p.target.index != i;
        });
      }
    }
