jQuery.sap.declare({
	modName: "com.sap.bi.nlpa.modules.Statistics.StatisticsController",
	type: "controller"
});
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("com.sap.bi.nlpa.utils.Sanitizer");


com.sap.bi.nlpa.modules.Statistics.StatisticsController = function () {
	sap.ui.core.mvc.Controller.apply(this, arguments);
};

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype = jQuery.sap.newObject(sap.ui.core.mvc.Controller.prototype);

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.onInit = function() {
	
};

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.onAfterRendering = function() {
	//var headerOffset = 100;
	//var height = (window.innerHeight - headerOffset)/2;
	//sap.ui.getCore().byId("statisticsWrapper").getDomRef().style.height = height+"px";
};


com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.getRelevantChartSuggestions = function(no_of_dimensions,no_of_measures,no_of_rows,queryTermsList){
	
	//check if queryTerm has the keyword Compare or vs
	var isComparisonChart = false;
	if(queryTermsList){
		for(var i=0;i<queryTermsList.length;i++){
			if(queryTermsList[i].rawInput.toLowerCase()==="compare" || 
					queryTermsList[i].rawInput.toLowerCase()==="vs" ||
					queryTermsList[i].rawInput.toLowerCase()==="versus" ||
					queryTermsList[i].rawInput.toLowerCase()==="against"){
				isComparisonChart = true;
				break;
			}
		}
	}
	
	
	
	var d = ((no_of_dimensions<=2)?no_of_dimensions:"N")+"d";
	var m = ((no_of_measures<=2)?no_of_measures:"N")+"m";
	
	console.log(d,m);
	
	if(no_of_rows===1 && no_of_measures>2){
		return "multi";
	}
	if(isComparisonChart){
		if(no_of_measures>2){
			return "multi";
		}
		else if(no_of_measures==2){
			return "dual line";
		}
		else{
			return "line";
		}
		
	}
	if(no_of_rows === undefined || no_of_rows === null){
		//for now only NORMAL charts
		return charting.NORMAL[d][m].SUGGESTIONS;
	}
	else{
		if(no_of_rows>0){
			var n = (no_of_rows<=20)?((no_of_rows===1)?"1":"FEW_"):"MAX_";
			n+="n";
			var reco;
			try{
				reco =charting.NORMAL[d][m][n].RECOMMENDED; 
			}catch(e){
				reco = "table";
			}
			return reco;
		}
	}
};

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.getCVOMChartType = function(chart_type){
	
};
com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.getMetadataContainer = function(metadata,chart_type){
	var metadataContainer = metadata;
	switch(chart_type){
	case "value":
		metadata.fields.splice(0,metadata.fields.length-1);
		metadataContainer = metadata;
		break;
	default:
		break;
	}
	return metadataContainer;
};

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.getDataContainer = function(data,chart_type){
	var dataContainer = data;
	switch(chart_type){
		case "value":
			//only have the measure value
			//which generally resides in the last 
			dataContainer = [[data[0][data[0].length-1]]];
			break;
		default:
			break;
	}
	return dataContainer;
};
com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.createBinding = function(dimensions,measures,chart_type){
	var bindings = [];
	switch(chart_type){
	case "bar":
	case "line":
		/*bindings = [{
	        'feed' : 'categoryAxis',
	        'source' : dimensions
	    },{
	        'feed' : 'valueAxis',
	        'source' : measures
	    }];*/
		bindings = [{
            'feed' : 'categoryAxis',
            'source' : [dimensions[0]]
        }, {
            'feed' : 'color',
            'source' : dimensions.splice(1)
        }, {
            'feed' : 'valueAxis',
            'source' : measures
        }];
		
		break;
	case "dual bar":
	case "dual line":
		bindings = [{
		    "feed": "valueAxis",
		    "source": [measures[0]]
		}, {
		    "feed": "valueAxis2",
		    "source": [measures[1]]
		}, {
		    "feed": "color",
		    "source": [{
		        "measureNames": ["valueAxis", "valueAxis2"]
		    }]
		}, {
		    "feed": "categoryAxis",
		    "source": dimensions
		}];
		break;
		
	case "stacked bar":
		var bindings = [{
		    "feed": "valueAxis",
		    "source": measures
		}, {
		    "feed": "color",
		    "source": [dimensions[1]]
		}, {
		    "feed": "categoryAxis",
		    "source": [dimensions[0]]
		}];
		break;
		
	case "pie":
		bindings = [{
            "feed": "size",
            "source": [measures[0]]
        }, {
            "feed": "color",
            "source": [dimensions[0]]
        }];
		break;
	case "scatter":
		bindings = [{
		    "feed": "valueAxis",
		    "source": [measures[0]]
		}, {
		    "feed": "valueAxis2",
		    "source": [measures[1]]
		}, {
		    "feed": "color",
		    "source": dimensions
		}];
		break;
	case "bubble":
		bindings = [{
            "feed": "valueAxis",
            "source": [measures[0]]
        }, {
            "feed": "valueAxis2",
            "source": [measures[1]]
        }, {
            "feed": "bubbleWidth",
            "source": [measures[2]]
        }, {
            "feed": "color",
            "source": dimensions
        }];
		break;
	case "heat":
		bindings = [{
		    "feed": "color",
		    "source": measures
		}, {
		    "feed": "categoryAxis",
		    "source": dimensions
		}];
		break;
	case "treemap":
		bindings = [{
		    "feed": "weight",
		    "source": measures
		}, {
		    "feed": "title",
		    "source": dimensions
		}, {
		    "feed": "color",
		    "source": measures
		}];
		break;
	case "value":
		bindings = [{
            "feed": "value",
            "source": measures
        }];
		break;
	}
	return bindings;
};

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.getchartType = function(resp){
	return resp.queryresult.axis.chartType;
};

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.getData = function(resp){
	
	// Show Dataset statistics
	   var summarytable = sap.ui.getCore().byId("SummaryTable");
	   var summaryData = {data:[]};
	   for(i=0;i<resp.summaryResult.maximise.length;i++){
	 	  var obj = {};
	 	   obj["attributes"] = resp.summaryResult.attributes[i];
	       obj["maximise"] = resp.summaryResult.maximise[i];
	       obj["minimum"] = resp.summaryResult.minimum[i];
	       obj["range"] = resp.summaryResult.range[i];
	       obj["sd"] = resp.summaryResult.sd[i];
	       obj["sum"] = resp.summaryResult.sum[i];
	       obj["average"] = resp.summaryResult.average[i];
	       summaryData.data.push(obj);
	   }
	   var osummarytableJsonModel = new sap.ui.model.json.JSONModel(summaryData);
	   summarytable.setModel(osummarytableJsonModel);
	   //summarytable.placeAt("content");

	   
	   
	   //show statistics for query
	   var querytable = sap.ui.getCore().byId("QuerySummaryTable");
	   var queryData = {data:[]};
	   for(i=0;i<resp.queryresult.values.maximise.length;i++){
	 	  var obj = {};
	       obj["maximise"] = resp.queryresult.values.maximise[i];
	       obj["minimum"] = resp.queryresult.values.minimum[i];
	       obj["range"] = resp.queryresult.values.range[i];
	       obj["sd"] = resp.queryresult.values.sd[i];
	       obj["sum"] = resp.queryresult.values.sum[i];
	       obj["average"] = resp.queryresult.values.average[i];
	       queryData.data.push(obj);
	   }
	   var oquerytableJsonModel = new sap.ui.model.json.JSONModel(queryData);
	   querytable.setModel(oquerytableJsonModel);
	
	var chartType = resp.queryresult.axis.chartType;
	if(chartType=="box"){
		var newData = [];
		resp.queryresult.axis.Y.values.forEach(function(elem){
			var arr = [];
			arr[0] = Object.keys(elem)[0];
			arr[1] = elem[arr[0]];
			newData.push(arr);
		})
		var boxData = {
			"X": resp.queryresult.axis.X.name,
			"Y": resp.queryresult.axis.Y.name,
			"data": newData
		};
		//boxData.data.push(newData);
		return boxData;
	}
    var dataObj = { data: [] };
  for(i=0;i<resp.queryresult.axis.Y.values.length;i++){
	  var obj = {}; 
      obj[resp.queryresult.axis.Y.name] = resp.queryresult.axis.Y.values[i];
      obj[resp.queryresult.axis.X.name] = resp.queryresult.axis.X.values[i];
      dataObj.data.push(obj);
  }
 
  //prepare data for charts
  var dataFormat = {
	"columns":[],
	"rows":[]
  };
  
  	  dataFormat.columns.push(resp.queryresult.axis.Y.name);
	  dataFormat.columns.push(resp.queryresult.axis.X.name);
  
  for(i=0;i<resp.queryresult.axis.Y.values.length;i++){
	  var obj = []; 
      obj[0] = resp.queryresult.axis.Y.values[i];
      obj[1] = resp.queryresult.axis.X.values[i];
      dataFormat.rows.push(obj);
  }
  console.log(dataFormat);
  
  var oData = {
           data: [
               /*{'Country': "Canada", 'revenue': 410.87},
               {'Country': "China", 'revenue': 338.29},
               {'Country': "France", 'revenue': 487.66},
               {'Country': "Germany", 'revenue': 470.23},
               {'Country': "India", 'revenue': 170.93},
               {'Country': "United States", 'revenue': 905.08}*/
                    ]
       };
   
   /*var oVizFrame = sap.ui.getCore().byId("StatisticsVizFrame");
   var oJsonModel = new sap.ui.model.json.JSONModel(oData);
   var dataset = new sap.viz.ui5.data.FlattenedDataset({
       dimensions: [
           {name: resp.queryresult.axis.X.name, value: "{"+ resp.queryresult.axis.X.name+"}"}
           //{name: 'product', value: "{product}"}
       ],
       measures: [
           {name: resp.queryresult.axis.Y.name, value: "{"+ resp.queryresult.axis.Y.name+"}"}
           //{name: 'Negative', value: '{Negative}'}
       ],
       data: {path: "/data"}
   });
   
   oVizFrame.setDataset(dataset);
   oVizFrame.setModel(oJsonModel);
   var feedPrimaryValues = new sap.viz.ui5.controls.common.feeds.FeedItem({
   'uid' : "valueAxis",
   'type' : "Measure",
   'values' : [resp.queryresult.axis.Y.name]
   }), feedAxisLabels = new sap.viz.ui5.controls.common.feeds.FeedItem({
   'uid' : "categoryAxis",
  'type' : "Dimension",
   'values' : [resp.queryresult.axis.X.name]
   });

   oVizFrame.addFeed(feedPrimaryValues);
   oVizFrame.addFeed(feedAxisLabels);
   
   var titleText = "Sales vs Region";
   
   sap.ui.getCore().byId("StatisticsVizFrame").getModel().setData(dataObj);
   //var titleText = "Sentiments for " + resp.term[0];
   sap.ui.getCore().byId("StatisticsVizFrame").setVizProperties({title:{visible:true, text:titleText}});
   var maxVal = resp.queryresult.values.maximise[0];
   sap.ui.getCore().byId("max").setText(sap.ui.getCore().byId("max").getText() + ":" + maxVal);
   var minVal = resp.queryresult.values.minimum[0];
   sap.ui.getCore().byId("min").setText(sap.ui.getCore().byId("min").getText() + ":" + minVal);
   var rangeVal = resp.queryresult.values.range[0];
   sap.ui.getCore().byId("range").setText(sap.ui.getCore().byId("range").getText() + ":" + rangeVal);
   var sdVal = resp.queryresult.values.sd[0];
   sap.ui.getCore().byId("sd").setText(sap.ui.getCore().byId("sd").getText() + ":" + sdVal);
   var sumVal = resp.queryresult.values.sum[0];
   sap.ui.getCore().byId("sum").setText(sap.ui.getCore().byId("sum").getText() + ":" + sumVal);
   var averageVal = resp.queryresult.values.average[0];
   sap.ui.getCore().byId("average").setText(sap.ui.getCore().byId("average").getText() + ":" + averageVal);
   //var products = Object.keys(resp.Suggested_Detail);
   //sap.ui.getCore().byId("productBox").removeAllItems();
   */
   
   //querytable.placeAt("content");
   return dataFormat;
};

