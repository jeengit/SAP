sap.ui.define([
	"./BaseController",
	'sap/m/MessageBox',
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (BaseController, MessageBox, Controller, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.ProcessDetail", {
		onInit: function () {
			this.getRouter().getRoute("processDetail").attachMatched(this.routeMatched, this);
		},

		routeMatched: function (oEvent) {
			var sPath = oEvent.getParameter("arguments").Id;
			this.path = sPath;
			this._bindView(decodeURIComponent(sPath));

			this.loadJiraMap();

			var model = this.getView().getModel("jiraMap");
			if (model) {
				var projId = model.getData().Jiraproject;
				var workItem = model.getData().Wpjira;

			}
			var payload = {
				"QueryString": "/rest/api/latest/project/" + projId + "/statuses",
				"Method": "GET"
			};
			this.callApi(payload, "JirastatModel", workItem);
			this.loadProcesspingData(decodeURIComponent(sPath));
			//this.byId("edit").setVisible(true);
			this.byId("save").setVisible(false);
			this.byId("cancel").setVisible(false);
		},

		loadProcesspingData: function (path) {
			var that = this;
			var model = this.getModel();
			model.read("/" + path + "/JiraChaRMStatusMappingSet", {
				success: function (data) {
					var jModel = new JSONModel(data.results);
					that.getView().setModel(jModel, "viewModel");

					var enb = false;
					if (data.results.length === 0) {
						that.byId("edit").setVisible(false);
						that.byId("save").setVisible(true);
						that.byId("cancel").setVisible(false);
						enb = true;
					}
					var model = new JSONModel({
						enabled: enb
					});
					that.getView().setModel(model, "enbModel");
					//that._onBindingChange();
					//	that._bindView(decodeURIComponent(path));
				},
				error: function () {

				}
			});
		},
		_bindView: function (sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this)
				}
			});
			var that = this;

			var model = this.getModel();
			model.read(sObjectPath, {
				success: function (oData) {

					var jModel = new JSONModel(oData);
					that.getView().setModel(jModel, "procDataModel");

				}
			});
		},

		_onBindingChange: function () {
			var that = this;
			this.getModel().setDefaultBindingMode("TwoWay");
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oObject = oView.getBindingContext().getObject();

			var model = this.getModel();
			//model.setUseBatch(false);
			model.read("/CHARMProcessTypesSet('" + oObject.Valueinsap + "')/CHARMStatusCodesSet", {
				success: function (oData) {
					var data = oData.results;
					data.sort(function (a, b) {
						return parseInt(a.Stonr) - parseInt(b.Stonr);
					});
					//var formattedData = that.formatData(data);
					var jModel = new JSONModel(data);
					that.getView().setModel(jModel, "selectModel");
					setTimeout(function () {
						that.byId("table").rerender();
					}, 500);

				}
			});
			//this.getView().byId("select").bindItems("/CHARMProcessTypesSet('" + oObject.Valueinsap + "')/CHARMStatusCodesSet");
		},
		formatData: function (data, row) {
			var tableItems = this.byId("table").getItems();
			var selKey = tableItems[parseInt(row) - 1].getBindingContext("viewModel").getObject()["Valueinsap"];
			for (var j = 0; j < data.length; j++) {
				if (data[j]["Status"] === selKey) {
					var selInd = parseInt(data[j].Stonr);
				}
				if (selInd && data[j].Status !== "E0010") {
					if (parseInt(data[j].Stonr) <= selInd) {
						data[j]["enabled"] = false;
					} else {
						data[j]["enabled"] = true;
					}
				} else {
					data[j]["enabled"] = false;
				}
			}
			return data;
		},
		onFocus: function (evt) {
			this.row = this.getTableRow(evt);
			//	var valInSap = evt.getSource().getBindingContext().getObject()["Valueinsap"];
			if (this.row === this.prevRow) {
				return;
			}
			this.prevRow = this.row;
			var selectModel = this.getView().getModel("selectModel");
			var formattedData = this.formatData(selectModel.getData(), this.row);
			selectModel.setData(formattedData);
		},

		onSaveProcessMapping: function () {
			var that = this;
			//	this.getModel().setUseBatch(true);
			var data = this.getView().getModel("viewModel").getData();
			//	this.getModel().setUseBatch(true);
			var arg = {
				success: function (oResp) {
					sap.m.MessageToast.show("Changes are saved");
					var sPath = that.path;
					//that._bindView(decodeURIComponent(sPath));
					that.loadProcesspingData(decodeURIComponent(sPath));
				},
				error: function (oerror) {
					sap.m.MessageToast.show("Error while saving");
					//			that.getModel().setUseBatch(false);
				}
			};
			var prevData = this.getView().getModel("procDataModel").getData();
			for (var i = 0; i < data.length; i++) {
				var url = "/JiraChaRMStatusMappingSet";

				if (i === data.length - 1) {
					data[i]["Valueinsap"] = that.byId("fieldinetool").getText();
					data[i]["Direction"] = i % 2 === 0 ? "1" : "2";
					data[i]["Type"] = 'STA';
					data[i]["Parentmapid"] = prevData.Mapid;
					this.getModel().create(url, data[i], arg);
				} else {
					data[i]["Valueinsap"] = that.byId("fieldinetool").getText();
					data[i]["Direction"] = i % 2 === 0 ? "1" : "2";
					data[i]["Type"] = 'STA';
					data[i]["Parentmapid"] = prevData.Mapid;
					this.getModel().create(url, data[i]);
				}
			}

			this.getModel().submitChanges();
			/*setTimeout(function () {
				that.getModel().setUseBatch(false);
			}, 1000);*/

		},

		onNavBack: function () {
			if (window.history.length > 2) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("mapping");
			}
		},
		getTableRow: function (evt) {
			var items = this.byId("table").getItems();
			var row = 0;
			var ind = evt.getSource().getBindingContext("viewModel").getObject().Valueinetool;

			for (var i = 0; i < items.length; i++) {
				var val = items[i].getBindingContext("viewModel").getObject().Valueinetool;
				if (val === ind) {
					row = i;
					break;
				}
			}
			return row;
		},
		enabledFormatter: function (val2) {
			if (val2) {
				return true;
			} else {
				return false;
			}
		},
		onProcessMappingAction: function (evt) {
			var model = this.getView().getModel("enbModel");
			var data = model.getData();
			var id = evt.getSource().getId();
			if (id.indexOf("edit") !== -1) {
				data.enabled = true;
				this.byId("edit").setVisible(false);
				this.byId("save").setVisible(true);
				this.byId("cancel").setVisible(true);
			} else {
				data.enabled = false;
				this.byId("edit").setVisible(true);
				this.byId("save").setVisible(false);
				this.byId("cancel").setVisible(false);
			}

			if (id.indexOf("save") !== -1) {
				this.onSaveProcessMapping();
			}
			model.refresh();
		},
		formatDiretionIcon: function (key) {
			var dir = "";
			if (key === "0") {
				dir = "sap-icon://source-code";
			} else if (key === "1") {
				dir = "sap-icon://arrow-right";
			} else if (key === "2") {
				dir = "sap-icon://arrow-left";
			}
			return dir;
		},
		/*onStatusChange: function (evt) {
			var path = evt.getSource().getBindingContext("viewModel").getPath().substr(1);
			if (path === "1") {
				var data = this.getView().getModel("selectModel").getData();
				for (var i = 0; i < data.length; i++) {
					var curr = evt.getSource().getBindingContext("viewModel").getProperty("Valueinsap");
					if (data[i].Status === curr) {
						var model = this.getView().getModel("viewModel");
						model.getData()[parseInt(path) + 1].Valueinsap = data[i + 1].Status;
						model.refresh();
						break;
					}
				}
			}
			if (path === "2") {
				MessageBox.alert(
					"This is automatically populated status value. Please ensure that you make a valid status selection without skipping statuses.");
			}
		},*/

		onInitSysChange: function (evt) {
			var sel = evt.getSource().getSelectedKey();
			var items = this.byId("table").getItems();
			var hBox = items[1].getCells()[0].getItems();
			if (sel === "charm") {
				items[0].setVisible(false);
				hBox[0].setVisible(false);
				hBox[1].setText("New");
			} else {
				items[0].setVisible(true);
				hBox[0].setVisible(true);
				hBox[1].setText("");
			}
		},

		showHideRightArrowInStMap: function (arr, jira, crm) {
			var ind = "";
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] && (arr[i].Fieldinetool === crm || arr[i].Valueinetool === jira)) {
					ind = i;
					break;
				}

			}
			var flag = true;
			if (ind % 2 === 1) {
				flag = false;
			}

			return flag;
		},

		showHideLeftArrowInStMap: function (arr, jira, crm) {
			var ind = "";
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] && (arr[i].Fieldinetool === crm || arr[i].Valueinetool === jira)) {
					ind = i;
					break;
				}

			}
			var flag = true;
			if (ind % 2 === 0) {
				flag = false;
			}

			return flag;
		},

		addNewRowMapDetail: function () {
			var model = this.getView().getModel("viewModel");
			var obj = {
				Valueinetool: "",
				Valueinsap: "",
				Comments: ""
			};
			var rows = this.getView().getModel("JirastatModel").getData().length;
			if (rows > model.getData().length) {
				model.getData().push(obj);
				model.refresh();
			} else {
				sap.m.MessageToast.show("No more rows can be added");
			}
		},
	});
});