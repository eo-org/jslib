$(document).ready(function() {
	var DH = $(document).height();
	var WH = $(document).width();
	var BB_LT = (WH - 600) / 2;
	
	var BUTTON_UPLOAD = $("<input id='uploadfile' type='file' name='uploadfile' multiple='multiple' />&nbsp;&nbsp;<a href='javascript:void(0);' class='close mini-icon-bg mini-icon-close'></a>");
	var BUTTON_START = $("<input id='button-start' type='button' name='start-upload' value='Start' />");
	var UL_FILE = $("<ul class='file-list file-update'></ul>");
	var FILELIST_UPLOAD = null;
	var Q = null;
	var Warray = new Array();
	var WB = $('#whitebox');
	var BB = $('#blackbox');
	
	function fileUpload(file, i, afterUpload)
	{
		var formData = new FormData();
		formData.append("uploadedfile", file);
		var groupId = $('.file-container').attr('groupId');
		var xhr = new XMLHttpRequest();
		xhr.open('POST', "/adminrest/adminrest-file.json?" + "groupId=" + groupId, true);
		xhr.onreadystatechange = function() {
	        if (xhr.readyState == 4) {
	            if (xhr.status == 200 || xhr.status == 304) {
	            	try {
	            		var jsonObj = eval('(' + xhr.response + ')');
	            	} catch(e) {
	            		console.log('error report!');
	            		console.log(e);
	            		console.log(xhr.response);
	            	}
					this.Uploadfile = new FileCollectionView;
					this.Uploadfile.afterOneSent(jsonObj);
	            	afterUpload(i);
	            }
	        }
	    }
		xhr.send(formData);
	};
	
	
	var afterUpload = function(i) {
		var lis = UL_FILE.find('li');
		var lisd = UL_FILE.find('li:visible');
		$(lis[i]).css('color', 'red');
		$(lis[i]).attr('active', 0);
		var allFinished = true;
		_.each(lisd, function(li) {
			if($(li).attr('active') == 1) {
				allFinished = false;
			}
		})

		if(allFinished) {
			Warray=[];
			WB.css('display', 'none');
			BB.css('display', 'none');
			UL_FILE.empty();
			$(':file').val("");
			BUTTON_START.removeAttr('class');
		}
	};
	
	BUTTON_UPLOAD.change(function() {
		FILELIST_UPLOAD = document.getElementById('uploadfile').files;
		
		_.each(FILELIST_UPLOAD, function(file, i) {
			var liEl = "<li file-index='" + i + "' active='1'>"+'<a href=javascript:void(0);>x</a>&nbsp;&nbsp;&nbsp;'+file.name + ' <div class=\'size\'>' + (file.size/(1024 * 1024)).toFixed(2) + 'MB' + "</div></li>"
			UL_FILE.append(liEl);
		});
//***************
		$('.file-update').find('li a').bind('click',function(){
			$(this).parent().addClass('flase');
			$(this).parent().css({
				display: 'none'
			});
		});
//*************
	});
	
	BUTTON_START.click(function() {
		if(FILELIST_UPLOAD.length > 0 && $(this).attr('class')!='BUTTONfailure') {
//***************
		BUTTON_START.attr('class','BUTTONfailure');
			$('.file-update li:visible').each(function(j,fileflase){
				Q=parseInt($(this).attr('file-index'));
				Warray[j]=Q;
			})
//***************
			_.each(FILELIST_UPLOAD, function(file, i) {
				_.each(Warray,function(WarrayV,j){
					if(WarrayV==i){
						fileUpload(file, i, afterUpload);
					}
				})
			});
			Warray=[];
		}
	});
	
	
	WB.css({
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: DH,
		background: 'white',
		opacity: 0.8,
		display: 'none'
	});
	
	BB.css({
		position: 'absolute',
		top: '50px',
		left: BB_LT,
		width: '600px',
		height: '500px',
		background: '#777',
		display: 'none'
	});
	WB.click(function() {
		WB.css('display', 'none');
		BB.css('display', 'none');
		$('.file-update').empty();
		$(':file').val("");  
	});
	$('#upload-button').click(function() {
		alert('button clicked');
		WB.css('display', 'block');
		BB.css('display', 'block');
		BB.append(BUTTON_UPLOAD);
		BB.append(UL_FILE);
		BB.append(BUTTON_START);
//******************
		$('.mini-icon-close').click(function(){
			WB.css('display', 'none');
			BB.css('display', 'none');
			$('.file-update').empty();
			$(':file').val("");  
		});
//*****************
	});
	
});