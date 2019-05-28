import calculateGrades from './classification-rules'

const y2form = document.getElementById('year-2-units')
const y3form = document.getElementById('year-3-units')

const addy2 = document.getElementById('add-y2-unit')
const addy3 = document.getElementById('add-y3-unit')

const grades = document.getElementById('grades')
const error = document.getElementById('error')

const rule1 = document.getElementById('rule-1')
const rule2 = document.getElementById('rule-2')
const rule3 = document.getElementById('rule-3')

const errText = document.getElementById('error-text')

window.addEventListener('DOMContentLoaded', loadPage)

function removeUnit(form, row) {
	return (ev) => {
		ev.preventDefault()
		form.removeChild(row)
		updateGrades()
	}
}

function extractUnitGrades(child) {
	const grade = child.querySelector('[data-type="grade"]')
	const credits = child.querySelector('[data-type="credits"]')
	return {
		grade: parseInt((grade.value || 0), 10),
		credits: parseInt(credits.value, 10)
	}
}

function updateGrades() {
	const y2grades = [...y2form.children].map(extractUnitGrades)
	const y3grades = [...y3form.children].map(extractUnitGrades)
	try {
		grades.style.display = 'block'
		error.style.display = 'none'
		const calculated = calculateGrades(y2grades, y3grades)
		rule1.textContent = calculated.rule1
		rule2.textContent = calculated.rule2
		rule3.textContent = calculated.rule3
	} catch (err) {
		error.style.display = 'block'
		grades.style.display = 'none'
		errText.textContent = err.toString()
	}

	savePage()
}

function addUnit(form) {
	return () => {
		const row = document.createElement('tr')
		row.innerHTML = `
		<td><input data-type="unit-name" type="text" placeholder="Unit" /></td>
		<td><input data-type="grade" type="number" placeholder="Grade" min="0" max="100" /></td>
		<td><input data-type="credits" type="number" placeholder="Credits" min="5" max="120" value="20" /></td>`
		const inputs = row.querySelectorAll('input')
		inputs.forEach((input) => input.addEventListener('keyup', updateGrades))

		const remove = document.createElement('a')
		const td = document.createElement('td')
		remove.addEventListener('click', removeUnit(form, row))
		remove.textContent = 'x'
		td.appendChild(remove)
		row.appendChild(td)
		form.appendChild(row)
		// updateGrades()
		return row
	}
}

function getFormData(form) {
	return [...form].map((row) => {
		const grade = row.querySelector('[data-type="grade"]')
		const credits = row.querySelector('[data-type="credits"]')
		const unit = row.querySelector('[data-type=unit-name]')
		return {
			grade: grade.value,
			credits: credits.value,
			unit: unit.value,
		}
	})
}

function savePage() {
	const y2 = getFormData(y2form.children)
	const y3 = getFormData(y3form.children)
	console.log({y2, y3})
	const saveFile = JSON.stringify({y2, y3})
	localStorage.setItem('save-file', saveFile)
	console.info('grades saved')
}

function populateForms(form) {
	return (unit) => {
			const row = addUnit(form)()
			const grade = row.querySelector('[data-type="grade"]')
			const credits = row.querySelector('[data-type="credits"]')
			const unitName = row.querySelector('[data-type="unit-name"]')
			grade.value = unit.grade
			credits.value = unit.credits
			unitName.value = unit.unit
	}
}

function loadPage() {
	let saveFile = localStorage.getItem('save-file')
	if (!saveFile) {
		console.log('Save not found')//. Adding seed.')
		// saveFile = JSON.stringify({
		// 	y2: []
		// })
		return
	}
	try {
		const {y2, y3} = JSON.parse(saveFile)
		y2.forEach(populateForms(y2form))
		y3.forEach(populateForms(y3form))
	} catch (err) {
		console.warn('Error parsing save file')
		return
	}
	console.log('loading complete')
	updateGrades()
}

addy2.addEventListener('click', () => {
	addUnit(y2form)()
	updateGrades()
})
addy3.addEventListener('click', () => {
	addUnit(y3form)()
	updateGrades()	
})