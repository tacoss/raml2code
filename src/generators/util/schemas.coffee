util = {}

util.parseBodyJson = (body, meta = '') ->
  schema = {}
  if body and body['application/json']
    schema = util.parseSchema(body['application/json'].schema, meta)
  schema

util.parseSchema = (raw, meta = '') ->
  schema = {}
  if raw
    try
      schema = JSON.parse(raw)
    catch e
      console.log "-----JSON ERROR on #{meta}---------"
      throw e
  schema

util.loadSchemas = (data)->
  schemas = []
  for row in data.schemas
    for schemaName of row
      schema = util.parseSchema(row[schemaName], "Trouble parsing schema: #{schemaName}")
      schemas.push schema
  schemas

module.exports = util