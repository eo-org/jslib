requirejs.config({paths: {"commonApp": "common/script/app"}});

define(["commonApp/Lightbox"], function(lightboxApplication) {
	FileApplication.module('GroupModule', function(GroupModule, FileApplication) {
		GroupModule.addInitializer(function(options) {
			GroupModule.controller = new Controller({
				region: FileApplication.groupRegion
			});
		});
		
		var Controller = Backbone.Marionette.Controller.extend({
	        initialize: function (options) {
	        	var TH = this;
	            this.region = options.region;
	            
	            this.gcv = new GroupCollectionView();
	            this.gcv.collection.fetch({success: function() {
	            	TH.region.show(TH.gcv);
	            	var string = Backbone.history.fragment;
	            	if(string == '') {
		            	TH.activeGroup({'group': 'all', 'page': 1});
	            	} else {
	            		reg = string.match(/^groupId\:(.*)@page\:(\d*)$/);
		            	TH.activeGroup({'group': reg[1], 'page': reg[2]});
	            	}
	            }});
	            
	            FileApplication.vent.on('Group:activeGroup', this.activeGroup, this);
	            lightboxApplication.vent.on('Lightbox:submit', this.submitGroup, this);
	            lightboxApplication.vent.on('Lightbox:remove', this.removeGroup, this);
	        },
	        activeGroup: function(data) {
	        	this.gcv.activeGroup(data);
	        },
	        submitGroup: function() {
	        	var data = this.groupEditView.getInputData();
	        	if(this.currentGroupModel.isNew()) { //create new model
	        		this.gcv.collection.add(this.currentGroupModel);
	        	}
	        	this.currentGroupModel.save(data, {success: function() {
	        		lightboxApplication.vent.trigger('Lightbox:close');
        		}});
	        },
	        removeGroup: function() {
	        	this.currentGroupModel.destroy({success: function() {
	        		lightboxApplication.vent.trigger('Lightbox:close');
	        	}});
	        },
	        invokeGroupEditor: function(groupModel) {
	        	this.currentGroupModel = groupModel;
	        	this.groupEditView = new GroupEditView({model: groupModel});
	        	
	        	if(groupModel.isNew()) {
	        		lightboxApplication.vent.trigger('Lightbox:show', {
						"view": this.groupEditView,
						"title": {
							"text": "新建文件夹"
						},
						"actions": [{
							"type": "submitButton",
							"text": "提交"
						}]
					});
	        	} else {
	        		lightboxApplication.vent.trigger('Lightbox:show', {
						"view": this.groupEditView,
						"title": {
							"text": "编辑文件夹"
						},
						"actions": [{
							"type": "submitButton",
							"text": "提交"
						}, {
							"type": "removeButton",
							"text": "删除"
						}]
					});
	        	}
	        }
	    });
			
		var GroupModel = Backbone.Model.extend({
			defaults: {
				id: null,
				label: ""
			}
		});
		
		var GroupCollection = Backbone.Collection.extend({
			model: GroupModel,
			url: "/adminrest/filerest-group.json"
		});
		
		var GroupView =	Backbone.Marionette.ItemView.extend({
			tagName: "li",
			template: "#group-template",
			events: {
				"click .group-item-label": "setNav",
				"click .edit": "editGroup"
			},
			modelEvents: {
				'change': "modelChanged"
			},
			initialize: function() {
				this.listenTo(this.model, "setActive", this.setActive, this);
				//this.listenTo(this.model, 'save', this.render, this);
			},
			setNav: function(e) {
				e.preventDefault();
				Backbone.history.navigate("groupId:" + this.model.id + "@page:1", {trigger: true});
			},
			setActive: function() {
				$(this.el).addClass('selected');
			},
			editGroup: function() {
				GroupModule.controller.invokeGroupEditor(this.model);
			},
			modelChanged: function() {
				this.render();
			}
		});
		
		var GroupCollectionView = Backbone.Marionette.CompositeView.extend({
			activeGroupData: null,
			itemView: GroupView,
			template: "#group-list-template",
			events: {
				'click .default-folder': 'loadDefaultGroup',
				'click .create-folder': 'createGroup'
			},
			appendHtml: function(collectionView, itemView) {
				collectionView.$('ul.group-list').append(itemView.el);
			},
			initialize: function() {
				this.collection = new GroupCollection();
			},
			fetchData: function() {
				this.collection.fetch({remove: false});
			},
			activeGroup: function(data) {
				$('.default-folder').removeClass('selected');
				$('.group-list li').removeClass('selected');
				if(data.group == 'all' || data.group == 'default') {
					$('.default-folder').each(function(i, folderDiv) {
						if($(folderDiv).data('group') == data.group) {
							$(folderDiv).addClass('selected');
						} 
					});
				} else {
					var ag = this.collection.findWhere({'id': data.group});
					if(ag != undefined) {
						ag.trigger('setActive');
					}
				}
			},
			loadDefaultGroup: function(e) {
				group = $(e.currentTarget).data('group');
				Backbone.history.navigate("groupId:" + group + "@page:1", {trigger: true});
			},
			createGroup: function(e) {
				var newModel = new GroupModel({'label':'新建文件夹'})
				GroupModule.controller.invokeGroupEditor(newModel);
			}
		});
		
		var GroupEditView = Backbone.Marionette.ItemView.extend({
			template: "#group-edit-template",
			events: {
				"click .attribute-field": "selectField"
			},
			getInputData: function() {
				var data = {};
				this.$('.attribute-field').each(function(i, input) {
					var name = $(input).attr('name');
					var val = $(input).val();
					data[name] = val;
				});
				return data;
			},
			selectField: function(e) {
				$(e.currentTarget).select();
			}
		});
	});
});