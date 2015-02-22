mjAPI = require("MathJax-node/lib/mj-single.js")
Promise = require('promise')

tex2svg = (mn,inline) ->
  new Promise (resolve) ->
    mjAPI.typeset
      math: mn
      format: if inline then "inline-TeX" else "TeX",
      svg:true
      speakText: false
      linebreaks: false
    , (data) ->
      if (!data.errors)
        resolve(data)

walkChildren = (children) ->
  Promise.all children.map (childnode) ->
    walkTree(childnode)

walkTree = (node) ->
  if node.t=="Math"
    inline=node.c[0].t!='DisplayMath'
    tex=node.c[1]
    wrap = (s) -> "<p>"+s+"</p>"
    tex2svg(tex,inline).then (svg) ->
      t:"RawInline"
      c:["html",if inline then svg.svg else wrap(svg.svg)]
  else
    if node.c? and typeof node.c is 'object'
      walkChildren(node.c).then (c) ->
        t: node.t
        c: c
    else
      Promise.resolve(node)

mjAPI.start()

process.stdin.setEncoding('utf8')
jsondata = ""
process.stdin.on 'data', (data) ->
  jsondata+=data
process.stdin.on 'end', () ->
  data=JSON.parse(jsondata)
  if data?
    walkChildren data[1]
    .then (trans) ->
      data[1]=trans
      console.log(JSON.stringify(data))
