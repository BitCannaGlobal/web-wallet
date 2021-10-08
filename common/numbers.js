const SMALLEST = 1e-6
// const language = window.navigator.userLanguage || window.navigator.language
const language = `en` // TODO get from request, window is not available in SSR

function setDecimalLength(value, length) {
  if (value === undefined || value === null || Number.isNaN(value)) return null

  // rounding up the last decimal
  const roundedValue =
    Math.round(value * Math.pow(10, length)) / Math.pow(10, length)
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: length > 3 ? length : 0,
  }).format(roundedValue)
}

function shortDecimals(value) {
  return setDecimalLength(value, 3)
}

function fullDecimals(value) {
  return setDecimalLength(value, 6)
}

function pretty(number = 0) {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(number * 100) / 100)
}

function prettyLong(number = 0) {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 20,
    useGrouping: true,
  }).format(number)
}

// pretty print long decimals not in scientific notation
function prettyDecimals(number = 0) {
  let longDecimals = new Intl.NumberFormat(language, {
    minimumFractionDigits: 20,
    maximumFractionDigits: 20,
  }).format(number)

  // remove all trailing zeros
  while (longDecimals.charAt(longDecimals.length - 1) === `0`) {
    longDecimals = longDecimals.substr(0, longDecimals.length - 1)
  }

  // remove decimal separator from whole numbers
  if (Number.isNaN(Number(longDecimals.charAt(longDecimals.length - 1)))) {
    longDecimals = longDecimals.substr(0, longDecimals.length - 1)
  }

  return longDecimals
}

function prettyInt(number = 0) {
  return new Intl.NumberFormat(language).format(Math.round(number))
}

function percentInt(number = 0) {
  return new Intl.NumberFormat(language).format(Math.round(number * 100)) + `%`
}

function percent(number = 0) {
  return (
    new Intl.NumberFormat(language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.round(number * 10000) / 100) + `%`
  )
}

function bigFigure(number = 0) {
  let formatted = Math.round(number * 100) / 100

  let suffix = ''
  if (Math.abs(Number(formatted)) >= 1e12) {
    formatted = Number(formatted) / 1e12
    suffix = 'T'
  } else if (Math.abs(Number(formatted)) >= 1e9) {
    formatted = Number(formatted) / 1e9
    suffix = 'B'
  } else if (Math.abs(Number(formatted)) >= 1e6) {
    formatted = Number(formatted) / 1e6
    suffix = 'M'
  }
  return (
    new Intl.NumberFormat(language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(formatted) + ` ${suffix}`
  )
}

function bigFigureOrShortDecimals(number) {
  // here we check how many positive digits the number has to see how we should format it
  if (Math.abs(Number(number)) < 1e6) {
    return shortDecimals(number)
  } else {
    return bigFigure(number)
  }
}

function bigFigureOrPercent(number) {
  // once again, the same logic
  if (Math.abs(Number(number)) < 1e4) {
    return percent(number)
  } else {
    return bigFigure(number * 100)
      .toString()
      .concat(` %`)
  }
}

// This will take an object and for each (k,v) will return
// v rounded such that the sum of all v is 100.
// Used the following as a reference:
// https://stackoverflow.com/questions/13483430/how-to-make-rounded-percentages-add-up-to-100
// Note: We pass an object, and want to keep the (key, value) association.
const roundObjectPercentages = (dataMap) => {
  // This algorithm workson integers and we want 2 decimal places.
  // So round up first.
  const scale = 100
  const asArray = Object.entries(dataMap).map(([key, value]) => {
    return [key, value * scale]
  })

  const sumRounded = (acc, x) => {
    return acc + Math.round(x[1])
  }

  // The leftOver is the difference beween 100 and
  // the sum of the rounded values.
  const leftOver = scale * 100 - asArray.reduce(sumRounded, 0)

  //
  const cmpNumberValue = (a, b) => {
    return b[1] - Math.round(a[1]) - a[1]
  }

  // Here we distribute the leftOver as evenly as possible amongst the rounded values.
  // The values are sorted first.
  asArray.sort(cmpNumberValue)
  const result = asArray.map(function (x, i) {
    // Note: leftOver can be negative.
    const rounded = [
      x[0],
      (Math.round(x[1]) + (leftOver > i) - (i >= asArray.length + leftOver)) /
        100.0,
    ]
    return rounded
  })

  // Turn the array back into the original data structure layout
  const resultObject = {}
  result.forEach((x) => {
    resultObject[x[0]] = x[1]
  })

  return resultObject
}

module.exports = {
  SMALLEST,
  shortDecimals,
  fullDecimals,
  setDecimalLength,
  pretty,
  prettyInt,
  prettyLong,
  percent,
  percentInt,
  prettyDecimals,
  roundObjectPercentages,
  bigFigure,
  bigFigureOrShortDecimals,
  bigFigureOrPercent,
}
