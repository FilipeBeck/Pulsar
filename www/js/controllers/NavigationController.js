$.import('ViewController.js');

Pulsar.class('NavigationController', ViewController, function($)
{	
	$('let').controllers = $.new(Array);
	
	$('var').connections = null;
	
	$('var').rootController = {
		get: function() { return this.controllers[0]; }
	}
	
	$('var').topController = {
		get: function() { return this.controllers[this.controllers.length - 1]; }
	}
	
	$('cached var').navigationBar = {
		get: function() { return $(this).navigationBar; }
	}
	
	$().viewDidLoad = function()
	{
		this.view.node.style['display'] = 'flex';
		this.view.node.style['flex-direction'] = 'column';
		this.view.node.style['width'] = '100%';
		this.view.node.style['height'] = '100%';

		$(this).navigationBar = new View(document.createElement('div'));
		$(this).navigationBar.node.style.height = '30px';
		$(this).navigationBar.node.style['background-color'] = '#22aaff';
		
		this.view.addSubview($(this).navigationBar);
		
		var rootController = this.storyboard.instantiateSceneWithIdentifier(this.connections.querySelector('root').getAttribute('identifier'));
		
		this.pushController(rootController);
		
		rootController.parentController = this;
	}
	
	$().pushController = function(controller)
	{
		if (this.topController)
			this.topController.view.removeFromSuperview();
		
		controller.view.node.style.width = '100%';
		controller.view.node.style.flex = 1;
		
		this.view.addSubview(controller.view);
		this.controllers.push(controller);
		
		controller.parentController = this;
	}
})