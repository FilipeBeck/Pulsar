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
	@fileoverview Tipos e operações geométricas
*/

class Metric
{
	constructor(value, mu, element)
	{
		if (value.constructor.name == 'String') {
			if (!value.length) {
				this.value = 0
				this.mu = 'UNDEF'
				return
			}

			if (value.startsWith('var')) {
				value = value.match(/--[\s\S][^)]*/)[0]
				// TODO: Melhorar - (por enquanto estabelece o primeiro encontrado)
				sheetLoop: for (let i = 0, count = document.styleSheets.length; i < count; i++) {
					let sheet = document.styleSheets[i]

					for (let i = 0, count = sheet.cssRules.length; i < count; i++)  {
						let match = sheet.cssRules[i].cssText.match(new RegExp(`${value}[^;]*`))

						if (match) {
							value = match[0].match(/[^:\s]*$/)[0]; break sheetLoop
						}
					}
				}
			}

			if (value.endsWith('%')) {
				this.value = parseFloat(value.substring(0, value.length - 1))
				this.mu = '%'
				this.element = element
			}
			else if (value.startsWith('#')) {
				value = value.substring(1)
				this.value = []

				for (let i = 0, count = value.length, range = count == 6 ? 2 : 1; i < count; i += range)
					this.value.push(parseInt(value.substring(i, i + range), 16))

				this.mu = '#'
			}
			else if (value.startsWith('rgb')) {
				this.mu = value.startsWith('rgba') ? 'rgba' : 'rgb'
				value = value.match(/[0-9.,\s]*(?=\))/)[0].split(',')

				for (let i = 0; i < 3; i++)
					value[i] = parseInt(value[i])

				if (value.length == 4)
					value[3] = parseFloat(value[3])

				this.value = value
			}
			else {
				if (!isNaN(value)) {
					this.value = parseFloat(value)
					this.mu = mu || 'UNDEF'
				}
				else {
					this.value = parseFloat(value.substring(0, value.length - 2))

					if (isNaN(this.value)) {
						this.value = 0
						this.mu = 'PX'
					}
					else {
						this.mu = value.substring(value.length - 2).toUpperCase()
					}
				}
			}

			if (mu) {
				if (mu.startsWith('rgba')) {
					if (this.value.length == 3)
						this.value.push(1)
				}
				else if (mu == '#' || mu.startsWith('rgb')) {
					if (this.value.length == 4)
						this.value.pop()
				}
				else {
					mu = mu.toUpperCase()
					this.value *= Metric[this.mu] / Metric[mu]
				}

				this.mu = mu
			}
		}
		else {
			this.value = value
			this.mu = mu || 'UNDEF'
		}

		Object.seal(this)
	}

	sumColor(rhs)
	{
		let sum = []

		if (rhs.constructor.name == 'Metric') {
			for (let i = 0, count = this.value.length; i < count; i++)
				sum.push(this.value[i] + (rhs.value[i] || 0))

			return new Metric(sum, this.mu)
		}
		else {
			for (let i = 0, count = this.value.length; i < count; i++)
				sum.push(this.value[i] + rhs)

			return new Metric(sum, this.mu)
		}
	}

	subColor(rhs)
	{
		let sub = []

		if (rhs.constructor.name == 'Metric') {
			for (let i = 0, count = this.value.length; i < count; i++)
				sub.push(this.value[i] - (rhs.value[i] || 0))

			return new Metric(sub, this.mu)
		}
		else {
			for (let i = 0, count = this.value.length; i < count; i++)
				sum.push(this.value[i] - rhs)

			return new Metric(sub, this.mu)
		}
	}

	mulColor(rhs)
	{
		let mul = []

		if (rhs.constructor.name == 'Metric') {
			for (let i = 0, count = this.value.length; i < count; i++)
				mul.push(this.value[i] * (rhs.value[i] || 1))

			return new Metric(mul, this.mu)
		}
		else {
			for (let i = 0, count = this.value.length; i < count; i++)
				mul.push(this.value[i] * rhs)

			return new Metric(mul, this.mu)
		}
	}

	divColor(rhs)
	{
		let div = []

		if (rhs.constructor.name == 'Metric') {
			for (let i = 0, count = this.value.length; i < count; i++)
				div.push(this.value[i] / (rhs.value[i] || 1))

			return new Metric(div, this.mu)
		}
		else {
			for (let i = 0, count = this.value.length; i < count; i++)
				div.push(this.value[i] / rhs)

			return new Metric(div, this.mu)
		}
	}

	sumLength(rhs)
	{
		if (rhs.constructor.name == 'Metric') {
			return new Metric(this.value + (rhs.value * (Metric[rhs.mu] / Metric[this.mu])), this.mu)
		}
		else {
			return new Metric(this.value * rhs, this.mu)
		}
	}

	subLength(rhs)
	{
		if (rhs.constructor.name == 'Metric') {
			return new Metric(this.value - (rhs.value * (Metric[rhs.mu] / Metric[this.mu])), this.mu)
		}
		else {
			return new Metric(this.value - rhs, this.mu)
		}
	}

	mulLength(rhs)
	{
		if (rhs.constructor.name == 'Metric') {
			return new Metric(this.value * (rhs.value * (Metric[rhs.mu] / Metric[this.mu])), this.mu)
		}
		else {
			return new Metric(this.value * rhs, this.mu)
		}
	}

	divLength(rhs)
	{
		if (rhs.constructor.name == 'Metric') {
			return new Metric(this.value / (rhs.value * (Metric[rhs.mu] / Metric[this.mu])), this.mu)
		}
		else {
			return new Metric(this.value / rhs, this.mu)
		}
	}

	sum(rhs)
	{
		if (Metric[this.mu])
			return this.sumLength(rhs)
		else
			return this.sumColor(rhs)
	}

	sub(rhs)
	{
		if (Metric[this.mu])
			return this.subLength(rhs)
		else
			return this.subColor(rhs)
	}

	mul(rhs)
	{
		if (Metric[this.mu])
			return this.mulLength(rhs)
		else
			return this.mulColor(rhs)
	}

	div(rhs)
	{
		if (Metric[this.mu])
			return this.divLength(rhs)
		else
			return this.divColor(rhs)
	}

	toString()
	{
		if (Metric[this.mu]) {
			return this.value + (this.mu != 'UNDEF' ? this.mu : '')
		}
		else {
			if (this.mu == '#') {
				let result = []

				for (let i = 0; i < 3; i++) {
					let value = this.value[i].toString(16)

					result.push(value.length == 2 ? value : '0' + value)
				}

				return this.mu + result.join('')
			}
			else {
				let fixed = []

				for (let i = 0; i < 3; i++)
					fixed.push(this.value[i].toFixed())

				if (this.value.length == 4)
					fixed.push(this.value[3])

				return `${this.mu}(${fixed.join(',')})`
			}
		}
	}
}

