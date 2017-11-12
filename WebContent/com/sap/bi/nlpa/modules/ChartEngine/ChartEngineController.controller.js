jQuery.sap.declare({
	modName: "com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController",
	type: "controller"
});
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("com.sap.bi.nlpa.utils.Sanitizer");


com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController = function () {
	sap.ui.core.mvc.Controller.apply(this, arguments);
};

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype = jQuery.sap.newObject(sap.ui.core.mvc.Controller.prototype);

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.onInit = function() {
	
};

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.onAfterRendering = function() {
	var headerOffset = 100;
	var height = window.innerHeight - headerOffset;
	sap.ui.getCore().byId("myChartWrapper").getDomRef().style.height = height+"px";
};


com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.getRelevantChartSuggestions = function(no_of_dimensions,no_of_measures,no_of_rows,queryTermsList){
	
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

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.getCVOMChartType = function(chart_type){
	
};
com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.getMetadataContainer = function(metadata,chart_type){
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

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.getDataContainer = function(data,chart_type){
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
com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.createBinding = function(dimensions,measures,chart_type){
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

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController.prototype.displayChart = function(raw_data,chart_type){
	sap.ui.getCore().byId("myChartWrapper").setBusy(false);
	/*
	sap.ui.getCore().byId("chartInfoMessageStrip").setVisible(true);
	if(raw_data.rows.length===100){
		sap.ui.getCore().byId("chartInfoMessageStrip").setText("Showing first "+raw_data.rows.length+" rows of the entire result.");
	}else if(raw_data.rows.length===0){
		sap.ui.getCore().byId("chartInfoMessageStrip").setText("0 results.");
	}else{
		sap.ui.getCore().byId("chartInfoMessageStrip").setText(raw_data.rows.length +" results.");
	}	*/
	for(var i=0;i<raw_data.columns.length;i++){
		raw_data.columns[i] = NLPAApp.getNameFromId(raw_data.columns[i]);
	}
	var $this = this;
	if(raw_data.rows.length==1){
		if(raw_data.rows[0].length==1){
			raw_data.rows[0][0] = raw_data.rows[0][0].toFixed(2); 
		}
	}
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
    			if(raw_data.columns[col]===NLPAApp.metadataList[m]._name){
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
				if(raw_data.columns[col] === NLPAApp.metadataList[m]._name){
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
			if(NLPAApp.metadataList[m]._name===raw_data.columns[i]){
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
		feedDimensions.forEach(function(elem){
			titleText += NLPAApp.getNameFromId(elem) + ",";
		});
		titleText = titleText.slice(0,-1);
		if(feedDimensions.length > 0)
			titleText += " vs ";
		
		feedMeasures.forEach(function(elem){
			titleText += NLPAApp.getNameFromId(elem)+",";
		});
		titleText = titleText.slice(0,-1);
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