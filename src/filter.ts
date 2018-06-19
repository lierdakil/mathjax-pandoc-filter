import * as pandoc from 'pandoc-filter-promisified'
const mjAPI: any = require('mathjax-node')

mjAPI.start()

function tex2svg(mn: string, inline: boolean) {
  return new Promise<string>(function(resolve, reject) {
    mjAPI.typeset(
      {
        math: mn,
        format: inline ? 'inline-TeX' : 'TeX',
        svg: true,
        speakText: false,
        linebreaks: false,
      },
      function(data: any) {
        if (data.error) reject(data.error)
        else resolve(data.svg)
      },
    )
  })
}

function wrap(meta: pandoc.Meta | undefined, s: pandoc.Inline) {
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

function getConfigOption(meta: pandoc.Meta | undefined, optionName: string) {
  if (!meta) return undefined
  const opt = meta[`mathjax.${optionName}`]
  if (!opt) return undefined
  return opt.c
}

const action: pandoc.FilterAction = async function(
  elt,
  _format: string,
  meta?: pandoc.Meta,
) {
  if (elt.t === 'Math') {
    const inline = elt.c[0].t != 'DisplayMath'
    const tex = elt.c[1]
    const svg = await tex2svg(tex, inline)
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
