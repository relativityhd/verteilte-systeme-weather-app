/**
 * Implementation of the Business Logic of the Weather App recommendations.
 * @param {Object} weatherdata
 * @param {Number} weatherdata.nextHoursTemp The next Hours Temperature
 * @param {Number} weatherdata.nextHoursUV The next Hours UV-Index, based on the official scalar: https://en.wikipedia.org/wiki/Ultraviolet_index
 * @param {Number} weatherdata.nextHoursPOP The next Hours Probability of Precipation
 * @returns {Object} JSON Object, { clothes, risk, umbrella }
 */
function recommend({ nextHoursTemp, nextHoursUV, nextHoursPOP }) {
  /**
   * These are Shorthand if statements
   * How they work:
   * https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
   */
  const clothes = nextHoursTemp > 12 ? 'tshirt' : nextHoursTemp > 5 ? 'sweater' : 'coat'
  const risk = nextHoursUV > 5 ? 'high' : nextHoursUV > 2 ? 'moderate' : 'low'
  const umbrella = nextHoursPOP >= 0.1 ? 'yes' : 'no'
  return { clothes, risk, umbrella }
}

module.exports = { recommend }
