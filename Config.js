let BASE_URL=null;
let TIMEOUT= 60 * 1000;
let WITH_CREDENTIALS=true;
let PROJECT_FLAG=null;//项目标记
let AUTHORIZATION=null;

function setBaseUrl(url){
  BASE_URL=url;
}
function setTimeout(time){
  TIMEOUT=time;
}
function setWithCredentials(credientials){
  WITH_CREDENTIALS=credientials;
}
function setProjectFlag(flag){
  PROJECT_FLAG=flag;
}
//设置token
function setAuthorization(token){
	AUTHORIZATION=token;
}

//loading
let confLoading={
  showLoading:function(){},
  hideLoading:function(){}
}

function setConfigLoading(fn=function(){}){
  confLoading.showLoading=fn;
}
function hideConfigLoading(fn=function(){}){
  confLoading.hideLoading=fn;
}


export{
  setBaseUrl,
  setTimeout,
  setWithCredentials,
  setProjectFlag,
  setAuthorization,
  BASE_URL,
  TIMEOUT,
  WITH_CREDENTIALS,
  PROJECT_FLAG,
  AUTHORIZATION,
  confLoading,
  setConfigLoading,
  hideConfigLoading
}
