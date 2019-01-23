'use strict';
var _ = require('lodash');
var axios = require('axios');
var config = require('./config.js');
const icon = require("./assets/icon.png");

var cached_weburl = [];

var instance = axios.create({
  baseURL: config.url,
  timeout: 15000,
  // withCredentials: true,
  responseType: 'json',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': config.token
  }
});


function QueryGroups(index,history,callback){
  instance.get('/projects', {
    params: {
      page: index + 1,
      per_page: 90,
    }
  })
  .then((response)=>{
    var data = response.data;
    var web_urls = _.map(data,(key)=>{
      return [_.toLower(key.web_url),key.web_url];
    });
    history = _.concat(history,web_urls);
    cached_weburl = history;
    if(web_urls.length >= 90){
      setTimeout(()=>{
        QueryGroups(index+1,history,callback);
      }, 1000);
    }
    else{
      callback(history);
    }
  })
  .catch(function (error) {
    console.log(error);
  });
}



function FilterTerm(list,filters,display,actions){
  if(filters.length > 0){
    var filter = filters[0];
    FilterTerm(_.filter(list,(o)=>{return _.includes(o[0],filter);}),_.slice(filters,1),display,actions);
  }
  else{
    _.map(list,(value)=>{
      display({
        icon,
        title:`${value[1]}`,
        onSelect:()=>{ return actions.open(value[1]);}
      });
    });
  }
}

const initialize = () => {
  QueryGroups(0,[],(result)=>{
    // console.log('Fetch cached_weburl is:',result);
    cached_weburl = result;
    return result;
  });
}

const fn = ({ term, display,actions }) => {
  if (term.match('^gitlab ') || term.match('^gi ')) {
    var splited_term = term.split(' ');
    if(splited_term.length > 1){
      FilterTerm(cached_weburl,_.slice(splited_term,1),display,actions);
    }
  }
};

module.exports = {
  initialize: initialize,
  fn: fn
}