boxChart = function(boxData,id){
	var labels = true; // show the text labels beside individual boxplots?

	var margin = {top: 30, right: 50, bottom: 70, left: 50};
	var  width = $("#__vbox0").width() || (900 - margin.left - margin.right);
	width -= 100;
	var height = 800 - margin.top - margin.bottom;
		
	var min = Infinity,
	    max = -Infinity;
	var data; 
	data = boxData.data;
	var xName = boxData.X;
	var yName = boxData.Y;
	// parse in the data	
	//d3.csv("data.csv", function(error, csv) {
		// using an array of arrays with
		// data[n][2] 
		// where n = number of columns in the csv file 
		// data[i][0] = name of the ith column
		// data[i][1] = array of values of ith column

	/*	var data = [];
		data[0] = [];
		data[1] = [];
		data[2] = [];
		data[3] = [];
		// add more rows if your csv file has more columns

		// add here the header of the csv file
		data[0][0] = "Q1";
		data[1][0] = "Q2";
		data[2][0] = "Q3";
		data[3][0] = "Q4";
		// add more rows if your csv file has more columns

		data[0][1] = [];
		data[1][1] = [];
		data[2][1] = [];
		data[3][1] = [];
	  
		csv.forEach(function(x) {
			var v1 = Math.floor(x.Q1),
				v2 = Math.floor(x.Q2),
				v3 = Math.floor(x.Q3),
				v4 = Math.floor(x.Q4);
				// add more variables if your csv file has more columns
				
			var rowMax = Math.max(v1, Math.max(v2, Math.max(v3,v4)));
			var rowMin = Math.min(v1, Math.min(v2, Math.min(v3,v4)));

			data[0][1].push(v1);
			data[1][1].push(v2);
			data[2][1].push(v3);
			data[3][1].push(v4);
			 // add more rows if your csv file has more columns
			 
			if (rowMax > max) max = rowMax;
			if (rowMin < min) min = rowMin;	
		});
	  */
	min = -500;
	max= 50000;
		var chart = d3.box()
			.whiskers(iqr(1.5))
			.height(height)	
			.domain([min, max])
			.showLabels(labels);

		var svg = d3.select(id).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("class", "box")    
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		// the x-axis
		var x = d3.scale.ordinal()	   
			.domain( data.map(function(d) { console.log(d); return d[0] } ) )	    
			.rangeRoundBands([0 , width], 0.7, 0.3); 		

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		// the y-axis
		var y = d3.scale.linear()
			.domain([min, max])
			.range([height + margin.top, 0 + margin.top]);
		
		var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

		// draw the boxplots	
		svg.selectAll(".box")	   
	      .data(data)
		  .enter().append("g")
			.attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
	      .call(chart.width(x.rangeBand())); 
		
		      
		// add a title
		svg.append("text")
	        .attr("x", (width / 2))             
	        .attr("y", 0 + (margin.top / 2))
	        .attr("text-anchor", "middle")  
	        .style("font-size", "18px") 
	        //.style("text-decoration", "underline")  
	        .text(yName + " VS " + xName);
	 
		 // draw y axis
		svg.append("g")
	        .attr("class", "y axis")
	        .call(yAxis)
			.append("text") // and text1
			  .attr("x", -(height/2) )
			  .attr("transform", "rotate(-90)")
			  .attr("y", -50)
			  .attr("dy", ".71em")
			  .style("text-anchor", "end")
			  .style("font-size", "16px") 
			  .text(yName);		
		
		// draw x axis	
		svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
	      .call(xAxis)
		  .append("text")             // text label for the x axis
	        .attr("x", (width / 2) )
	        .attr("y",  20 )
			.attr("dy", ".71em")
	        .style("text-anchor", "middle")
			.style("font-size", "16px") 
	        .text(xName); 
	//});
};

