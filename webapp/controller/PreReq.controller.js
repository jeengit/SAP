sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Controller, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.PreReq", {
		onAfterRendering: function () {
			this.loadListData();
			this.getLoginName();
		},

		loadListData: function () {
			var oModel = this.getOwnerComponent().getModel("sysConfig");
			var that = this;
			oModel.read("/AlertSnowInteStepsSet", {
				success: function (data) {
					that.getView().setModel(new JSONModel(data.results), "preReq");
				},
				error: function (err) {
				}
			});
		},
		onHelpPress: function (evt) {
			var text = evt.getSource().getBindingContext("preReq").getProperty("Tooltip");
			var contentWidth = "40%";

			var popover = new sap.m.Popover({
				contentWidth: contentWidth,
				showHeader: false,
				content: new sap.m.Text({
					text: text
				})
			}).addStyleClass("popoverClass");
			popover.openBy(evt.getSource());

		},
		onStatusUpdate: function (evt) {
			var model = this.getView().getModel("preReq");
			var data = model.getData();
			var path = evt.getSource().getBindingContext().getPath().substr(1);
			data[path].Status = evt.getSource().getSelected() ? "X" : "";
			model.refresh();
		},

		onSavePreReq: function () {
			var that = this;
			var data = this.getView().getModel("preReq").getData();
			var oModel = this.getOwnerComponent().getModel("sysConfig");

			var changeSetId = "foo";
			var mParameters = {
				"groupId": changeSetId,
				"changeSetId": changeSetId
			};
			for (var i = 0; i < data.length; i++) {
				var url = "/AlertSnowInteStepsSet";
				if (!data[i].Timestamp) {
					data[i].Timestamp = new Date();
				}
				oModel.create(url, data[i], mParameters);
			}
			this.getModel().submitChanges({
				success: function (oResp) {
					that.loadListData();
					sap.m.MessageToast.show("Changes are saved");
				},
				error: function (oerror) {
					sap.m.MessageToast.show("Error while saving");
				}
			});
		}
	});
});