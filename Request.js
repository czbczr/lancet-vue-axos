/**
 * version 1.1.36
*/
import axios from "axios";
import MD5 from "js-md5"
import {BASE_URL,TIMEOUT,WITH_CREDENTIALS,PROJECT_FLAG,AUTHORIZATION,confLoading} from 'lancet-vue-axios/Config'

let loadingCount=0;

function showLoad(){
	loadingCount++;
	confLoading.showLoading();
}
function hideLoading(){
	loadingCount--;
	setTimeout(()=>{
		if(loadingCount<=0){
			loadingCount=0;
			confLoading.hideLoading();
		}
	},100)
}
// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
//axios.defaults.withCredentials = true

function responseData(msg,code=0){
	return {msg,code};
}

function sortASCII(obj={}){
	if(Object.keys(obj).length<1){return '';}
	let _arr = new Array();
	let _num = 0;
	for (let i of Object.keys(obj)) {
		_arr[_num] = i;
		_num++;
	}
	let _sortArr = _arr.sort();
	let _sortObj = {};
	for (let i of Object.keys(_sortArr)) {
		_sortObj[_sortArr[i]] = obj[_sortArr[i]];

	}
	let _objStringify=null;
	 for (let k of Object.keys(_sortObj)) {
		 _objStringify=_objStringify?`${_objStringify}&${k}=${_sortObj[k]}`:`${k}=${_sortObj[k]}`
	 }
	return _objStringify;
}

function nowTime(){
	return new Date().getTime();
}

//headers
let headersData={
	"Sign-Key":null,
	"Cur-Time":null,
	Authorization:AUTHORIZATION
}


axios.defaults.baseURL = BASE_URL;
axios.defaults.timeout = TIMEOUT;
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = true;

let config = {
	baseURL: BASE_URL,
	timeout: TIMEOUT, // Timeout
	withCredentials: WITH_CREDENTIALS, // Check cross-site Access-Control
};

const _axios = axios.create(config);

try{
	if(uni){
		_axios.defaults.adapter = function(config) {
			return new Promise((resolve, reject) => {
				console.log('----uniapp axios config----',config)
				var settle = require('axios/lib/core/settle');
				var buildURL = require('axios/lib/helpers/buildURL');
				uni.request({
					method: config.method.toUpperCase(),
					url: config.baseURL + buildURL(config.url, config.params, config.paramsSerializer),
					header: config.headers,
					data: config.data,
					dataType: config.dataType,
					responseType: config.responseType,
					sslVerify: config.sslVerify,
					complete: function complete(response) {
						console.log("----uniapp axios 执行完成：----", response)
						response = {
							data: response.data,
							status: response.statusCode,
							errMsg: response.errMsg,
							header: response.header,
							config: config
						};
		
						settle(resolve, reject, response);
					}
				})
			})
		}
	}
}
catch(e){}


_axios.interceptors.request.use(
	function(conf) {
		showLoad();
		_axios.interceptors.reqConf&&_axios.interceptors.reqConf(conf);
		//if (store.getters.token) {
			// 在头部Authorization携带token，以供后端验证
			//config.headers['Authorization'] = getToken()
		//}
		headersData.Authorization = AUTHORIZATION;
		const _nowTime=nowTime();

		headersData["Cur-Time"] = _nowTime;
		const CONFIG_HEADERS=conf.headers;

		if (conf.reqMethod=='dowload') {//下载
			headersData["Sign-Key"] = MD5(`${conf.url}${sortASCII(conf.params)}${PROJECT_FLAG}${headersData["Cur-Time"]}`);
			conf.headers={...CONFIG_HEADERS,...headersData};
			dowload(conf);	
		}
		else if(conf.reqMethod=='upload'){//上传
			headersData["Sign-Key"] = MD5(`${conf.url}${PROJECT_FLAG}${headersData["Cur-Time"]}`);
			conf.headers={...CONFIG_HEADERS,...headersData};
			upload(conf);
		}
		else if(conf.method.toLowerCase()==='get'){//get
			headersData["Sign-Key"] = MD5(`${conf.url}${sortASCII(conf.params)}${PROJECT_FLAG}${headersData["Cur-Time"]}`);
			conf.headers={...CONFIG_HEADERS,...headersData};
		}
		else if(conf.method.toLowerCase()==='post'){//post
			const DATA = JSON.stringify(conf.data)||{};
			let BODY = Object.keys(DATA).length>0?`requestBody=${DATA}`:'';
			headersData["Sign-Key"] = MD5(`${conf.url}${BODY}${PROJECT_FLAG}${headersData["Cur-Time"]}`);
			console.log('-----',`${conf.url}${BODY}${PROJECT_FLAG}${headersData["Cur-Time"]}`)
			conf.headers={...CONFIG_HEADERS,...headersData};
		}
		// Do something before request is sent
		return conf;
	},
	function(error) { 
		hideLoading();
		// Do something with request error
		console.error('----请求错误----'+error);
		return Promise.reject(error);
	}
);

