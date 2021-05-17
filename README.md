# axios集成

朗森特axios二次封装

# config（config要在调用axios前处理）

```javascript
import { setBaseUrl,setProjectFlag,setAuthorization,setConfigLoading,hideConfigLoading } from "lancet-vue-axios/Config";
setConfigLoading(function(){
	alert('loading...')
});
hideConfigLoading(function(){
	alert('loading removed')
});
setBaseUrl(process.env.VUE_APP_BASE_API);
setProjectFlag('supplier-manage-web-app');
setAuthorization(<token>);//token||null
```

# 拦截逻辑

```javascript		
import { _axios } from 'lancet-vue-axios/Request'

_axios.interceptors.resCallback = function(res) {
	//非 0 code
	console.log('拦截成功---', res);
	//window.contentWindow.postMessage
	if(res.code === 50008 || res.code === 50012 || res.code === 50014){
		//全局code错误返回处理
	}
};

_axios.interceptors.errCallback = function(error) {
	//error回调
};
_axios.interceptors.reqConf = function(conf) {
	//请求头config
};
```

# 调用逻辑 demo
```javascript
import { _axios as request } from 'lancet-vue-axios/Request'
request({
    method:'get',//get post
    params:data,//url params
		data,//body params
		reqMethod:'dowload',//下载 upload上传 不支持oss
    url:url,///url地址
})
```

## 构建
``` bash
npm install lancet-vue-axios
```
