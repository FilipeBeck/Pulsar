/*window.addEventListener('load', function() {
	let descriptions = document.body.querySelectorAll('article h4.name')
	
	for (let i = 0, count = descriptions.length; i < count; i++) {
		let description = descriptions[i]
		
		setupDisplay(description.nextElementSibling.nextElementSibling)
		
		description.addEventListener('click', function() {
			switchDisplay(this.nextElementSibling.nextElementSibling)
		})
	}
})

function switchDisplay(element)
{
	while (element != null && element.className != 'name') {
		if (element.style.height == '' || element.style.height != '0px') {
			element.style.height = '0px'
			element.className += ' collapsed'
		}
		else {
			element.style.height = element.visibleHeight + 'px'
			element.className = element.className.split(' ').shift()
		}
		
		element = element.nextElementSibling
	}
}

function setupDisplay(element)
{
	while (element != null && element.className != 'name') {
		element.style.overflow = 'hidden'
		element.style.transition = 'height 0.25s'
		element.visibleHeight = element.offsetHeight
		element.style.height = '0px'		
		element.className += ' collapsed'
		
		element = element.nextElementSibling
	}
}*/