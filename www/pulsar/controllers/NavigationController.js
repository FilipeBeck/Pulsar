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
	@fileoverview Contém a classe para controlar a navegação.
*/

$.import(['ViewController.js', '../gui/NavigationBar.js']);

Pulsar.class('NavigationController', 'ViewController', function($)
{
	$.initialization = function() {
		View.insertCSSRules({
			'.ps-navigation-controller': {
				'display': 'flex',
				'flex-direction': 'column',
				//'align-items': 'stretch',
				//'align-content': 'stretch',
				'width': '100%',
				'height': '100%',
        '.ps-navigation-bar': {
          'flex': 1,
          'flex-basis': '50px',
          'flex-shrink': 0,
          'flex-grow': 0,
          'box-shadow': '1px 1px 1px'
        },
				'.content-view': {
					'flex': 1
				}/*,
        '.subview': {
          'margin-left': '100%',
  				'background-color': 'white',
  				'box-shadow': '0px 0px 20px #112244',
  				'width': '100%',
  				'height': '100%',
  				'flex': 1
        }*/
			},
		})
	}

	/** @const {ViewController[]} controllers Controladores carregados. */
	$('let').controllers = $.new('Array');

	/**
		@var {ViewController} rootController Controlador raiz.
		@readonly
	*/
	$('var').rootController = {
		get: function() { return this.controllers[0] }
	}

	/**
		@var {ViewController} topController Último controlador carregado.
		@readonly
	*/
	$('var').topController = {
		get: function() { return this.controllers[this.controllers.length - 1] }
	}

	$('readonly var').navigationBar = null

	$('readonly var').contentView = null

	$('private let').eventListeners = $.new('Dictionary', {
		left: null,
		right: null
	})

	$('func').init = function()
	{
		this.super(ViewController, 'init', ...arguments)

		//$(this).navigationBar = new NavigationBar();
		$(this).backEventListener = this.popController.bind(this);
	}

	$('func').viewDidLoad = function()
	{
		this.super(ViewController, 'viewDidLoad')

    if (!$(this).navigationBar)
			$(this).navigationBar = new NavigationBar()

    if (!$(this).contentView)
  		$(this).contentView = new View()

		this.view.addClassName('ps-navigation-controller')
    this.contentView.addClassName('content-view')
		this.view.addSubview($(this).navigationBar)
    this.view.addSubview($(this).contentView)

		this.storyboard.instantiateSceneWithIdentifier(this.connections.querySelector('root').getAttribute('identifier'), rootController => {
			this.pushController(rootController);
		});
	}

	$('func').setupWithCoder = function(coder)
	{
		coder.cloneWith(coder.tag('view')).whenChildIs({
			'navigationBar': subCoder => {
				var node = subCoder.injectAttribute('ps-kind', 'NavigationBar').proccessElement('div')
				$(this).navigationBar = node.view || new NavigationBar(node)//(node.view != undefined) ? node.view : new View(node);

        return Coder.DESTROY
			},
			'contentView': subCoder => {
        $(this).contentView = subCoder.injectAttribute('ps-kind', 'View').proccessElement('div').view

        return Coder.DESTROY
			}
		}, true)

    this.super(ViewController, 'setupWithCoder', coder)


		return Coder.CHILDREN_WAS_PROCCESSED
	}

	$('func').pushController = function(controller)
	{
		controller.view.addClassName('subview')

		//this.view.userInteractionEnabled = false

		//this.contentView.replaceSubview(this.topController && this.topController.view, { 'margin-left': '-20%' }, controller.view, { 'margin-left': '0%' }, { duration: 0.375, timingFunction: 'ease-out' }, () => { this.view.userInteractionEnabled = true })
    let topController = this.topController

    if (topController)
      topController.view.removeFromSuperview()

		this.contentView.addSubview(controller.view)

    this.controllers.push(controller)

		$(this).navigationBar.pushNavigationItem(controller.navigationItem);

		if (!controller.navigationItem.left)
		{
			var node = $(this).navigationBar.left.node;

			for (var i = 0, count = node.children.length; i < count; i++)
				node.children[i].addEventListener('mouseup', $(this).backEventListener);
		}

		controller.parent = this;
	}

	$('func').popController = function()
	{
    if (!this.controllers.length)
      return

		var topController = this.controllers.pop();

		if (!topController.navigationItem.left)
		{
			var node = $(this).navigationBar.left.node;

			for (var i = 0, count = node.children.length; i < count; i++)
				node.children[i].removeEventListener('mouseup', $(this).backEventListener);
		}

		$(this).navigationBar.popNavigationItem(() => {
			if (!this.topController.navigationItem.left)
			{
				var node = $(this).navigationBar.leftView.node;

				for (var i = 0, count = node.children.length; i < count; i++)
					node.children[i].addEventListener('mouseup', $(this).backEventListener);
			}
		});

		topController.view.removeFromSuperview()
		this.contentView.addSubview(this.topController.view)

		//this.contentView.replaceSubview(topController.view, { 'margin-left': '100%' }, this.topController && this.topController.view, { 'margin-left': '0%' }, { duration: 0.375, timingFunction: 'ease-out' }, null, true)
	}

	$('private var').backEventListener = undefined;
})
