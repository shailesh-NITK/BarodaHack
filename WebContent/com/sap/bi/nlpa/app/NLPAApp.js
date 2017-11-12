(function(window){
	"use strict";

	jQuery.sap.declare('com.sap.bi.nlpa.NLPAApp');

	var oAppModel, oResourceBundle, sBasePath, sBaseUrl, sResourceBundlePath, sAppRouterName;
	var productLocale, preferredViewingLocale, logonToken, timeZone;
	var webServiceBaseURL = "";
	var tileCount = 0;
	productLocale = "";
	preferredViewingLocale = "";
	logonToken ="";
	timeZone ="";

	oAppModel           = null;
	oResourceBundle     = null;
	sBasePath           = window.location.pathname.replace(/\/[^\/]*\.?[^\/]*$/, '/');            
	sBaseUrl            = window.location.protocol + '//' + window.location.host + sBasePath;
	sResourceBundlePath = sBaseUrl + "i18n/NLPAResources.properties";
	sAppRouterName      = "nlpaAppRouter";


	window.NLPAApp = {};

	NLPAApp.getTimeZone = function(){
		return timeZone;
	};
	NLPAApp.getProductLocale = function(){
		return productLocale;
	};
	NLPAApp.getPreferredViewingLocale = function(){
		return preferredViewingLocale;
	};
	NLPAApp.getlogonToken = function(){
		return logonToken;	
	};
	NLPAApp.getWebServiceBaseURL = function(){
		return webServiceBaseURL;	
	};

	NLPAApp.init = function (appSettings) {


		logonToken = appSettings.logonToken;
		webServiceBaseURL = appSettings.webServiceURL;
		productLocale = appSettings.productLocale;
		preferredViewingLocale = appSettings.pvl;
		timeZone=appSettings.timeZone;

		if(preferredViewingLocale !=undefined && preferredViewingLocale !=null){
			preferredViewingLocale = preferredViewingLocale.replace(/_/g, "-");
		}
		var oI18nModel, ui5core;

		ui5core = sap.ui.getCore();

		oAppModel = new sap.ui.model.json.JSONModel();
		ui5core.setModel(oAppModel, "appModel");

		//we could force a certain locale/language
		//oI18nModel = new sap.ui.model.resource.ResourceModel({bundleUrl:sResourceBundlePath, bundleLocale:"en"});
		//or we just let ui5 decide:
		//(HINT: this will cause a messages_de_DE.properties 404 (Not Found) in our setup for German browsers, but then messages_de.properties is found)
		oI18nModel = new sap.ui.model.resource.ResourceModel({bundleUrl:sResourceBundlePath, bundleLocale:productLocale});
		ui5core.setModel(oI18nModel, "i18n");
		oResourceBundle = oI18nModel.getResourceBundle();

		//this is the one and only JS View which will use in our application (all other views are XML Views) 

		var app = new sap.m.App({initialPage:"bi.nlpaMainView"});

		this.oView = sap.ui.view({id:"bi.nlpaMainView", viewName:"com.sap.bi.nlpa.app.NLPAView", type:sap.ui.core.mvc.ViewType.JS});


		app.addPage(this.oView);

		app.placeAt("content");

		$('#content').on("keydown", function(oEvent) {
			if (oEvent.keyCode == 27) {
				oEvent.stopPropagation();
				oEvent.preventDefault();
			}
		});

	};

	/**
	 * Return the localized string for the given key
	 * @param {string} key Key of the localization property
	 * @param {Array=} args Array of strings containing the values to be used for replacing placeholders *optional*
	 * @return {string} the corresponding translated text
	 */
	NLPAApp.localized = function (key, args) {
		return oResourceBundle.getText(key, args);
	};

	NLPAApp.getNLPAAppRouterName = function () {
		return sAppRouterName;
	};

	NLPAApp.getAppRouter = function () {
		return sap.ui.core.routing.Router.getRouter(sAppRouterName);
	};

	NLPAApp.getAppModel = function () {
		return oAppModel;
	};

	NLPAApp.setShell = function (oShell) {
		NLPAApp.oShell = oShell;
	};

	NLPAApp.getShell = function () {
		return NLPAApp.oShell;
	};

	NLPAApp.getBaseUrl = function () {
		return sBaseUrl;
	};

	/**
	 * Loads a stylesheet in case it has not been loaded yet. If the stylesheet has been loaded already, then nothing happens (no replacement).
	 * This is a handy function which prevents some issues that can occur, especially in older browsers (IE7).
	 * For replacement enabled inclusion please use jQuery.sap.includeStyleSheet(sUrl, sId);
	 * @param {string} sUrl the application relative path to the css file
	 * @param {string} id dom id of the css that shall be used. If not defined, then the dom id will be calculated from sUrl ("/" will be replaced with "-")
	 */
	NLPAApp.includeStyleSheet = function (sUrl, sId) {
		if (!sUrl) {
			return;
		}
		if (!sId){
			sId = sUrl.replace(/\//g, "-");
		}
		if (!document.getElementById(sId)){
			return jQuery.sap.includeStyleSheet(sUrl, sId);
		}
	};

	/**
	 * Reload the current page and ignore browser cache
	 */
	NLPAApp.reload = function () {
		window.location.reload(true);
	};

	/**
	 * Allows to change the language on the fly
	 * @param {string} lang new language to be used application wide
	 */
	NLPAApp.setLang = function (lang) {
		var oModel, oCore, oConfig;

		oCore = sap.ui.getCore();
		oConfig = oCore.getConfiguration();

		if (oConfig.getLanguage() !== lang) {
			oConfig.setLanguage(lang);

			oModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : sResourceBundlePath,
				bundleLocale : lang});
			oCore.setModel(oModel, 'i18n');
			oResourceBundle = oModel.getResourceBundle();
		}
	};

	NLPAApp.constants = {
			//serviceURL : "/nlp_analytics_velocity_microservice/NLPAnalyticsMicroservice",
			serviceURL : "/BarodaHack/EndPoint",
			BACKSPACE_KEYCODE : 8,
			SPACEBAR_KEYCODE: 32,
			LEFT_ARROW:37,
			RIGHT_ARROW:39,
			DOWN_ARROW:40,
			UP_ARROW:38
	};

	NLPAApp.suggestionsMap = new Map();
	NLPAApp.selectedDataset;
	NLPAApp.getSelectedDataset = function(){
		return NLPAApp.selectedDataset;
	};
	NLPAApp.pinnedSVGURLs=[];
	NLPAApp.getQueryAsString = function(){
		var contents = sap.ui.getCore().byId("autocompleteHorizontalLayout").getContent();
		var queryString = "";
		for(var i=0;i<contents.length;i++){
			if(contents[i].getMetadata().getName()==="sap.m.Text"){
				if(NLPAApp.suggestionsMap.get(Sanitizer.sanitizeName(contents[i].getText()))){
					queryString += Sanitizer.getPascalCase(contents[i].getText())+" ";
				}else{
					queryString += contents[i].getText()+" ";
				}
			}else if(contents[i].getMetadata().getName()==="sap.m.SearchField"){
				if(NLPAApp.suggestionsMap.get(Sanitizer.sanitizeName(contents[i].getValue()))){
					queryString += Sanitizer.getPascalCase(contents[i].getValue())+" ";
				}else{
					queryString += contents[i].getValue()+" ";
				}
				
			}
		}
		queryString = queryString.trim();
		return queryString;
	};
	NLPAApp.busyIndicatorDialog = new sap.m.BusyDialog();
	NLPAApp.pinnedVisualizatoins = [];
	NLPAApp.pinnedVizSVGs = [];
	NLPAApp.metadataList = [];
	NLPAApp.metadataIdToNameMapping = {};
	NLPAApp.getNameFromId = function(id){
		return (NLPAApp.metadataIdToNameMapping[id] || id);
	};
	NLPAApp.chart_types = [
	                              "line",
	                              "curve",
	                              "bar",
	                              "dual bar",
	                              "stacked bar",
	                              "bubble",
	                              "pie",
	                              "table",
	                              "scatter",
	                              "mutli bar",
	                              "multi pie",
	                              "multi tree",
	                              "treemap",
	                              "table",
	                              "value",
	                              "geo",
	                              "multi"
	                              ];
})(window);