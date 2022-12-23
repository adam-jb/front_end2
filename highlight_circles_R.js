// !preview r2d3 data=c(0.3, 0.6, 0.8, 0.95, 0.40, 0.20)
//
// r2d3: https://rstudio.github.io/r2d3
//


////// to make package:
// x and y labels
// main title



/*
data_to_bind = [{dte:'30/5/12', x:100, y:100, trend: [{x:50,y:100}, {x:200,y:300}, {x:250,y:300}], val:"abba", grp:"a"}, 
				{dte:'30/5/15', x:200, y:150, trend: [{x:50,y:100}, {x:220,y:290}, {x:210,y:300}], val:"bc", grp:"a"}, 
				{dte:'30/12/12', x:300, y:170, trend: [{x:50,y:100}, {x:290,y:201},{x:290,y:300}], val:"aoo", grp:"b"}, 
				{dte:'30/7/13', x:400, y:131, trend: [{x:50,y:100}, {x:220,y:133}, {x:230,y:300}], val:"oxox", grp:"c"}]  
				*/ // if making circles, the each val in the array is linked to it 



data_to_bind2 = [{x:100, y:100, trend: [{x:'30/7/13',y:100}, {x:'30/7/14',y:300}, {x:'30/7/15',y:300}], val:"abba", grp:"a"}, 
				{x:200, y:150, trend: [{x:'30/7/13',y:100}, {x:'30/7/14',y:290}, {x:'30/7/15',y:300}], val:"bc", grp:"a"}, 
				{ x:300, y:170, trend: [{x:'30/7/13',y:100}, {x:'30/7/14',y:201},{x:'30/7/15',y:300}], val:"aoo", grp:"b"}, 
				{x:400, y:131, trend: [{x:'30/7/13',y:100}, {x:'30/7/14',y:133}, {x:'30/7/15',y:300}], val:"oxox", grp:"c"}]

///// 



/// making calculations for canvas positioning
axis_width = 40
axis_height = 50
legend_width = 40

true_width = (width - legend_width) / 2    /// total X pixels available to each plot, inc axes, excluding legend

plot_width = true_width - axis_width
plot_height = height - axis_height - 10

left_vert_x = axis_width   /// vertical axis
left_vert_y = 10
left_horiz_x =axis_width   /// horizontal axis
left_horiz_y = height - axis_height

right_vert_x = true_width + axis_width  // same, for right hand side plot
right_vert_y = 10
right_horiz_x = true_width + axis_width
right_horiz_y = height - axis_height

legend_pos = width - 120



///// adjusting scatter point size by zoom level
rad = Math.round(width / 150)






///// finding number of unique vals
all_grps = d3.map(data_to_bind2, function(d){return d.grp})
grps = [...new Set(all_grps)]   /// gets unique grp values



// text for brush
var brush = svg.append("text")
	.attr('x', 60)
  	.attr('y', 40)
  	.attr('stroke', 'black')
  	//.attr('fill', '#69a3b2')
  	.style('opacity', 0)
  	.style('font-size', 12)
  	.text('value')
//// 



//// point plot
scaleX = d3.scaleLinear()
	.domain([0, 400])
	.range([0, plot_width])

scaleY = d3.scaleLinear()
	.domain([200, 0])
	.range([0, plot_height])
	
if (grps.length > 1) {            /// to scale values from 0 to 1, unless there's only one type
  grp_increment = 1 / (grps.length - 1)   
  scale_colour_step1 = d3.scaleOrdinal()   // making numeric for viridis interpolator
  	.domain(grps)
  	.range(d3.range(0, (1 + grp_increment), grp_increment))
} else {
  scale_colour_step1 = d3.scaleOrdinal()   // making numeric for viridis interpolator
  	.domain(grps)
  	.range([0, 0])
}




