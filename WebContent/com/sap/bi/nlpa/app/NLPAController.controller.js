jQuery.sap.require("sap.ui.core.routing.Router");
jQuery.sap.require("com.sap.bi.nlpa.utils.Sanitizer");

sap.ui.controller("com.sap.bi.nlpa.app.NLPAController", {
 
    oShell : null,
 
    /**
     * Called when a controller is instantiated and its View controls (if
     * available) are already created. Can be used to modify the View before it
     * is displayed, to bind event handlers and do other one-time
     * initialization.
     *
     * @memberOf bi.nlpa.modules.Main
     */
    prepareDataset : function(datasetName){
    	var $this = this;
    	jQuery.ajax({
    	    type: 'POST',
    	    //url: "/NLASWebClient/NLASService",
    	    url: NLPAApp.constants.serviceURL,
    	    headers: {
    	    	//csrfToken: csrfToken
    	    },
    	    data:{
    	    	
    	    	"request":JSON.stringify({
    	    		"service":"prepare",
        	    	"dataset":datasetName
    	    	})
    	    	
    	    }
    	}).done(function(data) {
    		NLPAApp.busyIndicatorDialog.close();
    		$this.getView().datasetSelectionButton.setText(datasetName);
    		$this.loadMetadata(datasetName);
    	}).fail(function(err){
    		NLPAApp.busyIndicatorDialog.close();
    		$this.getView().datasetSelectionButton.setText(datasetName);
    		$this.loadMetadata(datasetName);
    	});
    },
    loadMetadata : function(selectedDataset){
    	var $this = this;
    	
    	//clear all the previous data
    	NLPAApp.metadataList = [];
    	NLPAApp.suggestionsMap.clear();
    	$this.getView().metadataMeasuresPanel.removeAllContent();
    	$this.getView().metadataDimensionsPanel.removeAllContent();
    	$this.getView().metadataBar.removeAllContent();
    	
    	
    	$.ajax({
    	    type: 'POST',
    	    url:NLPAApp.constants.serviceURL,
    	    data:{ "request":JSON.stringify({
    	    	"service":"getMetadata",
    	    	"dataset":NLPAApp.getSelectedDataset()
    	    	})
    	    }
    	}).done(function(metadata) {
    		console.log(metadata);
    		NLPAApp.metadataList = metadata;
    		NLPAApp.metadataList.sort(function(a,b){ return (a._type==="MEASURE" && b._type==="DIMENSION"?1:-1)});
    		NLPAApp.metadataList.forEach(function(elem){
    			NLPAApp.metadataIdToNameMapping[elem._id] = elem._name;
    		});
    		var num_dimensions=0,num_measures=0;
    		for(var i=0;i<NLPAApp.metadataList.length;i++){
    			NLPAApp.suggestionsMap.set(Sanitizer.sanitizeName(NLPAApp.metadataList[i]._name).toLowerCase(),{
					rawInput: NLPAApp.metadataList[i]._name,
					attribute:NLPAApp.metadataList[i]._id,
					type:NLPAApp.metadataList[i]._type,
				});
    			
    			if(NLPAApp.metadataList[i]._type==="MEASURE"){

    				
    				$this.getView().metadataBar.addContent(
    					new sap.m.Token({
    						editable:false,
    						text:NLPAApp.metadataList[i]._name
    					}).addStyleClass("metadataMeasureToken")
					);
    				
    				num_measures++;
    			}else if(NLPAApp.metadataList[i]._type==="DIMENSION"){

    				$this.getView().metadataBar.addContent(
    					new sap.m.Token({
    						editable:false,
    						text:NLPAApp.metadataList[i]._name
    					}).addStyleClass("metadataDimensionToken")
					);
    				num_dimensions++;
    			}else{
    				continue;
    			}
    		}
    		//$this.getView().metadataDimensionsPanel.setHeaderText(NLPAApp.localized("metadata_dimensions")+"("+num_dimensions+")");
        	//$this.getView().metadataMeasuresPanel.setHeaderText(NLPAApp.localized("metadata_measures")+"("+num_measures+")");
    	});
    	
    },
    onInit : function() {
    	var $this = this;
    	//get datasets
    	/*$.ajax({
    	    type: 'POST',
    	    url:NLPAApp.constants.serviceURL,
    	    headers: {
    	        
    	    },
    	    data:{
    	    	"request" :JSON.stringify({
    	    		"service":"listDataSources",
    	    		"data":""
    				})
    	    }
    	}).done(function(data) { 
    		
    		
    		NLPAApp.datasets = data;
    		//add the datasets to the dialog
    		for(var i=0;i<data.length;i++){
    			$this.getView().datasetSelectionDialog.addItem(
					new sap.m.StandardListItem({
						title:data[i].technicalName
					})
    			);
    		}
    		*/
    		//set selected item to the first item
    		//$this.getView().datasetSelectionButton.setText(data[0].technicalName);
    	$this.getView().datasetSelectionDialog.addItem(
				new sap.m.StandardListItem({
					title:"Welcome Nirijhar Abhijaya Bonjani"
				})
			);
    		NLPAApp.selectedDataset = "Welcome Nirijhar Abhijaya Bonjani";
    	
    },
 
    /**
     * Similar to onAfterRendering, but this hook is invoked before the
     * controller's View is re-rendered (NOT before the first rendering!
     * onInit() is used for that one!).
     *
     * @memberOf bi.nlpa.modules.Main
     */
    onBeforeRendering : function() {
        
    },
 
    /**
     * Called when the View has been rendered (so its HTML is part of the
     * document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     *
     * @memberOf bi.nlpa.modules.Main
     */
    onAfterRendering : function() {
    	/*var $this = this;
    	var headerOffset = 100;
    	var height = window.innerHeight - headerOffset;
    	$this.oView.leftPaneLayout.getDomRef().style.height = height+"px";*/
    	/*this.oView.reLayout();
    	this.oView.lazyLoad();
    	var $this = this;
    	$(window).resize(function(){
    		$this.oView.reLayout(); 
    	});*/  
    },
 
    /**
     * Called when the Controller is destroyed. Use this one to free resources
     * and finalize activities.
     *
     * @memberOf bi.nlpa.modules.Main
     */
    onExit : function() {
 
    }
 
});