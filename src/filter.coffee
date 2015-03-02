wait = require('wait.for')
pandoc = require('pandoc-filter')
mjAPI = require("MathJax-node/lib/mj-single.js")
get_stdin = require('get-stdin')

mjAPI.start()

tex2svg = (mn,inline,callback) ->
  mjAPI.typeset
    math: mn
    format: if inline then "inline-TeX" else "TeX",
    svg:true
    speakText: false
    linebreaks: false
  , (data) ->
    if data.error
      callback(data.error,null)
    else
      callback(null,data.svg)

action = (type,value,format,meta) ->
  if type == 'Math'
    inline = value[0].t!='DisplayMath'
    tex = value[1]
    wrap = (s) -> "<p>"+s+"</p>"
    svg = wait.for tex2svg,tex,inline
    pandoc.RawInline "html",if inline then svg else wrap(svg)


toJSONFilter = (json) ->
  data = JSON.parse(json)
  format = if process.argv.length > 2 then process.argv[2] else ''
  output = pandoc.filter data, action, format
  process.stdout.write JSON.stringify output

get_stdin (json) ->
  wait.launchFiber toJSONFilter, json