svg.selectAll("circle")
	.data(data_to_bind2)
	.enter()
	.append("circle")
	  .attr('r', rad)
	  .attr('cx', function(d) {return scaleX(d.x)})    // scaleX
	  .attr('cy', function(d) {return scaleY(d.y)})
	  .attr('stroke', 'black')
	  .attr('fill', function(d) {return d3.interpolateViridis(scale_colour_step1(d.grp))})
	  .attr("transform","translate("+left_vert_x+","+left_vert_y+")")
	  .on("mouseover", function(event, d) {

	  	d3.select(this).style("fill", "red");
	  	d3.select(this).transition()       // increasing radius on hover
	        .duration(250)
	        .attr("r", rad*3);

		draw_curve(d.trend);

		brush.text(d.val)
			.attr('x', scaleX(d.x) + 10)
			.attr('y', scaleY(d.y) - 10)
			.style('opacity', 1)

	  })
	  .on("mouseout", function(event, d) {

	  	d3.select("#callback_line").remove();
	  	brush.style('opacity', 0)

	  	d3.select(this).style("fill", function(d) {return d3.interpolateViridis(scale_colour_step1(d.grp))});
	  	d3.select(this).transition()       
	        .duration(250)
	        .attr("r", rad);

	  })

svg.append("g")                     //// setting axes
	.call(d3.axisBottom(scaleX))   
	.attr("transform", "translate("+left_horiz_x+","+left_horiz_y+")")

svg.append("g")
	.call(d3.axisLeft(scaleY))
	.attr("transform","translate("+left_vert_x+","+left_vert_y+")")





// line plot
var scaleXscatter = d3.scaleLinear()
	.domain([0, 300])
	.range([0, plot_width])

var scaleYscatter = d3.scaleLinear()
	.domain([300, 0])
	.range([0, plot_height])
	
	
/// date scaler
const tParser = d3.timeParse("%d/%m/%Y")    // scale x axis by date
all_dates = []            
for (i = 0; i < data_to_bind2.length; i++) {       // getting all dates, to get min and max
  for (k = 0; k < data_to_bind2[i].trend.length; k++) {
    all_dates.push(data_to_bind2[i].trend[k].x)
  }
}
date_range = d3.extent(all_dates) 
for (i = 0; i < date_range.length; i++) {   /// converting the min/max date strings to date format
  date_range[i] = tParser(date_range[i])
}

var scaleDate = d3.scaleTime()  
  .domain(date_range)
  .range([0, plot_width])

function date_to_px(x) {
  return scaleDate(tParser(x))
}
////// end of date scaling func



svg.append("g")            /// making axes
	.call(d3.axisBottom(scaleDate))
	.attr("transform", "translate("+right_horiz_x+","+right_horiz_y+")")
	.selectAll("text")
		.attr("transform", "translate(0, 20) rotate(-60)") 

svg.append("g")
	.call(d3.axisLeft(scaleYscatter))
	.attr("transform", "translate("+right_vert_x+","+right_vert_y+")")



var curveFunc = d3.line()   // for curve: https://www.d3-graph-gallery.com/graph/shape.html#myline
  .curve(d3.curveBasis)              // This is where you define the type of curve. Try curveStep for instance.
  //.x(function(d) { return scaleXscatter(d.x) })
  .x(function(d) { return date_to_px(d.x) })
  .y(function(d) { return scaleYscatter(d.y) })

function draw_curve(trend) {    // calls data and draws it
svg.append("path")    /// has to be called "path" to work
  .attr('d', curveFunc(trend))
  .attr('stroke', 'blue')
  .attr('stroke-width', 1.5)
  .attr('fill', 'none')
  .attr("transform",  "translate("+right_vert_x+","+right_vert_y+")")
  .attr('id', 'callback_line')
}





// legend - 
svg.selectAll("mydots")
  .data(grps)
  .enter()
  .append("circle")
    .attr("cx", 0)
    .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function(d){return d3.interpolateViridis(scale_colour_step1(d))})
    .attr('transform', "translate("+true_width*2+","+0+")")

svg.selectAll("mylabels")
  .data(grps)
  .enter()
  .append("text")
    .attr("x", 20)
    .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d) {return d3.interpolateViridis(scale_colour_step1(d))})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .attr('transform', "translate("+true_width*2+","+0+")")


