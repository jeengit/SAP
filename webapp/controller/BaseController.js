sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, JSONModel) {
	"use strict";

	return Controller.extend("serNow.conect.alert.BaseController", {
		getLoginName: function(){
			var oModel = this.getOwnerComponent().getModel("login");
			var that = this;
			oModel.read("/user_nameSet('')", {
				success: function (data) {
					that.getView().setModel(new JSONModel(data), "loginModel");
				},
				error: function (err) {
				}
			});
		},
		userList: function (first,last) {
			return first && last ? first.charAt(0) + last.charAt(0) : first && !last ? first.charAt(0) : !first && last ? last.charAt(0) : "";
		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		onNavBack: function () {
			if (window.history.length > 2) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home");
			}
		},
		callApi: function (payload, modelname, workItem, workPack) {
			var that = this;
			var model = this.getModel();
			model.create("/JiraApiSet", payload, {
				async: true,
				success: function (data) {
					if (modelname) {
						data = data.Payload ? JSON.parse(data.Payload) : [];
						if (modelname === "JirastatModel") {
							that.setModelForStatusMapJira(modelname, data, workItem);
						} else {
							var jModel = new JSONModel(data);
							that.getView().setModel(jModel, modelname);
						}
					}

				},
				error: function (err) {
				}
			});
		},
		setModelForStatusMapJira: function (modelname, data, workItem) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].id === workItem) {
					var status = data[i].statuses;
					break;
				}
			}
			var jModel = new JSONModel(status);
			this.getView().setModel(jModel, modelname);
		},
		loadJiraMap: function () {
			var that = this;
			var oModell = new sap.ui.model.odata.ODataModel("/sap/opu/odata/CORE/CJ_CHARMJIRAMAP_SRV", true);
			oModell.read("/JiraProjectMappingSet", {
				async: false,
				success: function (data) {
					var data = data.results ? data.results[0] : {};
					that.getView().setModel(new JSONModel(data), "jiraMap");
				},
				error: function (err) {
				}
			});
		},
	});
});