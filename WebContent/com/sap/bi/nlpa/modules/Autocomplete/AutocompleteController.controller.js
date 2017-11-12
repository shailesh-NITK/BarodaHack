jQuery.sap.declare({
	modName: "com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController",
	type: "controller"
});
jQuery.sap.require("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ui.core.Control");


com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController = function () {
	sap.ui.core.mvc.Controller.apply(this, arguments);
};

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype = jQuery.sap.newObject(sap.ui.core.mvc.Controller.prototype);

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.onInit = function() {

	
};

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.onAfterRendering = function() {

};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.search = function(searchKeyword,cb){//callback
	$.ajax({
		type: 'POST',
		url:NLPAApp.constants.serviceURL,
		data:{ 
			"request" : JSON.stringify({
				"service":"search",
				"dataset" : NLPAApp.getSelectedDataset(),
				"keyword" : searchKeyword
			})
		}
	}).done(function(data) {
		cb(data);
	});
};



com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.submitQuery = function(sentence,queryTermsList,chart_type){
	var $this = this;
	$.ajax({
	    type: 'GET',
	    url:"/nlp_microservice/NLPMicroserviceServlet?sentence="+sentence,
	    data:""
	}).done(function(data) {
		var nodes = data;
		$this.getEnrichedQueryTerms(queryTermsList,chart_type,nodes);
		
		
	});
	
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.submitQueryForecast = function(exprTree){
	
	$.ajax({
		url:"https://mo-f783286e4.mo.sap.corp:51033/entry",
		type:"POST",
		data:JSON.stringify({
			"viewName":"\"_SYS_BIC\".\"Search/superStore\"",
			"expressionTree":exprTree
		})
	}).done(function(data){
		//data = JSON.parse(data);
		/*
		data = {

	               "forecast": [
	                               ["2013-01-09", 8183.529211461246],
	                               ["2013-01-08", 8183.529211461246],
	                               ["2013-01-07", 8183.529211461246],
	                               ["2013-01-06", 8183.529211461246],
	                               ["2013-01-05", 8183.529211461246],
	                               ["2013-01-04", 8183.529211461246],
	                               ["2013-01-03", 8183.529211461246],
	                               ["2013-01-02", 8183.529211461246],
	                               ["2013-01-01", 8183.529211461246],
	                               ["2012-12-31", 8183.529211461246]
	               ],
	               "actual": [
	                               ["2012-12-29", 18874.42],
	                               ["2012-12-28", 2721.1799999999994],
	                               ["2012-12-27", 21119.5015],
	                               ["2012-12-26", 351.40999999999997],
	                               ["2012-12-25", 6089.703],
	                               ["2012-12-24", 9915.9735],
	                               ["2012-12-23", 5102.11],
	                               ["2012-12-22", 476.31],
	                               ["2012-12-21", 8689.3735],
	                               ["2012-12-20", 11224.3],
	                               ["2012-12-19", 1935.6345000000001],
	                               ["2012-12-18", 10722.31],
	                               ["2012-12-17", 303.97],
	                               ["2012-12-16", 6883.236500000001],
	                               ["2012-12-15", 16906.12],
	                               ["2012-12-14", 19.81],
	                               ["2012-12-13", 1673.4279999999999],
	                               ["2012-12-12", 31668.03],
	                               ["2012-12-11", 3222.1655]
	               ],
	               "columns": ["ORDER_DATE", "SALES_1"]

	};
	*/

		var obj = {}
		//obj.rows_forecast = data.forecast;
		//obj.rows_history = data.actual;
		
		
		obj.columns = data.columns;
		obj.columns.push("Type"); //signifying if its a history point or a forecast point
		obj.rows = [];
		var slicedData = data.actual.slice(data.actual.length - 6);
		slicedData.forEach(function(elem){
			var row = elem;
			row.push("Historical")
			obj.rows.push(row);
		});
		
		//add last row from historical to forecast
		var row = [].concat(data.actual[data.actual.length - 1]);
		row[row.length - 1] = "Forecast";
		obj.rows.push(row);
		
		data.forecast.forEach(function(elem){
			var row = elem;
			row.push("Forecast");
			obj.rows.push(row);
		});
		
		//if layout isn't present in the additionalServicesLayout, first add it
		var additionalServicesLayoutContent = sap.ui.getCore().byId("additionalServicesLayout").getContent();
		var containsForecastView = false;
		additionalServicesLayoutContent.forEach(function(elem){
			if(elem.sId=='ForecastContainer'){
				containsForecastView = true;
				return;
			}
		});
		if(!containsForecastView){
			sap.ui.getCore().byId("additionalServicesLayout").addContent(sap.ui.getCore().byId("ForecastContainer").getController().getView());
		}
		sap.ui.getCore().byId("ForecastContainer").getController().displayChart(obj,"line");
	});
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.submitQueryStatistics = function(queryTerms){
	$.ajax({
		//url:"https://tempi323495trial.hanatrial.ondemand.com/statistics/temp",
		url:"https://statistics1i323495trial.hanatrial.ondemand.com/statistics/",
		type:"POST",
		data:JSON.stringify(queryTerms)
		/*data:JSON.stringify({
			"viewName":"\"_SYS_BIC\".\"Search/superStore\"",
			"expressionTree":exprTree
		})*/
	}).done(function(data){
		/*
		var obj = {
                "summaryResult":{
                    "region":["Atlantic", "Northwest Territories", "Nunavut", "Ontario", "Prarie", "Quebec", "West", "Yukon"],
                    "min": [4.97,4.99,14.76,3.63,5.63,3.42,2.243,23],
                    "max": [89061.05,26133.39,14223.82,24051.49,41343.21,45923.76,29884.6,23949.51],
                    "avg": [1865.0446328703729,2032.6074352791882,1473.1200443037974,1677.5533841730546,1663.1328262016407,1933.668476312423,1806.905713460573,1800.4933044280451]
              }
		};
		
		data = {"min": 116376.48,
                "max": 3597549.27,
                "avg": 1864450.10,
                "sd": 1146278.62,
                "measure":"Sales"
            	};
    	*/
		sap.ui.getCore().byId("StatisticsContainer").getController().statisticsData = data;
		//data = data.summaryResult;
		var obj = data.queryresult.values;
		
		for(var i=0;i<obj.attributes.length;i++){
			var finalTxt ="";
			/*
			var title2 = new sap.m.Text({text:"Minimum " + attributeName});
			var txt2 = new sap.m.Text({text:parseInt(obj.minimum[i].toFixed(0))});
			txt2.addStyleClass("measureValueText");
			var vertLayout2 = new sap.ui.layout.VerticalLayout({content:[title2,txt2]});
			vertLayout2.addStyleClass("statisticInfo");
			sap.ui.getCore().byId("StatisticsContainer").addContent(vertLayout2);
			*/
			var metadata_id = obj.attributes[i];
			var metadata_name = NLPAApp.getNameFromId(metadata_id);
			
			finalTxt += "<div>"+metadata_name + " ranges from a <b>minimum</b> of <b>"+obj.minimum[i].toFixed(2)
					+"</b> to a <b>maximum</b> of <b>"+obj.maximise[i].toFixed(2)
					+"</b> with an <b>average</b> of <b>"+obj.average[i].toFixed(2)
					+"</b> and a <b>deviation</b> of <b>"+obj.sd[i].toFixed(2)+"</b></div>";
			
			sap.ui.getCore().byId("statisticsText").setContent(finalTxt);
			sap.ui.getCore().byId("statisticsLink").setVisible(true);
			
			
			/*
			var attributeName = obj.attributes[i];
			var title = new sap.m.Text({text:"Average " + attributeName});
			var txt = new sap.m.Text({text:parseInt(obj.average[i].toFixed(0))});
			txt.addStyleClass("measureValueText");
			var vertLayout = new sap.ui.layout.VerticalLayout({content:[title,txt]});
			vertLayout.addStyleClass("statisticInfo");
			sap.ui.getCore().byId("StatisticsContainer").addContent(vertLayout);
			
			
			
			var title3 = new sap.m.Text({text:"Maximum " + attributeName});
			var txt3 = new sap.m.Text({text:parseInt(obj.maximise[i].toFixed(0))});
			txt3.addStyleClass("measureValueText");
			var vertLayout3 = new sap.ui.layout.VerticalLayout({content:[title3,txt3]});
			vertLayout3.addStyleClass("statisticInfo");
			sap.ui.getCore().byId("StatisticsContainer").addContent(vertLayout3);
			
			var title4 = new sap.m.Text({text:"Standard Deviation of " + attributeName});
			var txt4 = new sap.m.Text({text:obj.sd[i].toFixed(0)});
			txt4.addStyleClass("measureValueText");
			var vertLayout4 = new sap.ui.layout.VerticalLayout({content:[title4,txt4]});
			vertLayout4.addStyleClass("statisticInfo");
			sap.ui.getCore().byId("StatisticsContainer").addContent(vertLayout4);
			*/
		}
		
		//adding the statistics layout if its not present
		var additionalServicesLayoutContent = sap.ui.getCore().byId("additionalServicesLayout").getContent();
		var containsForecastView = false;
		additionalServicesLayoutContent.forEach(function(elem){
			if(elem.sId=='StatisticsContainer'){
				containsForecastView = true;
				return;
			}
		});
		if(!containsForecastView){
			sap.ui.getCore().byId("additionalServicesLayout").addContent(sap.ui.getCore().byId("StatisticsContainer").getController().getView());
		}
		
	});
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.submitQueryInfluencers = function(exprTree){
	var $this = this;
	$.ajax({
		url:"https://mo-f783286e4.mo.sap.corp:51033/entry2",
		type:"POST",
		data:JSON.stringify({
			"viewName":"\"_SYS_BIC\".\"Search/superStore\"",
			"expressionTree":exprTree
		})
	}).done(function(data){
		//data = JSON.parse(data);
		//console.log(data);
		
		//var influencersVerticalLayout = new sap.ui.layout.VerticalLayout({width:"100%"});
		var influencersVerticalLayout = sap.ui.getCore().byId("InfluencersContainer");
		influencersVerticalLayout.setBusy(false);
		var wordsMap = {
			"_DoW":"Day of the Week",
			"_QoY":"Quarter of the Year",
			"_DoM":"Day of the Month",
			"_DoW":"Day of the Week",
			"_DoY":"Day of the Year",
			"_MoQ":"Month of the Quarter",
			"_QoY":"Quarter of the Year",
			"_M":"Month",
			"_Y":"Year"
		};
		//sap.ui.getCore().byId("additionalServicesLayout").addContent(influencersVerticalLayout);
		//sap.ui.getCore().byId("StatisticsContainer").addContent(influencersVerticalLayout);
		influencersVerticalLayout.addStyleClass("influencersLayout");
		influencersVerticalLayout.removeAllContent();
		
		var id = data.target;
		var name = NLPAApp.getNameFromId(id);
		
		var titleTxt = new sap.m.Text({text:"Factors influencing "+name});
		titleTxt.addStyleClass("influencersTitleText");
		influencersVerticalLayout.addContent(titleTxt);
		
		data.influencer.forEach(function(elem){
			var metadata_id = elem.name;
			var name = NLPAApp.getNameFromId(metadata_id);
			
			Object.keys(wordsMap).forEach(function(elem){
				// the name must end with any of the word of wordsmap in order to be replaced
				var regExpression = elem + "$"; 
				if(elem.match(regExpression)!=null){
					name = name.replace(elem," "+wordsMap[elem]);
				}
			});
			var txt = new sap.m.Link({ 
				text:name + " (" + parseInt(elem.contribution) + "%)",
				press:function(id,targetVar){
					return function(){
						
						$.ajax({
							url:"https://mo-f783286e4.mo.sap.corp:51033/EntryFetchInfluencer",
							type:"POST",
							data:JSON.stringify({
								"viewName":"\"_SYS_BIC\".\"Search/superStore\"", 
								"expressionTree":exprTree,
								"measures":[targetVar,id] 
							})
						}).done(function(data){
							var dataObj = { "rows":[],"columns":[]};
							data.result.forEach(function(elem){
								var row = ["Dummy"];
								row = row.concat(elem);
								dataObj.rows.push(row);
							});
							var col = ["Type"];
							col = col.concat(data.measures);
							for(var i=0;i<col.length;i++){
								col[i] = NLPAApp.getNameFromId(col[i]);
							}
							dataObj.columns = col;
							$this.displayDetailInfluencer(dataObj);
							/*var dContent = new sap.ui.layout.VerticalLayout({width:"100%",height:"500px"});
							var chartWrapper = new sap.ui.layout.HorizontalLayout();
							chartWrapper.addStyleClass("influencerDetailWrapper");
							var VizFrame = sap.viz.vizframe.VizFrame;
						    var FlatTableDataset = sap.viz.api.data.FlatTableDataset;
						    var dataset = new FlatTableDataset({
						        'metadata' : {
						            'fields' : []
						        },
						        'data' : []
						    });
						    
						    var bindings = [];
						    chartWrapper.onAfterRendering = function(){
						    	var options = {
				   	    	        'type' : 'info/bar',
				   	    	        'container' : chartWrapper.getDomRef(),
				   	    	        'data' : dataset,
				   	    	        'bindings' : bindings
				   	    	    };
				       	    	var viz = new VizFrame(options);
				       	    	$this.displayChart(dataObj,"scatter",viz);
						    };
						    dContent.addContent(chartWrapper);
							var d = new sap.m.Dialog({
								content:[dContent],
								stretch:true,
								contentWidth:"100%",
								contentHeight:"100%"
							});
							d.open();*/
						});
					}
					
				}(elem.name,data.target)
			});
			influencersVerticalLayout.addContent(txt);
		});
		//var $a = $(sap.ui.getCore().byId("influencersVerticalLayout").getDomRef());
		//$a.animate({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0});
		//$a.animate({visible:'true'},"slow");
		
		
		//adding the statistics layout if its not present
		var additionalServicesLayoutContent = sap.ui.getCore().byId("additionalServicesLayout").getContent();
		var containsForecastView = false;
		additionalServicesLayoutContent.forEach(function(elem){
			if(elem.sId=='StatisticsContainer'){
				containsForecastView = true;
				return;
			}
		});
		if(!containsForecastView){
			sap.ui.getCore().byId("additionalServicesLayout").addContent(sap.ui.getCore().byId("StatisticsContainer").getController().getView());
		}
	});
};

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.submitQueryFinal = function(exprTree,queryTermsList,chart_type,nodes){
	//console.log(data);
	$.ajax({
	    type: 'POST',
	    url:NLPAApp.constants.serviceURL,
	    data:{ 
	    	"request":JSON.stringify({
	    		"service":"query",
	    		"dataset":NLPAApp.getSelectedDataset(),
	    		"query":JSON.stringify(queryTermsList),
	    		"nlpNodes":JSON.stringify(nodes),
	    		"exprTree":JSON.stringify(exprTree)
	    		})
	    }
	}).done(function(data){
		if(chart_type===undefined || chart_type===""){
			//recalculate no of dimensions and measures
			no_of_dimensions = 0;
			no_of_measures = 0;
			
			for(var i=0;i<data.columns.length;i++){
				//parse metadatalist and get the analytical types
				for(var m=0;m<NLPAApp.metadataList.length;m++){
					if(data.columns[i]===NLPAApp.metadataList[m]._id){
						if(NLPAApp.metadataList[m]._type==="MEASURE"){
							no_of_measures++;
						}else if(NLPAApp.metadataList[m]._type==="DIMENSION"){
							no_of_dimensions++;
						}
						break;
					}
				}
			}
			chart_type = sap.ui.getCore().byId("ChartEngineContainer").getController().getRelevantChartSuggestions(no_of_dimensions, no_of_measures,data.rows.length,queryTermsList);
			//chart_type = "bar";
		}
		sap.ui.getCore().byId("ChartEngineContainer").getController().displayChart(data,chart_type);
		
		
		/*
		//drawTable(data);
		//if(chart_type!=="table"){
		prepareData(data);
		drawChart(chart_type);
		//}
		updateStatus("");
		*/
	});
	
}
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.getEnrichedQueryTerms = function(queryTermsList,chart_type,nodes){
	var $this = this;
	$.ajax({
	    type: 'POST',
	    url:NLPAApp.constants.serviceURL,
	    data:{ 
	    	"request":JSON.stringify({
	    		"service":"enrichQuery",
	    		"dataset":NLPAApp.getSelectedDataset(),
	    		"query":JSON.stringify(queryTermsList),
	    		"nlpNodes":JSON.stringify(nodes)
	    		})
	    }
	}).done(function(enrichedQueryTerms) {
		var enrichedSentence = "";
		enrichedQueryTerms.forEach(function(queryTerm){
			enrichedSentence+= queryTerm.parsableInput + " ";
		});
		enrichedSentence = enrichedSentence.trim();
		$.ajax({
		    type: 'GET',
		    url:"/nlp_microservice/NLPMicroserviceServlet?sentence="+enrichedSentence,
		    data:""
		}).done(function(data) {
			var nodes = data;
			$this.getExpressionTree(enrichedQueryTerms,chart_type,nodes);
			
			
		});
	});
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.getExpressionTree = function(queryTermsList,chart_type,nodes){
	//clearChart();
	//updateStatus("Fetching Results...");
	var $this = this;
	var no_of_dimensions = 0;
	var no_of_measures = 0;
	
	//parse the DOM and insert the objects into query
	for(var i=0;i<queryTermsList.length;i++){
		if(queryTermsList[i].type==="DIMENSION" || queryTermsList[i].type==="DIMENSION_VALUE"){
			no_of_dimensions++;
		}else if(queryTermsList[i].type==="MEASURE"){
			no_of_measures++;
		}else{
			continue;
		}
	}
	
	
	$.ajax({
	    type: 'POST',
	    url:NLPAApp.constants.serviceURL,
	    data:{ 
	    	"request":JSON.stringify({
	    		"service":"expressionTree",
	    		"dataset":NLPAApp.getSelectedDataset(),
	    		"query":JSON.stringify(queryTermsList),
	    		"nlpNodes":JSON.stringify(nodes)
	    		})
	    }
	}).done(function(exprTree) {
		$this.submitQueryFinal(exprTree,queryTermsList,chart_type,nodes);
		//updateStatus("Preparing the chart...");
		// submit query for predictive influencers and forecast if possible
		//clear the layout
		//sap.ui.getCore().byId("additionalServicesLayout").removeAllContent();
		//$this.submitQueryInfluencers(exprTree);
		//$this.submitQueryForecast(exprTree);
		// submit query for statistics
		//$this.submitQueryStatistics(queryTermsList);
		//$this.submitQueryTwitter(queryTermsList);
	}).fail(function(data) {
		console.log(data);
	});
}
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.submitQueryTwitter = function(queryTermsList){
	sap.ui.getCore().byId("twitterCloudButton").setVisible(false);
	$.ajax({
	    type: 'POST',
	    url:"https://mo-f783286e4.mo.sap.corp:51035/main",
	    data:JSON.stringify(queryTermsList),
	    success:function(data){
			var chart_type ="dual line";
			//filter out data or text with profanity or swear words
			var profanity_list = ["fuck"]; //list of swear words
			
			//ideally evaluate all categories
			//ideally profanity filter must be applied in the back-end.
			for(var i=0;i<data.strong_negative.length;i++){
				var data_word = Object.keys(data.strong_negative[i])[0];
				profanity_list.forEach(function(word){
					if(data_word.toLowerCase().indexOf(word)>=0){
						data.strong_negative.splice(i,1);
						return;
					}
				});
			}
			
			//adding the twitter layout if its not present
			var additionalServicesLayoutContent = sap.ui.getCore().byId("additionalServicesLayout").getContent();
			var containsForecastView = false;
			additionalServicesLayoutContent.forEach(function(elem){
				if(elem.sId=='TwitterContainer'){
					containsForecastView = true;
					return;
				}
			});
			if(!containsForecastView){
				sap.ui.getCore().byId("additionalServicesLayout").addContent(sap.ui.getCore().byId("TwitterContainer").getController().getView());
			}
			
			sap.ui.getCore().byId("TwitterContainer").getController().displayChart(data,chart_type);
		}
	});
	
};


com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.displayChart = function(raw_data,chart_type,vizRef){
	var $this = this;
	/*
	raw_data = {
	        "rows": [
                       ["Dummy",67.84, 0.07],
                       ["Dummy",147.71, 0.0],
                       ["Dummy",2022.18, 0.09],
                       ["Dummy",41.87, 0.05],
                       ["Dummy",109.86, 0.07],
                       ["Dummy",28.39, 0.05],
                       ["Dummy",1484.49, 0.09],
                       ["Dummy",6230.68, 0.09],
                       ["Dummy",13.44, 0.08],
                       ["Dummy",122.09, 0.04],
                       ["Dummy",292.38, 0.05],
                       ["Dummy",2409.96, 0.07],
                       ["Dummy",47.04, 0.06],
                       ["Dummy",423.07, 0.01],
                       ["Dummy",574.5, 0.02],
                       ["Dummy",64.34, 0.09],
                       ["Dummy",3367.24, 0.07],
                       ["Dummy",189.99, 0.03],
                       ["Dummy",388.13, 0.04],
                       ["Dummy",907.24, 0.07],
                       ["Dummy",5450.6, 0.1],
                       ["Dummy",514.53, 0.04],
                       ["Dummy",46.4, 0.08],
                       ["Dummy",925.43, 0.0],
                       ["Dummy",839.07, 0.06],
                       ["Dummy",6216.6, 0.02],
                       ["Dummy",693.02, 0.07],
                       ["Dummy",53.14, 0.0],
                       ["Dummy",1408.34, 0.06],
                       ["Dummy",279.43, 0.0],
                       ["Dummy",971.95, 0.09],
                       ["Dummy",10145.14, 0.03],
                       ["Dummy",10094.43, 0.03],
                       ["Dummy",12470.31, 0.04],
                       ["Dummy",1677.27, 0.08],
                       ["Dummy",8875.17, 0.05],
                       ["Dummy",168.55, 0.05],
                       ["Dummy",4667.28, 0.09],
                       ["Dummy",440.23, 0.09],
                       ["Dummy",963.3, 0.06],
                       ["Dummy",562.95, 0.06]
       ],
       "columns": ["Type","SALES_1", "DISCOUNT_1"]
		};
	*/
	
	var metadataObj = { "fields":[]};
	var feedMeasures = [];
	var feedDimensions = [];
	
	for(var i=0;i<raw_data.columns.length;i++){
		//iterate over metadataList and get the item type
		var type;
		//if the text contains "date" in it, its a date dimension
		if(raw_data.columns[i].toLowerCase().indexOf("date")>=0){
			type = "DIMENSION";
		}else{
			type = "MEASURE";
		}
		if(type==="DIMENSION" || raw_data.columns[i] === "Type"){
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
	//console.log($this.getMetadataContainer(metadataObj,chart_type));
	//console.log($this.getDataContainer(raw_data.rows,chart_type));
	var dataset = new sap.viz.api.data.FlatTableDataset({
		'metadata' : metadataObj,
		'data':raw_data.rows
	});
//	dataset.metadata(metadataObj);
//	dataset.data(raw_data);
	
	var bindings = $this.createBinding(feedDimensions,feedMeasures,chart_type);
    console.log(bindings);
    console.log(CVOMChartTypes[chart_type]);
    //try catch type
    try{
    	if(chart_type){
    		vizRef.type(CVOMChartTypes[chart_type]);
    	}
    	
    }catch(e){
    	
    }
    
    //try catch dataset
	try{
		vizRef.data(dataset);
	}catch(e){
		
	}
	
	//try catch bindings
	try{
		vizRef.bindings(bindings);
	}catch(e){
		
	}
	
	//setting the title
	try{
		var titleText = "Comparison of ";
		//titleText += (feedDimensions.length>0)?feedDimensions.toString() +" vs ":"";
		titleText += feedMeasures.toString();
		vizRef.properties({
			legend:{
				visible:false,
			},
            title : {
                visible : true,
                text:titleText
            }
        });
	}catch(e){
		console.log(e);
	}
	
	

};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.displayDetailInfluencer = function(dataObj){
	var $this = this;
	var VizFrame = sap.viz.vizframe.VizFrame;
	var FlatTableDataset = sap.viz.api.data.FlatTableDataset;
	var dataset = new FlatTableDataset({
	    'metadata' : {
	        'fields' : []
	    },
	    'data' : []
	});
	
	var bindings = [];
	if(sap.ui.getCore().byId("influencersDetailDialog")==undefined){
		
		var dContent = new sap.ui.layout.VerticalLayout({width:"100%",height:"100%"});
		
		var chartWrapper = new sap.ui.layout.VerticalLayout("influencersDetailWrapper",{
			width:"100%",
			height:"100%"
		});
		chartWrapper.addStyleClass("influencerDetailWrapper");
		
		chartWrapper.onAfterRendering = function(){
			var options = {
			        'type' : 'info/scatter',
			        'container' : chartWrapper.getDomRef(),
			        'data' : dataset,
			        'bindings' : bindings
			    };
		   	$this.viz = new VizFrame(options);
		   	$this.displayChart(dataObj,"scatter",$this.viz);
			
		};
		dContent.addContent(chartWrapper);
		
		var d = new sap.m.Dialog("influencersDetailDialog",{
			content:[chartWrapper],
			stretch:true,
			contentWidth:"100%",
			contentHeight:"100%",
			showHeader:false
		});
		d.open();
	}
	else{
		var influencersDetailWrapper = sap.ui.getCore().byId("influencersDetailWrapper");
		influencersDetailWrapper.onAfterRendering = function(){
			var options = {
			        'type' : 'info/scatter',
			        'container' : influencersDetailWrapper.getDomRef(),
			        'data' : dataset,
			        'bindings' : bindings
			    };
		   	$this.viz = new VizFrame(options);
		   	$this.displayChart(dataObj,"scatter",$this.viz);
		};
		//$this.displayChart(dataObj,"scatter",$this.viz);
		sap.ui.getCore().byId("influencersDetailDialog").open();
	}
	
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.createBinding = function(dimensions,measures,chart_type){
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