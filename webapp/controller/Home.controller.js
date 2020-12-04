sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.Home", {

		onNavSelect: function (evt) {
			var key = evt.getParameter("item").getKey();
			this.getRouter().navTo(key);
			sap.ui.getCore().byId("__component0---app--app").hideMaster();
		},

		/*onCollapseExpandPress: function (evt) {
			var oSideNavigation = this.byId("sideNavigation");
			var bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		}*/
	});
});