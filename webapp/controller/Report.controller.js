sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, Export, ExportTypeCSV, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.Report", {
		onInit: function () {
			var data = [{
				"key": "today",
				"desc": "Today"
			}, {
				"key": "yest",
				"desc": "Yesterday"
			}, {
				"key": "last7day",
				"desc": "Last 7 Days"
			}, {
				"key": "curr_month",
				"desc": "Current Month"
			}, {
				"key": "last_month",
				"desc": "Last Month"
			}, {
				"key": "curr_year",
				"desc": "Current Year"
			}, {
				"key": "last_year",
				"desc": "Last Year"
			}];
			var model = new JSONModel(data);
			this.getView().setModel(model, "dateModel");
		},
		onAfterRendering: function () {
			var that = this;
			this.loadFilterData();
			this.loadDestInRprt();
			//	var filters = [];
			//	filters.push(new Filter("Requestfrom", FilterOperator.EQ, "SNOW"));
			//	this.loadTableData(filters);
			setTimeout(function () {
				that.onFacetFilterSelect();
			});

		},

		loadDestInRprt: function () {
			var that = this;
			var oModel = this.getModel();
			oModel.read("/SNOWRFCDestSet", {
				success: function (data) {
					var desName = data.results[0] ? data.results[0].Rfcdest : "";
					oModel.read("/SNOWRFCDestSet(Rfcdest='" + desName + "',ConCheck=" + false + ")", {
						success: function (data) {
							that.desUrl = data.Rfchost;
						},
						error: function (err) {

						}
					});
				},
				error: function () {

				}
			});
		},
		loadFilterData: function () {
			var that = this;
			var model = this.getModel();
			model.read("/CharmfilterSet", {
				success: function (data) {
					var data1 = data.results[0].Filter_val ? JSON.parse(data.results[0].Filter_val) : [];
					var model1 = new JSONModel(data1);
					that.getView().setModel(model1, "filterModel");
				},
				error: function () {

				}
			});
		},
		onFacetFilterSelect: function (evt) {
			this.mianfilters = [];
			//	filters.push(new Filter("Requestfrom", FilterOperator.EQ, "SNOW"));
			var that = this;
			var oFacetFilter = this.getView().byId("idFilterSel");
			var date = this.getView().byId("idDateSelect").getSelectedKey();
			var mFacetFilterLists = oFacetFilter.getLists().filter(function (oList) {
				return oList.getSelectedItems().length;
			});
			if (mFacetFilterLists.length) {
				mFacetFilterLists.map(function (oList) {
					oList.getSelectedItems().map(function (oItem) {
						that.mianfilters.push(new Filter(oList.getKey(), "EQ", oItem.getKey()));
					});
				});
			}

			if (date) {
				this.mianfilters.push(new Filter("Desc", "EQ", date));
			}
			this.loadTableData(this.mianfilters);
		},

		loadTableData: function (filters) {
			var that = this;
			if (!filters.length) {
				return;
			}
			var oModel = this.getModel();
			sap.ui.core.BusyIndicator.show(0);
			oModel.read("/SnowCharmRequestSet", {
				filters: filters,
				success: function (oData) {
					var jModel = new JSONModel(oData.results);
					that.byId("reportTable").setModel(jModel, "tableModel");
					var count = oData.results.length;
					that.byId("title").setText("Alert Report (" + count + ")");
					sap.ui.core.BusyIndicator.hide(0);
					that.byId("createdFromSnow").setSelected(false);
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide(0);
				}
			});
		},
		onLinkPressObject: function (evt) {
			var obj = evt.getSource().getBindingContext("tableModel").getObject();
			var url = "/sap/bc/ags_workcenter/ags_crm_docln?objectid=" + obj.ObjectId + "&proctype=" + obj.ProcessType;
			window.open(url);
		},
		onExcelDownload: function () {
			var oExport = new Export({
				exportType: new ExportTypeCSV({
					separatorChar: ","
				}),
				models: this.byId("reportTable").getModel("tableModel"),
				rows: {
					path: "/"
				},
				columns: [{
					name: "Charm ID",
					template: {
						content: "{ObjectId}"
					}

				}, {
					name: "Change Description",
					template: {
						content: "{ProcessTypedesc}"
					}
				}, {
					name: "Change Type",
					template: {
						content: "{ProcessType}"
					}
				}, {
					name: "Change Status",
					template: {
						content: "{Statustxt}"
					}
				}, {
					name: "Transport Requests",
					template: {
						content: "{Transport}"
					}
				}, {
					name: "Change Cycle ID",
					template: {
						content: "{Cycle}"
					}
				}, {
					name: "Change Cycle Description",
					template: {
						content: "{Cycletxt}"
					}
				}, {
					name: "Created By",
					template: {
						content: "{CreatedBy}"
					}
				}, {
					name: "Created Date",
					template: {
						content: "{PostingDate}"
					}
				}, {
					name: "Landscape",
					template: {
						content: "{LogicalSystem}"
					}
				}, {
					name: "ServiceNow ID",
					template: {
						content: "{Snowid}"
					}
				}]
			});

			// download exported file
			oExport.saveFile().catch(function (oError) {
				sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});

		},
		clearAllSortings: function (oEvent) {
			var oTable = this.getView().byId("reportTable");
			oTable.getBinding("rows").sort(null);
			this.resetSortingState();
		},
		resetSortingState: function () {
			var oTable = this.getView().byId("reportTable");
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				aColumns[i].setSorted(false);
			}
		},
		/*filterFromServiceNow: function (evt) {
			if (evt.getSource().getSelected())
				this._oGlobalFilter = new Filter("ExtId", FilterOperator.NE, "");
			else
				this._oGlobalFilter = null;
			this.filter();
		},*/
		onTableSearch: function (oEvent) {
			var sQuery = this.getView().byId("searchFieldReport").getValue();
			this._oGlobalFilter = null;

			var snow = this.byId("createdFromSnow").getSelected();
			var filters = [];
			if (sQuery || snow) {
				if (sQuery) {
					var filter1 = new Filter([
						new Filter("ObjectId", FilterOperator.Contains, sQuery),
						new Filter("Description", FilterOperator.Contains, sQuery),
						new Filter("ProcessTypedesc", FilterOperator.Contains, sQuery),
						new Filter("Statustxt", FilterOperator.Contains, sQuery),
						new Filter("Cycletxt", FilterOperator.Contains, sQuery),
						new Filter("LogicalSystem", FilterOperator.Contains, sQuery),
						new Filter("CreatedBy", FilterOperator.Contains, sQuery),
						new Filter("Transport", FilterOperator.Contains, sQuery),
						//new Filter("Snowid", FilterOperator.Contains, sQuery),
					], false);
					filters.push(filter1);
				}
				if (snow) {
					var filter2 = new Filter("Snowid", FilterOperator.StartsWith, "CHG");
					filters.push(filter2);
				}
				this._oGlobalFilter = new Filter(filters, true);
			}

			this.filter();
		},
		filter: function () {
			var oFilter = this._oGlobalFilter;
			var rows = this.getView().byId("reportTable").getBinding("rows");
			rows.filter(oFilter, "Application");
			this.byId("title").setText("Alert Report (" + rows.aIndices.length + ")");
		},
		clearAllFilters: function () {
			var oTable = this.getView().byId("reportTable");
			this.byId("searchFieldReport").setValue("");
			this._oGlobalFilter = null;
			this.filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},
		handleFacetFilterReset: function (oEvent) {
			var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
			var aFacetFilterLists = oFacetFilter.getLists();
			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}
			//this.loadTableData([]);
			this.onFacetFilterSelect();
			this.getView().byId("idDateSelect").setSelectedKey("last7day");
			this.byId("reportTable").getModel("tableModel").setData();
			this.byId("title").setText("Alert Report (0)");
		},
		onSnowIdPress: function (evt) {
			var url = "https://" + this.desUrl + "/nav_to.do?uri=task.do?sysparm_query=number=" + evt.getSource().getText();
			window.open(url);
		},

		onTransportView: function (evt) {
			var text = evt.getSource().getBindingContext("tableModel").getProperty("Transport");
			var popover = new sap.m.Popover({
				showHeader: false,
				placement: "Bottom",
				content: [new sap.m.Text({
					text: text
				}).addStyleClass("sapUiSmallMarginTopBottom sapUiSmallMarginBeginEnd")]
			});

			popover.openBy(evt.getSource());
		},

		formatTransport: function (val) {
			var text = "";
			if (val) {
				var arr = val.split(",");
				if (arr.length > 1) {
					text = "Multiple";
				} else {
					text = val;
				}
			}
			return text;
		}
	});
});