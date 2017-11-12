jQuery.sap.declare("com.sap.bi.nlpa.modules.Statistics.StatisticsContainer");
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Statistics.StatisticsView",
	type: "view"
});
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Statistics.StatisticsController",
	type: "controller"
});

com.sap.bi.nlpa.modules.Statistics.StatisticsContainer = function (oData) {

	this.oView = new com.sap.bi.nlpa.modules.Statistics.StatisticsView(oData.id,{
		viewName: "com.sap.bi.nlpa.modules.Statistics.StatisticsView"
	});
	this.oController = this.oView.getController();
};

com.sap.bi.nlpa.modules.Statistics.StatisticsContainer.prototype.getUI = function () {
	return this.oView;
};

com.sap.bi.nlpa.modules.Statistics.StatisticsContainer.prototype.destroy = function () {
	this.oView.destroyContent();
	this.oController = null;
};