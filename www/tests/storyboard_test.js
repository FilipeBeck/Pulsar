$.import('js/models/Storyboard.js', 'absolute');
$.import('js/controllers/NavigationController.js', 'absolute');

Pulsar.class('Controller1', ViewController, function($)
{
	$().print = function()
	{
		alert('Controller1');
	}
})

Pulsar.class('MyController', Controller1, function($)
{
	$().init = function()
	{

	}

	$().buttonPressed = function(view, event)
	{
		console.log('My button pressed');
	}
})

Pulsar.class('Controller2', ViewController, function($)
{
	$().print = function()
	{
		alert('Controller2');
	}
})

Pulsar.class('YourController', Controller2, function($)
{
	$().init = function()
	{

	}

	$().buttonPressed = function(view, event)
	{
		console.log('Your button pressed');
	}
	
	$().print = function()
	{
		alert('YourController');
	}
})

Pulsar.class('RootView', View, function($)
{

})

Pulsar.class('MyView', View, function($)
{

})

Pulsar.class('YourView', View, function($)
{

})

var storyboard = new Storyboard('tests/test.storyboard', Storyboard.FILE_TYPE);
var controller = storyboard.instantiateInitialScene();

var myController = controller.rootController;

document.body.appendChild(controller.view.node);