Object.defineProperties(Metric, {
	PX: { value: 1 },
	CM: { value: 96 / 2.54 }, // 96px = 2.54cm
	MM: { value: (96 / 2.54) / 10 },
	IN: { value: 96 },
	PT: { value: 96 / 72 },
	PC: { value: 12 * (96 / 72) },
	UNDEF: { value: 1 }
})

/**
	Par de coordenadas 2D
*/
class Point
{
	/**
		Constrói um ponto com as coordenadas especificadas
		@param {Float} x Abscissa
		@param {Float} y Ordenada
	*/
	constructor(x, y)
	{
		this.x = x
		this.y = y

		Object.seal(this)
	}
}

/**
	Dimensão 2D
*/
class Size
{
	/**
		Constrói um tamanho com as dimensões especificadas
		@param {Float} width Largura
		@param {Float} height Altura
	*/
	constructor(width, height)
	{
		this.width = width
		this.height = height

		Object.seal(this)
	}
}

/**
	Figura quadrilátera de ângulos internos retos
*/
class Rectangle
{
	/**
		Constrói um retângulo com os parâmetros especificados
		@param {Point} point Ponto
		@param {Size} size Tamanho
	*/
	/**
		Constrói um retângulo com os parâmetros especificados
		@param {Point|Float} origin Ponto ou abscissa do canto superior esquerdo
		@param {Size|Float} origin Tamanho ou ordenada do canto superior esquerdo. Se o primeiro argumento for um ponto, esse deve ser um tamanho
		@param {?Float} width Largura. Se o primeiro argumento for um ponto, esse será ignorado
		@param {?Float} height Tamanho. Se o primeiro argumento for um ponto, esse será ignorado
	*/
	constructor()
	{
		var args = Array.prototype.slice.call(arguments)

		if (args.length == 2) {
			this.origin = args[0]
			this.size = args[1]
		}
		else {
			this.origin = new Point(args[0], args[1])
			this.size = new Size(args[2], args[3])
		}

		Object.seal(this)
	}

	/** Abscissa do canto esquerdo */
	get left() {
		return this.origin.x
	}
	set left(n) {
		this.origin.x = n
	}

	/** Ordenada do canto superior */
	get top() {
		return this.origin.y
	}
	set top(n) {
		this.origin.y = n
	}

	/** Abscissa do canto direito */
	get right() {
		return this.origin.x + this.size.width
	}
	set right(n) {
		this.size.width = n - this.origin.x
	}

	/** Ordenada do canto inferior */
	get bottom() {
		return this.origin.y + this.size.height
	}
	set bottom(n) {
		this.size.height = n - this.origin.y
	}

	/**
		Verifica se o ponto especificado está dentro de `this`
		@param {Point} point Ponto a ser verificado
	*/
	contains(point)
	{
		return point.x >= this.origin.x && point.x <= this.right && point.y >= this.origin.y && point.y <= this.bottom
	}
}
