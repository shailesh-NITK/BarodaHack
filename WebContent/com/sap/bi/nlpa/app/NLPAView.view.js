jQuery.sap.require("com.sap.bi.nlpa.modules.Autocomplete.AutocompleteContainer");
jQuery.sap.require("com.sap.bi.nlpa.modules.ChartEngine.ChartEngineContainer");
jQuery.sap.require("com.sap.bi.nlpa.modules.Statistics.StatisticsContainer");
jQuery.sap.require("com.sap.bi.nlpa.modules.Twitter.TwitterContainer");
jQuery.sap.require("com.sap.bi.nlpa.modules.Forecast.ForecastContainer");


sap.ui.jsview("com.sap.bi.nlpa.app.NLPAView", {

	getControllerName : function() {
		return "com.sap.bi.nlpa.app.NLPAController";
	},

	createContent : function(oController) {
		var $this = this;
		
		//layout
		/*
		 * TOP: Header (datasetButton|search bar| -----|home|dashboard)
		 * BOTTOM: Left Pane(MetadataTile|insights) RightPane(VertLayout=Chart + Buttons)
		 * */
		
		
		var searchToBiWrapper = new sap.ui.layout.VerticalLayout("nlpaWrapper",{width:"100%"});
		var headerBarWrapper = new sap.ui.layout.VerticalLayout({
			width:"100%"
		});
		var headerBar = new sap.ui.layout.HorizontalLayout();
		//headerBar.addStyleClass("nlpaHeaderBar");
		$this.datasetSelectionDialog = new sap.m.SelectDialog({
			title:"Welcome Nirijhar Abhijaya Bonjani",
			confirm:function(event){
				console.log("Selected dataset:",event.getParameters().selectedItem.getTitle());
				NLPAApp.selectedDataset = event.getParameters().selectedItem.getTitle();
				NLPAApp.busyIndicatorDialog.setTitle("Preparing..");
				NLPAApp.busyIndicatorDialog.setText("Please wait...");
				oController.prepareDataset(event.getParameters().selectedItem.getTitle());
				
				NLPAApp.busyIndicatorDialog.open();
				
				
			}
		});
		$this.datasetSelectionButton = new sap.m.Button({
			text:"Welcome Nirijhar Abhijaya Bonjani",
			icon:"sap-icon://employee",
			width:"278px",
			press:function(){
				$this.datasetSelectionDialog.open();
			}
		});
		//$this.datasetSelectionButton.addStyleClass("datasetSelectButton");
		headerBar.addContent($this.datasetSelectionButton);
		
		//autocomplete layout
		var autocomplete = new com.sap.bi.nlpa.modules.Autocomplete.AutocompleteContainer("AutocompleteContainer");
		headerBar.addContent(autocomplete.getUI());

		//add the tab layout or buttons...later
		var tabViewMenu = new sap.m.IconTabBar("TabBarMenu",{
			expandable:false,
	        select : function(oEvent){
	        	var selectedKey = oEvent.getParameters().selectedKey;
	        	switch(selectedKey){
	        	case "Pinboard":
	        		//searchToBiBodyLayout.setVisible(false);
	        		$this.dashboardContent.setVisible(true);
	        		
	        		$("#"+searchToBiBodyLayout.getId()).hide();
	        		$("#"+$this.dashboardContent.getId()).show();
	        		break;
	        	case "Home":
	        		//$this.dashboardContent.setVisible(false);
	        		//searchToBiBodyLayout.setVisible(true);
	        		$("#"+searchToBiBodyLayout.getId()).show();
	        		$("#"+$this.dashboardContent.getId()).hide();
	        		break;
        		default:
        			break;
	        	}
	        }
		});
		
		
		$this.tabViewMenu_dashboardFilter = new sap.m.IconTabFilter({
			key:"Pinboard",
			icon:"sap-icon://pushpin-on",
			text:"Pinboard",
			count:0,
			/*iconColor:sap.ui.core.IconColor.Positive,*/
			//content:[ $this.dashboardContent ]
		});
		var tabViewMenu_homeFilter = new sap.m.IconTabFilter({
			key:"Home",
			icon:"sap-icon://home",
			text:"Home",
			//content:[ new sap.m.Text({text:"Home content goes here"})]
		});
		tabViewMenu.addItem(tabViewMenu_homeFilter);
		tabViewMenu.addItem($this.tabViewMenu_dashboardFilter);
		
		var searchToBiBodyLayout = new sap.ui.layout.Grid();
		searchToBiBodyLayout.addStyleClass("nlpaLayout");
		// Left Pane layout
		$this.leftPaneLayout = new sap.ui.layout.VerticalLayout({ width: "100%"}).addStyleClass("leftPaneLayout");
		// Right Content Layout = [SearchBar Layout,Results Layout]
		
		//metadata list
		$this.metadataMeasuresPanel = new sap.m.Panel({expandable:true,expanded:true});
		$this.metadataDimensionsPanel = new sap.m.Panel({expandable:true,expanded:true});
		var attributeHeader = new sap.m.Text({ text:"Attributes "});
		attributeHeader.addStyleClass("attributeLayoutHeader");
		var attributesLayout = new sap.ui.layout.VerticalLayout({
			content:[
			         	attributeHeader,
			         	$this.metadataDimensionsPanel,
			         	$this.metadataMeasuresPanel
			         ]
		});
		
		
		$this.metadataBar = new sap.ui.layout.HorizontalLayout();
		$this.metadataBar.addStyleClass("metadataBar");
		
		attributesLayout.addStyleClass("attributesLayout");
		$this.leftPaneLayout.addContent(attributesLayout);
		
		var rightContentLayout = new sap.ui.layout.VerticalLayout({width: "100%"});
		var resultsLayout = new sap.ui.layout.VerticalLayout({width:"100%"});
		rightContentLayout.addContent(resultsLayout);
		
		
		//searchToBiBodyLayout.addContent(leftPaneLayout);
		//searchToBiBodyLayout.addContent(rightContentLayout);
		
		/*$this.dashboardContent = new sap.ui.layout.HorizontalLayout({
			width:"100%",visible:false
		});
		
		$this.dashboardContent.addStyleClass("pinboardContainer");*/
		
		//searchToBiWrapper.addContent(headerBar);
		//headerBar.addContent(tabViewMenu);
		searchToBiWrapper.addContent(searchToBiBodyLayout);
		//searchToBiWrapper.addContent($this.dashboardContent);
		
		var charting = new com.sap.bi.nlpa.modules.ChartEngine.ChartEngineContainer({id:"ChartEngineContainer"});
		
		var statistics = new com.sap.bi.nlpa.modules.Statistics.StatisticsContainer({id:"StatisticsContainer",width:"100%"});
		var influencers = new sap.ui.layout.VerticalLayout({id:"InfluencersContainer",width:"100%"});
		var twitter = new com.sap.bi.nlpa.modules.Twitter.TwitterContainer({id:"TwitterContainer"});
		var forecast= new com.sap.bi.nlpa.modules.Forecast.ForecastContainer({id:"ForecastContainer"});
		
	    var chartingLayout = charting.getUI();
	    var statisticsLayout = statistics.getUI();
	    var twitterLayout = twitter.getUI();
	    var forecastLayout = forecast.getUI();
	    
	    /*var statisticsAndTwitterLayout = new sap.ui.layout.VerticalLayout("additionalServicesLayout",{ 
	    	width:"100%",
	    	content:[statisticsLayout,influencers,twitterLayout,forecastLayout] 
	    })*/;
	    
	    $this.metadataBar.setLayoutData(new sap.ui.layout.GridData({ span: "L12 M12 S12" }));
	    headerBarWrapper.setLayoutData(new sap.ui.layout.GridData({ span: "L12 M12 S12" }));
	    //$this.leftPaneLayout.setLayoutData(new sap.ui.layout.GridData({ span: "L2 M2 S2" }));
		chartingLayout.setLayoutData(new sap.ui.layout.GridData({ span: "L8 M8 S8" }));
		//statisticsAndTwitterLayout.setLayoutData(new sap.ui.layout.GridData({ span: "L4 M4 S4" }));
		
		headerBarWrapper.addStyleClass("nlpaHeader")
		headerBarWrapper.addContent(headerBar);
		//headerBarWrapper.addContent(new sap.m.Button({text:"hello there"}));
		searchToBiBodyLayout.addContent(headerBarWrapper);
		searchToBiBodyLayout.addContent($this.metadataBar);
		//searchToBiBodyLayout.addContent($this.leftPaneLayout);
	    searchToBiBodyLayout.addContent(chartingLayout);
	    //searchToBiBodyLayout.addContent(statisticsAndTwitterLayout);
	    
		
		return searchToBiWrapper;
	}
});