function iqr(k) {
	  return function(d, i) {
	    var q1 = d.quartiles[0],
	        q3 = d.quartiles[2],
	        iqr = (q3 - q1) * k,
	        i = -1,
	        j = d.length;
	    while (d[++i] < q1 - iqr);
	    while (d[--j] > q3 + iqr);
	    return [i, j];
	  };
}

d3.box = function() {
	  var width = 1,
	      height = 1,
	      duration = 0,
	      domain = null,
	      value = Number,
	      whiskers = boxWhiskers,
	      quartiles = boxQuartiles,
		  showLabels = true, // whether or not to show text labels
		  numBars = 4,
		  curBar = 1,
	      tickFormat = null;

	  // For each small multiple…
	  function box(g) {
	    g.each(function(data, i) {
	      //d = d.map(value).sort(d3.ascending);
		  //var boxIndex = data[0];
		  //var boxIndex = 1;
		  var d = data[1].sort(d3.ascending);
		  
		 // console.log(boxIndex); 
		  //console.log(d); 
		  
	      var g = d3.select(this),
	          n = d.length,
	          min = d[0],
	          max = d[n - 1];

	      // Compute quartiles. Must return exactly 3 elements.
	      var quartileData = d.quartiles = quartiles(d);

	      // Compute whiskers. Must return exactly 2 elements, or null.
	      var whiskerIndices = whiskers && whiskers.call(this, d, i),
	          whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });

	      // Compute outliers. If no whiskers are specified, all data are "outliers".
	      // We compute the outliers as indices, so that we can join across transitions!
	      var outlierIndices = whiskerIndices
	          ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
	          : d3.range(n);

	      // Compute the new x-scale.
	      var x1 = d3.scale.linear()
	          .domain(domain && domain.call(this, d, i) || [min, max])
	          .range([height, 0]);

	      // Retrieve the old x-scale, if this is an update.
	      var x0 = this.__chart__ || d3.scale.linear()
	          .domain([0, Infinity])
			 // .domain([0, max])
	          .range(x1.range());

	      // Stash the new scale.
	      this.__chart__ = x1;

	      // Note: the box, median, and box tick elements are fixed in number,
	      // so we only have to handle enter and update. In contrast, the outliers
	      // and other elements are variable, so we need to exit them! Variable
	      // elements also fade in and out.

	      // Update center line: the vertical line spanning the whiskers.
	      var center = g.selectAll("line.center")
	          .data(whiskerData ? [whiskerData] : []);

		 //vertical line
	      center.enter().insert("line", "rect")
	          .attr("class", "center")
	          .attr("x1", width / 2)
	          .attr("y1", function(d) { return x0(d[0]); })
	          .attr("x2", width / 2)
	          .attr("y2", function(d) { return x0(d[1]); })
	          .style("opacity", 1e-6)
	        .transition()
	          .duration(duration)
	          .style("opacity", 1)
	          .attr("y1", function(d) { return x1(d[0]); })
	          .attr("y2", function(d) { return x1(d[1]); });

	      center.transition()
	          .duration(duration)
	          .style("opacity", 1)
	          .attr("y1", function(d) { return x1(d[0]); })
	          .attr("y2", function(d) { return x1(d[1]); });

	      center.exit().transition()
	          .duration(duration)
	          .style("opacity", 1e-6)
	          .attr("y1", function(d) { return x1(d[0]); })
	          .attr("y2", function(d) { return x1(d[1]); })
	          .remove();

	      // Update innerquartile box.
	      var box = g.selectAll("rect.box")
	          .data([quartileData]);

	      box.enter().append("rect")
	          .attr("class", "box")
	          .attr("x", 0)
	          .attr("y", function(d) { return x0(d[2]); })
	          .attr("width", width)
	          .attr("height", function(d) { return x0(d[0]) - x0(d[2]); })
	        .transition()
	          .duration(duration)
	          .attr("y", function(d) { return x1(d[2]); })
	          .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

	      box.transition()
	          .duration(duration)
	          .attr("y", function(d) { return x1(d[2]); })
	          .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

	      // Update median line.
	      var medianLine = g.selectAll("line.median")
	          .data([quartileData[1]]);

	      medianLine.enter().append("line")
	          .attr("class", "median")
	          .attr("x1", 0)
	          .attr("y1", x0)
	          .attr("x2", width)
	          .attr("y2", x0)
	        .transition()
	          .duration(duration)
	          .attr("y1", x1)
	          .attr("y2", x1);

	      medianLine.transition()
	          .duration(duration)
	          .attr("y1", x1)
	          .attr("y2", x1);

	      // Update whiskers.
	      var whisker = g.selectAll("line.whisker")
	          .data(whiskerData || []);

	      whisker.enter().insert("line", "circle, text")
	          .attr("class", "whisker")
	          .attr("x1", 0)
	          .attr("y1", x0)
	          .attr("x2", 0 + width)
	          .attr("y2", x0)
	          .style("opacity", 1e-6)
	        .transition()
	          .duration(duration)
	          .attr("y1", x1)
	          .attr("y2", x1)
	          .style("opacity", 1);

	      whisker.transition()
	          .duration(duration)
	          .attr("y1", x1)
	          .attr("y2", x1)
	          .style("opacity", 1);

	      whisker.exit().transition()
	          .duration(duration)
	          .attr("y1", x1)
	          .attr("y2", x1)
	          .style("opacity", 1e-6)
	          .remove();

	      // Update outliers.
	      var outlier = g.selectAll("circle.outlier")
	          .data(outlierIndices, Number);

	      outlier.enter().insert("circle", "text")
	          .attr("class", "outlier")
	          .attr("r", 5)
	          .attr("cx", width / 2)
	          .attr("cy", function(i) { return x0(d[i]); })
	          .style("opacity", 1e-6)
	        .transition()
	          .duration(duration)
	          .attr("cy", function(i) { return x1(d[i]); })
	          .style("opacity", 1);

	      outlier.transition()
	          .duration(duration)
	          .attr("cy", function(i) { return x1(d[i]); })
	          .style("opacity", 1);

	      outlier.exit().transition()
	          .duration(duration)
	          .attr("cy", function(i) { return x1(d[i]); })
	          .style("opacity", 1e-6)
	          .remove();

	      // Compute the tick format.
	      var format = tickFormat || x1.tickFormat(8);

	      // Update box ticks.
	      var boxTick = g.selectAll("text.box")
	          .data(quartileData);
		 if(showLabels == true) {
	      boxTick.enter().append("text")
	          .attr("class", "box")
	          .attr("dy", ".3em")
	          .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
	          .attr("x", function(d, i) { return i & 1 ?  + width : 0 })
	          .attr("y", x0)
	          .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
	          .text(format)
	        .transition()
	          .duration(duration)
	          .attr("y", x1);
		}
			 
	      boxTick.transition()
	          .duration(duration)
	          .text(format)
	          .attr("y", x1);

	      // Update whisker ticks. These are handled separately from the box
	      // ticks because they may or may not exist, and we want don't want
	      // to join box ticks pre-transition with whisker ticks post-.
	      var whiskerTick = g.selectAll("text.whisker")
	          .data(whiskerData || []);
		if(showLabels == true) {
	      whiskerTick.enter().append("text")
	          .attr("class", "whisker")
	          .attr("dy", ".3em")
	          .attr("dx", 6)
	          .attr("x", width)
	          .attr("y", x0)
	          .text(format)
	          .style("opacity", 1e-6)
	        .transition()
	          .duration(duration)
	          .attr("y", x1)
	          .style("opacity", 1);
		}
	      whiskerTick.transition()
	          .duration(duration)
	          .text(format)
	          .attr("y", x1)
	          .style("opacity", 1);

	      whiskerTick.exit().transition()
	          .duration(duration)
	          .attr("y", x1)
	          .style("opacity", 1e-6)
	          .remove();
	    });
	    d3.timer.flush();
	  }

	  box.width = function(x) {
	    if (!arguments.length) return width;
	    width = x;
	    return box;
	  };

	  box.height = function(x) {
	    if (!arguments.length) return height;
	    height = x;
	    return box;
	  };

	  box.tickFormat = function(x) {
	    if (!arguments.length) return tickFormat;
	    tickFormat = x;
	    return box;
	  };

	  box.duration = function(x) {
	    if (!arguments.length) return duration;
	    duration = x;
	    return box;
	  };

	  box.domain = function(x) {
	    if (!arguments.length) return domain;
	    domain = x == null ? x : d3.functor(x);
	    return box;
	  };

	  box.value = function(x) {
	    if (!arguments.length) return value;
	    value = x;
	    return box;
	  };

	  box.whiskers = function(x) {
	    if (!arguments.length) return whiskers;
	    whiskers = x;
	    return box;
	  };
	  
	  box.showLabels = function(x) {
	    if (!arguments.length) return showLabels;
	    showLabels = x;
	    return box;
	  };

	  box.quartiles = function(x) {
	    if (!arguments.length) return quartiles;
	    quartiles = x;
	    return box;
	  };

	  return box;
};

