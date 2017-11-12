jQuery.sap.declare({
	modName: "com.sap.bi.nlpa.modules.Forecast.ForecastView",
	type: "view"
});
jQuery.sap.require("com.sap.bi.nlpa.utils.Sanitizer");
jQuery.sap.require("sap.ui.core.mvc.JSView");

com.sap.bi.nlpa.modules.Forecast.ForecastView = function () {
	"use strict";
	sap.ui.core.mvc.JSView.apply(this, arguments);
};
com.sap.bi.nlpa.modules.Forecast.ForecastView.prototype = jQuery.sap.newObject(sap.ui.core.mvc.JSView.prototype);

com.sap.bi.nlpa.modules.Forecast.ForecastView.prototype.getControllerName = function () {
	return "com.sap.bi.nlpa.modules.Forecast.ForecastController";
};

com.sap.bi.nlpa.modules.Forecast.ForecastView.prototype.createContent = function (oController) {
	
	var $this = this;
	var chartOverallLayout = new sap.ui.layout.VerticalLayout({width:"100%"});
	var chartOptionsLayout = new sap.ui.layout.HorizontalLayout();
	chartOptionsLayout.addStyleClass("chartOptionsLayout");
	chartOptionsLayout.addContent();
	chartOptionsLayout.addContent();
	chartOptionsLayout.addContent();
	var chartWrapper = new sap.ui.layout.HorizontalLayout("forecastWrapper",{height:"150px"});
	chartWrapper.addStyleClass("forecastWrapper");
	var VizFrame = sap.viz.vizframe.VizFrame;
    var FlatTableDataset = sap.viz.api.data.FlatTableDataset;
    sap.viz.api.env.Resource.path('sap.viz.api.env.Template.loadPaths',['/nlp_analytics_velocity_microservice/libs/templates']); 
        
    var dataset = new FlatTableDataset({
        'metadata' : {
            'fields' : []
        },
        'data' : []
    });
    
    var bindings = [];
    $this.vizFrame;
    
    chartWrapper.onAfterRendering = function(){
    	//bind the wrapper one time.
    	console.log(sap.viz.api.env.Template.get());
    	if(sap.viz.api.env.Template.get()!=="standard_lumira"){
    		sap.viz.api.env.Template.set('standard_lumira', function() {
       		 	console.log("i have rendered",chartWrapper.getDomRef());
       	    	var options = {
   	    	        'type' : 'info/bar',
   	    	        'container' : chartWrapper.getDomRef(),
   	    	        'data' : dataset,
   	    	        'bindings' : bindings
   	    	    };
       	    	$this.vizFrame = new VizFrame(options);
       	    	//window.vf = $this.vizFrame;
       	    	//console.log($("#"+NLPAApp.oView.dashboardContent.getId()));
       	    	
       	 	});
    	}else{
    		var svgLen = chartWrapper.getDomRef().getElementsByTagName("svg").length;
    		if(svgLen==0){
    			var options = {
	    	        'type' : 'info/bar',
	    	        'container' : chartWrapper.getDomRef(),
	    	        'data' : dataset,
	    	        'bindings' : bindings
	    	    };
	   	    	$this.vizFrame = new VizFrame(options);
    		}
    		
    	}
    };
        
    
    //creating a message Strip
    var infoMessageStrip = new sap.m.MessageStrip("forecastInfoMessageStrip",{
    	text:"",
    	type:sap.ui.core.MessageType.Information,
    	showIcon:true,
    	visible:false
    });
    
    //chartOverallLayout.addContent(infoMessageStrip);
    chartOverallLayout.addContent(chartWrapper);
    //chartOverallLayout.addContent(chartOptionsLayout);
	return chartOverallLayout;
};

