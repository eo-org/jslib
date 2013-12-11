define(function() {
	var applicationLayer = $(
		"<div id='lightbox-application' style='display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100;'>" +
			"<div id='lightbox-black-mask' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; opacity: 0.8'></div>" +
			"<div id='lightbox-white-content' style='position: absolute; top: 0; left: 0; bottom: 0; right: 0; width: 80%; height: 540px; background-color: white; margin: auto; border: 5px solid #eee; padding: 5px;'>" +
				"<div id='lba-title'></div>" + 
				"<div id='lba-content'></div>" + 
				"<div id='lba-action'></div>" + 
			"</div>" +
		"</div>"
	);
	
	var LightboxApplication = new Backbone.Marionette.Application();
	
	LightboxApplication.addRegions({
		titleRegion: "#lba-title",
		contentRegion: "#lba-content",
		actionRegion: "#lba-action"
	});
	
	LightboxApplication.module('LightboxModule', function(LightboxModule, LightboxApplication) {
		LightboxModule.addInitializer(function(options) {
			$('body').append(applicationLayer);
			
			$('#lightbox-black-mask').click(function() {
				LightboxApplication.vent.trigger('Lightbox:close');
			});
			
			LightboxModule.controller = new Controller({
				titleRegion: LightboxApplication.titleRegion,
				contentRegion: LightboxApplication.contentRegion,
				actionRegion: LightboxApplication.actionRegion
			});
		});
		
		var Controller = Backbone.Marionette.Controller.extend({
			initialize: function(options) {
				this.titleRegion = options.titleRegion;
				this.contentRegion = options.contentRegion;
				this.actionRegion = options.actionRegion;
				
				LightboxApplication.vent.on('Lightbox:show', this.show, this);
				LightboxApplication.vent.on('Lightbox:close', this.close, this);
			},
			show: function(options) {
				applicationLayer.css("display", "block");
				this.contentView = options.view;
				
				if(options.title != undefined) {
					var titleView = new TitleView({model: options.title});
					this.titleRegion.show(titleView);
				}
				
				if(options.actions != undefined) {
					var actionView = new ActionView({model: options.actions});
					this.actionRegion.show(actionView);
				}
				
				this.contentRegion.show(this.contentView);
			},
			close: function() {
				applicationLayer.css("display", "none");
				this.contentView.close();
			}
		});
		
		var TitleView = Backbone.View.extend({
			render: function() {
				$(this.el).html(this.model.text);
			}
		});
		
		var ActionView = Backbone.View.extend({
			events: {
				"click .lba-submitbutton": "triggerSubmit",
				"click .lba-removebutton": "triggerRemove"
			},
			render: function() {
				var htmlString = "";
				_.each(this.model, function(m) {
					switch(m.type) {
						case 'submitButton': 
							htmlString+= "<div class='lba-submitbutton'>" + m.text + "</div>";
							break;
						case 'removeButton':
							htmlString+= "<div class='lba-removebutton' data-removeid='" + m.id + "'>" + m.text + "</div>";
							break;
					}
				});
				
				$(this.el).html(htmlString);
			},
			triggerSubmit: function() {
				LightboxApplication.vent.trigger('Lightbox:submit');
			},
			triggerRemove: function(e) {
				var id = $(e.currentTarget).data('removeid');
				LightboxApplication.vent.trigger('Lightbox:remove', {'id': id});
			}
		});
	});
	
	LightboxApplication.start();
	
	return LightboxApplication;
});