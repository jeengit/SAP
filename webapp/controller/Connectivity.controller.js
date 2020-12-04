sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (BaseController, Controller, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.Connectivity", {
		onInit: function () {
			this.getRouter().getRoute("connectivity").attachMatched(this.routeMatched, this);
		},

		routeMatched: function (oEvent) {
			//var that = this;
			this.loadDestName();

		},
		loadDestName: function () {
			var that = this;
			var oModel = this.getOwnerComponent().getModel("sysConfig");
			//oModel.setUseBatch(false);
			oModel.read("/AlertSnowRfcDestSet", {
				success: function (data) {
					that.destName = data.results[0] ? data.results[0].Rfcdest : "";
					if (that.destName) {
						that.loadDestination(false);
					} else {
						var obj = {
							"save": true,
							"edit": false,
							"cancel": false,
							"check": false
						};

						for (var x in obj) {
							that.byId(x).setVisible(obj[x]);
						}
					}
				},
				error: function (err) {

				}
			});
		},

		onAfterRendering: function () {
			var oModel = new JSONModel([]);
			this.getView().setModel(oModel, "dest");
			this.getView().bindElement({
				path: "dest>/"
			});
		},
		formatProxySelection: function (val1, val2, val3) {
			var flag = false;
			if (val1 || val2 || val3) {
				flag = true;
			} else {
				flag = false;
			}
			return flag;
		},

		onProxySelect: function (evt) {
			var sel = evt.getSource().getSelected();
			this.byId("proxyForm").setVisible(sel);
		},
		onConnectionCheck: function () {
			this.loadDestination(true);
		},
		loadDestination: function (conCheck) {
			var that = this;
			var model = this.getOwnerComponent().getModel("sysConfig");
			sap.ui.core.BusyIndicator.show();
			model.read("/AlertSnowRfcDestSet(Rfcdest='" + this.destName + "',ConCheck=" + conCheck + ")", {
				success: function (data) {
					//if (!conCheck) {
					data["enabled"] = false;
					//	}
					var oModel = new JSONModel(data);
					that.getView().setModel(oModel, "dest");
					that.getView().bindElement({
						path: "dest>/"
					});
					if (conCheck) {
						that.showMessageDialog(data);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (err) {
					if (conCheck) {
						that.showMessageDialog();
					}
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		onConnection: function (evt) {
			var obj = {
				"save": false,
				"edit": true,
				"cancel": false,
				"check": true
			};
			var id = evt.getSource().getId();
			if (id.indexOf("edit") !== -1) {
				var enabled = true;
				obj = {
					"save": true,
					"edit": false,
					"cancel": true,
					"check": false
				};
			} else if (id.indexOf("cancel") !== -1 || id.indexOf("save") !== -1) {
				enabled = false;
				obj = {
					"save": false,
					"edit": true,
					"cancel": false,
					"check": true
				};
			}

			if (id.indexOf("save") !== -1) {
				this.saveRfc();
			}
			for (var x in obj) {
				this.byId(x).setVisible(obj[x]);
			}

			var model = this.getView().getModel("dest");
			var data = model.getData();
			data.enabled = enabled;
			model.refresh();
		},

		saveRfc: function () {
			var that = this;
			var model = this.getOwnerComponent().getModel("sysConfig");
			var vModel = this.getView().getModel("dest");
			var data = vModel.getData();

			var payload = {};
			var arr = ["enabled", "Status", "Statusicon"];
			for (var x in data) {
				if (arr.indexOf(x) === -1) {
					payload[x] = data[x];
				}
			}
			sap.ui.core.BusyIndicator.show();
			model.update("/AlertSnowRfcDestSet(Rfcdest='" + payload.Rfcdest + "',ConCheck=false)", payload, {
				success: function (data1) {
					setTimeout(function () {
						that.loadDestName();
					}, 2000);

					sap.m.MessageToast.show("Destination saved successfully");

				},
				error: function (err) {
					sap.m.MessageToast.show("Destination could not be saved");
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		showMessageDialog: function (data) {
			var status = data.Status;
			if (status === "200") {
				MessageBox.success('Connection to "' + data.Rfcdest + '" established');
			} else {
				MessageBox.error("Status: " + status + " (Connection not established)");
			}
		}

	});
});