import * as pandoc from 'pandoc-filter'
const mjAPI: any = require('mathjax-node')
const mjState = {}
let mjInitialized = false

async function meta2val(v: pandoc.PandocMetaValue): Promise<{}> {
  switch (v.t) {
    case 'MetaMap':
      return metaMap2obj(v.c)
    case 'MetaList':
      return Promise.all(v.c.map(meta2val))
    case 'MetaBool':
    case 'MetaString':
      return v.c
    case 'MetaInlines':
    case 'MetaBlocks':
      return pandoc.stringify(v.c as any)
    default:
      throw new Error(`Unknown meta type ${JSON.stringify(v)}`)
  }
}

async function metaMap2obj(m: pandoc.PandocMetaMap): Promise<{}> {
  const result = {}
  for (const [k, v] of Object.entries(m)) {
    result[k] = await meta2val(v)
  }
  return result
}

async function meta2obj(
  varName: string,
  meta: pandoc.PandocMetaMap | undefined,
): Promise<{}> {
  if (meta === undefined) return {}
  const e = meta[varName]
  if (e === undefined) return {}
  if (e.t !== 'MetaMap') {
    throw new Error(`${varName} should be MetaMap, but got ${e.t}`)
  }
  return metaMap2obj(e.c)
}

async function tex2svg(
  mn: string,
  inline: boolean,
  meta: pandoc.PandocMetaMap | undefined,
): Promise<{ svg: string }> {
  const opts = Object.assign(
    {
      math: mn,
      format: inline ? 'inline-TeX' : 'TeX',
      svg: true,
      speakText: false,
      linebreaks: false,
      state: mjState,
    },
    await meta2obj('mathjax.typeset', meta),
  )
  return mjAPI.typeset(opts)
}

function wrap(meta: pandoc.PandocMetaMap | undefined, s: pandoc.Inline) {
  return [
    pandoc.RawInline(
      'html',
      getConfigOption(meta, 'centerDisplayMath')
        ? '<p style="text-align: center">'
        : '<p>',
    ),
    s,
    pandoc.RawInline('html', '</p>'),
  ]
}

function getConfigOption(
  meta: pandoc.PandocMetaMap | undefined,
  optionName: string,
) {
  if (!meta) return undefined
  const opt = meta[`mathjax.${optionName}`]
  if (!opt) return undefined
  return opt.c
}

const action: pandoc.SingleFilterActionAsync = async function(
  elt,
  _format: string,
  meta?: pandoc.PandocMetaMap,
) {
  if (!mjInitialized) {
    mjAPI.config(await meta2obj('mathjax', meta))
    mjAPI.start()
    mjInitialized = true
  }
  if (elt.t === 'Math') {
    const [mathT, tex] = elt.c
    const inline = mathT.t != 'DisplayMath'
    const { svg } = await tex2svg(tex, inline, meta)
    if (!getConfigOption(meta, 'noInlineSVG')) {
      const svgel = pandoc.RawInline('html', svg)
      return inline ? svgel : wrap(meta, svgel)
    } else {
      const src =
        'data:image/svg+xml;charset=utf-8;base64,' +
        Buffer.from(svg).toString('base64')
      const width = svg.match(/\bwidth="([^"]+)"/)
      const height = svg.match(/\bheight="([^"]+)"/)
      const style = svg.match(/\bstyle="([^"]+)"/)
      const image = pandoc.Image(
        pandoc.attributes({
          style:
            (style ? style[1] : '') +
            (width ? `width:${width[1]};` : '') +
            (height ? `height:${height[1]};` : ''),
        }),
        [pandoc.Str(tex)],
        [src, ''],
      )
      return inline ? image : wrap(meta, image)
    }
  } else {
    return undefined
  }
}

export = function() {
  pandoc.stdio(action)
}
