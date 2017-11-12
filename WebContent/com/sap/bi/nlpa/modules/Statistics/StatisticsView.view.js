jQuery.sap.declare({
	modName: "com.sap.bi.nlpa.modules.Statistics.StatisticsView",
	type: "view"
});
jQuery.sap.require("com.sap.bi.nlpa.utils.Sanitizer");
jQuery.sap.require("sap.ui.core.mvc.JSView");

com.sap.bi.nlpa.modules.Statistics.StatisticsView = function () {
	"use strict";
	sap.ui.core.mvc.JSView.apply(this, arguments);
};
com.sap.bi.nlpa.modules.Statistics.StatisticsView.prototype = jQuery.sap.newObject(sap.ui.core.mvc.JSView.prototype);

com.sap.bi.nlpa.modules.Statistics.StatisticsView.prototype.getControllerName = function () {
	return "com.sap.bi.nlpa.modules.Statistics.StatisticsController";
};

com.sap.bi.nlpa.modules.Statistics.StatisticsView.prototype.createContent = function (oController) {
	
	var $this = this;
	var chartOverallLayout = new sap.ui.layout.VerticalLayout();
	var chartOptionsLayout = new sap.ui.layout.HorizontalLayout();
	chartOptionsLayout.addStyleClass("chartOptionsLayout");
	chartOptionsLayout.addContent();
	chartOptionsLayout.addContent();
	chartOptionsLayout.addContent();
	var chartWrapper = new sap.ui.layout.HorizontalLayout("statisticsWrapper");
	chartWrapper.addStyleClass("statisticsWrapper");
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
       	    	window.vf = $this.vizFrame;
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
    var infoMessageStrip = new sap.m.MessageStrip("statisticsInfoMessageStrip",{
    	text:"",
    	type:sap.ui.core.MessageType.Information,
    	showIcon:true,
    	visible:false
    });
    
    var statisticsLink = new sap.m.Link("statisticsLink",{
    	text:"More details...",
    	visible:false,
    	press:function(){
    		//oController.displayCloud();
    		//read content from controller
    		var data = oController.statisticsData;
    		// table / chart model set
    		$this.raw_data = oController.getData(data);
    		$this.chart_type = oController.getchartType(data);
    		sap.ui.getCore().byId("statisticsDialog").open();
    	}
    })
    
    var summaryDataset = new sap.m.Text("summaryDataet",{text:"Statastics on whole dataset"});
	var maximiseDataset = new sap.m.Text("maxDataset",{text:"Maximise"});
	var minimiseDataset = new sap.m.Text("minDataset",{text:"Minimise"});
	var rangeDataset = new sap.m.Text("rangeDataset",{text:"Range"});
	var sdDataset = new sap.m.Text("sdDataset",{text:"Standard Deviation"});
	var sumDataset = new sap.m.Text("sumDataset",{text:"Sum"});
	var averageDataset = new sap.m.Text("averageDataset",{text:"Average"});
	
	
	var maximise = new sap.m.Text("max",{text:"Maximise"});
	var minimise = new sap.m.Text("min",{text:"Minimise"});
	var range = new sap.m.Text("range",{text:"Range"});
	var sd = new sap.m.Text("sd",{text:"Standard Deviation"});
	var sum = new sap.m.Text("sum",{text:"Sum"});
	var average = new sap.m.Text("average",{text:"Average"});
	
	
    var oVizFrame = new sap.viz.vizframe.VizFrame("StatisticsVizFrame",{
        'width': '100%',
        'height': '600px',
        'vizType' : 'column',
        'vizProperties' : {
          plotArea: {dataLabel : {
                  visible: false,
              //renderer: function(pieDataLabel){pieDataLabel.text = pieDataLabel.ctx.Revenue;}
          }},
          
        }          
      });
    
    var summaryTitle = new sap.m.Title("summaryTitle",{
    	text: "DataSummary",
    	textAlign: sap.ui.core.TextAlign.Center,
    	width:"100%"
    });
    
    // Table for Dataset summary
    var table = new sap.m.Table("SummaryTable",{ 
		columns : [
		        new sap.m.Column({header: new sap.m.Text({text: "Measure"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Maximum"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Minimum"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Range"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Standard Deviation"})}),
				new sap.m.Column({header: new sap.m.Text({text: "SUM"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Average"})})
			]
	});
    
    var columnListItem = new sap.m.ColumnListItem({});
	columnListItem.bindAggregation("cells", "", new sap.m.Text({ 
	    text:"{}"
	}));
	table.bindAggregation("items", "/data", columnListItem)
	
	var queryTitle = new sap.m.Title("queryTitle",{
    	text: "Query Statistics",
    	textAlign: sap.ui.core.TextAlign.Center,
    	width:"100%"
    });
	var tableQuery = new sap.m.Table("QuerySummaryTable",{ 
		columns : [
				new sap.m.Column({header: new sap.m.Text({text: "Maximum"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Minimum"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Range"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Standard Deviation"})}),
				new sap.m.Column({header: new sap.m.Text({text: "SUM"})}),
				new sap.m.Column({header: new sap.m.Text({text: "Average"})})
			]
	});
	
	var columnListItemQuery = new sap.m.ColumnListItem({});
	columnListItemQuery.bindAggregation("cells", "", new sap.m.Text({ 
	    text:"{}"
	}));
	tableQuery.bindAggregation("items", "/data", columnListItemQuery)
	
    //var productHBox = new sap.m.HBox("productBox",{});
	var chartLayout = new sap.ui.layout.VerticalLayout({width:"100%"});
    var vbox = new sap.m.VBox({
           width:"60%",
           //height:"600px",
           items:[ ]
    });
    
    /*var vbox_mid = new sap.m.VBox({
           width:"30%",
           items:[table]
    });*/
    
    var vbox_right = new sap.m.VBox({
        width:"40%",
        //items:[maximise,minimise,range,sd,sum,average]
        items:[queryTitle,tableQuery,summaryTitle,table]
    });
 
    var hboxt= new sap.m.HBox({
           justifyContent : sap.m.FlexJustifyContent.Start,
           width:"100%",
           alignItems : sap.m.FlexAlignItems.Center,
           items:[
                  vbox,
                  //vbox_mid,
                  vbox_right
           ]
    });
    
    
    var statisticsDialog = new sap.m.Dialog("statisticsDialog",{
    	title:"Statistics",
    	stretch:true,
    	content:[hboxt],
    	afterOpen:function(e){
    		//if($this.vizFrame==undefined || $this.vizFrame==null){
    			/*var oVizFrame = new sap.viz.vizframe.VizFrame("StatisticsVizFrame",{
        	        'width': '100%',
        	        'height': '600px',
        	        'vizType' : 'column',
        	        'vizProperties' : {
        	          plotArea: {dataLabel : {
        	                  visible: false,
        	              //renderer: function(pieDataLabel){pieDataLabel.text = pieDataLabel.ctx.Revenue;}
        	          }},
        	          
        	        }          
        	      });*/
    			 var dataset = new FlatTableDataset({
    			        'metadata' : {
    			            'fields' : []
    			        },
    			        'data' : []
    			    });
    			    
    			    var bindings = [];
    			var options = {
       	    	        'type' : 'info/bar',
       	    	        'container' : vbox.getDomRef(),
       	    	        'data' : dataset,
       	    	        'bindings' : bindings
       	    	    };
           	    	$this.vizFrame = new sap.viz.vizframe.VizFrame(options);
    		//}
    		oController.displayChart($this.raw_data,$this.chart_type);
    	}
    });
    
    //chartOverallLayout.addContent(infoMessageStrip);
    //chartOverallLayout.addContent(chartWrapper);
    //chartOverallLayout.addContent($this.table);
    //chartOverallLayout.addContent(chartOptionsLayout);
    //chartOverallLayout.addContent(statisticsDialog);
    
	
    var statisticsText = new sap.ui.core.HTML("statisticsText",{ content:"" });
    var statisticsTextLayout = new sap.ui.layout.VerticalLayout({ 
		content: [statisticsText]
	}).addStyleClass("statisticInfo");
    
    chartOverallLayout.addContent(statisticsTextLayout);
    chartOverallLayout.addContent(statisticsLink);
	return chartOverallLayout;
};

