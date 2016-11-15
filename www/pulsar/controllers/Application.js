Pulsar.class('Application', Object, function($)
{
	$('var').viewController = undefined;
	
	$().init = function(storyboardURL)
	{ // Cena raiz
		var self = this;
		var storyboard = new Storyboard(storyboardURL);
		storyboard.instantiateInitialScene(function(viewController){ self.viewController = viewController });
	}
	
	$('static').setDirectMessage = function(closure)
	{
		var listener = function(event)
		{
			if (event.source === window)
			{
				window.removeEventListener('message', listener, false);
				closure();
			}
		}
		
		window.addEventListener('message', listener, false);
		window.postMessage('Application.setDirectMessage', '*');
	}
})