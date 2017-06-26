var width = 500,
    height = 385,
    radius = Math.min(width, height) / 2;

var xx = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var yy = d3.scale.sqrt()
    .range([0, radius]);

var colorr = d3.scale.category20c();

var svgg = d3.select("#mySVGG")
    .attr("width", width)
    .attr("height", function(){return height+10})
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + ((height / 2)+5) + ")");

var partitionn = d3.layout.partition()
    .sort(null)
    .value(function(d) { return d.size; });

var arcc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, xx(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, xx(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, yy(d.y)); })
    .outerRadius(function(d) { return Math.max(0, yy(d.y + d.dy)); });

// Keep track of the node that is currently being displayed as the root.
var node;

d3.json("../json/data.json", function(error, root) {
  console.log(root);
  node = root;
  var pathh = svgg.datum(root).selectAll("path")
      .data(partitionn.nodes)
    .enter().append("path")
      .attr("d", arcc)
      .style("fill", function(d) { 
        if(d.parent===undefined){
          return "white";
        }
        else if(d.name === "Crash"){
          return "#f0ad4e";
        }
        else if(d.name === "Pass"){
          return "#5cb85c";
        }
        else{
          return colorr((d.children ? d : d.parent).name); 
        }
      })
      .on("click", click)
      .on("mouseover", hover)
      .each(stash);

  d3.selectAll(".first").on("change", function change() {
    var value = this.value === "size"
        ? function(d) { return d.size; }
        : function() { return 1; };

    pathh
        .data(partitionn.value(value).nodes)
      .transition()
        .duration(1000)
        .attrTween("d", arcTweenDataa);
  });

  function click(d) {
    node = d;
    pathh.transition()
      .duration(1000)
      .attrTween("d", arcTweenZoom(d));
  }
  function deshover(){
      $("#api").html(".");
      $("#apia").html(".");
      $("#sr").html(".");
      $("#sra").html(".");
      $("#cr").html(".");
      $("#ps").html(".");
        $("#cr").css("color","black")
        $("#ps").css("color","black")
  }

  function hover(d) {
    if(d.parent===undefined){
      $("#api").html(".");
      $("#apia").html(".");
      $("#sr").html(".");
      $("#sra").html(".");
      $("#cr").html(".");
      $("#cr").css("background-color","#f5f5f5");
      $("#ps").html(".");
      $("#ps").css("background-color","#f5f5f5");
        $("#cr").css("color","black")
        $("#ps").css("color","black")
    }
    else if(d.parent !== undefined && d.parent.parent === undefined){
      $("#api").html(d.name);
      $("#apia").html(d.value);
      $("#sr").html(".");
      $("#sra").html(".");
      $("#cr").html(".");
      $("#cr").css("background-color","#f5f5f5")
      $("#ps").html(".");
      $("#ps").css("background-color","#f5f5f5");
        $("#cr").css("color","black")
        $("#ps").css("color","black")
    }
    else if(d.parent !== undefined && d.parent.parent !== undefined && d.parent.parent.parent === undefined){
      $("#api").html(d.parent.name);
      $("#apia").html(d.parent.value);
      $("#sr").html(d.name);
      $("#sra").html(d.value);
      $("#cr").html(d.children[0].value);
      $("#cr").css("background-color","#f5f5f5")
      $("#ps").html(d.children[1].value);
      $("#ps").css("background-color","#f5f5f5");
        $("#cr").css("color","black")
        $("#ps").css("color","black")
    }
    else{
      $("#api").html(d.parent.parent.name);
      $("#apia").html(d.parent.parent.value);
      $("#sr").html(d.parent.name);
      $("#sra").html(d.parent.value);
      if(d.name==="Crash"){
        $("#cr").html(d.value);
        $("#cr").css("background-color","#f0ad4e")
        $("#ps").html(d.parent.children[1].value);
        $("#ps").css("background-color","#f5f5f5")
        $("#cr").css("color","white")
        $("#ps").css("color","black")
      }
      else{
        $("#cr").html(d.parent.children[0].value);
        $("#cr").css("background-color","#f5f5f5")
        $("#ps").html(d.value);
        $("#ps").css("background-color","#5cb85c")
        $("#cr").css("color","black")
        $("#ps").css("color","white")
      }
      
    } 
  }
});

d3.select(self.frameElement).style("height", height + "px");

// Setup for switching data: stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// When switching data: interpolate the arcs in data space.
function arcTweenDataa(a, i) {
  var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  function tween(t) {
    var b = oi(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  }
  if (i == 0) {
   // If we are on the first arc, adjust the x domain to match the root node
   // at the current zoom level. (We only need to do this once.)
    var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
    return function(t) {
      x.domain(xd(t));
      return tween(t);
    };
  } else {
    return tween;
  }
}

// When zooming: interpolate the scales.
function arcTweenZoom(d) {
  var xd = d3.interpolate(xx.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(yy.domain(), [d.y, 1]),
      yr = d3.interpolate(yy.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arcc(d); }
        : function(t) { xx.domain(xd(t)); yy.domain(yd(t)).range(yr(t)); return arcc(d); };
  };
}

function filterTable(){
    var input, filter, select, selection, table, tr, td, i;
    input = document.getElementById("myyInput");
    filter = input.value.toUpperCase();
    select = document.getElementById("selection");
    selection = select.value;
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[selection];
        console.log(td);
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        } 
    }
    console.log(tr.length);
}

function cleanFilter(){
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    input = document.getElementById("myyInput");
    input.value = "";
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        tr[i].style.display = "";
    }
}