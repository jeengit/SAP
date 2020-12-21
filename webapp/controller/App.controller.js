sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.App", {

		onInit: function () {
			var that = this;
			var model = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/CORE/CS_AUTH_SRV", true);

			model.read("/Authority_CheckSet('X')", {
				success: function (data) {
					if (data.Auth === "NA") {
						data.Auth = "";
					}
					that.setModel(new JSONModel(data), "authModel");
				},
				error: function () {

				}
			});

		}
	});

});