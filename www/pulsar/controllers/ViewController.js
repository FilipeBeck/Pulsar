$.import('../gui/View.js');

Pulsar.class('ViewController', Object, function($)
{
	$('var').view = undefined;

	$('var').storyboard = null;

	$('var').parentController = null;

	$().init = function()
	{

	}
	
	$().setupWithCoder = function(coder)
	{
		var scene = coder.element;
		
		for (var i = 0, count = scene.children.length; i < count; i++)
		{
			var child = scene.children[i];
			coder.element = child;

			switch (child.tagName)
			{
				case 'navigationItem':
				{
					
				}break;
					
				case 'view':
				{
					var node = coder.proccessElement('div');
					this.view = (node.view != undefined) ? node.view : new View(node);
					
				}break;
					
				case 'connections':
				{
					this.connections = child;
				}break;
					
				default:
					break;
			}
		}
	}
	
	$().viewDidLoad = function()
	{
		
	}

	$().performSegue = function(identifier, sender)
	{
		var controller = this.storyboard.instantiateSceneWithIdentifier(identifier);
		
		this.parentController.pushController(controller);
		
		//this.navigationController.performSegue(identifier, sender);
	}
})