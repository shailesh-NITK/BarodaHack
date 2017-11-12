jQuery.sap.declare("com.sap.bi.nlpa.modules.ChartEngine.ChartEngineContainer");
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView",
	type: "view"
});
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.ChartEngine.ChartEngineController",
	type: "controller"
});

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineContainer = function (oData) {

	this.oView = new com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView(oData.id,{
		viewName: "com.sap.bi.nlpa.modules.ChartEngine.ChartEngineView"
	});
	this.oController = this.oView.getController();
};

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineContainer.prototype.getUI = function () {
	return this.oView;
};

com.sap.bi.nlpa.modules.ChartEngine.ChartEngineContainer.prototype.destroy = function () {
	this.oView.destroyContent();
	this.oController = null;
};