program = require('commander')
data2code = require("./data2code.js")
fs = require('fs')

raml = require('raml-parser')

if  require.main is module
  program
  .usage('[options] [RAML input file]')
  .option('-i, --input [input]', 'RAML input file')
  .option('-g, --generators [generators]', 'Generator modules comma separated')
  .option('-o, --outputDir [outputDir]', 'Output Dir')
  .option('-e, --extra [extra]', "JSON string to be added to model")
  .parse(process.argv)

  if not (program.input  and program.generators and program.outputDir)
    console.error "Error: You need to specify all parameters"
    program.help()
    process.exit(1)

  generators = []
  for gen in program.generators.split(",")
    g = require(gen)
    
    g.handleRender = (results)->
      for result in results
        if result.name and result.str
          writeFile("#{program.outputDir}/#{result.name}", result.str)
        else
          console.log "no name"
    generators.push g

  writeFile = (path, content) ->
    fs.writeFile path, content, (err) ->
      if err
        console.log err
      else
        console.log "The file #{path} was generated!"
      return

  parseExtra = (str)->
    data = {}
    if str
      try
        data = JSON.parse(program.extra)
      catch e
        console.error e
    return data


  raml.loadFile(program.input).then ((data) ->
    data.extra =  parseExtra(program.extra)
    for gen in generators
      data2code.process(data, gen)
    return
  ), (error) ->
    console.log "Error parsing: " + error
    return

