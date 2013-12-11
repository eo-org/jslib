var FileApplication = new Backbone.Marionette.Application();

(function () {
    'use strict';
    
    requirejs.config({
    	baseUrl: "http://lib.eo.test/fucms/",
    	paths: {
    		"fileModel": "file/script/app/model"
    	}
    });
    
    define(["fileModel/File", "fileModel/FileGroup"], function() {
    	FileApplication.addRegions({
			groupRegion				: "#group",
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
        			FileApplication.vent.trigger('Group:activeGroup', {'group': 'all'});
        			FileApplication.vent.trigger('File:loadFile', {'group': 'all', 'page': 1});
        		},
				loadGroupFile: function(groupId, page) {
        			FileApplication.vent.trigger('Group:activeGroup', {'group': groupId});
        			FileApplication.vent.trigger('File:loadFile', {'group': groupId, 'page': page});
				}
			});
			
			FileApplication.router = new FileRoute();
		});
		
		FileApplication.on('initialize:after', function() {
			Backbone.history.start();
		});
		
		FileApplication.start();
    });
}());