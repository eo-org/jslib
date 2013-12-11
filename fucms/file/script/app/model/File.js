requirejs.config({
	paths: {
		"commonApp": "common/script/app"
	}
});

define(["commonApp/Lightbox"], function(lightboxApplication) {
	FileApplication.module('FileModule', function(FileModule, FileApplication) {
		var Group_Id = 'all';
		
		FileModule.addInitializer(function(options) {
			FileModule.controller = new Controller({
				fileRegion: FileApplication.fileRegion,
				paginatorRegion: FileApplication.paginatorRegion
			});
		});
		
		var Controller = Backbone.Marionette.Controller.extend({
	        initialize: function (options) {
	            this.fileRegion	= options.fileRegion;
	            this.pRegion = options.paginatorRegion
	            
	            this.fcv = new FileCollectionView();
	            this.fileRegion.show(this.fcv);
	            
	            this.paginator = new PaginatorView();
	            this.pRegion.show(this.paginator);
	            
	            FileApplication.vent.on('File:loadFile', this.fcv.loadFile, this.fcv);
	            FileApplication.vent.on("Paginator:updatePage", this.paginator.render);
	        }
	    });
		
		/**
		 * File Upload
		 */
		var UploadFileModel = Backbone.Model.extend({
			defaults: {
				id: null,
				name: "",
				size: 0,
				status: "ready"
			}
		});
		
		var UploadFileCollection = Backbone.Collection.extend({model: UploadFileModel});
		
		var UploadFileModelView = Backbone.Marionette.ItemView.extend({
			tagName: "li",
			template: "#upload-file-template",
			events: {
				'click .remove-file': 'removeFile'
			},
			modelEvents: {
				'change:status': 'statusChanged'
			},
			statusChanged: function() {
				switch(this.model.get('status')) {
					case 'removed':
						$(this.el).attr('class', 'removed');
						break;
					case 'uploading':
						$(this.el).attr('class', 'uploading');
						break;
					case 'uploaded':
						$(this.el).attr('class', 'uploaded');
						break;
				}
			},
			removeFile: function() {
				this.model.set('status', 'removed');
			}
		});
		
		var UploadFileCollectionView = Backbone.Marionette.CompositeView.extend({
			itemView: UploadFileModelView,
			template: "#upload-collection-template",
			events: {
				"change #uploadfile": "prepareUploadList",
				"click #upload-start": "startUpload"
			},
			appendHtml: function(collectionView, itemView) {
				collectionView.$('ul.upload-list').append(itemView.el);
			},
			prepareUploadList: function() {
				var FILELIST_UPLOAD = document.getElementById('uploadfile').files;
				
				this.filelist_upload = FILELIST_UPLOAD;
				
				var fileUploadArr = [];
				
				_.each(FILELIST_UPLOAD, function(file, i) {
					fileUploadArr.push({
						id: i,
						name: file.name,
						size: file.size
					});
				});
				
				this.collection = new UploadFileCollection();
				this.collection.set(fileUploadArr);
				this.render();
			},
			startUpload: function() {
				this.uploadFile(this.filelist_upload, 0);
			},
			uploadFile: function(filelist_upload, idx) {
				var TH = this;
				var totalFileCount = filelist_upload.length;
				
				if(idx >= totalFileCount) {
					//upload finished
					FileApplication.vent.trigger('File:loadFile', {'group': Group_Id, 'page': 1});
					
					lightboxApplication.vent.trigger('Lightbox:close');
				} else {
					var model = this.collection.at(idx);
					model.set('status', 'uploading');
					
					var file = filelist_upload[idx];
					var formData = new FormData();
					formData.append("uploadedfile", file);
					var xhr = new XMLHttpRequest();
					xhr.upload.addEventListener('progress', function(e) {
						$('#uploadfile-progressbar').html(e.loaded + ' : ' + e.total);
					}, false);
					xhr.onreadystatechange = function(e) {
						if(xhr.readyState == 4) {
							model.set('status', 'uploaded');
							uploadedFileIndex = idx + 1;
							TH.uploadFile(filelist_upload, uploadedFileIndex);
						}
					}
					xhr.open("POST", "/adminrest/filerest-file.json", true);
					
					xhr.setRequestHeader("X-File-Name", file.name);
					xhr.setRequestHeader("X-Group-Id", Group_Id);
					xhr.send(formData);
				}
			}
		});
		
		/**
		 * File Selector
		 */
		var FileModel = Backbone.Model.extend({
			defaults: {
				id: null,
				urlname: "",
				filename: "",
				isImage: null,
				size: "",
				groupId:"",
				uploadTime: "",
				dims: null
			}
		});
		
		var FileCollection = Backbone.Collection.extend({
			model: FileModel,
			url: "/adminrest/filerest-file.json",
			parse: function(resp) {
				this.pageInfo = {
					"currentPage": resp.currentPage,
					"dataSize": resp.dataSize,
					"pageSize": resp.pageSize
				};
				return resp.data;
			}
		});
		
		var FileView = Backbone.Marionette.ItemView.extend({
			tagName: "li",
			template: "#file-template",
			events: {
				'click': "singleClick",
				'dblclick': "dblClick",
				'click .remove': "removeModel"
			},
			removeModel: function() {
				this.model.destroy();
			},
			singleClick: function() {
				FileApplication.vent.trigger('File:singleClick', {'model': this.model});
			},
			dblClick: function() {
				FileApplication.vent.trigger('File:dblclick', {'model': this.model});
			}
		});
		
		var FileCollectionView = Backbone.Marionette.CompositeView.extend({
			itemView: FileView,
			template: "#file-list-template",
			appendHtml: function(collectionView, itemView) {
				collectionView.$('ul.file-list').append(itemView.el);
			},
			events: {
				'click .upload-invoker': 'showUpload'
			},
			initialize: function() {
				this.collection = new FileCollection();
			},
			loadFile: function(data) {
				Group_Id = data.group;
				var CO = this.collection;
				this.collection.fetch({
					data: {'groupId': data.group, 'page': data.page},
					success: function() {
						FileApplication.vent.trigger('Paginator:updatePage', CO.pageInfo);
					}
				});
				if(Group_Id == 'all') {
					this.$('.upload-invoker-bg').css('display', 'none');
				} else {
					this.$('.upload-invoker-bg').css('display', 'block');
				}
			},
			showUpload: function() {
				var upv = new UploadFileCollectionView();
				lightboxApplication.vent.trigger('Lightbox:show', {"view": upv});
			}
		});
		
		/**
		 * paginator
		 */
		var PaginatorView = Backbone.Marionette.ItemView.extend({
			template:　"#paginator-template",
			tagName:'ul',
			render: function(pageInfo) {
				if(pageInfo != undefined) {
					var paginatorContainer = $(this.el);
					var pageNumber = Math.ceil(pageInfo.dataSize / pageInfo.pageSize);
					
					paginatorContainer.empty();
					for(var i = 1; i <= pageNumber; i++) {
						if(i == pageInfo.currentPage) {
							paginatorContainer.append('<li class="current">' + i + '</li>');
						} else {
							paginatorContainer.append('<li><a href="#groupId:' + Group_Id + '@page:' + i + '">' + i + '</a></li>');
						}
					}
					var startItemNumber = pageInfo.pageSize * (pageInfo.currentPage - 1) + 1;
					var endItemNumber = pageInfo.pageSize * pageInfo.currentPage;
					if(endItemNumber > pageInfo.dataSize) {
						endItemNumber = pageInfo.dataSize;
					}
					paginatorContainer.append('<li class="desc">(' + startItemNumber + '-' + endItemNumber + ' of ' + pageInfo.dataSize + ' items)</li>');
				}
			}
		});
		
	});
});
