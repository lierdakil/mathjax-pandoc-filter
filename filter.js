#!/usr/bin/env node
var Promise, jsondata, mjAPI, tex2svg, walkChildren, walkTree;

mjAPI = require("MathJax-node/lib/mj-single.js");

Promise = require('promise');

tex2svg = function(mn, inline) {
  return new Promise(function(resolve) {
    return mjAPI.typeset({
      math: mn,
      format: inline ? "inline-TeX" : "TeX",
      svg: true,
      speakText: false,
      linebreaks: false
    }, function(data) {
      if (!data.errors) {
        return resolve(data);
      }
    });
  });
};

walkChildren = function(children) {
  return Promise.all(children.map(function(childnode) {
    return walkTree(childnode);
  }));
};

walkTree = function(node) {
  var inline, tex;
  if (node.t === "Math") {
    inline = node.c[0].t !== 'DisplayMath';
    tex = node.c[1];
    return tex2svg(tex, inline).then(function(svg) {
      return {
        t: "RawInline",
        c: ["html", svg.svg]
      };
    });
  } else {
    if ((node.c != null) && typeof node.c === 'object') {
      return walkChildren(node.c).then(function(c) {
        return {
          t: node.t,
          c: c
        };
      });
    } else {
      return Promise.resolve(node);
    }
  }
};

mjAPI.start();

process.stdin.setEncoding('utf8');

jsondata = "";

process.stdin.on('data', function(data) {
  return jsondata += data;
});

process.stdin.on('end', function() {
  var data;
  data = JSON.parse(jsondata);
  if (data != null) {
    return walkChildren(data[1]).then(function(trans) {
      data[1] = trans;
      return console.log(JSON.stringify(data));
    });
  }
});
