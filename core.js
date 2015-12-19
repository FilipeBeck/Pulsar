"use strict";

/**
 * @fileoverview Núcleo do framework. Este deve ser o primeiro arquivo a ser carregado pelo documento
 * @author {@link filipe.beck@gmail.com Filipe Beck}
 * @version 0.1
 */

/**
 * Utilizada na criação de simples dicionários dentro das definições de classe, sendo a classe 'Object' usada apenas em propriedades computadas.
 * @class Dictionary
 * @example
 *
 * $('var').property = { // Isso cria uma propriedade computada
 *   get: function() {...}, // value = this.property
 *   set: function(newValue) {...} // this.property = newValue
 * }
 *  
 * $('var').property = new Dictionary ({ // Isso cria um simples dicionário
 *   get: function() {...}, // value = this.property.get()
 *   set: function(newValue) {...} // this.property.set(newValue)
 * })
 *	@param {object} descriptor O objeto com as propriedades a serem copiadas
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
/**
 * Importa o módulo especificado, se já não foi importado
 * @method $#import
 * @param {string} modulePath A URL do módulo. Se o módulo já foi importado, simplesmente retorna
 */
Object.defineProperty($, 'import', { value: function(modulePath)
{ // Evita a adição de módulos já importados, imprimindo uma mensagem de aviso e retornando
	for (var i in this.importedPaths)
		if (modulePath == this.importedPaths[i]) {
			console.warn('The module \'' + modulePath + '\' is already imported'); return;
		}

	var http = new XMLHttpRequest({mozAnon: false, mozSystem: true});
	
	http.onreadystatechange = function ()
	{
    if (http.readyState !== XMLHttpRequest.DONE)
    	console.log('$.import.http.readyState', http.readyState);
    if (http.status !== 200)
    	console.log('$.import.http.status', http.status);
	};
	
	http.open('GET', modulePath, false); http.send();
	// Interpreta o módulo e registra o módulo como 'importado'
	eval(http.responseText); this.importedPaths.push(modulePath);
}});
/**
 * @var {string[]} $#importedPaths Módulos já importados
 */
Object.defineProperty($, 'importedPaths', { value: [] });

/**
 * Núcleo do framework. Utilizada na criação de classes
 * @namespace Pulsar
 */
