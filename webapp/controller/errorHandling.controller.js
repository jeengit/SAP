sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Controller, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.errorHandling", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf serNow.conect.alert.view.errorHandling
		 */
		onAfterRendering: function (){
			this.getLoginName();
			this.getErrorTypeData();
		},
		getErrorTypeData: function (){
			var oModel = this.getOwnerComponent().getModel("sysConfig");
			var that = this;
			oModel.read("/AlertSnowInteStepsSet", {
				success: function (data) {
					that.getView().setModel(new JSONModel(data.results), "errorRes");
					sap.ui.getCore().setModel(new JSONModel(data.results), "errorRes");
				},
				error: function (err) {
				}
			});
		},
		handleSelectionChange : function (){
			var data = sap.ui.getCore().getModel("errorRes").getData();
			console.log(data);
		}
	});
});