function boxWhiskers(d) {
	  return [0, d.length - 1];
}

function boxQuartiles(d) {
	  return [
	    d3.quantile(d, .25),
	    d3.quantile(d, .5),
	    d3.quantile(d, .75)
	  ];
}

com.sap.bi.nlpa.modules.Statistics.StatisticsController.prototype.displayChart = function(raw_data,chart_type){
	if(chart_type=="box"){
		//vbox.removeAllItems();
		boxChart(raw_data,"#__vbox0");
		return;
	}
	
	var $this = this;
	//create the metadata object
	if(chart_type==="table"){
		$("#myChartWrapper").hide();
		sap.ui.getCore().byId("multiChartDiv").setVisible(false);
		var obj = {};
		obj.columns = raw_data.columns;
		obj.rows = [];
		for(var i=0;i<raw_data.rows.length;i++){
			var rowObj = {};
			for(var col=0;col<raw_data.columns.length;col++){
				rowObj[raw_data.columns[col]] = raw_data.rows[i][col]
			}
			obj.rows.push(rowObj);
		}
		$this.getView().table.setVisible(true);
		$this.getView().table.setModel(new sap.ui.model.json.JSONModel(obj));
		return;
	}
	else if(chart_type==="multi"){
		var data = [];
    	//collect all measures from metadataList
    	
    	var dimensionColumnIndex = -1;
    	for(var col=0;col<raw_data.columns.length;col++){
    		for(var m=0;m<NLPAApp.metadataList.length;m++){
    			if(raw_data.columns[col]===NLPAApp.metadataList[m]._id){
        			if(NLPAApp.metadataList[m]._type==="DIMENSION"){
        				dimensionColumnIndex = col;
            			break;
        			}
        			
        		}
    		}
    		
    	}
    	
		for(var col=0;col<raw_data.columns.length;col++){
			//if current col is a measure
			var isMeasure = false;
			for(var m=0;m<NLPAApp.metadataList.length;m++){
				if(raw_data.columns[col] === NLPAApp.metadataList[m]._id){
					if(NLPAApp.metadataList[m]._type==="MEASURE"){
						isMeasure = true;
						break;
					}
					
				}
			}
			if(isMeasure){
				//assume first row is the dimension value
				var obj = {};
				obj.chart_title=raw_data.columns[col];
				obj.unit = "";
				
				for(var i=0;i<raw_data.rows.length;i++){
					var dimValue;
					if(dimensionColumnIndex>-1){
						dimValue = raw_data.rows[i][dimensionColumnIndex];
					}else{
						dimValue = "";
					}
					
					obj[dimValue] = raw_data.rows[i][col];
				}
				data.push(obj);
			}
    	}
    	
    	console.log(data);
    	
    	$("#myChartWrapper").hide();
    	sap.ui.getCore().byId("multiChartDiv").setVisible(true);
    	$this.getView().table.setVisible(false);
    	$("#multiChartDiv").html("");
    	//$("#multiChartDiv").show();
    	setTimeout(function(){
    		multiChart(data);	
    	},1);
    	
    	return;
	}else{
		$this.getView().table.setModel(new sap.ui.model.json.JSONModel({}));
		$this.getView().table.setVisible(false);
		sap.ui.getCore().byId("multiChartDiv").setVisible(false);
		$("#myChartWrapper").show();
	}
	var metadataObj = { "fields":[]};
	var feedMeasures = [];
	var feedDimensions = [];
	
	for(var i=0;i<raw_data.columns.length;i++){
		//iterate over metadataList and get the item type
		var type;
		for(var m=0;m<NLPAApp.metadataList.length;m++){
			if(NLPAApp.metadataList[m]._id===raw_data.columns[i]){
				type = NLPAApp.metadataList[m]._type;
				break;
			}
		}
		if(type==="DIMENSION"){
			metadataObj.fields.push({
				"id" : raw_data.columns[i],
				"name":raw_data.columns[i],
				"semanticType":"Dimension",
				"dataType":"String"
			});
			feedDimensions.push(raw_data.columns[i]);
		}else if(type==="MEASURE"){
			metadataObj.fields.push({
				"id" : raw_data.columns[i],
				"name":raw_data.columns[i],
				"semanticType":"Measure",
				"dataType":"Number"
			});
			feedMeasures.push(raw_data.columns[i]);
		}else{
			continue;
		}
	}
	console.log(metadataObj);
	console.log($this.getMetadataContainer(metadataObj,chart_type));
	console.log($this.getDataContainer(raw_data.rows,chart_type));
	var dataset = new sap.viz.api.data.FlatTableDataset({
		'metadata' : $this.getMetadataContainer(metadataObj,chart_type),
		'data':$this.getDataContainer(raw_data.rows,chart_type)
	});
//	dataset.metadata(metadataObj);
//	dataset.data(raw_data);
	
	var bindings = this.createBinding(feedDimensions,feedMeasures,chart_type);
    console.log(bindings);
    console.log(CVOMChartTypes[chart_type]);
    //try catch type
    try{
    	if(chart_type){
    		this.getView().vizFrame.type(CVOMChartTypes[chart_type]);
    	}
    	
    }catch(e){
    	
    }
    
    //try catch dataset
	try{
		this.getView().vizFrame.data(dataset);
	}catch(e){
		
	}
	
	//try catch bindings
	try{
		this.getView().vizFrame.bindings(bindings);
	}catch(e){
		
	}
	
	//setting the title
	try{
		var titleText = "";
		titleText += (feedDimensions.length>0)?feedDimensions.toString() +" vs ":"";
		titleText += feedMeasures.toString();
		this.getView().vizFrame.properties({
            title : {
                visible : true,
                text:titleText
            }
        });
	}catch(e){
		console.log(e);
	}
	
	

};

