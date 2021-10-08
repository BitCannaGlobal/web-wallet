module.exports = {
  urlSafeEncode(value) {
    return value.replaceAll('+', '_').replaceAll('/', '-')
  },
}
