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
	@fileoverview Contém a classe para processar elementos XML em elementos HTML
*/

/**
	Classe para decodificar views a partir de elementos xml
	@class Coder
*/
Pulsar.class('Coder', function($)
{
	/** @const {Integer} Coder.CHILDREN_NOT_PROCCESSED Identifica o não processamento dos subelementos */
	$('static let').CHILDREN_NOT_PROCCESSED = 0

	/** @const {Integer} Coder.CHILDREN_WAS_PROCCESSED Identifica o processamento dos subelementos. */
	$('static let').CHILDREN_WAS_PROCCESSED = 1

	/***/
	$('static let').DESTROY = 2

	/** @var {Element} Coder#element Elemento xml a ser processado */
	$('var').element = undefined

	/** @var {ViewController} Coder#controller Controlador do view */
	$('var').controller = undefined

	/**
		Constrói um coder com o elemento e controlador especificados
		@constructs Coder
		@method Coder#init
		@param {Element|String} elemento Um elemnto xml ou uma string como template.
		@param {?ViewController} controller Controlador
	*/
	$('func').init = function(element, controller)
	{
		if (element.constructor.name == 'String')
			element = new DOMParser().parseFromString(element, 'text/xml').documentElement

		this.element = element
		this.controller = controller
	}

	/**
		TODO: Adicionar comentários.
	*/
	$('func').tag = function(name)
	{
		return this.element.querySelector(name)
	}

	/**
		TODO: Adicionar comentários.
	*/
	$('func').injectAttribute = function(name, value)
	{
		if (!this.element.hasAttribute(name))
			this.element.setAttribute(name, value)

		return this
	}

	/**
		Decodifica o atributo especificado através de `eval`. Os valores devem ser separados por vírgula, e os caracteres '{' e '}' serão inseridos automaticamente no inicio e no fim da string.
		@method Coder#evalData
		@param {String} attr Sufixo do nome do atributo a ser decodificado. A string 'ps-' será automaticamente prefixada ao valor.
		@returns {Object} O objeto decodificado, ou um objeto vazio se o atributo não existir.
	*/
	$('func').evalData = function(attr)
	{
		let completeName = 'ps-' + attr

		return (this.element.hasAttribute(completeName)) ? eval('({' + this.element.getAttribute(completeName) + '})') : {}
	}

	/**
		Decodifica o atributo especificado em formato JSON através de `JSON.parse`. Os valores devem ser separados por vírgula, e os caracteres '{' e '}' serão inseridos automaticamente no início e no fim da string
		@method Coder#jsonData
		@param {String} attr Sufixo do nome do atributo a ser decodificado. A srting 'ps-' será automaticamente prefixada ao valor
		@returns {Object} O objeto decodificado, ou um objeto vazio se o atributo não existir.
	*/
	$('func').jsonData = function(attr)
	{
		let completeName = 'ps-' + attr

		return (this.element.hasAttribute(completeName)) ? JSON.parse('{' + this.element.getAttribute(completeName) + '}') : {}
	}

	/**
		Decodifica o atributo especificado como um dicionário de strings. Os valores devem ser separados por vírgula, e os caracteres '{' e '}' serão inseridos automaticamente no início e no fim da string
		@method Coder#listData
		@param {String} attr Sufixo do nome do atributo a ser decodificado. A srting 'ps-' será automaticamente prefixada ao valor
		@returns {Object} O objeto decodificado, ou um objeto vazio se o atributo não existir.
	*/
	$('func').listData = function(attr)
	{
		let completeName = 'ps-' + attr
		let list = {}

		if (this.element.hasAttribute(completeName)) {
			let lines = this.element.getAttribute('ps-' + attr).split(',')

			for (let i = 0, count = lines.length; i < count; i++) {
				let line = lines[i]

				if (line != '') {
					let tuple = line.split(':')
					list[tuple[0].trim()] = tuple[1].trim()
				}
			}
		}

		return list;
	}

	/**
		Retorna o valor bruto do atributo especificado.
		@method Coder#rawData
		@param {String} attr Sufixo do nome do atributo. A string 'ps-' será automaticamente prefixada ao valor
		@returns {String} O valor do atributo, ou uma string vazia se o atributo não existir.
	*/
	$('func').rawData = function(attr)
	{
		return this.element.getAttribute('ps-' + attr) || ''
	}

	/**
		Cria uma cópia de `this' com o elemento e controlador especificados.
		@method Coder#cloneWith
		@param {?Element} element Elemento xml. Se nulo, usa o elemento atual de `this'
		@param {?ViewController} Controlador. Se nulo, usa o controlador atual de `this`
		@returns {Coder} O novo objeto
	*/
	$('func').cloneWith = function(element, controller)
	{
		return new Coder(element || this.element, controller || this.controller)
	}

	/**
		Cria uma cópia de 'this' para cada subelemento.
		@method Coder#explode
		@returns {Coder[]} Um array com os coders para cada subelemento
	*/
	$('func').explode = function()
	{
		let children = this.element.children
		let coders = []

		for (let i = 0, count = children.length; i < count; i++)
			coders.push(new Coder(children[i], this.controller))

		return coders
	}

	/**
		Processa o elemento, criando os elementos HTML e delegando o setup para os possíveis views e controlador
		@method Coder#proccessElement
		@param {?String} nameForTag O nome da tag. Se nulo, usa o nome do elemento xml
		@returns {Element} O elemento HTML processado
	*/
	$('func').proccessElement = function(nameForTag)
	{ // Insere texto
		if (this.element.nodeType == Node.TEXT_NODE) {
			return document.createTextNode(this.element.data)
		} // Insere outros elementos
		else {
			let newNode = document.createElement(nameForTag || this.element.tagName)
			let proccessChildren = true
			// Se possui classe, cria a instância e delega o setup
			if (this.element.hasAttribute('ps-kind')) {
				let newView = new window[this.element.getAttribute('ps-kind')](newNode)
				// Delega o setup
				if (newView.setupWithCoder(this) != Coder.CHILDREN_NOT_PROCCESSED)
					proccessChildren = false;
			} // Se não possui classe, apenas copia os atributos (e a seguir, os subelementos)
			else {
				this.copyAttributesTo(newNode)
			}
			// Processa os subelementos se o setup do view já não o fez, ou se não houver classe definida para o elemento
			if (proccessChildren)
				this.proccessChildrenTo(newNode)

			return newNode;
		}
	}

	/**
		Copia os atributos do elemento xml para o elemento especificado
		@method Coder#copyAttributesTo
		@param {Element} node Elemento aonde serão copiados os atributos
	*/
	$('func').copyAttributesTo = function(node, exceptionList)
	{
		let attributes = this.element.attributes;

		for (let i = 0, count = attributes.length; i < count; i++) {
			let attr = attributes[i];
			node.setAttribute(attr.name, !node.hasAttribute(attr.name) ? attr.value : node.getAttribute(attr.name) + ' ' + attr.value);
		}
	}

	/**
		Decodifica os subelementos the `this.element` e os adiciona ao elemento especificado
		@method Coder#proccessChildrenTo
		@param {Element} parent Elemento aonde serão adicionados os subelementos processados
	*/
	$('func').proccessChildrenTo = function(parent)
	{ // Backup do elemento original
		let originalElement = this.element;
		let children = this.element.childNodes;

		for (let i = 0, count = children.length; i < count; i++) {
			this.element = children[i];
			parent.appendChild(this.proccessElement());
		}
		// Restaura o elemento original
		this.element = originalElement;
	}

	/**
		Testa o objeto especificado contra o nome da tag dos subelementos e invoca a função definida pela chave com o mesmo nome, se houver.
		@method Coder#whenChildIs
		@param {Object<String,Function>} caseList Um objeto com as chaves a serem comparadas. Se houver algum elemento com a tag de mesmo nome, a função estabelecida para esta chave será invocada com o elemento correspondente como parâmetro se `shouldClone` for falso, senão, o parâmetro será um coder clonado com o elemento especificado.
		@param {Bool} shouldClone Determina se o parâmetro da função de callback deve ser um coder clonado ou apenas elemento.
	*/
	$('func').whenChildIs = function (caseList, shouldClone)
	{
		for (let i = 0, count = this.element.children.length; i < count; i++) {
			let child = this.element.children[i]

			if (caseList[child.tagName])
				if ((caseList[child.tagName](shouldClone ? this.cloneWith(child) : child)) == Coder.DESTROY)
					this.element.removeChild(child)
		}
	}
})
