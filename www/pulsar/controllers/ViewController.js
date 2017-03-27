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
	@fileoverview Contém a classe controladora de views.
*/

$.import('../gui/View.js');

/**
	Classe controladora de views.
	@class ViewController
*/
Pulsar.class('ViewController', function($)
{
	/** @var {View} ViewController#view View sendo controlado. */
	$('var').view = null

	/** @var {ViewController} ViewController#parent Controlador contenedor deste, se houver. */
	$('var').parent = null

	/** @var {Storyboard} ViewController#storyboard Storyboard que instanciou o controlador, se houver. */
	$('var').storyboard = null

	/** @var {Object} ViewController#navigationItem Item com conteúdo a ser exibido na barra de navegação, se houver */
	$('var').navigationItem = null

	/** @var {Element[]} ViewController#connections Conexões com outras cenas */
	$('var').connections = null

	/** */
	$('lazy var').classNameChain = function() {
		return View.getClassNameChain(this)
	}

	/**
		Cria um controlador com o storyboard e controlador contenedor especificados
		@constructs ViewController
		@method ViewController#init
		@param {?Storyboard} storyboard O storyboard que instanciou o controlador
		@param {?ViewController} parent  Controlador contenedor.
	*/
	$('func').init = function(storyboard, parent)
	{
		this.storyboard = storyboard
		this.parent = parent
	}

	/**
		Configura o item de navegação, view e conexões.
		@override
		@method ViewController#setupWithCoder
		@param {Coder} coder Objeto com o elemento a ser codificado
	*/
	$('func').setupWithCoder = function(coder)
	{
		coder.whenChildIs({
			navigationItem: child => {
				this.navigationItem = {}

				for (let j = 0, count = child.children.length; j < count; j++)
				{
					let subChild = child.children[j]
					let node = coder.cloneWith(subChild).proccessElement('div');

					if (subChild.tagName == 'back')
						node.addEventListener('mouseup', this.backFromSegue.bind(this));

					this.navigationItem[subChild.tagName] = node.view || new View(node)
				}
			},
			view: child => {
				var node = coder.cloneWith(child).proccessElement('div');
				this.view = node.view || new View(node);//(node.view != undefined) ? node.view : new View(node);
				this.view.addClassName(this.classNameChain)
			},
			connections: child => {
				this.connections = child
			}
		})

		return Coder.CHILDREN_WAS_PROCCESSED
	}

	/**
		Executado após o view ter sido completamente carregado.
		@method ViewController#viewDidLoad
	*/
	$('func').viewDidLoad = function()
	{
		this.view.clipsToBounds = true
	}

	/**
		TODO: Manipular diferentes configurações de acordo com os parâmetros das conexões.
	*/
	$('func').performSegue = function(identifier, sender)
	{
		this.storyboard.instantiateSceneWithIdentifier(identifier, controller => {
			this.parent.pushController(controller)
		})
	}

	/**
		TODO: Manipular diferentes configurações de acordo com os parâmetros das conexões.
	*/
	$('func').backFromSegue = function()
	{
		this.parent.popController();
	}
})
