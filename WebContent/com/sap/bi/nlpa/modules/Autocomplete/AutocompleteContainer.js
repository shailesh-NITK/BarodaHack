jQuery.sap.declare("com.sap.bi.nlpa.modules.Autocomplete.AutocompleteContainer");
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView",
	type: "view"
});
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Autocomplete.AutocompleteController",
	type: "controller"
});

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteContainer = function (oData) {

	this.oView = new com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView({
		viewName: "com.sap.bi.nlpa.modules.Autocomplete.AutocompleteView"
	});
	this.oController = this.oView.getController();
};

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteContainer.prototype.getUI = function () {
	return this.oView;
};

com.sap.bi.nlpa.modules.Autocomplete.AutocompleteContainer.prototype.destroy = function () {
	this.oView.destroyContent();
	this.oController = null;
};