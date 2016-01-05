Pulsar.class('ViewController', Object, function($)
{
	$('var').view = undefined;

	$('var').storyboard = null;

	$('var').navigationController = null;

	$().init = function()
	{

	}

	$().performSegue = function(identifier, sender)
	{

	}
})

Pulsar.class('Storyboard', Object, function($)
{
	$('var').url = undefined;

	$().init = function(url)
	{
		this.url = url;
	}

	$().instantiateInitialViewController = function(afterLoad)
	{
		var iFrame = document.createElement('iframe');
		iFrame.src = `${this.url}/index.html`;
		
		iFrame.addEventListener('load', function()
		{
			var style = document.createElement('style');
			style.innerHTML = 'a { visibility: hidden; }';
			iFrame.contentDocument.head.appendChild(style);
			
			var controller = new parent[iFrame.contentDocument.body.getAttribute('data-controller')];
			controller.view = new View(iFrame.contentDocument.body);
			//controller.view = iFrame.contentDocument.body.view;
			
			var classes = iFrame.contentDocument.querySelectorAll('[data-class]');
			
			for (var i = 0, count = classes.length; i < count; i++)
			{
				var node = classes[i];
				var view = new window[node.getAttribute('data-class')](node);
				
				if (node.hasAttribute('data-outlet'))
					controller[node.getAttribute('data-outlet')] = view;
			}
			
			var controls = iFrame.contentDocument.querySelectorAll('[data-action]');
			
			for (var i = 0, count = controls.length; i < count; i++)
			{
				var control = controls[i];

				var events = control.getAttribute('data-action').split(' ');

				for (var j in events)
				{
					var event = events[j].split(':');

					(function(message, action){
						control.addEventListener(message, function(e) {
							controller[action](e.target);
						})
					})(event[0], event[1]);
				}
			}
			
			afterLoad(controller);
		})
		
		document.body.appendChild(iFrame);
		
		return iFrame;
	}

	$().instantiateViewControllerWithIdentifier = function(identifier)
	{

	}
})

Pulsar.class('Application', Object, function($)
{
	$('var').viewController = undefined;
	
	$().init = function(storyboardURL)
	{ // Cena raiz
		var self = this;
		var storyboard = new Storyboard(storyboardURL);
		var iFrame = storyboard.instantiateInitialViewController(function(viewController){ self.viewController = viewController });
		
		/*var iFrame = document.createElement('iFrame');

		iFrame.src = 'application.storyboard/index.html';

		document.body.appendChild(iFrame);

		iFrame.onload = function()
		{	
			var controller = new parent[iFrame.contentDocument.body.getAttribute('data-controller')];
			var controls = iFrame.contentDocument.querySelectorAll('[data-class]');

			for (var i = 0, count = controls.length; i < count; i++)
			{
				var control = controls[i];

				var events = control.getAttribute('data-action').split(' ');

				for (var j in events)
				{
					var event = events[j].split(':');

					(function(message, action){
						control.addEventListener(message, function(e) {
							controller[action](e.target);
						})
					})(event[0], event[1]);
				}
			}
		}*/
	}
})