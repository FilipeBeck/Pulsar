'use strict'

function Point(x, y)
{
	this.x = x;
	this.y = y;
	
	Object.seal(this);
}

function Size(width, height)
{
	this.width = width;
	this.height = height;
	
	Object.seal(this);
}

function Rectangle(args)
{
	var args = arguments;
	
	if (args.length == 2)
	{
		this.origin = args[0];
		this.size = args[1];
	}
	else
	{
		this.origin = new Point(args[0], args[1]);
		this.size = new Rectangle(args[2], args[3]);
	}
	
	Object.seal(this);
}

/**
 * Representa um elemento visível no documento
 * @class View
 * @param {Element} node Referência ao elemento
 */
Pulsar.class('View', Object, function($)
{ 
	/**
	 * @var {Object} View.styles Estilos
	 * @private
	 */
	var commumStyle = document.createElement('style');
	commumStyle.innerHTML = `
		* { box-sizing: border-box; }
		iframe { border: none; }`
	document.head.appendChild(commumStyle);
	
	var styles =  {
		view: 	'',
		layer:  'position: absolute; width: 100%; height: 100%; flex: 1;',
		canvas: 'z-index: -1; width: 100%; height: 100%; flex: 1;'
	}
	/**
	 * @var {Element} View#node Elemento
	 * @private
	 */
	$('private var').node = undefined;
	/**
	 * @var {Element} View#layer Div contenedor de todos os elementos quando houver um canvas
	 * @private
	 */
	$('private var').layer = undefined;
	/**
	 * @var {Element} View#canvas Canvas utilizado quando houver desenho customizado
	 * @private
	 */
	$('private var').canvas = undefined;
	
	/** @var {View} View#superview */
	$('var').superview = {
		get: function() { return $(this).superview; }
	}; $('private var').superview = undefined;
	
	/** @var {View[]} View#subviews Todos os views filhos (Um para cada <b>node</b>) */
	$('cached var').subviews = {
		get: function() {
			// Primeiro acesso
			if ($(this).subviews == undefined)
			{
				$(this).subviews = []
				// Se a camada não foi criado ainda, recupera a própria, senão recupera a camada
				var node = ($(this).layer == undefined) ? $(this).node : $(this).layer;
				// Percorre os subelementos criando os respectivos views
				for (var i = 0, childs = node.children, count = childs.length; i < count; i++)
				{
					var child = childs[i];
					var subview = (child.view != undefined) ? child.view : new View(child);
					$(subview).superview = this;
					$(this).subviews.push(subview);
				}
			}
			
			return $(this).subviews;
		} // Escopo privado
	};// $('private var').subviews = undefined;
	
	/** */
	$('private').createLayer = function()
	{
		var children = [];
		// Remove os subelementos
		while ($(this).node.firstChild)
			children.push($(this).node.removeChild($(this).node.firstChild));
		// Nova div como camada para os subelementos
		var layer = document.createElement('div');
		layer.className = 'pulsar-gui-layer';
		layer.setAttribute('style', styles.layer);
		// Insere os subelemntos na nova camada
		for (var i in children)
			layer.appendChild(children[i]);
		
		$(this).node.appendChild(layer);
		$(this).layer = layer;
	}
	
	/** */
	$('private').createCanvas = function()
	{
		if ($(this).layer == undefined)
			$(this).createLayer()
		// Canvas para as primitivas gráficas
		var canvas = document.createElement('canvas');
		canvas.className = 'pulsar-gui-canvas';
		canvas.setAttribute('style', styles.canvas);

		$(this).node.appendChild(canvas);
		$(this).canvas = canvas;
	}
	
	/** @var {Object} View#context Contexto gráfico para o canvas. Se o canvas não existir, será criado um */
	$('var').context = {
		get: function() {
			if ($(this).canvas == null) {
				if ($(this).layer == undefined || $(this).canvas == undefined) {
					$(this).createLayer(); $(this).createCanvas();
				}
			}
			
			return $(this).canvas.getContext('2d')
		}
	}
	
	/** @var {Bool} View#clipsToBounds */
	$('var').clipsToBounds = {
		get: function() { return $(this).node.style.overflow == 'hidden' },
		set: function(yesOrNo) { $(this).node.style.overflow = (yesOrNo) ? 'hidden' : 'visible' }
	}
	
	/** @var {String} View#backgroundColor */
	$('var').backgroundColor = {
		get: function() { return $(this).node.style.backgroundColor },
		set: function(n) { $(this).node.style.backgroundColor = n }
	}
	
	/** @var {Bool} View#hidden */
	$('var').hidden = {
		get: function() { return $(this).node.style.visibility == 'hidden' },
		set: function(yesOrNo) { $(this).node.style.visibility = (yesOrNo) ? 'hidden' : 'visible' }
	}
	
	/** @var {Float} View#alpha */
	$('var').alpha = {
		get: function() { return $(this).node.style.opacity },
		set: function(n) { $(this).node.style.opacity = n }
	}
	
	/** @var {Rectangle} View#frame */
	$('var').frame = {
		get: function() {
			if ($(this).layer == undefined)
				$(this).createLayer()
				
			return {
				origin: {
					x: $(this).node.offsetLeft,
					y: $(this).node.offsetTop,
				},
				size: {
					width: $(this).node.offsetWidth,
					height: $(this).node.offsetHeight
				}
			}
		},
		set: function(newFrame) {
			if ($(this).layer == undefined)
				$(this).createLayer()
				
			//$(this).node.style.margin = '0px 0px 0px 0px';
			$(this).node.style.left = newFrame.origin.x + 'px';
			$(this).node.style.top = newFrame.origin.y + 'px';
			$(this).node.style.width = newFrame.size.width + 'px';
			$(this).node.style.height = newFrame.size.height + 'px';
		}
	}
	
	/**
	 * Construtor padrão
	 * @constructs View
	 * @param {Element} Referência ao elemento
	 */
	$().init = function(node)
	{
		if (node.view != undefined) return node.view;
		
		node.view = this;
		node.className = 'pulsar-gui-view ' + node.className;
		node.setAttribute('data-class', this.constructor.name);
		
		var position = window.getComputedStyle(node).position;
		
		if (position != 'relative' && position != 'absolute' && position != 'fixed')
			node.style.position = 'relative';
		
		$(this).node = node;
	}
	
	/**
	 * Cria um view com um novo elemento
	 * @method View.new
	 * @param {string} name Nome do elemento a ser criado
	 */
	$('static').new = function(name)
	{
		this.init(document.createElement(name));
	}
	
	/**
	 *
	 */
	$('static').animate = function(duration, block, finish)
	{
		var sheet = document.styleSheets[0];
		
		if (sheet.insertRule)
			sheet.insertRule(`.pulsar-gui-view { transition: ${duration}s; transform: translation3d(0,0,0); }`);
		else
			sheet.addRule('.pulsar-gui-view', `transition: ${duration}s; transform: translation3d(0,0,0);`);
		
		document.addEventListener('transitionend', function listener(event)
		{ 
			console.log('transitionend', event);
			sheet.removeRule('.pulsar-gui-view');
			document.removeEventListener('transitionend', listener, true);
			window.setTimeout(finish, 0.0);
		}, true)
		
		block();
	}
	
	/**
	 * Desenha
	 * @method View#draw
	 */
	$().draw = function(size) {}
})