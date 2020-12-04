sap.ui.define([
	"./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (BaseController, Controller, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.alertRouting", {
		onAfterRendering: function () {
            this.getLoginName();
            this.getRoutingSet();
            var obj ={
                "results":[{},{}]
            }
            this.getView().setModel(new JSONModel(obj), "routeModel");
        },
        getRoutingSet: function() {
            var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/CORE/CA_ALERT_MAPPING_SRV", true);
			var that = this;
			oModel.read("/AlertSnowRoutingSet?$filter=Input eq 'Fields'", {
				success: function (data) {
                    data = data.results ? JSON.parse(data.results['0']['Output']) : [];
                    that.getView().setModel(new JSONModel(data), "fieldModel");
				},
				error: function (err) {
				}
			});
        }
	});
});