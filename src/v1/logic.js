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
