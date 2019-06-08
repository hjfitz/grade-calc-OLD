import {cloneDeep} from 'lodash/lang';
import {flatten, uniq} from 'lodash/array';

/**
 * sort a year by grade, highest to lowest
 * @param {object} u1 First unit
 * @param {object} u2 Second unit
 */
const sortByGrade = (u1, u2) => {
	if (u1.grade > u2.grade) {
		return 1;
	} else if (u1.grade < u2.grade) {
		return -1;
	}
	return 0;
};

function discountWorstCredits(year) {
	const sorted = year.sort(sortByGrade)
	sorted.splice(0, 4) // remove the worst 20 creds
	return sorted
};

function avgYear(year) {
	const total = year
		.map(gr => parseInt(gr.grade, 10))
		.reduce((acc, cur) => acc + cur, 0);
	const mean = total / year.length;
	return mean;
};

function splitCredits(year) {
	const normalised = year.map(unit => {
		const { grade, credits } = unit;
		console.log(grade)
	// ensure that each 'unit' consists of 5 credits
	// and there are a proportional amount of units
		const toPush = credits / 5;
		const normalisedUnit = [];
		for (let i = 0; i < toPush; i += 1) {
			normalisedUnit.push({
				grade,
				credits: 5,
				originalCredits: credits,
			});
		}
		return normalisedUnit;
	});
	return flatten(normalised);
};

const invalidCredits = (year2=[], year3=[]) => {
	const total = year2
		.concat(year3)
		.reduce((acc, cur) => acc + parseInt(cur.credits, 10), 0);
	return total !== 240;
};

function getGPA(max) {
	if (max > 74) return 4.25
	if (max > 70) return 4
	if (max > 66) return 3.75
	if (max > 63) return 3.5
	if (max > 60) return 3.25
	if (max > 56) return 3
	if (max > 53) return 2.75
	if (max > 49) return 2.5
	if (max > 47) return 2.25
	if (max > 42) return 2
	if (max > 39) return 1.5
	if (max > 37) return 1
	if (max > 34) return 0.75
	if (max > 29) return 0.5
	return 0
}

function getHonours(...grades) {
	const [max] = grades.sort().reverse()
	if (max > 69) return '1st'
	if (max > 59) return '2:1'
	if (max > 49) return '2:2'
	if (max > 38.5) return '3rd'
	return '3rd (No honours)'
}


function calculateGrades(year2, year3) {

	if (invalidCredits(year2, year3)) {
		throw new Error('Invalid credits! Must equal 120 per year!')
		// return { err: 'Invalid credits! Should be 120 per year' };
	}

	const [y2disc, y3disc] = [year2, year3]
		.map(splitCredits)
	.map(discountWorstCredits);
	

	
	const [avgY2, avgY3] = [y2disc, y3disc].map(avgYear);

	const calculatedGrades = {};

	/**
	 * the classification of the weighted mean of all relevant credits
	 * at Level 5 and all relevant credits at Level 6 in the ratio of 40:60 respectively
	 * after first discounting the marks in the worst 20 credits both at Level 5 and at Level 6
	 */

	calculatedGrades.rule1 = ((avgY2 * 0.4) + (avgY3 * 0.6)).toFixed(3);
	/**
	 * the classification of the weighted mean of all relevant credits at Level 6
	 * after first discounting the marks in the worst 20 credits at Level 6
	 */

	calculatedGrades.rule2 = avgY3.toFixed(3);

	/**
	 * the minimum classification in which more than 50% of the combined relevant
	 * credits at Level 5 and Level 6 were attained after first discounting the marks in the
	 * worst 20 credits both at Level 5 and at Level 6
	 */

	// fuckery with stringify and parse happens because
	// if we sort, we get units with same grades muddled up
	// it would still give us a correct result, but it doesn't look nice
	const rejoined = y2disc
		.concat(y3disc)
		.map(({ originalCredits, name, grade }, idx) => ({ name: (name || idx), grade, credits: originalCredits }))
		.map(JSON.stringify);

	console.log(rejoined)

	console.log({string: rejoined.map(JSON.stringify)})

	const sorted = uniq(rejoined)
	.map(JSON.parse)
	.sort(sortByGrade);
	console.log({sorted})
	// this rule is basically removing all the worst 20 credits from each year
	// and then finding the one in/or just below the median
	// that's why an "arbirtrary" sorted[4] is used
	calculatedGrades.rule3 = parseInt(sorted[3].grade, 10).toFixed(3);

	calculatedGrades.gpa = getGPA(calculatedGrades.rule1)

	calculatedGrades.overall = getHonours(calculatedGrades.rule1, calculatedGrades.rule2, calculatedGrades.rule3)
	
	return calculatedGrades;
};

export default calculateGrades;