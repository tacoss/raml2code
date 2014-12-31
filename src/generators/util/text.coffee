text = {}

text.capitalize = (str)->
  str.charAt(0).toUpperCase() + str.slice(1)

text.sanitize = (str)->
  aux = str.split(".")
  res = ''
  aux.forEach (it)->
    res += text.capitalize(it)
  res

module.exports = text