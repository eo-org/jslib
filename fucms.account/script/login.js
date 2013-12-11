$(document).ready(function () {
	$("#user-login").validate({
		rules: {
			loginName: {
				required: true,
				email: true
			},
			password: {
				required: true,
				minlength: 6
			}
		},
		messages: {
			loginName: {
				required: '请输入您注册时使用的邮箱地址',
				email: '您输入的邮箱地址格式不正确'
			},
			password: {
				required: '请输入密码',
				minlength: '密码最短为6位'
			}
		},
		errorPlacement: function(error, element) {
			error.insertAfter(element.closest('div'));
		},
		onkeyup: false
	});
	
	$(".hint-element").focus(function(){
		var currentVal = $(this).val();
		if(currentVal == $(this).data("hint")) {
			$(this).val("");
			var fieldType = $(this).data('type');
			$(this).prop('type', fieldType);
		}
	}).blur(function() {
		var currentVal = $(this).val();
		if(currentVal == "" || currentVal.replace(/\s/g,"") == "") {
			var defaultVal = $(this).data('hint');
			$(this).val(defaultVal);
			$(this).prop('type', 'text');
		}
	});
});