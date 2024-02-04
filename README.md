# 删除vue项目里的ts及vue文件里的script ts

### clone本项目
### 修改index.js 
```angular2html

const root = '需要转换的项目的绝对路径'; //需要转换的项目绝对路径
let out = '输出路径(绝对或者相对)'; //输出路径(绝对或者相对)
const dirname = '输出文件夹名称'; //输出文件夹名称
```

### 执行npm run remove


```
存在问题:
删除后文件中会残留一些类型引入(启动项目的时候会报出来错误),需要手动删除
```