// Add a response interceptor
_axios.interceptors.response.use(
	function(response) {
		hideLoading();
		if(typeof response.data.code==='number'){
			if(response.data.code==0){
				return response.data;
			}
			console.warn('----axios response 进入拦截callback----');
			_axios.interceptors.resCallback&&_axios.interceptors.resCallback(response.data);
			return Promise.reject(response.data);
		}
		else{
			console.error('----error----','返回code不是number类型');
			return false;
		}
	},
	function(error) {//接口错误
		console.error('----axios response error----',error);
		_axios.interceptors.errCallback&&_axios.interceptors.errCallback(error);
		// Do something with response error
		hideLoading();
		return Promise.reject(error);
	}
);

function upload(config){
	let _url='';
	const U_CONFIG_HEADERS=config.headers;
	if(config.url.slice(0,1)=='/'){
		_url=config.baseURL  + config.url;
	}
	else{
		_url=config.baseURL +'/' + config.url;
	}
	axios.post(
		_url,
		config.data,
		{ 
			headers: { ...U_CONFIG_HEADERS,"Content-Type": "multipart/form-data"},
			params:config.params,
		}
	).then(function (res) {
		hideLoading();
		if(typeof res.data.code==='number'){
			if(res.data.code==0){
				console.log('----上传成功----');
				return Promise.resolve(res.data);
			}
			// console.warn('----axios response 进入拦截callback----');
			// _axios.interceptors.resCallback&&_axios.interceptors.resCallback(response.data);
			return Promise.reject(res.data);
		}
		else{
			console.error('----error----','返回code不是number类型');
			return Promise.reject(res.data);
		}
	}, function (e) {
		console.error('----上传失败----',e);
		hideLoading();
		return Promise.reject(res.data);
	}).catch((e) => {
		console.error('----then处理逻辑失败 catch----',e);
		hideLoading();
		return Promise.reject(responseData('then处理逻辑失败',-1));
	});
}

function dowload(config) {
	let _url='';
	if(config.url.slice(0,1)=='/'){
		_url=config.baseURL  + config.url;
	}
	else{
		_url=config.baseURL +'/' + config.url;
	}
	axios.get(
		_url,
		config.data,
		{
		responseType: 'blob',
		params: config.params,
		headers: config.headers
	}).then((res) => {
		//  如果支持微软的文件下载方式(ie10+浏览器)
		if (window.navigator.msSaveBlob) {
			try {
				const blobObject = new Blob([res.data]);
				window.navigator.msSaveBlob(blobObject, res.headers['content-disposition'].split('=')[1]);
				console.log('----下载成功----');
				hideLoading();
				return Promise.resolve(responseData('下载成功'));
			} catch (e) {
				console.error('----下载失败 catch----'+e);
				hideLoading();
				return Promise.reject(responseData('下载失败',-1));
			}
		} else  {
			//  其他浏览器
			const blob = res.data;
			const reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onload = (e) => {
				const a = document.createElement('a');
				a.download = window.decodeURI(res.headers['content-disposition'].split('=')[1], "UTF-8");
				a.href = e.target.result;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				console.log('----下载成功----');
				hideLoading();
				return Promise.resolve(responseData('下载成功'));
			};
		}
	}, function (e) {
		console.error('----下载失败----',e);
		hideLoading();
		return Promise.reject(res.data);
	}).catch((e) => {
		console.error('----then处理逻辑失败 catch----',e);
		hideLoading();
		return Promise.reject(responseData('then处理逻辑失败',-1));
	});
}

export {
	_axios,
	config
};
