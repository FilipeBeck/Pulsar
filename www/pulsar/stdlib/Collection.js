/**
	Utilizada na criação de simples dicionários dentro das definições de classe.
	@class Dictionary
	@augments Object
	@param {object} descriptor O objeto com as propriedades a serem copiadas
	@example
	*
	* $('var').property = $.new(Dictionary, {
	*   a: 10, // value = this.property.a
	*   b: 20  // value = this.property.b
	* })
*/
class Dictionary
{
	static copy(source, destiny, keys)
	{
		if (keys) {
			for (let i = 0, count = keys.length; i < count; i++) {
				let key = keys[i]
				destiny[key] = source[key]
			}
		}
		else {
			Object.assign(destiny, source)
		}

		return destiny
	}

	constructor(content, keys)
	{
		Dictionary.copy(content, this, keys)
	}

	get keys()
	{
		return Object.keys(this)
	}

	forEach(handler)
	{
		for (let key in this)
			handler(key, this[key])
	}

	copyTo(destiny, keys)
	{
		return Dictionary.copy(this, destiny, keys)
	}

	copyFrom(source, keys)
	{
		return Dictionary.copy(source, this, keys)
	}
}

Object.defineProperties(Array.prototype,
{
	'first': { get: function() {
		return this[0]
	}},
	'last': { get: function() {
		return this[this.length - 1]
	}}
})

class Coordinator
{
	constructor()
	{
		Reflect.defineProperty(this, 'coordenations', { value: new WeakMap() })
	}

	revoke(proxy)
	{
		let coordenation = this.coordenations.get(proxy)
		coordenation.revoke()
		this.coordenations.delete(proxy)
	}

	proxyFor(collection)
	{
		if (!collection.length)
			return null

		let coordenation = Proxy.revocable(collection, {
			get: function (collection, property) {
				if (collection[0] && collection[0][property].constructor.name == 'Function') {
					return function() {
						for (let i = 0, count = collection.length; i < count; i++)
							collection[i][property].apply(collection[i], arguments)
					}
				}
				else {
					return collection[0] ? collection[0][property] : undefined
				}
			},
			set: function (collection, property, value) {
				for (let i = 0, count = collection.length; i < count; i++)
					collection[i][property] = value
			}
		})

		this.coordenations.set(coordenation.proxy, coordenation)

		return coordenation.proxy
	}
}
