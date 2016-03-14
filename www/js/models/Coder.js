Pulsar.class('Coder', Object, function($)
{
	$('static let').CHILDREN_WAS_PROCCESSED = true;
	
	$('static let').CHILDREN_NOT_PROCCESSED = false;
	
	$('var').element = undefined;
	
	$('var').controller = undefined;
	
	$().init = function(element, controller)
	{
		this.element = element;
		this.controller = controller;
	}
	
	$().evalData = function(attr)
	{
		var completeName = 'data-' + attr;
		
		return (this.element.hasAttribute(completeName)) ? eval('({' + this.element.getAttribute(completeName) + '})') : {};
	}
	
	$().jsonData = function(attr)
	{
		var completeName = 'data-' + attr;
		
		return (this.element.hasAttribute(completeName)) ? JSON.parse('{' + this.element.getAttribute(completeName) + '}') : {};
	}
	
	$().listData = function(attr)
	{	
		var completeName = 'data-' + attr;
		var list = {};
		
		if (this.element.hasAttribute(completeName))
		{
			var lines = this.element.getAttribute('data-' + attr).split(',');

			for (var i = 0, count = lines.length; i < count; i++)
			{
				var line = lines[i];

				if (line != '')
				{
					var tuple = line.split(':');

					list[tuple[0].trim()] = tuple[1].trim();
				}
			}
		}
		
		return list;
	}
	
	$().rawData = function(attr)
	{
		return this.element.getAttribute('data-' + attr);
	}
	
	$().proccessElement = function(nameForTag)
	{	
		if (this.element.nodeType == Node.TEXT_NODE) {
			return document.createTextNode(element.data);
		}
		else
		{	
			var newNode = document.createElement((nameForTag != undefined) ? nameForTag : this.element.tagName);
			var attributes = this.element.attributes;

			for (var i = 0, count = attributes.length; i < count; i++)
			{
				var attr = attributes[i];

				newNode.setAttribute(attr.name, attr.value);
			}

			var proccessChildren = true;

			if (newNode.hasAttribute('data-kind'))
			{
				var newView = new window[newNode.getAttribute('data-kind')](newNode);

				if (newNode.hasAttribute('data-outlet'))
					this.controller[newNode.getAttribute('data-outlet')] = newView;

				if (newView.setupWithCoder(this) != Coder.CHILDREN_NOT_PROCCESSED)
					proccessChildren = false;
			}
			
			if (proccessChildren)
			{
				var originalElement = this.element;
				var children = this.element.children;

				for (var i = 0, count = children.length; i < count; i++)
				{
					this.element = children[i];	
					newNode.appendChild(this.proccessElement());
				}
				
				this.element = originalElement;
			}

			return newNode;
		}
	}
})