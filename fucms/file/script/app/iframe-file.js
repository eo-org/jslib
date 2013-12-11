var FileApplication = new Backbone.Marionette.Application();

(function () {
    'use strict';
    
    requirejs.config({
    	baseUrl: "http://lib.eo.test/fucms/",
    	paths: {
    		"fileModel": "file/script/app/model"
    	}
    });
    
    define(["fileModel/File"], function() {
    	FileApplication.addRegions({
			fileRegion				: "#file",
			paginatorRegion			: "#paginator"
		});
    	
		FileApplication.addInitializer(function(options) {
			var FileRoute = Backbone.Marionette.AppRouter.extend({
				routes: {
					"": "defaultGroupFile",
					"groupId\::groupId@page\::pageNumber": "loadGroupFile"
				},
        		defaultGroupFile: function() {
        			FileApplication.vent.trigger('File:loadFile', {'group': 'all', 'page': 1});
        		},
				loadGroupFile: function(groupId, page) {
        			FileApplication.vent.trigger('File:loadFile', {'group': groupId, 'page': page});
				}
			});
			
			FileApplication.router = new FileRoute();
		});

		FileApplication.on('initialize:after', function() {
			Backbone.history.start();
		});
		
		FileApplication.vent.on("File:dblclick", function(callback) {
    		var model = callback.model;
    		parent.FileReceiver.processFileModel(model);
    	});
		
		FileApplication.start();
		
    });
}());