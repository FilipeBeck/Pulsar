/*
	Copyright (c) 2016 Filipe Roberto Beck

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/**
	@fileoverview Contém a classe base para manipular elementos
*/

$.import('../stdlib/Collection.js')
$.import('../stdlib/Geometry.js')
$.import('Transition.js')

/**
 * Classe base para manipular elementos. Todos os métodos e propriedades de 'EventTarget', 'Node', 'Element' e 'HTMLElement' são copiados para esta classe. Eles podem ser chamados diretamente, sendo propagados para o elemento relacionado.
 * @class View
 */
Pulsar.class('View', function($)
{
	$.initialization = function()
	{
		View.insertCSSRules({
			'*': {
				//'position': 'relative',
				'box-sizing': 'border-box',
				'font-family': 'sans-serif',
				'color': '#112244',
				'border-color': '#112244',
			},
			'body': {
				'margin': '0px',
				'padding': '0px',
				'display': 'block'
			},
			'ps-view': {
				'position': 'relative'
			}
		})
	}

	/** @const {CSSStyleSheet} View.standardSheet Folha de estilos padrão utilizada para estabelecer valores iniciais sem a necessidade de criar um arquivo separado. É adicionado como primeiro elemento, antes de qualquer outro estilo. */
	$('static let').standardSheet = document.head.insertBefore(document.createElement('style'), document.head.firstChild).sheet

	/**
		Insere novas regras de estilo.
		@method View.insertCSSRules
		@param {Object<String,Object>} rules Dicionário de objetos com as chaves representando os seletores, e os valores representando as regras.
		@param {?Integer} index Posição na folha. Se nulo, insere no final.
		@param {?CSSStyleSheet} sheet Folha onde será inserido. Se nulo, insere em `View.standardSheet`.
		TODO: Verificar se o seletor já existe
	*/
	$('static func').insertCSSRules = function(rules, index, sheet)
	{
		if (!sheet)
			sheet = View.standardSheet

		if (!index)
			index = sheet.cssRules.length

		function insert(selector)
		{
			let content = []

			for (let style in selector) {
				let value = selector[style]

				if (value.constructor.name == 'Object') {
					let originalPrefix = prefix
					prefix += ' ' + style
					insert(value)
					prefix = originalPrefix
				}
				else {
					content.push(`${style}:${value};`)
				}
			}

			sheet.insertRule(`${prefix}{${content.join('')}}`, index++)
		}

		for (let selector in rules) {
			var prefix = selector
			insert(rules[selector])
			prefix = ''
		}
	}

	/**
		Remove o seletor especificado da folha de estilos.
		@method View.removeCSSRule
		@param {String} selector Texto do seletor.
		@param {?CSSStyleSheet} sheet Folha da qual será removido. Se nulo, usa `View.standardSheet`
	*/
	$('static func').removeCSSRule = function(selector, sheet)
	{
		for (let i = 0, count = View.standardSheet.cssRules.length; i < count; i++) {
			let cssRule = View.standardSheet.cssRules[i]

			if (cssRule.selectorText == selector){
				if (!sheet)
					sheet = View.standardSheet
				sheet.deleteRule(i)
				break
			}
		}
	}

	/**
	 * 
	 */
	$('static func').getClassNameChain = function(object)
	{
		let result = []
		let classIterator = object.constructor.prototype

		do {
			let constructor = classIterator.constructor
			result.push('ps' + constructor.name.replace(/[A-Z]+/g, digit => '-' + digit.toLowerCase()))

			classIterator = Object.getPrototypeOf(constructor.prototype)
		}
		while (classIterator.constructor != Any)

		return result.reverse().join(' ')
	}

	/**
		Realiza uma transição animada nos elementos com a classe de estilo 'pulsar-gui-view'. Não funciona em elementos contidos em sombras.
		@method View.transit
		@param {Object} options Configuração da animação - duração, timingFunction, ...
		@param {Function} block Callback de animação.
		@param {?Function} completionHandler Executado no final da transição.
	*/
	$('static func').transit = function(options, block, completionHandler)
	{
		View.insertCSSRule({
			'.pulsar-gui-view': {
				'transition-delay': (options.delay || 0) + 's',
				'transition-duration': options.duration + 's',
				'transition-property': options.property || 'all',
				'transition-timing-function': options.timingFunction || 'ease',
				'transform': 'translation3d(0,0,0)'
			}
		})

		document.addEventListener('transitionend', function listener(event)
		{
			View.removeCSSRule('.pulsar-gui-view')
			document.removeEventListener('transitionend', listener, true)

			if (completionHandler)
				Application.dispatchAsync(completionHandler)
		}, true)

		block()
	}

	// Copia os métodos dos elementos
	;['EventTarget', 'Node', 'Element', 'HTMLElement'].forEach((className, index) => {
		let keys = Object.getOwnPropertyNames(window[className].prototype)

		keys.forEach((key, index) => {
			if (key == 'constructor') return

			let descriptor = Reflect.getOwnPropertyDescriptor(window[className].prototype, key)

			if (descriptor.value && descriptor.value.constructor.name == 'Function') {
				$('func')[key] = function() {
					return $(this).node[key].apply($(this).node, arguments);
				}
			}
			else {
				$('var')[key] = {
					get: function() { return $(this).node[key]; },
					set: function(newValue) { $(this).node[key] = newValue; }
				}
			}
		})
	})

	/** @var {String[]} View#classNames Lista de todas as classes de estilo. */
	$('var').classNames = {
		get: function() { return $(this).node.className.trim().split(/\s+/) },
		set: function(classNames) { $(this).node.className = classNames.join(' ') }
	}

	/**
		@var {Element} View#node Elemento
		@readonly
	*/
	$('readonly var').node = undefined;

	/**
		@var {View} View#superview Retorna o view contenedor (o view manipulador do elemento contenedor)
		@readonly
	 */
	$('var').superview = {
		get: function() {
			let parentNode = $(this).node.parentNode

			return parentNode ? parentNode.view : null
		}
	}

	/**
		@var {View[]} View#subviews Todos os views filhos (os views manipuladores dos nós contidos). Será criado uma instância para cada elemento que não contiver um view relacionado.
		@readonly
	*/
	$('var').subviews = {
		get: function() {
			let subviews = []
			let children = $(this).node.children

			for (let i = 0, count = children.length; i < count; i++) {
				let child = children[i]

				if (!child.view)
					subviews.push(new View(child))
				else
					subviews.push(children[i].view)
			}

			return subviews
		}
	}

	/**
		@var {CSSStyleDeclaration} View#computedStyle Estilo computado do elemento.
		@readonly
	*/
	$('var').computedStyle = {
		get: function() { return window.getComputedStyle($(this).node) }
	}

	/** @var {Bool} View#clearContextBeforeDraw Determina se o canvas deve ser limpado antes de desenhar. */
	$('var').clearContextBeforeDraw = true

	/**
		@var {ShadowRoot} View#shadow Sombra do elemento.
		@readonly
	*/
	$('readonly lazy var').shadow = Element.prototype.attachShadow ? function() {
		let shadow = $(this).node.attachShadow({mode: 'open'})
		shadow.appendChild(document.createElement('slot'))
		return shadow
	} : Element.prototype.createShadowRoot && navigator.userAgent.toLowerCase().indexOf('firefox') != -1 ? function() {
		let shadow = $(this).node.createShadowRoot()
		shadow.appendChild(document.createElement('content'))
		return shadow
	} : function() {
		let shadow = $(this).node.createShadowRoot()
		shadow.appendChild(document.createElement('slot'))
		return shadow
	}

	/**
		@var {CSSStyleSheet} View#shadowSheet Folha de estilos da sombra do elemento.
		@readonly
	*/
	$('readonly lazy var').shadowSheet = function() {
		let style = document.createElement('style')
		style.setAttribute('data-sheet', 'pulsar-gui-shadow-sheet')
		this.shadow.insertBefore(style, this.shadow.firstElementChild)
		return style.sheet
	}

	/**
		@var {HTMLCanvasElement} View#canvas Área de desenho do elemento. Por padrão, ocupa todo o espaço e possui o menor índice de profundidade.
		@readonly
	*/
	$('readonly lazy var').canvas = function() {
		let shadow = this.shadow
		let canvas = document.createElement('canvas')
		canvas.className = 'pulsar-gui-view-canvas'
		canvas.setAttribute('style', `position: absolute; z-index: ${Number.MIN_SAFE_INTEGER}; left: 0px; top: 0px; width: 100%; height: 100%; background-color: transparent`)
		canvas.width = $(this).node.offsetWidth
		canvas.height = $(this).node.offsetHeight

		shadow.insertBefore(canvas, shadow.firstChild)

		$(this).canvas = canvas;

		window.addEventListener('resize', () => {
			if (!$(this).resolution) {
				canvas.width = $(this).node.offsetWidth
				canvas.height = $(this).node.offsetHeight
			}

			this.requestDisplay()
		})

		return canvas
	}

	/** @var {Size} View#resolution Resolução do canvas. Por padrão, é igaual ao tamanho real do elemento */
	$('cached var').resolution = {
		get: function() {
			return $(this).resolution
		},
		set: function(resolution) {
			let canvas = this.canvas
			canvas.width = resolution.width
			canvas.height = resolution.height

			$(this).resolution = resolution
		}
	}

	/**
		@var {Object} View#context Contexto gráfico para o canvas. um canvas será criado e inserido no elemento no primeiro acesso
		@readonly
	*/
	$('var').context = {
		get: function() {
			return this.canvas.getContext('2d')
		}
	}

	/** @var {Bool} View#clipsToBounds Indica se o conteúdo que ultrapassar as bordas deve ser escondido (<code>style.overflow == 'hidden'</code>) */
	$('var').clipsToBounds = {
		get: function() { return $(this).node.style.overflow == 'hidden' },
		set: function(yesOrNo) { $(this).node.style.overflow = (yesOrNo) ? 'hidden' : 'visible' }
	}

	/** @var {String} View#backgroundColor Cor de fundo. Se houver um canvas, a cor deste será usada */
	$('var').backgroundColor = {
		get: function() { return $(this).node.style.backgroundColor },
		set: function(n) { $(this).node.style.backgroundColor = n }
	}

	/** @var {Bool} View#hidden Estabelece a visibilidade do elemento */
	$('var').hidden = {
		get: function() { return this.computedStyle.visibility == 'hidden' },
		set: function(yesOrNo) { $(this).node.style.visibility = (yesOrNo) ? 'hidden' : 'visible' }
	}

	/** @var {Float} View#alpha Opacidade do elemento */
	$('var').alpha = {
		get: function() { return $(this).node.style.opacity },
		set: function(n) { $(this).node.style.opacity = n }
	}

	/**
		@var {Bool} View#userInteractionEnabled Ativa ou desativa a inteeração do usuário com o elemento.
		NOTE: Melhor abordagem é criar um 'div' por cima de todos elementos em `this.shadow` (código comentado abaixo), mas com isso as animações em css são desativads
	*/
	$('cached var').userInteractionEnabled = {
		get: function() {
			return $(this).userInteractionEnabled
		},
		set: function(yesOrNo) {
			let self = $(this)
			if (self.userInteractionEnabled != yesOrNo) {
				if (yesOrNo == false) {
					for (let i = 0, count = uiEvents.length; i < count; i++)
						self.node.addEventListener(uiEvents[i], stopUserInteraction, true)
				}
				else {
					for (let i = 0, count = uiEvents.length; i < count; i++)
						self.node.removeEventListener(uiEvents[i], stopUserInteraction, true)
				}

				self.userInteractionEnabled = yesOrNo
			}
		},
		cache: true
	}
	/*{
		get: function() {
			return this.shadow.querySelector('div.pulsar-gui-view-user-interaction-manager') == null
		},
		set: function(yesOrNo) {
			let interactionManager = this.shadow.querySelector('div.pulsar-gui-view-user-interaction-manager')

			if (yesOrNo == (interactionManager == null)) { return }

			if (yesOrNo == false) {
				interactionManager = document.createElement('div')
				interactionManager.className = 'pulsar-gui-view-user-interaction-manager'
				interactionManager.setAttribute('style', `z-index: ${Number.MAX_SAFE_INTEGER}; position: absolute; left: 0; top: 0; width: 100%; height: 100%`)
				this.shadow.appendChild(interactionManager)
			}
			else {
				this.shadow.removeChild(interactionManager)
			}
		}
	}*/

	/** @var {Rectangle} View#frame Valor em pixels da coordenada e tamanho */
	$('var').frame = {
		get: function() {
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
			$(this).node.style.left = newFrame.origin.x + 'px';
			$(this).node.style.top = newFrame.origin.y + 'px';
			$(this).node.style.width = newFrame.size.width + 'px';
			$(this).node.style.height = newFrame.size.height + 'px';
		}
	}

	/** @var {View~DrawMethod} View#drawMethod Função utilizada para desenhar no canvas. */
	$('var').drawMethod = null

	/**
		Constrói um view com o nome ou elemento especificado
		@constructs View
		@method View#init
		@param {?String|Element} node Nome do elemento a ser criado, ou referência a um já existente. Se `nulo`, será usado <code>'div'</code>.
		@param {?Object<String, String>} attributes Atributos a serem adicionados ao elemento.
		@param {?View~DrawMethod} drawMethod Função a ser chamada nas operções de desenho no canvas.
		@param {?Size} resolution Resolução do canvas. Se nulo, usa o tamanho real.
	*/
	$('func').init = function(node, attributes, drawMethod, resolution)
	{
		if (node == null)
			node = 'div'

		if ((typeof node) == 'string')
			node = document.createElement(node)

		for (let key in attributes)
			node.setAttribute(key, attributes[key])

		Reflect.defineProperty(node, 'view', { value: this })
		$(this).node = node
		this.addClassName(this.classNameChain)

		if (drawMethod)
			this.drawMethod = drawMethod
		if (resolution)
			this.resolution = resolution
	}

	/**
		Adiciona a classe de estilo especificada, se já não existir.
		@method View#addClassName
		@param {String} name Nome da classe.
	*/
	$('func').addClassName = function(name)
	{
		if ($(this).node.className.indexOf(name.trim()) == -1)
			$(this).node.className += ' ' + name
	}

	/**
		Remove a classe de estilo especificada, se existir.
		@method View#removeClassName
		@param {String} name Nome da classe.
	*/
	$('func').removeClassName = function(name)
	{
		let classNames =  $(this).node.className.split(' ')
		name = name.trim()

		for (let i = 0, count = classNames.length; i < count; i ++) {
			if (classNames[i] == name) {
				classNames.splice(i, 1); break
			}
		}

		$(this).node.className = classNames.join(' ')
	}

	/**

	*/
	$('lazy var').classNameChain = function () {
		return View.getClassNameChain(this)
	}

	/**
		Adiciona o elemento de `subview` ao elemento de `this`
		@method View#addSubview
		@param {View} subview O view a ser adicionado
	*/
	$('func').addSubview = function(subview)
	{
		$(this).node.appendChild($(subview).node)

		if (subview.drawMethod)
			subview.requestDisplay()
	}

	/**
		Adiciona o elemento de `subview` na posição especificada.
		@method View#insertSubview
		@param {View} subview O view a ser adicionado.
		@param {View|Number} Índice da posição. Se for do tipo `View, inser atrás deste, senão, insere na posição numérica.
	*/
	$('func').insertSubview = function(subview, index)
	{
		if (index.constructor.name == 'Number')
			$(this).node.insertBefore($(subview).node, $(this).node.children(index))
		else
			$(this).node.insertBefore($(subview).node, index.node)
	}

	/**
		Remove todos os subviews e insere os especificados
		@method View#setSubviews
		@param {View[]} subviews Os views a serem adicionados
	*/
	$('func').setSubviews = function(subviews)
	{
		while ($(this).node.firstChild)
			$(this).node.removeChild($(this).node.firstChild)

		for (var i = 0, count = subviews.length; i < count; i++)
			this.addSubview(subviews[i]);
	}

	/**
		Remove o elemento de `this` do elemento contenedor
		@method View#removeFromSuperview
	*/
	$('func').removeFromSuperview = function()
	{
		let parentNode = $(this).node.parentNode

		if (parentNode)
			parentNode.removeChild($(this).node);
	}

	/**
		Remove `currentSubview` e insere `newSubview` em seu lugar. O reposicionamento pode ser animado para os dois views.
		@method View#replaceSubview
		@param {?View} currentSubview View a ser removido.
		@param {?Object} exitAnimation Propriedades a serem animadas em `currentSubview`.
		@param {?View} newSubview View a ser adicionado.
		@param {?Object} enterAnimation Propriedades a serem animadas em `newSubview`.
		@param {?Object} options Configuração da animação - duração, timingFunction, ...
		@param {?Function} completionHandler Executado no final da transição.
		@param {?Bool} insertBefore Determina se `newSubview` deve ser adicionado antes ou depois de `currentSubview`. Só tem utilidade quando a troca for animada.
	*/
	$('func').replaceSubview = function(currentSubview, exitAnimation, newSubview, enterAnimation, options, completionHandler, insertBefore)
	{
		if (currentSubview) {
			currentSubview.removeFromSuperview()
		}

		if (newSubview) {
			this.addSubview(newSubview)
		}

		if (completionHandler)
			completionHandler()

		/*if (currentSubview) {
			currentSubview.transit(options || { duration: 2.25 }, exitAnimation, () => {
				currentSubview.removeFromSuperview()

				if (!newSubview && completionHandler)
					completionHandler()
			})
		}

		if (newSubview) {
			(insertBefore && currentSubview) ? this.insertSubview(newSubview, currentSubview) : this.addSubview(newSubview)
			newSubview.transit(options || { duration: 2.25 }, enterAnimation, () => {
				if (currentSubview && !exitAnimation)
					currentSubview.removeFromSuperview()
				if (completionHandler)
					completionHandler()
			})
		}*/
	}

	/**
		Realiza uma cópia de `this`.
		@param {Bool} deep Determina se os subelementos devem ser clonados também.
		@returns Uma cópia de `this`.
		// TODO: Clonar propriedades de `this` também, e os views dos subelementos.
	*/
	$('func').clone = function(deep)
	{
		let cloned = new View($(this).node.cloneNode(deep || true))
		return cloned
	}

	$('func').translatePoint = function(point, from)
	{
		if (!point) point = { x:0, y:0 }
		if (from instanceof View) from = from.node
		const to = $(this).node

		if (!from.offsetParent || !to.offsetParent)
			throw new Error('Impossible to determine the positions')

		function translate(nodes)
		{
			const p = { x: point.x, y: point.y }
			let iterator = nodes.child

			while (iterator != nodes.parent) {
				p.x += iterator.offsetLeft
				p.y += iterator.offsetTop

				iterator = iterator.offsetParent
			}

			return p
		}

		let rootFrom = from.offsetParent
		let rootTo = to.offsetParent

		while (rootFrom.offsetParent)
			rootFrom = rootFrom.offsetParent
		while (rootTo.offsetParent)
			rootTo = rootTo.offsetParent

		if (rootFrom != rootTo)
			throw new Error('There is no commun parent')

		const fromPoint = translate({ child: from, parent: rootTo })
		const toPoint = translate({ child: to, parent: rootTo })

		return { x: fromPoint.x - toPoint.x, y: fromPoint.y - toPoint.y }
	}

	$('func').translateFrame = function(frame, from)
	{
		if (from instanceof View) from = from.node
		if (!frame) frame = { origin: { x:0, y:0 }, size: { width: from.offsetWidth, height: from.offsetHeight } }

		frame.origin = this.translatePoint(frame.origin, from)

		return frame
	}

	/**
		@const {String[]} View.uiEvents Lista com os nomes dos eventos de interface gráfica.
		@private
	*/
	// TODO: Melhorar. Adicionar outros...
	const uiEvents = ['mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'mousedrag', 'click', 'dbclick', 'keydown', 'keyup', 'keypress', 'dragdrop']

	/**
		Interrompe a propagação do evento especificado.
		@method View.stopUserInteraction
		@private
		@param {Event} event Evento a ser interrompido a propagação.
	*/
	function stopUserInteraction(event)
	{
		event.stopPropagation()
		event.preventDefault()
	}

	/**
		Configura o elemento conforme o coder especificado. É utilizada por {@link Storyboard} ao carregar as cenas
		@method View#setupWithCoder
		@param {Coder} coder Objeto com o elemento a ser codificado
	*/
	$('func').setupWithCoder = function(coder)
	{
		coder.copyAttributesTo($(this).node)

		var data = coder.evalData('keys');

		for (var key in data)
			this[key] = data[key];

		var controller = coder.controller;

		// Estabelece a referência no controlador
		if (coder.element.hasAttribute('ps-outlet'))
			controller[coder.element.getAttribute('ps-outlet')] = this

		var events = coder.listData('events');

		for (var key in events)
			$(this).node.addEventListener(key, controller[events[key]].bind(controller, this));

		var segue = coder.rawData('segue')

		if (segue) {
			$(this).node.addEventListener('mouseup', (event) => {
				controller.performSegue(segue, this);
			});
		}

		return Coder.CHILDREN_NOT_PROCCESSED;
	}

	/**
		Estabelece os attributos de estilo especificados
		@method View#changeStyle
		@param {Object<String, String>} style Valores a serem estabelecidos
	 */
	$('func').changeStyle = function(style)
	{
		for (var key in style)
			$(this).node.style[key] = style[key];
	}

	/**
		Requisita a atualização da pintura.
		@method View#requestDisplay
	*/
	// TODO: Usar `window.requestAnimationFrame` e otimizar mais.
	$('func').requestDisplay = function()
	{
		if (!$(this).askedToDisplay && this.drawMethod) {
			$(this).askedToDisplay = true
			Application.dispatchAsync(() => {
				let context = this.context

				if (!this.resolution) {
					context.canvas.width = this.offsetWidth
					context.canvas.height = this.offsetHeight
				}
				if (this.clearContextBeforeDraw)
					context.clearRect(0.0, 0.0, context.canvas.width, context.canvas.height)
				this.drawMethod(context)
				$(this).askedToDisplay = false
			})
		}
	}

	/**
		Efetua uma transição animada via JavaScript ou CSS.
		@method View#transit
		@param {Object} options Configuração da animação - duração, timingFunction, ...
		@param {Object} properties Propriedades a serem animadas.
		@param {?Function} completionHandler Executado no final da transição.
		@param {?String} cssOrJs Se 'js', anima com JavaScript. Se 'css', anima com CSS. Se nulo, o valor é detectado automaticamente em função da sombra do elemento (animações css não funcionam em elementos contidos na sombra).
	*/
	$('func').transit = function(options, properties, completionHandler, cssOrJs)
	{
		Application.dispatchAsync(() => {
			if (cssOrJs) {
				$(this)[cssOrJs + 'Transit'](options, properties, completionHandler)
			}
			else {
				let iteratorNode = this.node.parentElement

				while (iteratorNode) {
					if (iteratorNode.shadowRoot) {
						$(this).jsTransit(options, properties, completionHandler); return
					}

					iteratorNode = iteratorNode.parentElement
				}

				$(this).cssTransit(options, properties, completionHandler)
			}
		})
	}

	/**
		Adiciona `handler` como manipulador do evento `eventName` ocorrido no borbulhamento.
		@method View#on
		@param {String} eventName Nome do evento.
		@param {View~EventCallback} handler Manipulador do evento.
		@return {View} Uma referência a `this`
	*/
	$('func').on = function(eventName, handler)
	{
		$(this).node.addEventListener(eventName, handler, false)

		return this
	}

	/**
		Remove `handler` como manipualdor do evento `eventName` ocorrido no borbulhamento.
		@method View#off
		@param {String} eventName Nome do evento.
		@param {View~EventCallback} handler Manipulador do evento.
		@return {View} Uma referência a `this`
	*/
	$('func').off = function(eventName, handler)
	{
		$(this).node.removeEventListener(eventName, handler, false)

		return this
	}

	/**
		Executado pelo procedimento de desenho.
		@callback View~DrawMethod
		@param {CanvasRenderingContext2D} context Contexto gráfico.
	*/

	/**
		Manipulador de eventos.
		@callback View~EventCallback
		@param {Event} event Evento gerado.
	*/

	/**
		@var {Bool} View#askedToDisplay Determina se o view já está registrado para a próxima atualização da pintura.
		@private
	*/
	// TODO: Usar WeakSet
	$('private var').askedToDisplay = false

	/**
		Efetua uma transição animada via JavaScript.
		@method View#jsTransit
		@private
		@param {Object} options Configuração da animação - duração, timingFunction, ...
		@param {Object} properties Propriedades a serem animadas.
		@param {?Function} completionHandler Executado no final da transição.
	*/
	// TODO: Usar `window.requestAnimationFrame`
	$('private func').jsTransit = function(options, properties, completionHandler)
	{
		let transition = new Transition(options.duration)
		let steps = null

		if (options.duration)
			options.duration = 0.5
		if (!options.timingFunction)
			options.timingFunction = 'ease'

		if (options.timingFunction.constructor.name != 'String') {
			steps = transition.transitionTimingCubicBezier(options.timingFunction[0], p2 = options.timingFunction[1])
		}
		else {
			steps = transition[{
				'ease': 'transitionTimingEase',
				'linear': 'transitionTimingLinear',
				'ease-in': 'transitionTimingEaseIn',
				'ease-out': 'transitionTimingEaseOut',
				'ease-in-out': 'transitionTimingEaseInOut'
			}[options.timingFunction]]()
		}

		let initialStyle = {}
		let offsetStyle = {}
		let computedStyle = this.computedStyle

		for (let key in properties) {
			properties[key] = new Metric(properties[key])
			initialStyle[key] = new Metric(computedStyle[key], properties[key].mu)
			offsetStyle[key] = properties[key].sub(initialStyle[key])
		}

		let timer = null

		let refresh = () =>
		{
			let step = steps.next()

			if (step.done) {
				clearInterval(timer)

				if (completionHandler)
					completionHandler()
			}
			else {
				for (let key in properties)
					this.style[key] = initialStyle[key].sum(offsetStyle[key].mul(step.value)).toString()
			}
		}

		if (options.delay)
			setTimeout(() => { timer = setInterval(refresh, 1000 / Transition.FRAME_RATE) }, options.delay * 1000)
		else
			timer = setInterval(refresh, 1000 / Transition.FRAME_RATE)
	}

	/**
		Efetua uma transição animada via CSS.
		@method View#cssTransit
		@private
		@param {Object} options Configuração da animação - duração, timingFunction, ...
		@param {Object} properties Propriedades a serem animadas.
		@param {?Function} completionHandler Executado no final da transição.
	*/
	$('private func').cssTransit = function(options, properties, completionHandler)
	{
		options = {
			'transition-delay': (options.delay || 0) + 's',
			'transition-duration': options.duration + 's',
			'transition-property': options.property || 'all',
			'trnasition-timing-function': options.timingFunction || 'ease',
			'transform': 'translation3d(0,0,0)'
		}

		let self = this
		let originalOptions = new Dictionary(this.node.style, Object.keys(options))

		this.addEventListener('transitionend', function listener(event)
		{
			self.removeEventListener('transitionend', listener, true)
			self.changeStyle(originalOptions)

			if (completionHandler)
				Application.dispatchAsync(completionHandler)
		}, true)

		this.changeStyle(options)
		this.changeStyle(properties)
	}
})
