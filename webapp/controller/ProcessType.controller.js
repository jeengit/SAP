sap.ui.define([
	"./BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (BaseController, Controller, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.ProcessType", {
		onInit: function () {
			this.getRouter().getRoute("mapping").attachMatched(this.routeMatched, this);
			var data = [{
				key: "X",
				desc: "Approved"
			}, {
				key: "-1",
				desc: "Implement"
			}, {
				key: "-2",
				desc: "Scheduled"
			}, {
				key: "3",
				desc: "Authorize"
			}, {
				key: "0",
				desc: "Review"
			}, {
				key: "4",
				desc: "Cancelled"
			}];

			var model = new JSONModel(data);
			this.getView().setModel(model, "sNowStatus");

			var data1 = {
				"chngeType": "",
				"charm": "",
				"status": "",
				"edit": true
			};

			var pModel = new JSONModel(data1);
			this.getView().setModel(pModel, "pModel");
		},
		routeMatched: function () {
			this.byId("table").removeSelections();
			this.onTableSelect();
		},
		onAfterRendering: function () {
			/*var model = new JSONModel({});
			this.getView().setModel(model, "jiraMap");*/

			var payload = {
				"QueryString": "/rest/api/latest/project?maxResults=500",
				"Method": "GET"
			};
			this.callApi(payload, "jiraProjectModel");

			this.loadJiraMap();
			this.onJiraProjectChange();
		},
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			if (this.saveFlag)
				this.onJiraMappingSave();
			this._showObject(oEvent.getSource());

		},
		_showObject: function (oItem) {
			var sPath = oItem.getBindingContext().getPath();
			this.getRouter().navTo("processDetail", {
				Id: encodeURIComponent(sPath)
			});
		},

		openChangeTypeDialog: function (evt) {
			var id = evt.getSource().getId();
			var model = this.getView().getModel("pModel");
			var data = model.getData();

			if (id.indexOf("add") !== -1) {
				this.add = true;
				data.Valueinetool = "";
				data.Valueinsap = "";
				data.status = [];
				data.edit = true;
			} else {
				this.add = false;
				var selItem = this.byId("table").getSelectedItem();
				var obj = selItem.getBindingContext().getObject();
				data.Valueinetool = obj.Valueinetool;
				data.Valueinsap = obj.Valueinsap;
				data.edit = false;
			}
			model.refresh();
			var oPopover = this.byId("dimensionsPopover");
			oPopover.bindElement("pModel>/");
			oPopover.open();
		},

		onDialogClose: function () {
			this.byId("dimensionsPopover").close();
		},

		onTableSelect: function () {
			var selItems = this.byId("table").getSelectedItems();
			if (selItems.length) {
				this.byId("edit").setEnabled(true);
			} else {
				this.byId("edit").setEnabled(false);
			}
		},

		onChangeTypeCreate: function (evt) {
			var model = this.getModel();
			var that = this;
			if (!this.add) {
				var payload = {
					"Valueinsap": this.getView().getModel("pModel").getData().Valueinsap
				};
				var selItem = this.byId("table").getSelectedItem();
				var path = selItem.getBindingContext().getPath();
				model.update(path, payload, {
					success: function (data) {
						that.byId("table").getBinding("items").refresh();
						that.byId("dimensionsPopover").close();
						//that.createFlag = true;
					},
					error: function (err) {
						//console.log(err);
					}
				});
			}
		},

		onJiraProjectChange: function (evt) {
			if (evt) {
				this.saveFlag = "X";
			}
			var projId = this.getView().getModel("jiraMap").getData().Jiraproject;
			var payload = {
				"QueryString": "/rest/api/latest/project/" + projId,
				"Method": "GET"
			};
			this.callApi(payload, "jiraResourcesModel");
			//this.onJiraWIChangeAdmin();
			//	that.loadEpicsForProject()
		},
		onJiraWPChangeAdmin: function () {
			this.saveFlag = "X";
		},

		onJiraMappingSave: function () {
			var data = this.getView().getModel("jiraMap").getData();
			var that = this;
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/CORE/CA_ALERT_MAPPING_SRV", true);
			oModel.create("/JiraProjectMappingSet", data, {
				async: false,
				success: function (data) {
					that.saveFlag = "";
					//sap.m.MessageToast.show("Mapping saved successfully");
				},
				error: function (err) {

				}
			});
		},
	});
});