sap.ui.define("serNow/conect/alert/model/SelectCust", [
	"jquery.sap.global",
	"sap/m/Select",
	"sap/m/SelectRenderer"
], function (jQuery, Input, InputRenderer) {
	"use strict";

	return Input.extend("serNow.conect.alert.model.SelectCust", {
		metadata: {
			events: {
				focus: {}
			}
		},
		onAfterRendering: function () {
			this.addEventDelegate({
				onAfterRendering: function () {
					var $input = jQuery("#" + this.getId());

					$input.focus(function () {
						this.fireEvent("focus");
					}.bind(this));
				}.bind(this)
			});
		},
		/*onAfterRendering: function () {
			if (Input.onAfterRendering) {
				Input.onAfterRendering.apply(this, arguments);
			}
			var $input = jQuery("#" + this.getId());
			$input.focus(function () {
				this.fireEvent('focus');
			}.bind(this));
		},
*/
		renderer: InputRenderer

	});
});