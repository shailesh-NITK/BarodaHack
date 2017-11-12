jQuery.sap.declare({
	modName: "com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView",
	type: "view"
});
jQuery.sap.require("com.sap.bi.nlpa.utils.Sanitizer");
jQuery.sap.require("sap.ui.core.mvc.JSView");

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView = function () {
	"use strict";
	sap.ui.core.mvc.JSView.apply(this, arguments);
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView.prototype = jQuery.sap.newObject(sap.ui.core.mvc.JSView.prototype);

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView.prototype.getControllerName = function () {
	return "com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController";
};

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView.prototype.createContent = function (oController) {
	var $this = this;
	//SuggestionMap : (K,V)=>(suggestionText,queryItem)
	$this.suggestionsMap = new Map();
	
	//bestMatchMap is a dictionary lookup : (K,V)=>(firstWord,entire phrase)
	$this.bestMatchMap = {};
	
	
	$this.TIMEOUT_DURATION = 300;//ms
	$this.DID_YOU_MEAN_LABEL = "Showing results for ";
	$this.operators = ["in"];

	var autocompleteWrapper = new sap.ui.layout.HorizontalLayout();
	//autocompleteWrapper.addStyleClass("autocompleteWrapper");

	this.searchField = new sap.m.SearchField({
		width:"500px",
		showSearchButton:false,
		showMagnifier:false,
		placeholder:"What would you like to know?",
		enableSuggestions :true,
		selectOnFocus:true
	});
	this.searchField.addStyleClass("autocompleteSearchField");
	this.searchField.attachLiveChange($this.liveChangeHanlder,this);
	this.searchField.attachSearch($this.searchHandler,this);
	autocompleteWrapper.addContent($this.searchField);
	return autocompleteWrapper;
};



com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView.prototype.searchHandler = function(event){
	var $this = this;
	if($this.searchField.getValue().trim().length===0)
		return;
	
	var inputItems = $this.searchField.getValue().split(" ");
	//clearSelectedItems();
	var queryTermsList = $this.buildQueryItems($this.searchField.getValue());
	var sentence = "";
	queryTermsList.forEach(function(elem){
		sentence += elem.rawInput.replace(" ","_")+" ";
	});
	var chart_type = "";
	console.log(queryTermsList);
	if(queryTermsList.length>0){
		//set views to busy
		sap.ui.getCore().byId("forecastWrapper").setBusy(true);
		sap.ui.getCore().byId("twitterWrapper").setBusy(true);
		//sap.ui.getCore().byId("statisticsWrapper").setBusy(true);
		//sap.ui.getCore().byId("StatisticsContainer").setBusy(true);
		sap.ui.getCore().byId("InfluencersContainer").setBusy(true);
		
		sap.ui.getCore().byId("myChartWrapper").setBusy(true);
		
		$this.getController().submitQuery(sentence.trim(),queryTermsList,chart_type);
	}
	
};

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView.prototype.liveChangeHanlder = function(event){
	var $this = this;
	var currentSearchValue = event.getParameter("newValue");
	var searchTimeout = setTimeout(function(){
		//check the value again
		// if its the same, it means user was idle. fire query

		var newValue = $this.searchField.getValue();
		// console.log(currentSearchValue,newValue);
		if(currentSearchValue===newValue){
			//console.log("Will fire Query");
			$this.searchField.removeAllSuggestionItems();
			var inputValues = newValue.split(" ");
			console.log(inputValues);
			var newValue = inputValues.pop();
			if(newValue===""){
				return;
			}
			var oldValue = inputValues.join(" ");
			$this.searchField.oldValue = oldValue;
			$this.searchField.newValue = newValue;

			// make the call
			com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController.prototype.search(newValue,function(suggestions){

				suggestions.forEach(function(value,key){
					$this.suggestionsMap.set(value.rawInput.toLowerCase(),value);

					var key = value.rawInput.toLowerCase().split(" ")[0];
					var bestMatchArray = $this.bestMatchMap[key];
					if(!bestMatchArray){
						$this.bestMatchMap[key] = [value.rawInput];
					}else{
						if(bestMatchArray.indexOf(value.rawInput)===-1)
							bestMatchArray.push(value.rawInput);
					}


					//again validate if the request keywords match the current keywords
					// check if the keyword exists exactly at the end
					var searchFieldVal = $this.searchField.getValue(); 
					if(searchFieldVal.lastIndexOf($this.searchField.newValue)===(searchFieldVal.length-$this.searchField.newValue.length)){
						var suggestionText = ($this.searchField.oldValue.length===0)?value.rawInput:$this.searchField.oldValue+" "+value.rawInput;
						var suggestionItem = new sap.m.SuggestionItem({
							text:suggestionText
						});
						$this.searchField.addSuggestionItem(suggestionItem);
					}
					else{
						//do nothing
					}
					
					
				});


				$this.searchField.suggest();
			});
			
		}
	},$this.TIMEOUT_DURATION);
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView.prototype.isOperator = function(text){
	var $this = this;
	return ($this.operators.indexOf(text)>=0);
};
com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView.prototype.buildQueryItems = function(text){
	var $this = this;
	var inputLength = text.length;
	var inputValue = text;
	var nextIndex = 0;
	var queryItems = [];
	var counter = 0;
	while(nextIndex<inputLength){
		counter++;
		if(counter === 50){
			break;
		}
		var currentString = inputValue.substring(nextIndex,inputLength);
		var currentWord = currentString.split(" ")[0];
		// first check the best match map to get the best fit for current element
		var bestMatchArray = $this.bestMatchMap[currentWord.toLowerCase()];
		var queryItem;
		if(bestMatchArray && !$this.isOperator(currentWord)){
			//get the longest matching string from this array
			var bestMatch ="";
			bestMatchArray.forEach(function(value,key){
				if(currentString.toLowerCase().indexOf(value.toLowerCase())===0 && value.length>bestMatch.length){
					bestMatch = value;
				}
			});
			
			if(bestMatch!==""){
				queryItem = $this.suggestionsMap.get(bestMatch.toLowerCase());
				//nextIndex = inputValue.indexOf(bestMatch) + bestMatch.length + 1;//+1 assuming that it would be a space afterwards
				nextIndex += bestMatch.length + 1;//+1 assuming that it would be a space afterwards
			}else{
				queryItem = {
						rawInput:currentWord,
						attribute:"",
						type:""
				};
				//nextIndex = inputValue.indexOf(currentWord) +currentWord.length + 1;// +1 assuming one more space
				nextIndex += currentWord.length + 1;// +1 assuming one more space
			}
				
			

			
			
			
		}else{
			//insert default query item with no type
			queryItem = {
					rawInput:currentWord,
					attribute:"",
					type:""
			};
			//nextIndex = inputValue.indexOf(currentWord) +currentWord.length + 1;// +1 assuming one more space
			nextIndex += currentWord.length + 1;// +1 assuming one more space
		}
		queryItems.push(queryItem);
		// construct the query item from the suggestion Map
		
		

	}
	return queryItems;
};



