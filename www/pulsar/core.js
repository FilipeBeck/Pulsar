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

"use strict";

/**
	@fileoverview Núcleo do framework. Primeiro arquivo a ser carregado pelo documento.
	Nele são definidos as funções para criação de classes, importação de módulos, e uma classe
	para criação de simples dicionários dentro do escopo das definições de classe.
	@author {@link filipe.beck@gmail.com|Filipe Beck}
	@version 0.3
*/

/**
 * Utilizada na criação de classes, fornecendo o método {@link Pulsar#class} como único membro público
 * @namespace Pulsar
 */
Object.defineProperty(window, 'Pulsar', { value: new function Pulsar()
{
	var errorDescriptions = '';
	// Imprime as mensagens de erro na área cliente do navegador
	window.onerror = function(msg, url, line, col, error)
	{
		let errorDescription = `
			<br><div style="margin-left:5%;margin-right:5%;margin-top:5%;border:solid 2px;border-color:rgb(64,0,0);background-color:rgb(255,128,128); padding:15px;">
				<h1 style="word-wrap:break-word;font-size:12px;font-family:'arial';color:rgb(64,0,0);">${url} - line ${line}, col ${col}<br><br>${msg}</h1>
			</div><br>
		`;
		// Cache para mensagens antecessoras - o método 'write' pode apagá-las nos erros sucessores
		errorDescriptions += errorDescription

		if (document.body != undefined) // Anexa o novo erro ao corpo
			document.body.innerHTML += errorDescription
		else // Escreve todo o cache direto no documento
			document.write(errorDescriptions)
	}

	/**
		Classe base para todas as demais. Esta classe não pode ser instanciada diretamente
		@class Any
	*/
	Reflect.defineProperty(window, 'Any', { value: function Any()
	{
		throw Error('You can not create a direct instance of `Any`')
	}})

	Object.defineProperties(Any, {
		/**
			@const {Integer} Any.layer Camada na árvore genealógica
			@default 0
		*/
		layer: { value: 0 },
		/**
			@const {Pulsar~CoreDefinition} Any.Superclass Superclasse (não definida)
			@default undefined
		*/
		Superclass: { value: undefined },
		/**
			@const {Pulsar~CoreDefinition[]} Any.Superclasses Superclasses. Um array vazio
			@default []
		*/
		Superclasses: { value: [] }
	})

	Any.prototype = Object.create(Object.prototype, {
		/**
			Verifica se `this` é uma instância íntegra de `Class`
			@method Any#instanceOf
			@param {Pulsar~CoreDefinition} Class Classe ancestral
			@return {Boolean} Verdadeiro somente se herdar completamente, isto é, se `Class` não for apenas uma entre as superclasses
		*/
		instanceOf: { value: function(Class)
		{
			return this instanceof Class
		}},
		/**
			Verifica se `Class` se encontra entre os ancestrais de `this`
			@method Any#is
			@param {Pulsar~CoreDefinition} Class Classe ancestral
			@returns {Integer} Um valor indicando a ordem de ancestralidade (a ordem em que foi declarada em na definição). Retorna zero caso contrário. Se `Class` for exatamente a mesma classe que `this`, retorna -1
		*/
		is: { value: function(Class)
		{
			function isChildOf(Class, Ancestral)
			{
				for (var i in Class.Superclasses) {
					var Superclass = Class.Superclasses[i];

					if (Superclass === Ancestral) {
						return parseInt(i) + 1
					}
					else { // Propaga
						let isChild = (isChildOf(Superclass, Ancestral))

						if (isChild)
							return isChild
					}
				}

				return 0;
			}

			var isInstance = isChildOf(this.constructor, Class);

			if (isInstance == 0)
				return (this.constructor === Class) ? -1 : 0;
			else
				return isInstance;
		}},
		/**
			Invoca o método de alguma classe ancestral
			@method Any#super
			@param {?Pulsar~CoreDefinition} Superclass Nome da classe ancestral. Se `null`, Usa a superclasse de primeira ordem (primeira a ser declarada na definição)
			@param {!String} method Nome do método a ser invocado
			@param {...mixed} arguments Argumentos para o método
		*/
		super: { value: function()
		{
			let args = Array.prototype.slice.call(arguments)
			let Superclass = args.shift()

			return Superclass.prototype[args.shift()].apply(this, args)
		}},
		/**
			Construtor padrão
			@method Any#init
		*/
		init: {
			value: function() {}, writable: true
		},
		constructor: {
			value: Any, writable: true
		}
	})

	/**
		Utilizada na importação de módulos
		@namespace Factory
	*/
	Object.defineProperty(window, 'Factory', { value: new function Factory()
	{	/**
			Alias para <b>Factory</b>
			@namespace $
		*/
		Object.defineProperty(window, '$', { value: this })
		/** @var {Object.<String, Module>} Factory~modules Todos os módulos criados */
		var modules = {}

		/**
			Recupera a URL absoluta do caminho especificado
			@method Factory~getAbsolutePath
			@param {String} path URL a ser convertida
			@return {String} A URL absoluta
		*/
		function getAbsolutePath(path)
		{
			var pathStack = path.split('/')
			var resultPath = []

			for (let i = 0, count = pathStack.length; i < count; i ++) {
				if (pathStack[i] == '..')
					resultPath.pop()
				else if (pathStack[i] != '.')
					resultPath.push(pathStack[i])
			}

			return resultPath.join('/')
		}

		/**
			Scripts criados através de {@link Factory#import}
			@class Factory~Module
			@param {?String} modulePath URL do recurso
		*/
		function Module(modulePath)
		{
			if (modulePath != null) {
				if (modules[modulePath] != undefined) // TODO: Remover futuramente
					throw new Error('Isso não deve acontecer')

				this.src = modulePath
				this.async = 'true'

				modules[modulePath] = this
			}

			Object.defineProperties(this, {
				/**
					@var {String} Factory~Module#state Estado do carregamento. Pode ser:
					<li> <code>inactive</code>: não adicionado ao documento
					<li> <code>loading</code>: adicionado ao documento e carregando
					<li> <code>waiting</code>: carregado e esperando o carregamento das dependências
					<li> <code>complete</code>: completamente carregado
				*/
				state: { value: 'inactive', writable: true },
				/** @var {Function[]} Factory~Module#loadHandlers Manipuladores de finalização executados quando o módulo estiver completo */
				loadHandlers: { value: [] },
				/** @var {Factory~Module[]} Factory~Module#dependencies Módulos dos quais este depende para completar o carregamento e chamar os manipuladores de finalização */
				dependencies: { value: [] },
				/** @var {Factory~Module[]} Factory~Module#dependents Módulos que dependem deste para completarem o carregamento */
				dependents: { value: [] },
				/**
					Adiciona o módulo ao documento se isto já não foi feito. Se o módulo estiver completo, retorna imediatamente, senão, estabelece as relações de dependência entre o módulo atual e este
					@method Factory~Module#load
				*/
				load: { value: function()
				{
					if (this.state == 'complete')
						return

					let currentModule = window['$'].currentModule
					// Só acontece após o documento ser carregado. Neste caso, será usado o módulo raiz (pois document.currentScript == null)
					if (currentModule.state == 'complete') {
						currentModule.state = 'waiting'
					}
					// Estabelece as relações de dependência
					currentModule.dependencies.push(this)
					this.dependents.push(currentModule)

					if (this.state == 'inactive') {
						this.state = 'loading'

						window['Factory'].activityCount += 1

						this.addEventListener('load', () => {
							this.state = 'waiting'

							window['Factory'].activityCount -= 1

							if (this.dependencies.length == 0)
								this.complete()
						})

						document.head.appendChild(this)
					}
				}},
				/**
					Ocorre quando a dependencia já está pronta para ser utilizada
					@method Factory~Module#didImport
					@param {Factory~Module} dependency Dependência cujo carregamento foi completado
				*/
				didImport: { value: function(dependency)
				{
					let dependencies = this.dependencies.splice(0, this.dependencies.length)
					// NOTE: Talvez não seja necessário
					for (let i = 0, count = dependencies.length; i < count; i++)
						if (dependency !== dependencies[i])
							this.dependencies.push(dependencies[i])
					// Propaga se estiver completo
					if (this.state == 'waiting' && this.dependencies.length == 0)
						this.complete()
				}},
				/**
					Executa todos os manipuladores e notifica todos os dependentes
					@method Factory~Module#complete
				*/
				complete: { value: function()
				{
					this.state = 'complete'
					// Necessário caso houver mais importações dentro dos manipuladores
					let loadHandlers = this.loadHandlers.splice(0, this.loadHandlers.length)

					for (let i = 0, count = loadHandlers.length; i < count; i++)
						loadHandlers[i]()
					// Notifica os dependentes
					for (let i = 0, count = this.dependents.length; i < count; i++)
						this.dependents[i].didImport(this)

					this.dependents.splice(0, this.dependents.length)
				}}
			})

			return this
		}

		/**
			Cria um novo módulo para o recurso especificado
			@method Factory~Module.new
			@param {String|HTMLElement} resource Elemento ou caminho do recurso
		*/
		Reflect.defineProperty(Module, 'new', { value: function(resource)
		{ // Inicializa o elemento
			if (resource instanceof HTMLElement) {
				if (resource.state != undefined)
					return resource
				else
					return Module.call(resource, null)
			} // Cria e inicializa o recurso
			else {
				resource = getAbsolutePath(resource)
				// Retorna o módulo já existente em caso de duplicatas
				if (modules[resource] != undefined)
					return modules[resource]
				// Cria
				return Module.call(document.createElement('script'), resource)
			}
		}})

		/** @const {HTMLDivElement} Factory~activityIndicator Indicador de atividade exibido durante as importações ocorridas após o documento ser carregado. */
		const activityIndicator = document.createElement('div')
		// Sempre no topo e acima dos outros views
		activityIndicator.setAttribute('style', `display: block; position: fixed; left: -5px; top: -5px; width: 10px; height: 10px; border-radius: 5px; box-shadow: 0px 0px 3px #00AA55; z-index: ${Number.MAX_SAFE_INTEGER}; background: linear-gradient(to right, #00AA55, #359ec8); animation: progress-bar 0.5s ease-in-out 0s infinite alternate; transform: scale(5,5); transition: all 0.5s; opacity: 0`)

		activityIndicator.addEventListener('transitionend', function() {
			if (inProgressModulesCount == 0)
				activityIndicator.style.display = 'none'
		})

		const activityIndicatorStyle = document.createElement('style')
		activityIndicatorStyle.setAttribute('data-scope', 'pulsar-core-activity-indicator')
		activityIndicatorStyle.textContent = '@keyframes progress-bar { from { transform: scale(3,3); } to { transform: scale:(5,5); } }'
		document.head.insertBefore(activityIndicatorStyle, document.head.firstChild)

		window.addEventListener('load', function() {
			document.body.appendChild(activityIndicator)
		})

		/** @var {Integer} Factory~inProgressModulesCount Contador de módulos em progresso */
		var inProgressModulesCount = 0

		/** @var {Integer} Factory#activityCount Contador de atividade. Qualquer valor diferente de zero implica na exibição do indicador de atividade. Incremente este valor antes de iniciar alguma atividade e decremente depois de completar. */
		Object.defineProperty(this, 'activityCount', {
			get: function() {
				return inProgressModulesCount
			},
			set: function(newValue) {
				inProgressModulesCount = newValue

				if (newValue > 0 && activityIndicator.style.display == 'none')
					activityIndicator.style.display = 'block'

				activityIndicator.style.opacity = 1 - (1 / (newValue + 1))
			}
		})

		/** @const {Factory~Module} Factory~rootModule Módulo raiz utilizado quando <code>document.currentScript == null</code> (após o documento ser carregado) ou quando <code>document.currentScript.state == 'complete'</code> (quando houver mais importações dentro de algum manipulador de finalização) */
		const rootModule = Module.call({}, document.location.href)
		// Sempre em espera
		rootModule.state = 'waiting'

		/** @var {Factory~Module} Factory~currentModule Módulo atual. Pode ser <code>document.currentScript || {@linkcode Factory~rootModule} </code> */
		Object.defineProperty(this, 'currentModule', { get: function() {
			let currentScript = document.currentScript
			if (currentScript == null)
				return rootModule // Documento já carregado
			else if (currentScript.state == undefined)
				return Module.new(currentScript) // Não foi criado módulo para o script atual
			else if (currentScript.state == 'complete')
				return rootModule // Foi efetuada uma nova importação dentro de algum manipulador de finalização
			else // Já foi criado o módulo para o script atual
				return currentScript
		}})

		/**
			Importa o módulo especificado, se já não foi importado.
			@method Factory#import
			@param {String|String[]} modulePath A URL, ou array de URLs do módulo.
			@param {?String} baseType Base para a procura do módulo. Pode ser:
			<li> <code>relative</code>: relativo ao módulo atual (default, se não for especificado)
			<li> <code>absolute</code>: relativo à localização do documento
			<li> <code>extern</code>: externo à aplicação
			@param {?Function} completionHandler Função a ser executada quando as importações completarem
		 */
		Object.defineProperty(this, 'import', { value: function(modulePath, baseType)
		{
			let currentModule = this.currentModule
			let basePath = ''
			// Adiciona o prefixo se não for externo
			if (baseType != 'external') { // Localização do documento ou do módulo atual
				basePath = (baseType != 'absolute' && currentModule.src != '') ? currentModule.src : document.location.href
				let pathstack = basePath.split('/')
				pathstack.pop()
				basePath = pathstack.join('/') + '/'
			}
			// Apenas uma URL
			if (modulePath.constructor.name == 'String')
				Module.new(basePath + modulePath).load()
			else // Array de URLs
				for (let i = 0, count = modulePath.length; i < count; i++)
					Module.new(basePath + modulePath[i]).load()

			let completionHandler = arguments[arguments.length - 1]
			// Registra o manipulador, se houver
			if (completionHandler != undefined && completionHandler.constructor.name == 'Function')
				this.arrive(completionHandler)
		}})

		/**
			Registra a função especificada à lista de manipuladores a serem executados na finalização das importações. Deve ser invocada após todas as declarações de importação
			@method Factory#arrive
			@param {!Function} handler Função a ser executada. É invocada imediatamente se o módulo atual estiver completo
		*/
		Object.defineProperty(this, 'arrive', { value: function(handler)
		{
			if (!handler)
				throw new Error('Argument `handler` not provided in `Factory.arrive`')

			var currentModule = $.currentModule

			if (currentModule.state == 'complete') {
				handler(); return
			}

			currentModule.loadHandlers.push(handler)

			if (currentModule.state != 'loading' && currentModule.dependencies.length == 0)
				currentModule.complete()
		}})

		/**
			Carrega o recurso especificado
			@method Factory#load
			@param {String} url Localização do recurso
			@param {Factory~requestCallback} completionHandler Manipulador de finalização
		*//**
			@callback Factory~requestCallback
			@param {XMLHttpRequest} request Requisição com os dados do recurso
		*/
		Object.defineProperty(this, 'load', { value: function(url, completionHandler)
		{
			var request = new XMLHttpRequest()

			request.open('GET', url, true)

			this.activityCount += 1

			request.addEventListener('load', () => {
				this.activityCount -= 1
				completionHandler(request)
			})

			request.send()

			return request
		}})
	}});

	/** @const {String[]} Pulsar~definedClasses Nome de todas classes definidas. Usado na avaliação de classes duplicadas */
	const definedClasses = []

	/** @const {Function} Pulsar~coreConstructors Todas as funções construtoras do núcleo. Utilizada para percorrer a árvore de inicialização */
	const coreConstructors = { Any: function() {} };

	/** @const {Object} Pulsar~fusedPrototypes Todas as fusões de protótipos */
	const fusedPrototypes = {};

	/** @const {WeakMap} Pulsar~publicDescriptors */
	const publicDescriptors = new WeakMap();

	/** @const {WeakMap} Pulsar~privateDescriptros */
	const privateDescriptors = new WeakMap();

	/**
		Descritor de propriedades e métodos, estáticos e de instância.
		Todos os métodos e propriedades estão formatados para serem definidos através da função <code>Object.defineProperties()</code> nos momentos necessários
		@typedef {Object} Pulsar~SelfDescriptor
		@property {Object<String, Object>} static Descritor estático
		@property {Object<String, Object>} static.properties Todas as propriedades estáticas
		@property {Object<String, Object>} static.methods Todos os métodos estáticos
		@property {Object<String, Object>} instance Descritor de instância
		@property {Object<String, Object>} instance.properties Todas as propriedades de instância
		@property {Object<String, Object>} instance.methods Todos os métodos de instância
		@property {Object[]} constructions Todas as construções criadas com <code>$.new()</code>
		@property {Object[]} constants Todas as propriedades imutáveis
		@property {Function} close Congela o descritor e depois deleta a função.
	*/
	function SelfDescriptor()
	{
		Object.defineProperties(this, {
			'static': { value: {} },
			'instance': { value: {} },
			'constructions': { value: [] },
			'constants': { value: [] }
		})

		Object.defineProperties(this['static'], {
			'properties': { value: {} },
			'methods': { value: {} }
		})

		Object.defineProperties(this['instance'], {
			'properties': { value: {} },
			'methods': { value: {} }
		})

		/**
		 * Congela todas as propriedades (inclusive as aninhadas) e deleta a função
		 * @method Pulsar~SelfDescriptor~close
		 */
		this.close = function()
		{ // Não será mais necessária
			delete this.close;

			function close(object)
			{
				Object.freeze(object)

				for (let key in object)
					close(object[key])
			}

			close(this)
		}
	};

	/**
		Definição base para todas as classes criadas com o framework. Embora seja documentada como uma classe abstrata com membros de instância, isto deve ser entendido em um contexto meta-linguístico. As classes criadas pelo framework com {@linkcode Pulsar#class} podem ser vistas como uma instância de uma definição do núcleo. As propriedades serão aplicadas através de <code>CoreDefinition.call()</code> em cada classe definida pelo programador
		@class Pulsar~CoreDefinition
		@abstract
		@param {String[]} Superclasses As classes ancestrais, que pode conter apenas um elemento em caso de heraça simples
		@return {Pulsar~CoreDefinition~Kernel} Núcleo com propriedades definidoras
	*/
	function CoreDefinition(Superclasses)
	{
		/** @const {Function[]} Pulsar~CoreDefinition~superConstructors Construtores das superclasses */
		const superConstructors = []

		/** @const {Function} Pulsar~CoreDefinition~inheritanceHandler Manipulador de herança. Executado quando as dependências estiverem prontas */
		const inheritanceHandler = () => {
			for (let i in Superclasses)
				superConstructors.push(coreConstructors[Superclasses[i]]);
			// Inverte para otimizar as inicializações
			superConstructors.reverse()
			// Troca os nomes pelas classes propriamente ditas
			for (let i = 0, count = Superclasses.length; i < count; i++) {
				Superclasses[i] = window[Superclasses[i]]
			}

			/** @const {Pulsar~CoreDefinition} Pulsar~CoreDefinition#Superclass A classe ancestral. */
			Object.defineProperty(this, 'Superclass', { value: Superclasses[0], writable: false });

			/** @const {Pulsar~CoreDefinition[]} Pulsar~CoreDefinition#Superclasses As classes acestrais, que pode conter apenas um elemnto em caso de heraça simples */
			Object.defineProperty(this, 'Superclasses', { value: Superclasses, writable: false });

			let highestLayer = -1;
			// Recupera a camada mais alta entre as superclasses
			for (let i in Superclasses)
				if (Superclasses[i].layer > highestLayer)
					highestLayer = Superclasses[i].layer;

			/** @const {Integer} Pulsar~CoreDefinition#layer Número da camada na árvore genealógica, igual a camada mais baixa entre as superclasses + 1 */
			Object.defineProperty(this, 'layer', { value: highestLayer + 1, writable: false });
		}

		/** @const {Pulsar~SelfDescriptor} Pulsar~CoreDefinition~privateDescriptor Descritor do escopo privado */
		const privateDescriptor = new SelfDescriptor();

		/** @const {Pulsar~SelfDescriptor} Pulsar~CoreDefinition~publicDescriptor Descritor do escopo público */
		const publicDescriptor = new SelfDescriptor();

		/** @var {WeakMap} Pulsar~CoreDefinition~privateScope Contém todas as instâncias privadas da classe */
		const privateScope = new WeakMap();

		/*
			Construtor executado em cada instãncia da classe. Estabelece as propriedades e métodos privados, contruções e constantes
			@method Pulsar~CoreDefinition~constructInstance
			@param {Pulsar~CoreDefinition} publicInstance A instância criada com o operador <code>new</code>
		*/
		const constructInstance = function(publicInstance)
		{ // Herda
			for (let i = 0, count = superConstructors.length; i < count; i++)
				superConstructors[i](publicInstance);

			const privateInstance = {};
			// Estabelece as propriedades primitivas
			Object.defineProperties(privateInstance, privateDescriptor['instance']['properties']);
			Object.defineProperties(publicInstance,  publicDescriptor ['instance']['properties']);

			let constructions = privateDescriptor['constructions'];
			// Estabelece as construções públicas
			for (let i = 0, count = constructions.length; i < count; i++) {
				var construction = constructions[i];
				privateInstance[construction] = privateInstance[construction].create();
			}

			constructions = publicDescriptor['constructions'];
			// Estabelece as construções privadas
			for (let i = 0, count = constructions.length; i < count; i++) {
				var construction = constructions[i];
				publicInstance[construction] = publicInstance[construction].create();
			}

			let constants = privateDescriptor['constants'];
			// Estabelece as constantes públicas
			for (let i = 0, count = constants.length; i < count; i++) {
				var constant = constants[i];
				Object.defineProperty(privateInstance, constant, { writable: false });
			}

			constants = publicDescriptor['constants'];
			// Estabelece as constantes privadas
			for (var i in constants) {
				var constant = constants[i];
				Object.defineProperty(publicInstance, constant, { writable: false });
			}

			var methods = privateDescriptor['instance']['methods'];
			// Estabelece os métodos privados
			for (var method in methods)
				Object.defineProperty(privateInstance, method, { value: privateDescriptor['instance']['methods'][method].value.bind(publicInstance), writable: true });
			// Registra a instância privada
			privateScope.set(publicInstance, Object.seal(privateInstance));
		}
		// Registra o construtor
		coreConstructors[this.name] = constructInstance

		/**
			Procedimento definidor das propriedades do corpo
			@const {Pulsar~CoreDefinition~SelfDefiner} Pulsar~CoreDefinition~selfDefiner
		*//**
			@callback Pulsar~CoreDefinition~SelfDefiner
			@param {String} rules As regras para a definiçào. Pode ser qualquer combinação permitida entre os seguintes identificadores:<br>
			<li><code>public:</code> Membro público (default), acessível através de 'this'. Precisa ser a primeira declaração. Imcompatível com <code>private</code> e <code>readonly</code>
			<li><code>private:</code> Membro privado, acessível através de '$(this)'. Precisa ser a primeira declaração. Imcompatível com <code>public</code>, <code>readonly</code> e <code>static</code>
			<li><code>readonly:</code> Membro com acesso público somente para leitura. Incompatível com <code>public</code>, <code>private</code> e <code>static</code>
			<li><code>cached:</code> Membro público. Cria uma cópia de mesmo nome no escopo privado
			<li><code>static:</code> Membro de classe. Precisa vir antes de <code>var</code> ou <code>let</code> ou <code>lazy</code>. Imcompatível com <code>private</code> e <code>readonly</code>
			<li><code>var:</code> Membro mutável. Imcompatível com <code>let</code>
			<li><code>let:</code> Membro imutável. Imcompatível com <code>var</code> e propriedades computadas
			<li><code>lazy:</code> Propriedade armazenada. O valor deve ser uma função cujo valor de retorno será atribuido no primeiro acesso
			@return Um objeto vazio onde será inserida a propriedade ou método
			@example
			* Pulsar.class('MyClass', 'Superclass', function($)
			* {
			*   $('public var').a = 10;  // this.a
			*   $('private let').b = 20; // $(this).b
			*   $('static var').c = 30;  // MyClass.c
			* })
			@property {Object[]} definitions Armazenará todas as definições do corpo (propriedades e métodos - estáticos e de instãncia)
		*/
		const selfDefiner = function(rules)
		{
			const definition = {
				rules: rules,
				name: {}, // Será passado um objeto oco como referência para evitar conflito entre nomes
				value: undefined
			}

			selfDefiner.definitions.push(definition);

			return definition.name;
		}
		// Armazenará todas as definições do corpo (propriedades e métodos - estáticos e de instãncia)
		Reflect.defineProperty(selfDefiner, 'definitions', { value: [] })

		/**
			Acessa o escopo privado
			@method {Function} Pulsar~CoreDefinition~privateSelector
			@param {Pulsar~CoreDefinition} instance A instância a ser resgatado o escopo. Precisa ser da mesma classe em definição
			@return O escopo privado com todas as propriedades e métodos privados
		*/
		function privateSelector(instance)
		{
			return privateScope.get(instance)
		}

		/**
			@var {Function} Pulsar~CoreDefinitio~selfProcedureHook Referência usada por Pulsar~CoreDefinition~selfProcedure, para possibilitar mudança
			de comportamento dentro das definições de métodos e propriedades computadas sem adicionar controle de fluxo explícito.
		*/
		var selfProcedureHook = selfDefiner

		/**
			@const {Function} Pulsar~CoreDefinition~selfProcedure Procedimento fornecido como argumento (<code>$</code>) ao invocar a função definidora do usuário
		*//**
			@callback Pulsar~CoreDefinition.SelfProcedure Redireciona para a função apropriada, dependendo do escopo
			@param {String|Pulsar~CoreDefinition} rulesOrInstance Quando chamada no escopo local da função definidora da classe (fora do corpo dos métodos e propriedades computadas), este parâmetro deve ser uma string com as regras de definição. Quando chamada no escopo dos métodos e propriedades computadas, este parâmetro deve ser obrigatoriamente uma referência a uma instância da classe.
			@return {Object|Pulsar~CoreDefinition} Quando chamada no escopo local, o valor de retorno será um objeto vazio onde será armazenado a propriedade ou método. Quando chamada no escopo das propriedades e métodos, o valor de retorno será uma referência ao escopo privado da classe
			@property {{get: Function, set: Function}} ABSTRACT_PROPERTY Identificador de propriedade abstrata
			@property {Function} ABSTRACT_FUNCTION Identificador de método abstrato
			@property {Function} ABSTRACT_METHOD Alias para ABSTRACT_FUNCTION
			@property {?Function} initialization Função executada logo após a classe ter completado a sua definição
			@property {Function} new Cria uma associação que será construída para cada instância da classe
		*/
		const selfProcedure = function(rulesOrInstance)
		{
			return selfProcedureHook(rulesOrInstance)
		}
		// TODO: mover para `Factory`
		Object.defineProperty(selfProcedure, 'urlTo', { value: function(path)
		{
			let pathStack = document.currentScript.src.split('/')
			pathStack.pop()

			return pathStack.join('/') + '/' + path;
		}});

		Object.defineProperty(selfProcedure, 'ABSTRACT_PROPERTY', {
			get: function() {
				throw new TypeError(`Abstract property was not implemented in ${className} definition`);
			},
			set: function(newValue) {
				throw new TypeError(`Abstract property was not implemented ${className} definition`);
			}
		});

		Object.defineProperty(selfProcedure, 'ABSTRACT_FUNCTION', { value: function() {
			throw new TypeError(`Abstract method was not implemented in ${className} definition`);
		}});

		Object.defineProperty(selfProcedure, 'ABSTRACT_METHOD', { value: selfProcedure.ABSTRACT_FUNCTION });

		Object.defineProperty(selfProcedure, 'initialization', { value: null, writable: true });

		Object.defineProperty(selfProcedure, 'new', { value: function()
		{
			return new (function Construction(args) {
				this.arguments = [];
				this.className = args.shift();

				for (var i in args)
					this.arguments.push(`args[${i}]`);

				var constructor = `new ${this.className}(${this.arguments.join(',')})`;

				this.create = function() {
					return eval(constructor);
				}
			})(Array.prototype.slice.call(arguments));
		}});

		Object.seal(selfProcedure);

		/**
			Congela o descritor da classe, define as propriedades exclusivas e registra os manipuladores de finalização
			@method CoreDefinition~closeDefinition
		*/
		function closeDefinition()
		{
			var initialization = selfProcedure.initialization;

			privateDescriptor.close();
			publicDescriptor.close();

			selfProcedureHook = privateSelector;

			Object.defineProperties(this, publicDescriptor['static']['properties']);
			Object.defineProperties(this, publicDescriptor['static']['methods']);

			$.arrive(() => {
				inheritanceHandler()

				if (this.Superclass != undefined)
					this.prototype = Object.create((Superclasses.length == 1) ? window[this.Superclass.name].prototype : fuse(Superclasses))
				// Só agora estabelece as próprias características, sobrescrevendo qualquer outra
				Object.defineProperties(this.prototype, publicDescriptor['instance']['methods']);

				this.prototype.constructor = this;

				Object.seal(this);

				window[this.name] = this

				if (initialization != null) { initialization() }
			})
		}

		return {
			/**
				Descritores e funções internas do núcleo que que precisam ser expostas ao framework mas não podem ser expostas ao usuário
				@typedef {Object} Pulsar~CoreDefinition~Kernel
				@property {Object<String, SelfDescritor>} descriptors
				@property {SelfDescriptor} descriptors.private Descritor privado
				@property {SelfDescriptor} descriptors.public Descritor público
				@property {Object} definitions Definições estabelecidas pelo usuário
				@property {SelfProcedure} selfProcedure Função definidora, utilizada pelo usuário nas definições de propriedades e métodos
				@property {Function} construct Função construtora das instâncias
				@property {Function} close Função finalizadora do núcleo
			*/
			descriptors: {
				'private': privateDescriptor,
				'public': publicDescriptor
			},
			definitions: selfDefiner.definitions,
			selfProcedure: selfProcedure,
			construct: constructInstance,
			close: closeDefinition.bind(this)
		}
	}

	/**
		Realiza a fusão entre os protótipos dos ramos para os nós especificados. A função percorre a árvore genealógica fundindo os nós em cada
		iteração, repetindo os nós das camadas mais baixas para evitar fusão entre duas classes do mesmo ramo (superclasse com subclasse)
		<a href="img/Pulsar_fuse.svg" target="_new"><img src=img/Pulsar_fuse.svg style="width:25%%"></img></a>.
		@method Pulsar~fuse
		@param {Pulsar~CoreDefinition[]} Classes As classes a serem fundidas
	*/
	function fuse(Classes)
	{
		if (Classes.length == 0)
			throw new Error('Array vazio');
		// Encerra a recursão
		if (Classes.length == 1)
			return Classes[0].prototype;

		var fusedName = '$';
		var SuperClasses = [];

		var highestLayer = -1;

		for (var i in Classes)
			if (highestLayer < Classes[i].layer)
				highestLayer = Classes[i].layer;

		for (var i in Classes)
		{
			var Class = Classes[i];

			fusedName += Class.name + '$';

			if (Class.layer == highestLayer)
				fromBegin: for (var j in Class.Superclasses)
				{
					var Superclass = Class.Superclasses[j];

					if (Superclass != undefined)
						for (var l in SuperClasses)
							if (Superclass == SuperClasses[l])
								continue fromBegin;

					SuperClasses.push(Superclass);
				}
			else
				SuperClasses.push(Class);
		}

		var superPrototype = fuse(SuperClasses);
		var fusedPrototype = fusedPrototypes[fusedName];

		if (fusedPrototype == undefined)
		{
			fusedPrototype = fusedPrototypes[fusedName] = Object.create(superPrototype);
			fusedPrototype.constructor = { name: fusedName, classes: SuperClasses };//eval(`(function ${fusedName}(){})`);
			// Só agora estabelece as próprias características, sobrescrevendo qualquer outra
			for (var i in (Classes = Classes.slice().reverse()))
				Object.defineProperties(fusedPrototype, Classes[i].publicDescriptor['instance']['methods']);
		}

		return fusedPrototype;
	}

	/**
		Função base para a criação de classes
		@method Pulsar#class
		@param {string} className - O nome da classe
		@param {...Pulsar~CoreDefinition} superclasses - Zero ou mais superclases
		@param {Pulsar#ClassDefinitionCallback} body - Função definidora da classe, tendo como argumento uma referência à função definidora do núcleo
		@example
	  * Pulsar.class('MyClass', 'Superclass1', 'Superclass2', function($) // Função definidora. Precisa ser anônima e ter '$' como argumento
	  * {
	  *   var mS1 = 'static value' // Propriedade privada e estática
	  *   $('static let').mS2 = 'another static' // Propriedade pública, estática e constante
	  *
	  *   $('public var').a = 15 // Propriedade pública, variável e armazenada
	  *   $('private let').b = 30 // Propriedade privada, constante e armazenada
	  *
	  *   // Propriedade pública (default) e computada
	  *   $('var').c = {
	  *     get: function() {...},
	  *     set: function(newValue) {...}
	  *   }
	  *
	  *   // Construtor
	  *   $('func').init = function(args...)
	  *   {
	  *
	  *   }
	  *   // Método público
	  *   $('func').sum = function()
	  *   {
	  *     var v1 = this.a // Acesso a membro público
	  *     var v2 = $(this).b // Acesso a membro privado
	  *     return v1 + v2
	  *   }
	  * })
	*//**
		Função definidora da classe. Último argumento de {@link Pulsar#class}
		@callback Pulsar#ClassDefinitionCallback
		@param {Pulsar~CoreDefinition~SelfDefiner} $ Função definidora do núcleo
	*/
	this.class = function (/* className, superclass1, superClass2, ..., body */)
	{ // Converte o argumento para um array verdadeiro
		var args = Array.prototype.slice.call(arguments);
		// Separa os argumentos
		var className = args.shift();  // Classe
		var classDefiner = args.pop(); // Definição - corpo da classe
		var Superclasses = (args.length != 0) ? args : ['Any'] // Zero ou mais superclasses entre o primeiro e o último argumento

		if (definedClasses.indexOf(className) != -1)
			throw new Error(`There is already a class named \`${className}\``)

		definedClasses.push(className)

		// Verifica se há função definidora como último argumento, e se o argumento está correto
		if (typeof classDefiner !== 'function')
			throw new TypeError('You need provide the \'class definer function\' as last argument in \'' + className + '\' definition');
		else if (classDefiner.toString().match(/function[^)]+/) != 'function ($')
			throw TypeError('Invalid name for \'class definer\' argument in \'' + className + '\' definition. Use \'function($)\'');

		var privateInstances = new WeakMap();

		var CoreConstruct = undefined;

		var NewClass = eval(`(function ${className}()
		{
			CoreConstruct(this);

			this.init.apply(this, arguments);
		})`);

		const core = CoreDefinition.call(NewClass, Superclasses);
		CoreConstruct = core.construct;

		classDefiner(core.selfProcedure);

		// Membros privados a serem extraidos da função definidora e árvore genealógica
		var privateMembers = {};
		// Utilizado na verificação de duplicatas
		var identifiers = [];

		var descriptors = core.descriptors

		function getExclusiveToken(tokens)
		{
			let definedToken = null;

			for (let i = 0, count = tokens.length; i < count; i++)
			{
				let token = tokens[i];

				if (checkList[token])
					if (definedToken)
						throw new SyntaxError(`'${definedToken}' statement incompatible with '${token}' in '${className}.${identifier}' definition`);
					else
						definedToken = token;
			}

			return definedToken;
		}

		for (let i in core.definitions)
		{
			var definition = core.definitions[i]; // Cache
			var tokens = (definition.rules != undefined) ? definition.rules.split(' ') : []; // Valores em $('token1 token2 token3...')
			var identifier = Object.keys(definition.name)[0]; // Nome em $('tokens').identifier
			var content = definition.name[identifier]; // Valor em $('tokens').identifier = content

			identifiers.push(identifier);
			// Flag para os descritores
			var accessLevel = 'public';
			var instanceOrStatic = 'instance';
			var propertyOrMethod = undefined;
			// Lista para interpretação dos tokens
			var checkList = {
				'': 0,
				'public': 0,
				'private': 0,
				'static': 0,
				'cached': 0,
				'readonly': 0,
				'lazy': 0,
				'let': 0,
				'var': 0,
				'func': 0,
				'override': 0
			};

			for (let i = 0, count = tokens.length; i < count; i++)
			{
				var token = tokens[i];

				checkList[token]++;

				switch (token)
				{
					case '':
						continue

					case 'readonly':
						if (tokens[ i + 1] == 'lazy')
							continue
					case 'cached': case 'lazy': {
						var nextToken = tokens[i + 1];

						if (nextToken != 'var')
							throw new SyntaxError(`Unexpected identifier '${nextToken}' after '${token}' statement in '${className}.${identifier}' definition. Use 'var'`);
					}break;

					case 'static': { // Exige que seja declarado antes de 'let', 'var' ou 'func'
						if (checkList['let'] || checkList['var'] || checkList['func'])
							throw new SyntaxError(`'static' statement needs be declared before 'let', 'var' or 'func' in '${className}.${identifier}' definition`);

						instanceOrStatic = 'static';
					}break;

					case 'private': case 'public': case 'let': case 'var': case 'func':
						continue

					// Token desconhecido
					default:
						throw new SyntaxError(`Unexpected identifier '${token}' on '${className}.${identifier}' definition`);
				}
			}

			for (let token in checkList)
				if (checkList[token] > 1)
					throw new Error(`Duplicated '${token}' declaration in '${className}.${identifier}' definition`);

			let accessLevelToken = getExclusiveToken(['public', 'private', 'cached', 'readonly', 'override']);

			// Exige que seja a primeira declaração
			if (accessLevelToken && tokens[0] != accessLevelToken)
				throw new SyntaxError(`'${token}' statement needs be the first declaration in '${className}.${identifier}' definition`);

			accessLevel = ((accessLevelToken || 'public') == 'private') ? 'private' : 'public';

			if (instanceOrStatic == 'static' && accessLevel == 'private')
				throw new Error(`Unalowed access level '${accessLevelToken}' for static member in '${className}.${identifier}' definition`);

			let propertyOrMethodToken = getExclusiveToken(['var', 'let', 'func']);

			if (!propertyOrMethodToken)
				throw new SyntaxError(`Missing property or method specification in '${className}.${identifier}' definition. Use 'var', 'let' or 'func'`);

			propertyOrMethod = (propertyOrMethodToken == 'func') ? 'methods' : 'properties';

			var descriptor = descriptors[accessLevel];
			// Evita duplicatas
			for (let i in descriptor[instanceOrStatic][propertyOrMethod])
				if (descriptor[instanceOrStatic][propertyOrMethod][i] == identifier)
					throw new SyntaxError('Duplicated identifier \'' + identifier + '\' in \'' + className + '.' + identifier + '\' definition');
			// Tudo Ok. Agora apenas formata a definição
			if (checkList['let'] && !checkList['static']) { // Propriedade armazenada e constante
				definition = { value: content, writable: true }; descriptor['constants'].push(identifier);
			}
			else if (content == undefined || content == null)
				definition = { value: content, writable: true };
			else if (content.constructor.name == 'Object') // Propriedade computada
				definition = content;
			else if (typeof content === 'function') // Método
				definition = { value: content, writable: false };
			else // Propriedade armazenada e variável
				definition = { value: content, writable: true };
			// Para possibilitar sobrescrita por classes herdeiras
			definition.configurable = true;

			if (checkList['readonly'] && !checkList['lazy'])
			{
				let selfProcedureCache = core.selfProcedure
				let identifierCache = identifier

				descriptor[instanceOrStatic][propertyOrMethod][identifierCache] = {
					get: function() { return selfProcedureCache(this)[identifierCache]; }
				};

				descriptors['private'][instanceOrStatic][propertyOrMethod][identifier] = definition;
			}
			else if (checkList['lazy'])
			{
				let properties = new WeakMap()
				let maker = definition.value

				definition.get = function() {
					let property = properties.get(this)
					if (!property) {
						property = maker.call(this)
						properties.set(this, property)
					}

					return property
				}

				definition.set = function(newValue) {
					properties.set(this, newValue)
				}

				delete definition.value
				delete definition.writable

				if (checkList['readonly']) {
					descriptors['private'][instanceOrStatic][propertyOrMethod][identifier] = definition
					descriptor[instanceOrStatic][propertyOrMethod][identifier] = {
						get: definition.get
					}
				}
				else {
					descriptor[instanceOrStatic][propertyOrMethod][identifier] = definition
				}
			}
			else
			{
				descriptor[instanceOrStatic][propertyOrMethod][identifier] = definition;

				if (checkList['cached'])
					descriptors['private'][instanceOrStatic][propertyOrMethod][identifier] = { value: definition.cache, writable: true }

				delete definition.cache
			}

			if (content != undefined && content != null && content.constructor.name == 'Construction')
				if (checkList['readonly'])
					descriptors['private']['constructions'].push(identifier);
				else
					descriptor['constructions'].push(identifier);
		}

		core.close();
	};

	Object.seal(this)
}});