window['Pulsar'] = new function Pulsar()
{
	/**
	 * Definição base para todas as classes criadas com o framework. Embora seja documentada como uma classe abstrata com membros estáticos, isto deve ser
	 * entendido em um contexto meta-linguístico. As classes criadas pelo framework com <b>Pulsar.class</b> podem ser vistas como uma
	 * instância de uma definição núcleo. As propriedades serão aplicadas através de <b>CoreDefinition.call</b> em cada classe definida pelo programador,
	 * e na classe <b>Object</b> durante a inicialização do framework (com Superclass = undefined, Superclasses = []).
	 * @class Pulsar~CoreDefinition
	 * @abstract
	 * @param {CoreDefinition} Superclass A classe ancestral. Precisa ser outra classe definida pelo framework ou Object.
	 * @param {CoreDefinition[]} Superclasses As classes acestrais, que pode conter apenas um elemnto em caso de heraça simples
	 */
	function CoreDefinition(Superclass, Superclasses)
	{
		/** @var {CoreDefinition} Pulsar~CoreDefinition.Superclass A classe ancestral. */
		Object.defineProperty(this, 'Superclass', { value: Superclass, writable: false });
		/** @var {CoreDefinition[]} Pulsar~CoreDefinition.Superclasses As classes acestrais, que pode conter apenas um elemnto em caso de heraça simples */
		Object.defineProperty(this, 'Superclasses', { value: Superclasses, writable: false });
		/**
		 * Descritor de propriedades e métodos, estáticos e de instância.
		 * Todos os métodos e propriedades estão formatados para serem definidos através da função <b>Object.defineProperties()</b> nos momentos necessários
		 * @var {Object} Pulsar~CoreDefinition.descriptor
		 * @property {Object} static Descritor estático
		 * @property {Object} static.properties Todas as propriedades estáticas
		 * @property {Object} static.methods Todos os métodos estáticos
		 * @property {Object} instance Descritor de instância
		 * @property {Object} instance.properties Todas as propriedades de instância
		 * @property {Object} instance.methods Todos os métodos de instância
		 */
		Object.defineProperty(this, 'descriptor', {
			value: {
				'static': 	{ 'properties': {}, 'methods': {} },
				'instance': { 'properties': {}, 'methods': {} },
			},
			writable: false
		});
		
		var highestLayer = -1;
		// Recupera a camada mais alta entre as superclasses
		for (var i in Superclasses)
			if (Superclasses[i].layer > highestLayer)
				highestLayer = Superclasses[i].layer;
		/** @var {Number} Pulsar~CoreDefinition.layer Número da camada na árvore genealógica, igual a camada mais alta entre as superclasses + 1 */
		Object.defineProperty(this, 'layer', { value: highestLayer + 1, writable: false });
		
		this.close = function()
		{			
			for (var key1 in this.descriptor)
				for (var key2 in this.descriptor[key1])
					Object.freeze(this.descriptor[key1][key2]);
		}
	};
	
	/**
	 * Varre a árvore genealógica, combinando o protótipo das superclasses ao protótipo da subclasse.
	 * O setup ocorre da raiz às subclasses, possibilitando sobrescrita de propriedades e méthodos pelas classes herdeiras (e não o contrário)
	 * @method Pulsar~inheritPublicGenealogy
	 * @param Subclass A classe herdeira
	 * @param Superclasse A classe a ser herdada
	 */
	/*function inheritPublicGenealogy(Subclass, Superclass)
	{	// Primeiro propaga
		if (Superclass.Superclasses != undefined)
			for (var AncestralClass in Superclass.Superclasses.slice().reverse()) // Prioridade por ordem de declaração
				inheritPublicGenealogy(Subclass, Superclass.Superclasses[AncestralClass]);
		// Se não for classe embutida (nativa)
		if (Superclass.descriptor != undefined)
			Object.defineProperties(Subclass.prototype, Superclass.descriptor['instance']['methods']);
	}*/

	/** @var {WeakMap} Pulsar~PrivateDefinitions Descritores das propriedades e métodos privados de todas as classes */
	var PrivateDefinitions = new WeakMap();	
	/** @var {WeakMap} Pulsar~privateScopes Todas as instãncias criadas pelo framework */
	var privateScopes = new WeakMap();
	
	CoreDefinition.call(Object, undefined, []);
	var PrivateObjectDefinition = function (){};
	CoreDefinition.call(PrivateObjectDefinition, undefined, []);
	PrivateDefinitions.set(Object, PrivateObjectDefinition);
	var privateObjectInstances = new WeakMap();
	privateScopes.set(Object, privateObjectInstances);

	/**
	 * Varre a árvore genealógica, combinando o descritor privado das superclasses ao descritor da subclasse.
	 * O setup ocorre da raiz às subclasses, possibilitando sobrescrita de propriedades e métodos pelas clases herdeiras (e não o contrário)
	 * @method Pulsar~inheritPrivateGenealogy
	 * @param PrivateScope O descritor da classe herdeira
	 * @param Superclass A classe a ser herdada
	 */
	/*function inheritPrivateGenealogy (PrivateScope, Superclass)
	{ // Primeiro propaga
		if (Superclass.Superclasses != undefined)
			for (var AncestralClass in Superclass.Superclasses.slice().reverse()) // Prioridade por ordem de declaração
				inheritPrivateGenealogy(PrivateScope, Superclass.Superclasses[AncestralClass]);
		// Recupera o escopo privado da superclasse...
		var SuperclassScope = PrivateDefinitions.get(Superclass);
		// ... que pode ser indefinido caso for uma classe embutida da linguagem
		if (SuperclassScope != undefined) 
			Object.defineProperties(PrivateScope.prototype, SuperclassScope.descriptor['instance']['methods']);
	}*/
	
	/**
	 * @method Pulsar~fuse
	 */
	function fuse(Classes)
	{ 
		if (Classes.length == 1)
			return Classes[0];
		
		var fusedName = '';
		var SuperClasses = [];
		
		var highestLayer = -1;
		
		for (var i in Classes)
			if (highestLayer < Classes[i].layer)
				highestLayer = Classes[i].layer;
		
		for (var i in Classes)
		{
			var Class = Classes[i];
			
			fusedName += '$' + Class.name;
			
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
		
		var SuperClass = fuse(SuperClasses);
		
		if (window[fusedName] == undefined)
			window['Pulsar'].class(fusedName, SuperClass, function($){});
		
		var FusedClass = window[fusedName];
		var FusedPrivateDefinition = PrivateDefinitions.get(FusedClass);
		
		for (var i in Classes.reverse())
		{
			var Class = Classes[i];
			var PrivateDefinition = PrivateDefinitions.get(Class);
			// Só agora estabelece as próprias características, sobrescrevendo qualquer outra
			Object.defineProperties(FusedClass.prototype, Class.descriptor['instance']['methods']);
			Object.defineProperties(FusedPrivateDefinition.prototype, PrivateDefinition.descriptor['instance']['methods']);
			// Estabelece os membros estáticos
			Object.defineProperties(FusedClass, Class.descriptor['static']);
		}
		
		return FusedClass;
	}

	/**
	 * Função base para a criação de classes
	 * @method Pulsar#class
	 * @param {string} className - O nome da classe
	 * @param {Object} superclasses - Zero ou mais superclases
	 * @param {Function} body - Função definidora da classe, tendo como argumento uma referência à função definidora do núcleo 
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
	this.class = function (/* className, superclass1, superClass2, ..., body */)
	{ // Converte o argumento para um array verdadeiro
		var args = Array.prototype.slice.call(arguments); // Referência: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Functions/arguments
		// Separa os argumentos
		var className = args.shift();  // Classe
		var classDefiner = args.pop(); // Definição - corpo da classe
		var Superclasses = args; 			 // Zero ou mais superclasses entre o primeiro e o último argumento
		var bodyDefinitions = [];		   // Armazenará todas as definições do corpo (propriedades e métodos - estáticos e de instãncia)
		// Verifica se há função definidora como último argumento, e se o argumento está correto
		if (typeof classDefiner !== 'function')
			throw new TypeError('You need provide the \'class definer function\' as last argument in \'' + className + '\' definition');
		else if (classDefiner.toString().match(/function[^)]+/) != 'function ($')
			throw TypeError('Invalid name for \'class definer\' argument in \'' + className + '\' definition. Use \'function($)\'');
		
		var privateInstances = new WeakMap();
		
		// Define as propriedades
		function bodyDefiner(rules)
		{
			var definition = {
				rules: rules,
				name: {}, // Será passada essa variável como referência para evitar conflito entre nomes
				value: undefined
			};

			bodyDefinitions.push(definition);

			return definition.name;
		};
		// Acessa o seletor privado
		function privateAccessor(instance)
		{
			//if (!(instance instanceof window[className]))
				//throw new TypeError('Attempting to access the private scope from a different class');
			
			return privateInstances.get(instance);
		};
		// Por enquanto, '$' define as propriedades
		var selfProcedure = bodyDefiner;
		// Redireciona para a função apropriada, dependendo do escopo
		var self = function (rulesOrInstance)
		{
			return selfProcedure(rulesOrInstance);
		};
		
		Object.defineProperty(self, 'ABSTRACT_PROPERTY', {
			get: function() {
				throw new TypeError(`Abstract property was not implemented`);
			},
			set: function(newValue) {
				throw new TypeError(`Abstract property was not implemented`);
			}
		});
		
		Object.defineProperty(self, 'ABSTRACT_FUNCTION', { value: function() {
			throw new TypeError(`Abstract method was not implemented`);
		}});
		
		Object.defineProperty(self, 'ABSTRACT_METHOD', { value: self.ABSTRACT_FUNCTION });
		Object.freeze(self);
		
		classDefiner(self);
		
		/** @class Pulsar~PrivateDefinition */
		var PrivateDefinition = function (){};
		CoreDefinition.call(PrivateDefinition, Superclasses[0], Superclasses);
		
		function PulsarConstructor()
		{
			var privateScope = {}
			privateInstances.set(this, privateScope);
			
			(function defineProperties(Class, instance)
			{
				if (Class.Superclasses != undefined)
					for (var i in Class.Superclasses.slice().reverse())
						defineProperties(Class.Superclasses[i], instance);
				
				if (Class.descriptor != undefined)
				{
					Object.defineProperties(instance, Class.descriptor['instance']['properties']);		
					Object.defineProperties(privateScope, PrivateDefinitions.get(Class).descriptor['instance']['properties']);
					
					privateScopes.get(Class).set(instance, privateScope);
				}
			})(window[className], this);
			
			Object.seal(this)
			Object.seal(privateScope);
			
			this.init.apply(this, arguments);
			
			for (var property in this)
				if (this[property] == undefined)
					throw new TypeError(`Undefined property values after initialization in ${this.constructor.name} definition`);
		}
		
		/** @class Object */
		var NewClass = window[className] = eval(`(function ${className}() { PulsarConstructor.apply(this, arguments); })`);
		
		CoreDefinition.call(NewClass, Superclasses[0], Superclasses);
		
		privateScopes.set(NewClass, privateInstances);
		
		// Evita definição direta, como '$.myVar = 15', por exemplo
		//for (var directDefinition in self)
			//throw new SyntaxError('Parenthesis missing after \'$\' keyword in \'' + className + '.' + directDefinition + '\' definition');
		// Membros privados a serem extraidos da função definidora e árvore genealógica 
		var privateMembers = {};
		// Utilizado na verificação de duplicatas
		var identifiers = [];

		for (var i in bodyDefinitions)
		{
			var definition = bodyDefinitions[i]; // Cache
			var tokens = (definition.rules != undefined) ? definition.rules.split(' ') : []; // Valores em $('token1 token2 token3...')
			var identifier = Object.keys(definition.name)[0]; // Nome em $('tokens').identifier
			var content = definition.name[identifier]; // Valor em $('tokens').identifier = content
			// Impede duplicatas
			for (var i in identifiers)
				if (identifier == identifiers[i])
					throw new SyntaxError('Duplicated identifier \'' + identifier + '\' in \'' + className + '.' + identifier + '\' definition');
			
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
			// Tudo Ok. Agora apenas formata a definição
			if (checkList['let']) // Propriedade armazenada e constante
				definition = { value: content, writable: false };
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
			
			if (accessLevel == 'public')
				NewClass.descriptor[instanceOrStatic][propertyOrMethod][identifier] = definition;
			else
				PrivateDefinition.descriptor[instanceOrStatic][propertyOrMethod][identifier] = definition;
		}
		// A partir de agora, '$' será usado como seletor privado dentro das propriedades computadas e métodos
		selfProcedure = privateAccessor;
		// Estabelece os membros estáticos
		Object.defineProperties(NewClass, NewClass.descriptor['static']);
		
		var Superclass = (Superclasses.length == 1) ? NewClass.Superclass : fuse(Superclasses.slice());

		NewClass.prototype = Object.create(Superclass.prototype);

		var x = PrivateDefinitions.get(Superclass)
		if (x != undefined)
			PrivateDefinition.prototype = Object.create(x.prototype);
		
		// Só agora estabelece as próprias características, sobrescrevendo qualquer outra
		Object.defineProperties(NewClass.prototype, NewClass.descriptor['instance']['methods']);
		Object.defineProperties(PrivateDefinition.prototype, PrivateDefinition.descriptor['instance']['methods']);
		PrivateDefinitions.set(NewClass, PrivateDefinition);

		NewClass.prototype.constructor = NewClass;
		//Object.defineProperty(NewClass.prototype, 'constructor', { value: NewClass });
	};

	Object.freeze(this);
};