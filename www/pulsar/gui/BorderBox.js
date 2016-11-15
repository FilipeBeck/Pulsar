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
	@fileoverview Contém a classe para facilitar o uso de views com cabeçalho, rodapé e laterais.
*/

$.import('View.js')

/**
  Representa um view com cabeçalho, rodapé, laterais e conteúdo central. Esses views podem ser acessados diretamente através das respectivas propriedades.
  @class BorderBox
  @extends View
*/
Pulsar.class('BorderBox', 'View', function($)
{
  $.initialization = function()
  {
    View.insertCSSRules({
      '.pulsar-gui-border-box': {
        'display': 'flex',
        'flex-flow': 'column',
        'align-items': 'stretch'
      },
      '.pulsar-gui-border-box *': {
        'vertical-align': 'middle'
      },
      '.pulsar-gui-border-box .top': {
        'flex': 1,
        'order': 1
      },
      '.pulsar-gui-border-box .content-view': {
        'display': 'flex',
        'flex': 4,
        'order': 2
      },
      '.pulsar-gui-border-box .bottom': {
        'flex': '1',
        'order': 3
      },
      '.pulsar-gui-border-box > .content-view .left': {
        'flex': '1 20%',
        'order': 1,
      },
      '.pulsar-gui-border-box > .content-view .center': {
        'flex': '4 1 80%',
        'order': 2
      },
      '.pulsar-gui-border-box > .content-view .right': {
        'flex': '1 1 20%',
        'order': 3
      }
    })
  }

  /** @const {View} BorderBox#top View do topo - cabeçalho. Ocupa toda a largura */
  /** @const {View} BorderBox#right View da direita. Ocupa toda a altura */
  /** @const {View} BorderBox#bottom View da base - rodapé. Ocupa toda a largura */
  /** @const {View} BorderBox#left View da esquerda. Ocupa toda a altura */
  /** @const {View} BorderBox#center View do centro. Ocupa todo o espaço restante */
  ;[ ['top', 'header'], ['left', 'aside'], ['center', 'article'], ['right', 'aside'], ['bottom', 'footer'] ].forEach(function(value) {
    $('let')[value[0]] = $.new('View', value[1], { 'class': value[0] })
  })

  $('let').contentView = $.new('View', 'div', { class: 'content-view' })

  /**
    Inicializa os subviews
    @constructs BorderBox
    @method BorderBox#init
  */
  $('func').init = function()
  {
    this.super(View, 'init', ...arguments)
    this.addClassName('pulsar-gui-border-box')

    this.addSubview(this.top)
    this.addSubview(this.bottom)

    this.addSubview(this.contentView)

    ;['left', 'center', 'right'].forEach((value) => {
      this.contentView.addSubview(this[value])
    })
  }

  /**
    Realiza o setup de cada subview com a respectiva tag de mesmo nome
    @override
    @method BorderBox#setupWithCoder
    @param {Coder} coder O coder com o elemento XML
  */
  $('func').setupWithCoder = function(coder)
  {
    this.super(View, 'setupWithCoder', coder)

    ;['top', 'left', 'center', 'right', 'bottom'].forEach((value) => {
      let element = coder.element.querySelector(value)

      if (element) {
        let subCoder = coder.cloneWith(element)
        this[value].setupWithCoder(subCoder)
        subCoder.proccessChildrenTo(this[value].node)
      }
    })

    return Coder.CHILDREN_WAS_PROCCESSED
  }
})
