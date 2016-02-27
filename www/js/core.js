"use strict";

/**
 * @fileoverview Núcleo do framework. Este deve ser o primeiro arquivo a ser carregado pelo documento.
 * Nele são definidos as funções para criação de classes, importação de módulos, e uma classe
 * para criação de simples dicionários dentro do escopo das definições de classe.
 * @author {@link filipe.beck@gmail.com Filipe Beck}
 * @version 0.3
 */

/**
 * Utilizada na criação de classes, fornecendo o método <b>Pulsar.class</b> como único membro público
 * @namespace Pulsar
 */
Object.defineProperty(window, 'Pulsar', { value: new function Pulsar()
{
	var errorDescription = '';
	// Imprime as mensagens de erro na área cliente do navegador
	window.onerror = function(msg, url, line, col, error)
	{ // Cache para mensagens antecessoras - o método 'write' pode apagá-las nos erros sucessores
		errorDescription += `
			<div style="margin-left:5%;margin-right:5%;margin-top:5%;border:solid 2px;border-color:rgb(64,0,0);background-color:rgb(255,128,128); padding:15px;">
				<h1 style="word-wrap:break-word;font-size:12px;font-family:'arial';color:rgb(64,0,0);">${url} - line ${line}, col ${col}<br><br>${msg}</h1>
			</div>
		`;
		// Limpa o corpo do documento
		document.body.innerHTML = '';
		document.write(errorDescription);
	}
	
	/**
	 * Utilizada na criação de simples dicionários dentro das definições de classe.
	 * @class Dictionary
	 * @augments Object
	 * @param {object} descriptor O objeto com as propriedades a serem copiadas
	 * @example
	 *  
	 * $('var').property = $.new(Dictionary, {
	 *   a: 10, // value = this.property.a
	 *   b: 20  // value = this.property.b
	 * })
	 */
	Object.defineProperty(window, 'Dictionary', { value: function Dictionary(descriptor)
	{ // Simplesmente copia
		for (var key in descriptor)
			this[key] = descriptor[key];
	}});
	
	/**
	 * Utilizada na importação de módulos
	 * @namespace $
	 */
	Object.defineProperty(window, '$', { value: {} });
	/** @var {Elemet} $#currentScript */
	Object.defineProperty($, 'currentScript', { value: undefined, writable: true })
	/** @var {String[]} $#pathStack */
	Object.defineProperty($, 'pathStack', { value: [], writable: true });
	/**
	 * Importa o módulo especificado, se já não foi importado
	 * @method $#import
	 * @param {String} modulePath A URL do módulo. Se o módulo já foi importado, simplesmente retorna
	 * @example
	 * $.import('MyClass.js') // var myClass = new MyClass()
	 */
	Object.defineProperty($, 'import', { value: function(modulePath)
	{ // Estabelece a base relativa das URLs
		if (document.currentScript != this.currentScript)
		{
			this.currentScript = document.currentScript;
			this.pathStack = this.currentScript.src.split('/');
			this.pathStack.pop(); // Último elemento é o arquivo. Queremos apenas o diretório
		}

		var http = new XMLHttpRequest();
		
		var modulePathStack = modulePath.split('/');
		// Recupera onome do arquivo
		if (modulePathStack.length > 1)
			modulePath = modulePathStack.pop();
		// Nome do módulo sem a extensão
		var className = modulePath.split('.')[0];
		// Evita a adição de módulos já importados, imprimindo uma mensagem de aviso e retornando
		if (window[className] != undefined) {
			console.warn('The module \'' + modulePath + '\' was already imported'); return;
		}
		// Cache para URL base atual. Esta operação pode se tornar recursiva se o módulo importado também importar algum módulo
		var originalPathStack = this.pathStack;
		// Atualiza a base relativa das URLs
		this.pathStack = this.pathStack.concat(modulePathStack);
		// Recupera o caminho absoluto
		modulePath = this.pathStack.join('/') + '/' + modulePath;
		
		http.open('GET', modulePath, false); http.send();
		// Gera um erro em caso de conteúdo vazio
		if (http.responseText == '')
			throw new Error(`Error importing module ${modulePath}`);
		// Interpreta o módulo
		eval.call(window, http.responseText);
		// Restaura a base relativa das URLs
		this.pathStack = originalPathStack;
	}});
	
	/** @var {Function} Pulsar~coreConstructors Todas as funções construtoras do núcleo. Utilizada para percorrer a árvore de inicialização */
	var coreConstructors = {};
	
	/** @var {Object} Pulsar~fusedPrototypes Todas as fusões de protótipos */
	var fusedPrototypes = {};
	
	/**
	 * Descritor de propriedades e métodos, estáticos e de instância.
	 * Todos os métodos e propriedades estão formatados para serem definidos através da função <b>Object.defineProperties()</b> nos momentos necessários
	 * @typedef {Object} Pulsar~SelfDescriptor
	 * @property {Object} static Descritor estático
	 * @property {Object} static.properties Todas as propriedades estáticas
	 * @property {Object} static.methods Todos os métodos estáticos
	 * @property {Object} instance Descritor de instância
	 * @property {Object} instance.properties Todas as propriedades de instância
	 * @property {Object} instance.methods Todos os métodos de instância
	 * @property {Function} close Congela o descritor e depois deleta a função.
	 */
	function SelfDescriptor()
	{
		this['static'] = 	{ 'properties': {}, 'methods': {} };
		this['instance'] = { 'properties': {}, 'methods': {} };
		this['relationships'] = [];
		this['constants'] = [];
		
		/**
		 * Congela todas as propriedades (inclusive as aninhadas) e depois deleta a função
		 * @method Pulsar~SelfDescriptor~close
		 */
		this.close = function()
		{ // Não será mais necessária
			delete this.close;
			
			for (var key1 in this)
			{ // Congela
				for (var key2 in this[key1])
				{
					for (var key3 in this[key1][key2])
						Object.freeze(this[key1][key2][key3]);
					
					Object.freeze(this[key1][key2]);
				}
				
				Object.freeze(this[key1]);
			}
			
			Object.freeze(this);
		}
	};
	
	/**
	 * Definição base para todas as classes criadas com o framework. Embora seja documentada como uma classe abstrata com membros de instância,
	 * isto deve ser entendido em um contexto meta-linguístico. As classes criadas pelo framework com <b>Pulsar.class</b> podem ser vistas como uma
	 * instância de uma definição do núcleo. As propriedades serão aplicadas através de <b>CoreDefinition.call</b> em cada classe definida pelo programador,
	 * e na classe <b>Object</b> durante a inicialização do framework (com Superclass = undefined, Superclasses = []).
	 * @class Pulsar~CoreDefinition
	 * @abstract
	 * @param {CoreDefinition[]} Superclasses As classes ancestrais, que pode conter apenas um elemento em caso de heraça simples
	 */
	function CoreDefinition(Superclasses)
	{
		/** @const {CoreDefinition} Pulsar~CoreDefinition#Superclass A classe ancestral. */
		Object.defineProperty(this, 'Superclass', { value: Superclasses[0], writable: false });
		
		/** @const {CoreDefinition[]} Pulsar~CoreDefinition#Superclasses As classes acestrais, que pode conter apenas um elemnto em caso de heraça simples */
		Object.defineProperty(this, 'Superclasses', { value: Superclasses, writable: false });
		
		/**
		 * @var {Pulsar~SelfDescriptor} Pulsar~CoreDefinition#privateDescriptor Descritor do escopo privado
		 * @private
		 */
		var privateDescriptor = new SelfDescriptor();
		
		/**
		 * Descritor de propriedades e métodos, estáticos e de instância.
		 * @const {Pulsar~SelfDescriptor} Pulsar~CoreDefinition.descriptor
		 */
		var publicDescriptor = this.publicDescriptor = new SelfDescriptor();
		
		var highestLayer = -1;
		// Recupera a camada mais alta entre as superclasses
		for (var i in Superclasses)
			if (Superclasses[i].layer > highestLayer)
				highestLayer = Superclasses[i].layer;
		
		/** @const {Number} Pulsar~CoreDefinition.layer Número da camada na árvore genealógica, igual a camada mais alta entre as superclasses + 1 */
		Object.defineProperty(this, 'layer', { value: highestLayer + 1, writable: false });
		
		/**
		 * @var {WeakMap} Pulsar~CoreDefinition.privateScope Contém todas as instâncias privadas da classe
		 * @private
		 * @property {WeakMap[]} supers Escopos privados das superclasses
		 */
		var privateScope = new WeakMap();
		
		/** @var {Function[]} Pulsar~CoreDefinition~superConstructors */
		var superConstructors = [];
		
		for (var i in Superclasses)
			superConstructors.push(coreConstructors[Superclasses[i].name]);
		// Inverte para otimizar as inicializações	
		superConstructors.reverse()
		
		this.construct = function(publicInstance)
		{
			for (var i in superConstructors)
				superConstructors[i](publicInstance);
			
			var privateInstance = {};
			
			Object.defineProperties(privateInstance, privateDescriptor['instance']['properties']);
			Object.defineProperties(publicInstance,  publicDescriptor ['instance']['properties']);
			
			var relationships = privateDescriptor['relationships'];
			
			for (var i in relationships)
			{
				var relationship = relationships[i];
				privateInstance[relationship] = privateInstance[relationship].create();
			}
			
			relationships = publicDescriptor['relationships'];
			
			for (var i in relationships)
			{
				var relationship = relationships[i];
				publicInstance[relationship] = publicInstance[relationship].create();
			}
			
			var constants = privateDescriptor['constants'];
			
			for (var i in constants)
			{
				var constant = constants[i];
				Object.defineProperty(privateInstance, constant, { writable: false });
			}
			
			constants = publicDescriptor['constants'];
			
			for (var i in constants)
			{
				var constant = constants[i];
				Object.defineProperty(publicInstance, constant, { writable: false });
			}
			
			var methods = privateDescriptor['instance']['methods'];
			
			for (var method in methods)
				Object.defineProperty(privateInstance, method, { value: privateDescriptor['instance']['methods'][method].value.bind(publicInstance), writable: true });
			
			privateScope.set(publicInstance, privateInstance);
		}
		
		coreConstructors[this.name] = this.construct;
		
		this.getDescriptors = function()
		{
			return { 'private': privateDescriptor, 'public': publicDescriptor };
		}
		
		/**
		 * Define as propriedades do corpo
		 * @method Pulsar~CoreDefinition~bodyDefiner
		 * @param {String} rules As regras para a definiçào. Pode ser qualquer combinação permitida entre os seguintes identificadores:<br>
		 * <ul>
		 *  <li><b>public:</b> Membro público (default), acessível através de 'this'. Precisa ser a primeira declaração. Imcompatível com <b>private</b></li>
		 *  <li><b>private:</b> Membro privado, acessível através de '$(this)'. Precisa ser a primeira declaração. Imcompatível com <b>public</b> e <b>static</b></li>
		 *  <li><b>static:</b> Membro de classe. Precisa vir antes de <b>var</b> ou <b>let</b>. Imcompatível com <b>private</b></li>
		 *  <li><b>var:</b> Membro mutável. Imcompatível com <b>let</b> e métodos</li>
		 *  <li><b>let:</b> Membro imutável. Imcompatível com <b>var</b>, propriedades computadas e métodos</li>
		 * </ul>
		 * @return Um objeto vazio onde será inserida a propriedade ou método
		 * @example
		 * Pulsar.class('MyClass', Object, function($)
		 * {
		 *   $('public var').a = 10;  // this.a
		 *   $('private let').b = 20; // $(this).b
		 *   $('static var').c = 30;  // MyClass.c
		 * })
		 */
		this.bodyDefiner = function(rules)
		{
			var definition = {
				rules: rules,
				name: {}, // Será passado um objeto oco como referência para evitar conflito entre nomes
				value: undefined
			};

			this.bodyDefiner.definitions.push(definition);

			return definition.name;
		};
		// Armazenará todas as definições do corpo (propriedades e métodos - estáticos e de instãncia)
		this.bodyDefiner.definitions = [];
		
		/**
		 * Acessa o escopo privado
		 * @method {Function} Pulsar~CoreDefinition~privateSelector
		 * @param {Pulsar~CoreDefinition} instance A instância a ser resgatado o escopo. Precisa ser da mesma classe em definição
		 * @return O escopo privado com todas as propriedades e métodos definidos com 'private'
		 */
		function privateSelector(instance)
		{
			return privateScope.get(instance);
		};
		
		/**
		 * @var {Function} Pulsar~CoreDefinitio~selfProcedureHook Referência usada por Pulsar~CoreDefinition~selfProcedure, para possibilitar mudança
		 * de comportamento dentro das definições de métodos e propriedades computadas sem adicionar controle de fluxo.
		 */
		var selfProcedureHook = this.bodyDefiner.bind(this);
		
		/**
		 * @callback Pulsar~CoreDefinition.selfProcedure Redireciona para a função apropriada, dependendo do escopo
		 * @param {String|Pulsar~CoreDefinition} rulesOrInstance Quando chamada no escopo local da função definidora da classe (fora do corpo dos métodos e
		 * propriedades computadas), este parâmetro deve ser uma string com as regras de definição contendo qualquer combinação permitida entre 'public',
		 * 'private', 'static', 'var' e 'let'. Quando chamada no escopo dos métodos e propriedades computadas, este parâmetro deve ser obrigatoriamente uma
		 * referência a uma instância da classe.
		 * @return {Object|Pulsar~CoreDefinition} Quando chamada no escopo local, o valor de retorno será um objeto vazio onde será armazenado a propriedade ou método.
		 * Quando chamada no escopo das propriedades e métodos, o valor de retorno será uma referência ao escopo privado da classe
		 */
		this.selfProcedure = function (rulesOrInstance)
		{
			return selfProcedureHook(rulesOrInstance);
		};
		
		Object.defineProperty(this.selfProcedure, 'ABSTRACT_PROPERTY', {
			get: function() {
				throw new TypeError(`Abstract property was not implemented in ${className} definition`);
			},
			set: function(newValue) {
				throw new TypeError(`Abstract property was not implemented ${className} definition`);
			}
		});
		
		Object.defineProperty(this.selfProcedure, 'ABSTRACT_FUNCTION', { value: function() {
			throw new TypeError(`Abstract method was not implemented in ${className} definition`);
		}});
		
		Object.defineProperty(this.selfProcedure, 'ABSTRACT_METHOD', { value: this.selfProcedure.ABSTRACT_FUNCTION });
		
		Object.defineProperty(this.selfProcedure, 'initialization', { value: null, writable: true });
		
		Object.defineProperty(this.selfProcedure, 'new', { value: function()
		{
			return new (function Relationship(args) {				
				this.arguments = [];
				this.Class = args.shift();
				
				for (var i in args)
					this.arguments.push(`args[${i}]`);
				
				this.arguments = `new ${this.Class.name}(${this.arguments.join(',')})`;
				
				this.create = function() {
					return eval(this.arguments);
				}
			})(Array.prototype.slice.call(arguments));
		}});
		
		Object.seal(this.selfProcedure);
		
		/**
		 * Congela o descritor da classe e remove as referências privadas do escopo público.
		 * @method CoreDefinition~closeDefinition
		 */
		this.closeDefinition = function()
		{
			var initialization = this.selfProcedure.initialization;
			
			privateDescriptor.close();
			publicDescriptor.close();
			
			delete this.closeDefinition;
			delete this.selfProcedure;
			delete this.construct;
			delete this.getDescriptors;
			delete this.bodyDefiner.definitions;
			delete this.bodyDefiner;
			
			selfProcedureHook = privateSelector;
			
			Object.defineProperties(this, publicDescriptor['static']['properties']);
			Object.defineProperties(this, publicDescriptor['static']['methods']);
			
			function isChildOf(Class, Ancestral)
			{
				for (var i in Class.Superclasses)
				{
					var Superclass = Class.Superclasses[i];

					if (Superclass === Ancestral)
						return parseInt(i) + 1;
					else if (isChildOf(Superclass, Ancestral))
						return parseInt(i) + 1;
				}

				return 0;
			}
			
			if (this.Superclass != undefined)
			{
				this.prototype = Object.create((Superclasses.length == 1) ? this.Superclass.prototype : fuse(Superclasses));
				// Só agora estabelece as próprias características, sobrescrevendo qualquer outra
				Object.defineProperties(this.prototype, publicDescriptor['instance']['methods']);
				
				this.prototype.instanceOf = function(Class)
				{
					var isInstance = isChildOf(this.constructor, Class);
					
					if (isInstance == 0)
						return (this.constructor === Class) ? 1 : 0;
					else
						return isInstance;
				}
				
				var superMethod = function(superIndex, instance, theArguments)
				{
					var args = Array.prototype.slice.call(theArguments);
					
					return Superclasses[superIndex].prototype[args.shift()].apply(instance, args);
				}
				
				this.prototype.super = function() { return superMethod(0, this, arguments); }
				
				for (var i = 0, count = this.Superclasses.length; i < count; i++)
					this.prototype.super[this.Superclasses[i].name] = function() { return superMethod(i, this, arguments) };
				
				for (var i in this.Superclasses)

				this.prototype.constructor = this;
			}
			
			Object.seal(this);
			
			if (initialization != null) initialization();
		}
	};
	
	/**
	 * Todas as definições de Pulsar~CoreDefinition estão aplicadas na classe nativa. Ela deve ser a raiz de qualquer outra classe definida.
	 * @class Object
	 * @augments undefined
	 */
	/** @var {Number} Object.layer A camada de Object é 0 */
	CoreDefinition.call(Object, []);
	
	Object.closeDefinition();
	
	/**
	 * Realiza a fusão entre os protótipos dos ramos para os nós especificados. A função percorre a árvore genealógica fundindo os nós em cada
	 * iteração, repetindo os nós das camadas mais baixas para evitar fusão entre duas classes do mesmo ramo (superclasse com subclasse)
	 * <a href="Pulsar_fuse.svg" target="_new"><img src=Pulsar_fuse.svg style="width:25%%"></img></a>.
	 * @method Pulsar~fuse
	 * @param {CoreDefinition[]} Classes As classes a serem fundidas
	 */
	function fuse(Classes)
	{ 
		if (Classes.length == 0)
			throw new Error('Array vazio');
		// Finaliza a recursão
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
	 * Função base para a criação de classes
	 * @method Pulsar#class
	 * @param {string} className - O nome da classe
	 * @param {Pulsar~CoreDefinition} superclasses - Zero ou mais superclases
	 * @param {Pulsar~bodyDefiner} body - Função definidora da classe, tendo como argumento uma referência à função definidora do núcleo 
	 * @example
	 * Pulsar.class('MyClass', Superclass1, Superclass2, function($) // Função definidora. Precisa ser anônima e ter '$' como argumento
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
	 *   $().init = function(args...)
	 *   {
	 *
	 *   }
	 *   // Método público
	 *   $().sum = function()
	 *   {
	 *     var v1 = this.a // Acesso a membro público
	 *     var v2 = $(this).b // Acesso a membro privado
	 *     return v1 +v2
	 *   }
	 *
	 * })
	 */
	/**
	 * @callback Pulsar~bodyDefiner
	 * @param {Pulsar~coreDefiner} $ Função definidora do núcleo
	 */
	this.class = function (/* className, superclass1, superClass2, ..., body */)
	{ // Converte o argumento para um array verdadeiro
		var args = Array.prototype.slice.call(arguments); // Referência: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Functions/arguments
		// Separa os argumentos
		var className = args.shift();  // Classe
		var classDefiner = args.pop(); // Definição - corpo da classe
		var Superclasses = args; 			 // Zero ou mais superclasses entre o primeiro e o último argumento
		// Verifica se há função definidora como último argumento, e se o argumento está correto
		if (typeof classDefiner !== 'function')
			throw new TypeError('You need provide the \'class definer function\' as last argument in \'' + className + '\' definition');
		else if (classDefiner.toString().match(/function[^)]+/) != 'function ($')
			throw TypeError('Invalid name for \'class definer\' argument in \'' + className + '\' definition. Use \'function($)\'');
		
		var privateInstances = new WeakMap();
		
		/** @class Pulsar~PrivateDefinition */
		//var PrivateDefinition = function (){};
		//CoreDefinition.call(PrivateDefinition, Superclasses);
		
		var CoreConstructor = undefined;
		
		var NewClass = window[className] = eval(`(function ${className}()
		{
			CoreConstructor(this);

			this.init.apply(this, arguments);
		})`);
		
		CoreDefinition.call(NewClass, Superclasses);
		CoreConstructor = NewClass.construct;
		
		classDefiner(NewClass.selfProcedure);
		
		//privateScopes.set(NewClass, privateInstances);
		
		// Evita definição direta, como '$.myVar = 15', por exemplo
		//for (var directDefinition in self)
			//throw new SyntaxError('Parenthesis missing after \'$\' keyword in \'' + className + '.' + directDefinition + '\' definition');
		// Membros privados a serem extraidos da função definidora e árvore genealógica 
		var privateMembers = {};
		// Utilizado na verificação de duplicatas
		var identifiers = [];
		
		var descriptors = NewClass.getDescriptors();

		for (var i in NewClass.bodyDefiner.definitions)
		{
			var definition = NewClass.bodyDefiner.definitions[i]; // Cache
			var tokens = (definition.rules != undefined) ? definition.rules.split(' ') : []; // Valores em $('token1 token2 token3...')
			var identifier = Object.keys(definition.name)[0]; // Nome em $('tokens').identifier
			var content = definition.name[identifier]; // Valor em $('tokens').identifier = content
			// Impede duplicatas
			//for (var i in identifiers)
				//if (identifier == identifiers[i])
					//throw new SyntaxError('Duplicated identifier \'' + identifier + '\' in \'' + className + '.' + identifier + '\' definition');
			
			identifiers.push(identifier);
			// Flag para os descritores
			var accessLevel = 'public';
			var instanceOrStatic = 'instance';
			var propertyOrMethod = 'properties'
			// Lista para interpretação dos tokes
			var checkList = {
				'': 0,
				'public': 0,
				'private': 0,
				'static': 0,
				'cached': 0,
				'let': 0,
				'var': 0
			};
			
			for (var i in tokens)
			{
				var token = tokens[i];

				switch (token)
				{
					case '':
					{ // String vazia
						if (tokens.length == 1)
							throw new SyntaxError('Empty string on \'' + className + '.' + identifier + '\' definition');
					}continue;

					case 'private':
					{ 
						if (++checkList['private'] > 1) // Duplicado
							throw new SyntaxError('Duplicated \'private\' declaration in \'' + className + '.' + identifier + '\' definition');
						if (checkList['public'] > 0) // Imcompatível com 'public'
							throw new SyntaxError('Incompatible \'public\' and \'private\' declaration in \'' + className + '.' + identifier + '\' definition');
						// Exige que seja a primeira declaração
						for (var item in checkList)
							if (item != '' && item != 'private' && checkList[item] > 0)
								throw new SyntaxError('\'private\' statement needs be the first declaration in \'' + className + '.' + identifier + '\' definition');

						accessLevel = 'private';
					}break;

					case 'public':
					{
						if (++checkList['public'] > 1) // Duplicado
							throw new SyntaxError('Duplicated \'public\' declaration in \'' + className + '.' + identifier + '\' definition');
						if (checkList['private'] > 0) // Imcompatível com 'private'
							throw new SyntaxError('Incompatible \'public\' and \'private\' declaration in \'' + className + '.' + identifier + '\' definition');
						// Exige que seja a primeira declaração
						for (var item in checkList)
							if (item != '' && item != 'public' && checkList[item] > 0)
								throw new SyntaxError('\'public\' statement needs be the first declaration in \'' + className + '.' + identifier + '\'definition');

						accessLevel = 'public';
					}break;

					case 'static':
					{
						if (++checkList['static'] > 1) // Duplicado
							throw new SyntaxError('Duplicated \'static\' declaration in \'' + className + '.' + identifier + '\' definition');
						if (checkList['private'] > 0) // Imcompatível com 'private'
							throw new SyntaxError('Unalowed access level \'private\' for static member in \'' + className + '.' + identifier + '\'definition');
						if (checkList['let'] > 0 || checkList['var'] > 0) // Exige que seja declarado antes de 'let' ou 'var'
							throw new SyntaxError('\'static\' statement needs be declared before \'let\' and \'var\' in \'' + className + '.' + identifier + '\'definition');

						instanceOrStatic = 'static';
					}break;
						
					case 'cached':
					{
						if (++checkList['cached'] > 1)
							throw new SyntaxError(`Duplicated 'cached' statement in '${className}.${identifier}' definition`);
						if (checkList['public'] > 0) // Incompatível com públic
							throw new SyntaxError(`'cached' statement incompatible with 'private' in '${className}.${identifier}' definition`);
						
						var nextToken = tokens[parseInt(i, 10) + 1];
						
						if (nextToken != 'let' && nextToken != 'var')
							throw new SyntaxError(`Missing 'var' or 'let' after 'cached' statement in '${className}.${identifier}' definition`);
					}break;

					case 'let':
					{
						if (++checkList['let'] > 1) // Duplicado
							throw new SyntaxError('Duplicated \'let\' declaration in \'' + className + '.' + identifier + '\' definition');
						if (checkList['var'] > 0) // Imcompatível com 'var'
							throw new SyntaxError('Incompatible \'var\' and \'let\' combination in \'' + className + '.' + identifier + '\' definition');
						if (content != undefined && content != null && content.constructor.name == 'Object') // Imcompatível com propriedades computadas
							throw new TypeError('Imcompatible \'let\' declaration with computed var in \'' + className + '.' + identifier + '\'definition');
					}break;

					case 'var':
					{
						if (++checkList['var'] > 1) // Duplicado
							throw new SyntaxError('Duplicated \'var\' declaration in \'' + className + '.' + identifier + '\' definition');
						if (checkList['let'] > 0) // Imcompatível com let
							throw new SyntaxError('Incompatible \'let\' and \'var\' combination in \'' + className + '.' + identifier + '\' definition');
					}break;
					// Token desconhecido
					default:
						throw new SyntaxError('Unexpected token \'' + token + '\' on \'' + className + '.'  + identifier + '\' definition');
				}
			}
			// Exige que as propriedades possuam o descritor 'var' or 'let'
			if (!checkList['let'] && !checkList['var'] && typeof content !== 'function')
				throw new SyntaxError('Missing \'var\' or \'let\' statement in \'' + className + '.' + identifier + '\' definition');
			
			if (content != undefined && content != null)
			{ // Funções do conteúdo. Para métodos = 1, para propriedades computadas = 1+, e em outros casos = 0
				var functions = [];

				if (content.constructor.name == 'Object') // Se propriedade computada
					for (var key in content) // Extrai as funções acessoras
						functions.push(content[key]);
				else if (typeof content === 'function') // Se função
					if (checkList['let'] || checkList['var']) // Proíbe o uso de 'let' or 'var'
						throw new SyntaxError('Method specification does not accept \'let\' or \'var\' statement in \'' + className + '.' + identifier + '\' definition');
					else { // Extai a função (única)
						functions.push(content); propertyOrMethod = 'methods';
					}
				// Analiza as funções em 	busca de seletores privados
				/*for (var i in functions)
				{ // Recupera a string, remove os comentários e procura todas as declarações privadas ('$(this)')
					var privateAccessors = functions[i].toString().replace(/\/\*([\s\S]*?)\*\/|\/\/[^\n]+/g, '').match(/\$\s*\([^)]+\)/g);
					// Proíbe acesso a outras referências diferente de 'this'
					for (var i in privateAccessors)
						if (privateAccessors[i] != '$(this)')
							throw new TypeError('Unexpected identifier \'' + privateAccessors[i] + '\' in \'' + className + '.' + identifier + '\' definition. Use \'$(this)\'');
				}*/
			}
			
			var descriptor = descriptors[accessLevel];
			// Evita duplicatas
			for (var i in descriptor[instanceOrStatic][propertyOrMethod])
				if (descriptor[instanceOrStatic][propertyOrMethod][i] == identifier)
					throw new SyntaxError('Duplicated identifier \'' + identifier + '\' in \'' + className + '.' + identifier + '\' definition');
			// Tudo Ok. Agora apenas formata a definição
			if (checkList['let']) { // Propriedade armazenada e constante
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
			
			descriptor[instanceOrStatic][propertyOrMethod][identifier] = definition;
			
			if (checkList['cached'])
				descriptors['private'][instanceOrStatic][propertyOrMethod][identifier] = { value: undefined, writable: true };
			
			if (content != undefined && content != null && content.constructor.name == 'Relationship')
				descriptor['relationships'].push(identifier);
		}
		
		NewClass.closeDefinition();
	};

	Object.freeze(this);
}});