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
	@fileoverview Contém a classe para gerenciar um arquivo ou pasta específico contendo cenas no formato XML.
*/

$.import('Coder.js');

/**
	Representa um conjunto de cenas interligadas. Estas cenas estão no formato XML e podem estar contidas todas em um único arquivo, ou um arquivo para cada cena sob o mesmo diretório.
	@class Storyboard
*/
Pulsar.class('Storyboard', function($)
{
	/** @const {Integer} Storyboard.FILE_TYPE Constante usada para identificar cenas contidas em um arquivo */
	$('static let').FILE_TYPE = true

	/** @const {Integer} Storyboard.FOLDER_TYPE Constante usada para identificar cenas contidas em uma pasta */
	$('static let').FOLDER_TYPE = false

	/**
		@var {String} Storyboard#url Caminho do arquivo ou pasta contendo as cenas
		@readonly
	*/
	$('readonly var').url = undefined

	/**
		@var {Integer} Storyboard#fileOrFolder Especifica se a URL identifica um arquivo ou uma pasta.
		@readonly
	*/
	$('readonly var').fileOrFolder = undefined

	/**
		@var {XMLDocument} Storyboard#data Conteúdo do recurso.
		@private
	*/
	$('private var').data = null

	/**
		Constrói um storyboard com a URL e tipo especificado
		@constructs Storyboard
		@method Storyboard#init
		@param {String} url Caminho do recurdo.
		@param {Integer} fileOrFolder Identifica se o recurso é um arquivo ou uma pasta.
	*/
	$('func').init = function(url, fileOrFolder)
	{
		$(this).url = url
		$(this).fileOrFolder = fileOrFolder
	}

	/**
		Carrega o conteúdo do recurso. Se a URL for uma pasta, apenas cria um documento XML vazio e executa o manipulador de finalização.
		@method Storyboard#load
		@param {Function} completionHandler Executado após terminar o carregamento.
		@returns {Storyboard} Referência à `this`
	*/
	$('func').load = function(completionHandler)
	{ // Arquivo
		if ($(this).fileOrFolder == Storyboard.FILE_TYPE) {
			Factory.load($(this).url, (request) => {
				// NOTE: Arquivos locais funcionam com responseXML. Verificar cabeçalhos...
				let response = $(this).data = new DOMParser().parseFromString(request.responseText, 'application/xml')
				let dependencies = response.querySelector('document > dependencies')

				$(this).loadDependencies(dependencies, () => {
					completionHandler()
				})
			})
		} // Pasta
		else {
			$(this).data = new DOMParser().parseFromString('<document></document>', 'application/xml')

			if (completionHandler != undefined)
				completionHandler()
		}

		return this
	}

	/**
		Carrega as dependências especificadas
		@method Storyboard#loadDependencies
		@param {HTMLCollection} dependencies Elementos com os atributos `src` e `base-type`
		@param {Function} completionHandler Executado após terminar o carregamento
		@private
	*/
	$('private func').loadDependencies = function(dependencies, completionHandler)
	{
		if (dependencies != null) {
			let children = dependencies.children

			for (let i = 0, count = children.length; i < count; i++) {
				let child = children[i]

				if (child.tagName.toLowerCase() == 'script') {
					Factory.import((child.getAttribute('src') || child.getAttribute('href')), child.getAttribute('base-type'))
				}
				else {
					let link = document.createElement('link')
					link.href = child.getAttribute('href')
					link.rel = 'stylesheet'
					link.type = 'text/css'
					document.head.appendChild(link)
				}
			}

			Factory.arrive(completionHandler)
		}
		else {
			completionHandler()
		}
	}

	/**
		Carrega a cena inicial. Se `this.url` for arquivo, a cena inicial é identifica pelo elemento 'scene' com o atributo 'identifier="index"', senão, a cena é identificada pelo arquivo com o nome 'index.xml'.
		@method Storyboard#instantiateInitialScene
		@param {Storyboard~InstantiationCallback} completionHandler Executado após carregar a scena
	*/
	$('func').instantiateInitialScene = function(completionHandler)
	{
		this.instantiateSceneWithIdentifier('index', completionHandler)
	}

	/**
		Carrega a cena com o identificador especificado. Se `this.url` for arquivo, a cena é identificada pelo elemento 'scene' com o atributo 'identifier="$id"', senão, a cena é identificada pelo arquivo com o nome '$id.xml'.
		@method Storyboard#instantiateSceneWithIdentifier
		@param {String} id Identificador (atributo ou nome do arquivo)
		@param {Storyboard~InstantiationCallback} completionHandler Executado após carregar a cena
	*/
	$('func').instantiateSceneWithIdentifier = function(id, completionHandler)
	{
		let scene = $(this).data.querySelector(`scene[identifier=${id}]`)

		let complete = (scene) =>
		{
			$(this).loadDependencies(scene.querySelector('dependencies'), () => {
				let name = scene.getAttribute('controller')
				let controllerContructor = window[name]

				if (!controllerContructor)
					throw new Error(`Controller '${name}' not found`)

				let controller = new controllerContructor(this)
				let coder = new Coder(scene, controller)

				controller.setupWithCoder(coder)

				controller.viewDidLoad();

				completionHandler(controller)
			})
		}

		if ($(this).fileOrFolder == Storyboard.FILE_TYPE) {
			complete(scene)
		}
		else {
			if (!scene) {
				Factory.load(`${$(this).url}/${id}.xml`, (request) => {
					scene = request.responseXML.documentElement
					scene.setAttribute('identifier', id)
					$(this).data.documentElement.appendChild(scene)

					complete(scene)
				})
			}
			else {
				complete(scene)
			}
		}
	}

	/**
		Invocado pelas funções de instanciação.
		@callback Storyboard~InstantiationCallback
		@param {ViewController} controller Controlador da cena
	*/
})
