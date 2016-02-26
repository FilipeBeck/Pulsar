$.import('View.js')

/**
 * Abstração de iframes. Utilizadapor storyboards
 * @class Scene
 */
Pulsar.class('Scene', View, function($)
{
	/**
	 * @var {Element} Scene.iFrameStyle
	 * @private
	 */
	var iFrameStyle = document.createElement('style');
	iFrameStyle.innerHTML = 'body { margin: 0 } iframe { border: none; width: 100%; height: 100% } a { visibility: hidden; }';
	
	/** @var {View} Scene#view */
	$('cached var').rootView = {
		get: function(){
			return $(this).rootView;
		}
	}
	
	/***/
	$('var').controllerData = {
		get: function(){
			var controllerData = this.node.contentDocument.body.getAttribute('data-controller');
			var index = controllerData.indexOf('{');
			
			if (index != -1)
			{
				if (controllerData.indexOf('}') == -1)
					throw new Error(`Bad formatted controller data string in '${this.node.src}' file`);
				
				return { name: controllerData.substring(0, index), properties: controllerData.substring(index + 1, controllerData.length - 1) };
			}
			else
				return { name: controllerData, properties: null };
		}
	}
	
	/**
	 * @constructor
	 * @param {String} src Url do arquivo
	 */
	$().init = function(src)
	{
		var iFrame = document.createElement('iframe');
		iFrame.src = src;
		
		this.super('init', iFrame, new Rectangle(0.0, 0.0, window.innerWidth, window.innerHeight));
		
		var self = this;
		
		iFrame.addEventListener('load', function(event){
			iFrame.contentDocument.head.appendChild(iFrameStyle.cloneNode(true));
			window.addEventListener('resize', function(event){
				self.frame = new Rectangle(0.0, 0.0, window.innerWidth, window.innerHeight);
			}, false);
		});
	}
	
	/**
	 * @method Scene#data
	 */
	$().data = function(type)
	{
		var nodes = this.node.contentDocument.querySelectorAll(`[data-${type}]`);
		var result = [];
		
		for (var i = 0, count = nodes.length; i < count; i++){
			var node = nodes[i];
			result.push({ node: node, value: node.getAttribute(`data-${type}`) });
		}
		
		return result;
	}
	
	/**
	 * @method Scene#attachToView
	 */
	$().attachToView = function(view, afterDo)
	{
		var self = this;
		
		this.node.addEventListener('load', function(){
			$(self).rootView = new View(self.node.contentDocument.body);
			$(self).rootView.frame = self.frame;
			afterDo();
		});
		
		view.addSubview(this);
	}
})