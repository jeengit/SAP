sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller"
], function (BaseController, Controller) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.loginCustomer", {
		onAfterRendering: function () {
			this.getLoginName();
		},
		onTilePress: function (evt) {
			var route = evt.getParameter("id").split("--")[1];
			this.getRouter().navTo(route);
		}
	});
});