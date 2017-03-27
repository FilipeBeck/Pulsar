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

$.import('BorderBox.js')
$.import('../stdlib/Collection.js')

Pulsar.class('NavigationBar', 'BorderBox', function($)
{
	$.initialization = function()
  {
    View.insertCSSRules({
      '.ps-navigation-bar': {
				'*': {
	        'vertical-align': 'middle',
					'text-align': 'center'
	      },
	      '.top': {
					'padding': '10px'
	      },
	      '.content-view': {

	      },
	      '.bottom': {
					'vertical-align': 'bottom'
	      },
	      '.left': {
	        'text-align': 'left',
					'float': 'left'
	      },
	      '.center': {

	      },
	      '.right': {
	        'text-align': 'right',
					'float': 'right'
	      }
      }
    })
  }

	$('func').init = function()
	{
		this.super(BorderBox, 'init', ...arguments)
		//this.addClassName('pulsar-gui-navigation-bar')
	}

	$('func').pushNavigationItem = function(item)
	{
		$(this).navigationItems.push(item)
		$(this).updateNavigationItem(PUSH_ACTION)
	}

	$('func').popNavigationItem = function()
	{
		let topItem = $(this).navigationItems.pop()
		$(this).updateNavigationItem(POP_ACTION)

		return topItem
	}

	const PUSH_ACTION = 1
	const POP_ACTION = 2

	$('private let').navigationItems = $.new('Array')

	$('private func').updateNavigationItem = function(action)
	{
		let topItem = $(this).navigationItems.last

		if (action == PUSH_ACTION) {
			;['top', 'left', 'center', 'right', 'bottom'].forEach(key => {
				let item = topItem[key]
				let view = this[key]

				if (item != 'inherit') {
					view.replaceSubview(view.subviews.first, null, item, null)
				}
			})
		}
		else {
			;['top', 'left', 'center', 'right', 'bottom'].forEach(key => {
				let view = this[key]
				let item = topItem[key]

				for (index = $(this).navigationItems.length - 1; item == 'inherit'; item = $(this).navigationItems[--index][key]);

				view.replaceSubview(view.subviews.first, null, item, null)
			})
		}
	}
})
