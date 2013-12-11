$(document).ready(function () {
	$.validator.addMethod('subdomain', function(value, element) {
		return /^[a-z]{1}[a-z0-9]*$/i.test(value);
	}, "subdomain name should start with a letter and composed of letters or digits");
	
	$('#user-register').validate({
		rules: {
			subdomainName: {
				required: true,
				subdomain: true,
				minlength: 4,
				remote: "/sp/validate/subdomain-available.ajax"
			},
			loginName: {
				required: true,
				email: true,
				remote: "http://idp.enorange.test/validate/login-name-available.ajax"
			},
			password: {
				required: true,
				minlength: 6
			},
			password_2: {
				required: true,
				equalTo: '#password'
			}
		},
		messages: {
			subdomainName: {
				required: '请输入一个子域名，方便测试访问',
				subdomain: '所选子域名必须以字母开头，且只能由字母和数字组成',
				minlength: '子域名最少为4个字母',
				remote: '该子域名已存在'
			},
			loginName: {
				required: '请输入您的常用邮箱地址',
				email: '您输入的邮箱地址格式不正确',
				remote: '此邮箱已经被注册'
			},
			password: {
				required: '请输入密码',
				minlength: '密码最短为6位'
			},
			password_2: {
				required: '请再次输入密码',
				equalTo: '两次输入的密码不一致'
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
	$('#subdomainName').keyup(function() {
		var val = $(this).val();
		if(val == "") {
			$('#js-subdomain-name').css('color', '#999');
			$('#js-subdomain-name').html('subdomain');
		} else {
			$('#js-subdomain-name').css('color', '#0085d9');
			$('#js-subdomain-name').html(val);
		}
	});
});