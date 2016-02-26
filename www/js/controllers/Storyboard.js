$.import('../gui/Scene.js');

Pulsar.class('Storyboard', Object, function($)
{
	$('var').url = undefined;

	$().init = function(url)
	{
		var hrefArray = document.location.href.split('/');
		hrefArray.pop();
		hrefArray.push(url);
		
		this.url = hrefArray.join('/');
	}

	$().instantiateInitialScene = function(afterLoad)
	{
		var containerView = new View(document.body);
		
		this.instantiateSceneWithIdentifier('index', containerView, afterLoad);
	}

	$().instantiateSceneWithIdentifier = function(identifier, sourceView, afterLoad)
	{
		var scene = new Scene(`${this.url}/${identifier}.html`);
		var self = this;
		
		scene.attachToView(sourceView, function()
		{
			var controllerData = scene.controllerData;
			var controller = new parent[controllerData.name];
			
			if (controllerData.properties != null)
			{
				var properties = $(self).parseData(controllerData.properties);
				
				for (var i = 0, count = properties.length; i < count; i++)
				{
					var property = properties[i];
					controller[property.name] = property.value;
				}
			}
			
			controller.view = scene.rootView;
			controller.storyboard = self;
			
			var classes = scene.data('class');
			
			for (var i = 0, count = classes.length; i < count; i++)
			{
				var classData = classes[i];
				var view = new window[classData.value](classData.node);
				
				if (classData.node.hasAttribute('data-outlet'))
					controller[classData.node.getAttribute('data-outlet')] = view;
				
				if (classData.node.hasAttribute('data-property'))
				{
					var properties = $(self).parseData(classData.node.getAttribute('data-property'));
					
					for (var i = 0, count = properties.length; i < count; i++)
					{
						var property = properties[i];
						view[property.name] = property.value;
					}
				}
			}
			
			var controls = scene.data('action');
			
			for (var i = 0, count = controls.length; i < count; i++)
			{
				var controlData = controls[i];
				var events = $(self).parseData(controlData.value);
				
				for (var j = 0, count = events.length; j < count; j++)
				{
					var event = events[j];
					
					(function(message, action){
						controlData.node.addEventListener(message, function(e) {
							controller[action](e.target);
						})
					})(event.name, event.value);
				}
			}
			
			controller.viewDidLoad();
			
			afterLoad(controller);
		});
		
		return scene;
	}
	
	$('private').parseData = function(dataString)
	{
		var events = dataString.split(' ');
		var result = [];
		
		for (var i = 0, count = events.length; i < count; i++)
		{
			var event = events[i];
			
			if (event == '') continue;
			
			event = event.split(':');
			
			if (event.length != 2 || event[0] == '' || event[1] == '')
				throw new Error(`Bad formatted data string in '${this.url}' file`);
			
			result.push({ name: event[0], value: event[1] });
		}
		
		return result;
	}
})