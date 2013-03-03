var graphWidth = 500; 
var graphHeight = 600;
var teamBuffer = 15;
var fontFamily = 'Julius Sans One';
var fontSize = 12;
var playoffColor = 'crimson';
var nonPlayoffColor = 'black';


$.getJSON('static/data.json', function(data) {
	
	var leftData = data[3];
	var rightData = data[6];
	
	//sets up the basic container for the visualization
	var westChart = d3.select("#westStandings").append("svg")
	     .attr("width", graphWidth)
	     .attr("height", graphHeight);
	
	var eastChart = d3.select("#eastStandings").append("svg")
		     .attr("width", graphWidth)
		     .attr("height", graphHeight);
	
    renderStandings(westChart,leftData,rightData,{'key':'westernConference','title':'Western Conference'});
    renderStandings(eastChart,leftData,rightData,{'key':'easternConference','title':'Eastern Conference'});
});

function renderStandings(chart,left,right,conferenceName){
	
	var conference = conferenceName.key;
	var leftDate = left.date;
	var rightDate = right.date;

		//add a title based on the conference and dates
		var titleGroup = chart.append("g");
		
		titleGroup.append('text')
			.attr('x', 195)
			.attr('y', 20)
			.attr('font-family',fontFamily)
			.text(conferenceName.title);
		
		//left hand date	
		titleGroup.append('text')
				.attr('x', 100)
				.attr('y', 20)
				.attr('font-family',fontFamily)
				.attr('font-size',13)
				.text(leftDate);
		
		//right hand date
		titleGroup.append('text')
					.attr('x', 400)
					.attr('y', 20)
					.attr('font-family',fontFamily)
					.attr('font-size',13)
					.text(rightDate);
	
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
	
	//to account for the fact that it is highly likely that
	//teams can have the same number of points, and 
	//that close point values might translate coords
	//that cause overlapping text, apply a simple
	//algorithm to adjust the positions to look nice
    adjustYCoords(left[conference]);
    adjustYCoords(right[conference]); 	
					
	var leftGroup = chart.append("g");
	leftGroup.selectAll("text")                                     
	         .data(left[conference])
	         .enter().append("text")
			 .attr("x",100)
			 .attr('y', function(d,i){return d.yCoord;})
			 .attr('font-family',fontFamily)
			 .attr('font-size',fontSize)
			 .attr('fill',function(d,i){if(i<8) return playoffColor;else return nonPlayoffColor;}) //make the playoff bound teams standout
			 .text(function(d, i) { return d.team; });
			
	var leftGroupPoints = chart.append("g");
	leftGroupPoints.selectAll("text")                                     
	        .data(left[conference])
			.enter().append("text")
			.attr("x",200)
			.attr('y', function(d,i){return d.yCoord})
			.attr('font-family',fontFamily) 
			.attr('font-size',fontSize)         
			.text(function(d, i) { return d.points; });
			
	var rightGroup = chart.append("g");
	rightGroup.selectAll("text")                                     
	      .data(right[conference])
		  .enter().append("text")
		  .attr("x",400)
		  .attr('y', function(d,i){return d.yCoord;})
		  .attr('font-family',fontFamily)
		  .attr('font-size',fontSize)
		  .attr('fill',function(d,i){if(i<8) return playoffColor;else return nonPlayoffColor;}) //make the playoff bound teams standout          
		  .text(function(d, i) { return d.team; });
		
	var rightGroupPoints = chart.append("g");
	rightGroupPoints.selectAll("text")                                     
	     .data(right[conference])
	     .enter().append("text")
	     .attr("x",350)
	     .attr('y', function(d,i){return d.yCoord})
	     .attr('font-family',fontFamily)
	     .attr('font-size',fontSize)  
	     .text(function(d, i) { return d.points; });
	
	
	//combine the coord values for drawing the slopes
	var slopes = [];
	for(var i=0;i<left[conference].length;i++){
		var val = left[conference][i];
		var slope = {};
		slope.left = val.yCoord;
		for(var j=0;j<right[conference].length;j++){
			if(val.team === right[conference][j].team){
				slope.right = right[conference][j].yCoord;
				break;
			}	
		}
	    slopes.push(slope);	
	}
	
	
	var slopeGroup = chart.append("g");
	slopeGroup.selectAll("line")
	     .data(slopes)
	     .enter().append("line")
	     .attr('x1', 215)
		 .attr('x2', 345)
		 .attr('y1',function(d,i){return d.left - (teamBuffer/2);})
		.attr('y2',function(d,i){return d.right - (teamBuffer/2);})
		.attr('opacity', .5)
		.attr('stroke', 'black');	
		
		
	var leftEndPointGroup = chart.append("g");
	leftEndPointGroup.selectAll("path")
		.data(slopes)
		.enter().append("path")
		.attr("transform", function(d) { return "translate(215," + (d.left-(teamBuffer/2)) + ")"; })
		.attr("d", d3.svg.symbol()
		.size(function(d) { return 20; })
		.type(function(d) { return "circle"; }));
			
		var rightEndPointGroup = chart.append("g");
		rightEndPointGroup.selectAll("path")
		   .data(slopes)
		   .enter().append("path")
		   .attr("transform", function(d) { return "translate(345," + (d.right-(teamBuffer/2)) + ")"; })
		   .attr("d", d3.svg.symbol()
		   .size(function(d) { return 20; })
		   .type(function(d) { return "circle"; }));
		

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