/*
 * d: dimension
 * m: measure
 * Time,Geo,Normal
 * n: no. of results
 * 
 * */
var CVOMChartTypes = {
	"bar":"info/column",
	"dual bar":"info/dual_column",
	"stacked bar":"info/stacked_column",
	"line":"info/line",
	"dual line":"info/dual_line",
	"pie":"info/pie",
	"scatter":"info/scatter",
	"bubble":"info/bubble",
	"treemap":"info/treemap",
	"heatmap":"info/heatmap",
	"value":"info/number",
	"table":"table",
	"multi":"multi"
};
var charting = {
	"NORMAL":{
		"0d":{
			"0m":{
				"1n":{
					RECOMMENDED:"value"
				},
				"FEW_n":{
					RECOMMENDED: "bar"
				},
				"MAX_n":{
					RECOMMENDED: "treemap", 
				}
			},
			"1m":{
				SUGGESTIONS:["table"],
				"1n":{
					RECOMMENDED: "value",
					OTHERS: []
				},
				"FEW_n":{
					RECOMMENDED: "bar",
					OTHERS: []
				},
				"MAX_n":{
					RECOMMENDED: "table", 
					OTHERS: []
				}
			}
		},
		"1d":{
			"0m":{
				SUGGESTIONS:["table"],
				"1n":{
					RECOMMENDED: "table",
					OTHERS: []
				},
				"FEW_n":{
					RECOMMENDED: "table",
					OTHERS: []
				},
				"MAX_n":{
					RECOMMENDED: "table", 
					OTHERS: []
				}
			},
			"1m":{
				SUGGESTIONS:["bar","pie","treemap","table"],
				"1n":{
					RECOMMENDED: "bar",
					OTHERS: ["bar","pie"]
				},
				"FEW_n":{
					RECOMMENDED: "bar",
					OTHERS: ["pie","bubble"]
				},
				"MAX_n":{
					RECOMMENDED: "treemap", //maybe tree recommended
					OTHERS: ["treemap", "pie"]
				}
			},
			"2m":{
				SUGGESTIONS:["dual bar","scatter","table"],
				"1n":{
					RECOMMENDED: "value",
					OTHERS: ["multi bar","multi pie"]
				},
				"FEW_n":{
					RECOMMENDED: "dual bar",
					OTHERS: ["multi bar","multi pie"]
				},
				"MAX_n":{
					RECOMMENDED: "scatter", //maybe tree recommended
					OTHERS: ["treemap", "pie"]
				}
			},
			"3m":{
				SUGGESTIONS:["bubble","table"],
				"1n":{
					RECOMMENDED:"value"
				},
				"FEW_n":{
					RECOMMENDED:"bubble"
				},
				"MAX_n":{
					RECOMMENDED:"bubble"
				}
			},
			"Nm":{				
				SUGGESTIONS:["multi"],
				"1n":{
					RECOMMENDED:"multi"
				},
				"FEW_n":{
					RECOMMENDED:"multi"
				},
				"MAX_n":{
					RECOMMENDED:"multi"
				}
			}
		},
		"2d":{
			"0m":{
				SUGGESTIONS:["table"],
				"1n":{
					RECOMMENDED:"table"
				},
				"FEW_n":{
					RECOMMENDED:"table"
				},
				"MAX_n":{
					RECOMMENDED:"table"
				}
			},
			"1m":{
				SUGGESTIONS:["stacked bar","line","bar","table"],
				"1n":{
					RECOMMENDED:"stacked bar"
				},
				"FEW_n":{
					RECOMMENDED:"stacked bar"
				},
				"MAX_n":{
					RECOMMENDED:"stacked bar"
				}
			},
			"2m":{
				SUGGESTIONS:["table","line","bar"],
				"1n":{
					RECOMMENDED:"stacked bar"
				},
				"FEW_n":{
					RECOMMENDED:"table"
				},
				"MAX_n":{
					RECOMMENDED:"table"
				}
			}
		},
		"Nd":{
			"1m":{
				SUGGESTIONS:["line","bar"]
			},
			"Nm":{
				SUGGESTIONS:["table"]
			}
		}
	}
};


