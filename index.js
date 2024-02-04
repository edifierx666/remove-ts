const fs = require('fs-extra');
const ts = require('typescript');
const path = require('path');
const vtcompiler = require('vue-template-compiler');

const {
  globSync,
} = require('glob');

const root = '需要转换的项目绝对路径'; //需要转换的项目绝对路径
let out = '输出路径(绝对或者相对)'; //输出路径(绝对或者相对)
const dirname = '输出文件夹名称'; //输出文件夹名称
const globOps = {
  ignore: 'node_modules/**',
  cwd: root,
  withFileTypes: true,
  dot: true,
};
if (!path.isAbsolute(out)) {
  out = path.resolve(root, out);
}
fs.ensureDirSync(path.resolve(out, dirname), { mode: 0o2775 });

// globSync('**', globOps).forEach((f, i) => {
//   console.log(f.fullpath(), i,f.isDirectory());
// });
globSync('**', globOps).forEach((f, i) => {
  if (f.isDirectory()) {
    return;
  }
  const fullpath = f.fullpath();
  console.log(fullpath);
  const relative = f.relative();
  const outpath = path.resolve(out, dirname, relative);
  const content = fs.readFileSync(fullpath, 'utf-8');
  const extname = path.extname(fullpath);
  
  let s = ['.vue', '.ts'].some((ext) => extname === ext && !fullpath.endsWith('.d.ts'));
  
  if (s) {
    if (extname == '.vue') {
      fs.ensureFileSync(outpath);
      
      const result = vtcompiler.parseComponent(content, {});
      
      let vueFiles = ``;
      
      if (result.template) {
        vueFiles += `<template>${ result.template.content }</template>`;
      }
      let attrs;
      let js = '';
      if (result.script) {
        attrs = result.script.attrs;
        js = result.script.content;
      }
      
      if (result.scriptSetup) {
        attrs = result.scriptSetup.attrs;
        js = result.scriptSetup.content;
      }
      
      if (js) {
        const result = ts.transpileModule(js, {
          compilerOptions: compilerOptions(),
        });
        js = "\n"+result.outputText;
      }
      
      vueFiles += `\n<script${ makeInlineAttr(attrs) }>${ js }</script>`;
      
      if (result.styles) {
        result.styles.forEach((style) => {
          vueFiles += `\n<style${ makeInlineAttr(style.attrs) }>${ style.content }</style>`;
        });
      }
      fs.writeFileSync(outpath, vueFiles, 'utf-8');
      console.log(vueFiles)
    }
    if (extname == '.ts') {
      // console.log(`处理 ${ fullpath }`);
      const result = ts.transpileModule(content, {
        compilerOptions: compilerOptions(),
      });
      let noutpath = outpath.replace('.ts', '.js');
      fs.ensureFileSync(noutpath);
      fs.writeFileSync(noutpath, result.outputText, 'utf-8');
      // console.log(`更新 ${ noutpath }`);
    }
    
  } else {
    fs.copySync(fullpath, outpath);
  }
});

function makeInlineAttr(attrs = {}) {
  let inlineAttr = ``;
  
  if (attrs == null) {
    return inlineAttr;
  }
  
  for (const $scriptKey in attrs) {
    if ($scriptKey == 'lang' && attrs[$scriptKey] == 'ts') {
      continue;
    }
    inlineAttr += ` ${ $scriptKey }="${ attrs[$scriptKey] }"`;
  }
  return inlineAttr;
}

function compilerOptions() {
  
  return {
    'target': 'esnext',
    'module': 'esnext',
    'moduleResolution': 'node',
    'strict': false,
    'forceConsistentCasingInFileNames': true,
    'allowSyntheticDefaultImports': true,
    'strictFunctionTypes': false,
    'jsx': 'preserve',
    'baseUrl': '.',
    'allowJs': true,
    'sourceMap': false,
    'esModuleInterop': true,
    'resolveJsonModule': true,
    'noUnusedLocals': true,
    'noUnusedParameters': true,
    'preserveValueImports':true,
    'experimentalDecorators': true,
    'lib': [
      'dom',
      'esnext',
    ],
    'noImplicitAny': false,
    'skipLibCheck': true,
  };
}
