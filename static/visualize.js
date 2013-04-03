var graphWidth = 500; 
var graphHeight = 600;
var teamBuffer = 15;
var transitionDuration = 750;
var fontSize = 12;
var fontFamily = 'Julius Sans One';
var playoffColor = 'crimson';
var nonPlayoffColor = 'black';


$.getJSON('static/data.json', function(data) {
	
	var dates = $.map(data,function(value,index){return value['date']});
	$.each(dates, function(key, value) {   
	     $('#rightDateSelect')
	          .append($('<option>', { value : key })
	          .text(value)); 
	     	$('#leftDateSelect')
		          .append($('<option>', { value : key })
		          .text(value));
	});
	
	//callback for listening to when the date selects change
	var onSelectChanged = function(){
	    var leftIndex = $('#leftDateSelect').val();
	    var rightIndex = $('#rightDateSelect').val();
	    if(parseInt(leftIndex) <= parseInt(rightIndex)){
	        var leftData = data[leftIndex];
	        var rightData = data[rightIndex];
	        var conferenceKey = $('#conferenceSelect').val();
	        var conferenceText = $("#conferenceSelect option:selected").text();
	  
	        renderStandings(chart,leftData,rightData,{'key':conferenceKey,'title':conferenceText});
	    }
	}
	
	$('#leftDateSelect').change(onSelectChanged);
	$('#rightDateSelect').change(onSelectChanged);
	$('#conferenceSelect').change(onSelectChanged);
	
	//set the left select to initially be the lowest date
	$('#leftDateSelect').val(0);
	//set the right select to initially be the highest date
	$('#rightDateSelect').val(dates.length-1);
	
	var leftData = data[0];
	var rightData = data[dates.length-1];
	
	//sets up the basic container for the visualization
	var chart = d3.select("#slopegraph").append("svg")
	     .attr("width", graphWidth)
	     .attr("height", graphHeight);

	//initial rendering of the graph
    renderStandings(chart,leftData,rightData,{'key':'westernConference','title':'Western Conference'});
    

});