function multiChart(data){
	var WIDTH = 400;

	var COLOR_1 = "#73d2e0";

	var COLOR_2 = "#bbd03b";

	//var X_DATA_PARSE = vida.string;

	//var Y_DATA_PARSE = vida.number;

	var Y_DATA_FORMAT = d3.format("");

	var margin = {top: 70, right: 20, bottom: 30, left: 60},
	    width = WIDTH - margin.left - margin.right,
	    height = WIDTH - margin.top - margin.bottom;
		//height = height > 400? 400 : height;

	var groups = [];

	var makeBar = function(width, height, bar_data) {
	  var Y_DATA_FORMAT = d3.format("");
	  
	  var Y_AXIS_LABEL = bar_data.unit;
	  
	  if (bar_data.unit === 'percentage') {
	    Y_DATA_FORMAT = d3.format(".1%");
	  }
	  
	  var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], 0.1);

	  var y = d3.scale.linear()
	      .range([height, 0]);
	  
	  var xAxis = d3.svg.axis()
	      .scale(x)
	      .orient("bottom");
	  
	  var yAxis = d3.svg.axis()
	      .scale(y)
	      .orient("left")
	      .ticks(6)
	      .tickFormat(Y_DATA_FORMAT);
	  
	  var value_data = _.map(groups, function(d) {
	    return {x_axis: d, y_axis: bar_data[d]};
	  });
	  
	  x.domain(value_data.map(function(d) { return d.x_axis; }));
	  y.domain([0, d3.max(value_data, function(d) { return d.y_axis; })]);

	  var svg = d3.select("#multiChartDiv").append("svg")
	      .attr("width", width + margin.left + margin.right)
	      .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	      
	  var detailBox = svg.append("svg:text")
	      .attr("dx", "20px")
	      .attr("dy", "-5px")
	      .attr("text-anchor", "right")
	      .style("fill", "#1D5096")
	      .style("font-weight", "bold");

	  var title = svg.append("text")
	      .attr("x", 0)
	      .attr("y", -15)
	      .attr("class","chart-title")
	      .text(bar_data.chart_title);

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(0)")
	      .attr("y", -25)
	      .attr("x", 0)
	      .style("text-anchor", "left")
	      .text(Y_AXIS_LABEL);

	  svg.selectAll(".bar")
	      .data(value_data)
	    .enter().append("rect")
	      .style("fill", function(d) {
	        if (d.x_axis === groups[0]) {
	          return COLOR_1;
	        } else {
	          return COLOR_2;
	        }
	      })
	      .attr("x", function(d) { return x(d.x_axis); })
	      .attr("width", x.rangeBand())
	      .attr("y", function(d) { return y(d.y_axis); })
	      .attr("height", function(d) { return height - y(d.y_axis); })
	      .on("mouseover", function(d, i, j) {
	        detailBox.attr("x", x.range()[i] - Y_DATA_FORMAT(d.y_axis).length / 2)
	          .attr("y", y(d.y_axis))
	          .text(Y_DATA_FORMAT(d.y_axis))
	          .style("visibility", "visible");
	      
	        d3.select(this)
	          .style("opacity", 0.7);
	      }).on("mouseout", function() {
	        detailBox.style("visibility", "hidden");
	        
	        d3.select(this)
	          .style("opacity", 1.0);
	      });
	};

	var width = width / data.length - 10;
	width = width > 180 ? width : 180;

	var keys = Object.keys(data[0]);
	for (var i = 0; i < keys.length; i++) {
	  if (keys[i] !== "chart_title" && keys[i] !== "unit") {
	    groups.push(keys[i]);
	  }
	}

	for (i = 0; i < data.length; i++) {
	  makeBar(width, width, data[i]);
	}

	}