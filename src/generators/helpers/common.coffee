module.exports.helpers = ->

  [{name:'debug', fn: (optionalValue)->
    console.log "Current Context"
    console.log "===================="
    console.log this
    if optionalValue
      console.log "Value"
      console.log "===================="
      console.log optionalValue
    return
  }]