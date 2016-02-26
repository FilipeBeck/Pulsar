$.import('../gui/View.js');

Pulsar.class('ViewController', Object, function($)
{
	$('var').view = undefined;

	$('var').storyboard = null;

	$('var').navigationController = null;

	$().init = function()
	{

	}
	
	$().viewDidLoad = function()
	{
		
	}

	$().performSegue = function(identifier, sender)
	{
		this.navigationController.performSegue(identifier, sender);
	}
})