function renderStandings(chart,left,right,conferenceName){
	
	
	var conference = conferenceName.key;
	var leftDate = left.date;
	var rightDate = right.date;


       
        var titleGroup = chart.select('.titleGroup')
		//add a title based on the conference and dates
		if(titleGroup.empty()){
		    titleGroup = chart.append("g");
		    titleGroup.attr('class','titleGroup');
		    titleGroup.append('text')
				.attr('x', 195)
				.attr('y', 20)
				.attr('id','conference')
				.attr('font-family',fontFamily)
				.text(conferenceName.title);
				
		    //left hand date	
		     titleGroup.append('text')
		         .attr('x', 100)
				 .attr('y', 20)
				 .attr('font-family',fontFamily)
				 .attr('font-size',13)
				 .attr('id','leftDate')
				 .text(leftDate);

			//right hand date
			 titleGroup.append('text')
			    .attr('x', 400)
				.attr('y', 20)
				.attr('font-family',fontFamily)
				.attr('font-size',13)
				.attr('id','rightDate')
				.text(rightDate);
		}
		//if the title group exists, just change the text values
		else{
			titleGroup.select('#conference').text(conferenceName.title);
			titleGroup.select('#leftDate').text(leftDate);
			titleGroup.select('#rightDate').text(rightDate);
		}
		
		
		
	
	
	//get all the points into arrays
	var conferencePointsLeft = $.map(left[conference],function(value,index){
		    return value['points'];
		});
	var conferencePointsRight = $.map(right[conference],function(value,index){
			    return value['points'];
			});
	
	
	//create an intial scale functions based on the points
	var leftY = d3.scale.linear()
					.domain([d3.min(conferencePointsLeft),d3.max(conferencePointsLeft)])
					.range([graphHeight-300,60]);
	var rightY = d3.scale.linear()
					.domain([d3.min(conferencePointsRight),d3.max(conferencePointsRight)])
					.range([graphHeight-300,60]);
					
	//setup the y coordinates for each data point
	for(var i=0;i<left[conference].length;i++){
		var val = left[conference][i];
		val.yCoord = leftY(val.points);
	}
	for(var i=0;i<right[conference].length;i++){
		var val = right[conference][i];
		val.yCoord = rightY(val.points);
	}
	
	/* to account for the fact that it is highly likely that
	* teams can have the same number of points, and 
	* that close point values might translate coords
	* that cause overlapping text, apply a simple
	* algorithm to adjust the positions to look nice
	*/
    adjustYCoords(left[conference]);
    adjustYCoords(right[conference]); 	
					
	var leftGroup = chart.select('.leftGroup');
	if(leftGroup.empty()){
		leftGroup = chart.append("g");
		leftGroup.attr("class","leftGroup");
	}
	
	/* select any teams if there are any
	*
	* NOTE: the the function that is the argument to 'data'
	* is key for doing updates. This sets up a data key
	* so that when an update is performed, it can find existing elements
	*
	*/
	var leftTeams = leftGroup.selectAll("text").data(left[conference],function(d) { return d.team; });
	
	//add teams if necessary
	leftTeams
	         .enter().append("text")
			 .attr("x",100)
			 .attr('font-family',fontFamily)
			 .attr('font-size',fontSize)
			 .attr('y', function(d,i){return d.yCoord;})
			 .text(function(d, i) { return d.team; });
			
	//update the y position and playoff coloring		
	leftTeams.attr('fill',function(d,i){if(i<8) return playoffColor;else return nonPlayoffColor;}) //make the playoff bound teams standout
			.transition()
			.duration(transitionDuration)
			.attr('y', function(d,i){return d.yCoord;});
	
	//remove teams if necessary		
	leftTeams.exit().remove();
	
	//for all the other groups follow the same pattern as above: select, add/enter, update, exit/delete		
	var leftPointsGroup = chart.select('.leftGroupPoints');
	if(leftPointsGroup.empty()){
		leftPointsGroup = chart.append("g");
		leftPointsGroup.attr("class","leftGroupPoints");
	}

    var leftPoints = leftPointsGroup.selectAll("text").data(left[conference],function(d) { return d.team; });
    leftPoints.enter().append("text")
              .attr("x",200)
              .attr('y', function(d,i){return d.yCoord})
              .attr('font-family',fontFamily) 
			  .attr('font-size',fontSize);

	leftPoints.text(function(d, i) { return d.points; })
	         .transition()
			 .duration(transitionDuration)
	         .attr('y', function(d,i){return d.yCoord});
	
	leftPoints.exit().remove();
			
	var rightGroup = chart.select('.rightGroup');
	if(rightGroup.empty()){
		rightGroup = chart.append("g");
		rightGroup.attr("class","rightGroup");
	}
	
	//setup the right side teams and points
	var rightTeams = rightGroup.selectAll("text").data(right[conference],function(d) { return d.team; });
	
		  rightTeams.enter().append("text")
		  .attr("x",400)
		  .attr('font-family',fontFamily)
		  .attr('font-size',fontSize)
		  .attr('y', function(d,i){return d.yCoord;})
		  .text(function(d, i) { return d.team; });
		
	rightTeams.attr('fill',function(d,i){if(i<8) return playoffColor;else return nonPlayoffColor;}) //make the playoff bound teams standout
				.transition()
				.duration(transitionDuration)
				.attr('y', function(d,i){return d.yCoord;});
	rightTeams.exit().remove();
		
	var rightPointsGroup = chart.select('.rightGroupPoints');
		if(rightPointsGroup.empty()){
		   rightPointsGroup = chart.append("g");
		   rightPointsGroup.attr("class","rightGroupPoints");
		 }

	var rightPoints = rightPointsGroup.selectAll("text").data(right[conference],function(d) { return d.team; });
		rightPoints.enter().append("text")
		    .attr("x",350)
		    .attr('y', function(d,i){return d.yCoord})
			.attr('font-family',fontFamily)
			.attr('font-size',fontSize);

	 rightPoints.text(function(d, i) { return d.points; })
	        .transition()
			.duration(transitionDuration)
			.attr('y', function(d,i){return d.yCoord});
	 rightPoints.exit().remove();
	
	//combine the coord values for drawing the slopes
	var slopes = [];
	for(var i=0;i<left[conference].length;i++){
		var val = left[conference][i];
		var slope = {};
		slope.left = val.yCoord;
		for(var j=0;j<right[conference].length;j++){
			if(val.team === right[conference][j].team){
				slope.right = right[conference][j].yCoord;
				slope.team = right[conference][j].team;
				break;
			}	
		}
	    slopes.push(slope);	
	}
	
	
	var slopeGroup = chart.select('.slopeGroup');
	if(slopeGroup.empty()){
		slopeGroup = chart.append("g");
		slopeGroup.attr("class","slopeGroup");
	}
	
	var slopeLines = slopeGroup.selectAll("line").data(slopes,function(d){return d.team});

	 slopeLines.enter().append("line")
	    .attr('x1', 220)
		.attr('x2', 345)
		.attr('y1',function(d,i){return d.left - (teamBuffer/2);})
		.attr('y2',function(d,i){return d.right - (teamBuffer/2);})
		.attr('opacity', .5)
		.attr('stroke', 'black');	
	
	slopeLines.transition().duration(750)
	                       .attr('y1',function(d,i){return d.left - (teamBuffer/2);})
	                       .attr('y2',function(d,i){return d.right - (teamBuffer/2);});
		
	slopeLines.exit().remove();
		
	var leftEndPointGroup = chart.select('.leftEndPointsGroup');
	if(leftEndPointGroup.empty()){
		leftEndPointGroup = chart.append("g");
		leftEndPointGroup.attr("class","leftEndPointsGroup");
	}
	var leftEndPoints = leftEndPointGroup.selectAll("path").data(slopes,function(d){return d.team});
	
	leftEndPoints
		.enter().append("path")
		.attr("d", d3.svg.symbol()
		.size(function(d) { return 20; })
		.type(function(d) { return "circle"; }))
		.attr("transform", function(d) { return "translate(220," + (d.left-(teamBuffer/2)) + ")"; });
		
	leftEndPoints.transition().duration(transitionDuration).attr("transform", function(d) { return "translate(220," + (d.left-(teamBuffer/2)) + ")"; });
	
	leftEndPoints.exit().remove();
    
	var rightEndPointGroup = chart.select('.rightEndPointsGroup');
	if(rightEndPointGroup.empty()){
		rightEndPointGroup = chart.append("g");
		rightEndPointGroup.attr("class","rightEndPointsGroup");
	}
	var rightEndPoints = rightEndPointGroup.selectAll("path").data(slopes,function(d){return d.team});
	
	rightEndPoints
		.enter().append("path")
		.attr("d", d3.svg.symbol()
		.size(function(d) { return 20; })
		.type(function(d) { return "circle"; }))
		.attr("transform", function(d) { return "translate(345," + (d.right-(teamBuffer/2)) + ")"; });
		
	rightEndPoints.transition().duration(transitionDuration).attr("transform", function(d) { return "translate(345," + (d.right-(teamBuffer/2)) + ")"; });
	
	rightEndPoints.exit().remove();

}

function adjustYCoords(conference){
	//adjustment algorithm based on the one used in here: http://skedasis.com/d3/slopegraph/
	for(var i=0;i< conference.length;i++){
		var val = conference[i];
		if(i > 0){
			var previousVal = conference[i-1];
			if((val.yCoord - teamBuffer) < previousVal.yCoord){
				val.yCoord = val.yCoord + teamBuffer;
				for(var j=i;j<conference.length;j++){
					conference[j].yCoord = conference[j].yCoord + teamBuffer;
				}
			}
		}
	}
	

}