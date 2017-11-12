jQuery.sap.declare("com.sap.bi.nlpa.modules.Forecast.ForecastContainer");
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Forecast.ForecastView",
	type: "view"
});
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Forecast.ForecastController",
	type: "controller"
});

com.sap.bi.nlpa.modules.Forecast.ForecastContainer = function (oData) {

	this.oView = new com.sap.bi.nlpa.modules.Forecast.ForecastView(oData.id,{
		viewName: "com.sap.bi.nlpa.modules.Forecast.ForecastView"
	});
	this.oController = this.oView.getController();
};

com.sap.bi.nlpa.modules.Forecast.ForecastContainer.prototype.getUI = function () {
	return this.oView;
};

com.sap.bi.nlpa.modules.Forecast.ForecastContainer.prototype.destroy = function () {
	this.oView.destroyContent();
	this.oController = null;
};