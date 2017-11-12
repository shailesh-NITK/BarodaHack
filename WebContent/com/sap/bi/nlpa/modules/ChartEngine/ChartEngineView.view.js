jQuery.sap.declare({
	modName: "com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView",
	type: "view"
});
jQuery.sap.require("com.sap.bi.nlpa.utils.Sanitizer");
jQuery.sap.require("sap.ui.core.mvc.JSView");

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView = function () {
	"use strict";
	sap.ui.core.mvc.JSView.apply(this, arguments);
};
com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView.prototype = jQuery.sap.newObject(sap.ui.core.mvc.JSView.prototype);

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView.prototype.getControllerName = function () {
	return "com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController";
};

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView.prototype.createContent = function (oController) {
	
	var $this = this;
	var chartOverallLayout = new sap.ui.layout.VerticalLayout();
	var chartOptionsLayout = new sap.ui.layout.HorizontalLayout();
	chartOptionsLayout.addStyleClass("chartOptionsLayout");
	chartOptionsLayout.addContent();
	chartOptionsLayout.addContent();
	chartOptionsLayout.addContent();
	var chartWrapper = new sap.ui.layout.HorizontalLayout("myChartWrapper");
	chartWrapper.addStyleClass("chartWrapper");
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
    	}
    };
    //adding a separate table since table isn't a chart in ui5.
    $this.table = new sap.m.Table({
		/*growing : true,*/
		/*mode : sap.m.ListMode.SingleSelect,*/
		visible:false
    });
    $this.table.addStyleClass("chartTable");
    //$this.table.setModel(sap.ui.getCore().getModel("chartTableModel"));  
    $this.table.bindAggregation("columns", "/columns", 
	    new sap.m.Column({
    		header : new sap.m.Label({
    			text : "{}"
    		}),
    		/*visible : {
    		    path : "",
    		    formatter : function(column){
    		        if(column === "REQUEST_ID") {
    		            return false;
    		        }
    		        return true;
    		    }
    		}*/
	    })
	);
	
	var columnListItem = new sap.m.ColumnListItem({});
	columnListItem.bindAggregation("cells", "", new sap.m.Text({ 
	    text:"{}"
	}));
	$this.table.bindAggregation("items", "/rows", columnListItem);

    
    
    //creating a message Strip
    var infoMessageStrip = new sap.m.MessageStrip("chartInfoMessageStrip",{
    	text:"",
    	type:sap.ui.core.MessageType.Information,
    	showIcon:true,
    	visible:false
    });
    
    //creating a multichart div
    var multiChartDiv = new sap.ui.layout.VerticalLayout("multiChartDiv",{
    	height:"500px",
    	width:"100%",
    	visible:false
    });
    chartOverallLayout.addContent(infoMessageStrip);
    chartOverallLayout.addContent(chartWrapper);
    chartOverallLayout.addContent($this.table);
    chartOverallLayout.addContent(multiChartDiv);
    chartOverallLayout.addContent(chartOptionsLayout);
	return chartOverallLayout;
};

