var FileReceiver = {};
FileReceiver.invoker = null;

(function () {
    'use strict';
    requirejs.config({baseUrl: "http://lib.eo.test/fucms/", paths: {"commonApp": "common/script/app"}});
    
    define(["commonApp/Lightbox"], function(lbApplication) {
    	$('.icon-selector').click(function(e) {
    		FileReceiver.invoker = $(e.currentTarget);
    		var ifView = new IfView();
    		lbApplication.vent.trigger('Lightbox:show', {
    			'view': ifView
    		});
    	});
    	
    	FileReceiver.processFileModel = function(model) {
    		var callback = FileReceiver.invoker.data('callback');
    		switch(callback) {
    			case 'appendToEditor':
    				var editor = null;
    				for(var instanceName in CKEDITOR.instances) {
    					editor = CKEDITOR.instances[instanceName];
    				}
    				if ( editor.mode == 'wysiwyg' ) {
    					var imgHtml = CKEDITOR.dom.element.createFromHtml("<p>[img:" + model.get('urlname') + "/]</p>");
    					editor.insertElement(imgHtml);
    				} else {
    					alert( '需要在所见即所得模式下使用!' );
    				}
    				break;
    			case 'selectIcon':
    				FileReceiver.invoker.val(model.get('urlname'));
    				lbApplication.vent.trigger('Lightbox:close');
    				break;
    		}
    	};
    	
    	var IfView = Backbone.View.extend({
			render: function() {
				$(this.el).html("<iframe src='/admin/fileadmin-index.iframe/simple' seamless></iframe>");
			},
			close: function() {
				$(this.el).empty();
			}
		});
    });
}());