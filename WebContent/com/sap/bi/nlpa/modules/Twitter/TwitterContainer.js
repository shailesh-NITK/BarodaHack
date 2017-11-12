jQuery.sap.declare("com.sap.bi.nlpa.modules.Twitter.TwitterContainer");
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Twitter.TwitterView",
	type: "view"
});
jQuery.sap.require({
	modName: "com.sap.bi.nlpa.modules.Twitter.TwitterController",
	type: "controller"
});

com.sap.bi.nlpa.modules.Twitter.TwitterContainer = function (oData) {

	this.oView = new com.sap.bi.nlpa.modules.Twitter.TwitterView(oData.id,{
		viewName: "com.sap.bi.nlpa.modules.Twitter.TwitterView"
	});
	this.oController = this.oView.getController();
};

com.sap.bi.nlpa.modules.Twitter.TwitterContainer.prototype.getUI = function () {
	return this.oView;
};

com.sap.bi.nlpa.modules.Twitter.TwitterContainer.prototype.destroy = function () {
	this.oView.destroyContent();
	this.oController = null;
};