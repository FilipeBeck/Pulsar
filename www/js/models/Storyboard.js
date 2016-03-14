$.import('Coder.js');
//$.import('View.js');

Pulsar.class('Storyboard', Object, function($)
{
	$('static let').FILE_TYPE = true;
	
	$('static let').FOLDER_TYPE = false;
	
	$('cached var').url = {
		get: function() { return $(this).url; }
	}
	
	$('private var').base = undefined;
	
	$('private var').resource = undefined;
	
	$('private var').fileOrFolder = undefined;
	
	$('private var').data = null;
	
	$('private var').currentConnections = null;
	
	$().init = function(url, fileOrFolder)
	{
		$(this).url = url;
		$(this).fileOrFolder = fileOrFolder;
		
		var urlTree = url.split('/');
		
		$(this).file = urlTree.pop();
		$(this).base = urlTree.join('/') + '/';
		
		if (fileOrFolder == Storyboard.FILE_TYPE)
			$(this).data = $(this).load(url);
	}
	
	$().instantiateInitialScene = function()
	{
		return this.instantiateSceneWithIdentifier('index');
	}
	
	$().instantiateSceneWithIdentifier = function(id)
	{
		var scene = ($(this).fileOrFolder == Storyboard.FILE_TYPE) ?
			$(this).data.getElementById(id) : $(this).data = $(this).load($(this).url + '/' + id + '.xml');
		
		var controller = new window[scene.getAttribute('controller')];
		var coder = new Coder(scene, controller);
		var view = undefined;
		
		controller.storyboard = this;
		
		controller.setupWithCoder(coder);
		
		controller.viewDidLoad();
		
		return controller;
	}
	
	$('private').load = function(url)
	{
		var request = new XMLHttpRequest();
		
		request.open('GET', url, false);
		request.send();
		
		return request.responseXML;
	}
})