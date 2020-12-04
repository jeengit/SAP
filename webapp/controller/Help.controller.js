sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("serNow.conect.alert.controller.Help", {

		triggerMail: function (evt) {
			var txt = evt.getSource().getText();
			sap.m.URLHelper.triggerEmail(txt, "", "");
		},
		onChatSupportPress: function () {
			window.open("https://corealm.com/support");
		}

	});

});