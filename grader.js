#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)){
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1);
  }
  return instr;
};

var cheerioHtmlFile = function(htmlfile){
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks){
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone = function(fn){
  return fn.bind({});
};

var handler = function(result, response){
  if(result instanceof Error){
    console.error('Error: ' + response.message);
  }else{
    fs.writeFileSync(resultsFile, result);
    checkHtmlFileAndOutputResults(resultsFile, program.checks);
  }
};

var checkHtmlFileAndOutputResults = function(htmlfile, checksfile){
  var checkJson = checkHtmlFile(htmlfile, checksfile);
  var outJson = JSON.stringify(checkJson, null, 4);
  console.log(outJson);
}


if(require.main == module){
  program.option('-c, --checks <check_file>', 'Path to checks.json', 
clone(assertFileExists), CHECKSFILE_DEFAULT)
.option('-f, --file <html_file>', 'Path to index.html',
clone(assertFileExists), HTMLFILE_DEFAULT)
.option('-u, --url <url_address>', 'Url address') 
.parse(process.argv);

//var resultsFile = "";
if(program.url){
  var resultsFile = "htmloutput.html";
  rest.get(program.url).on('complete', handler);
}else{
  //resultsFile = program.file;
  checkHtmlFileAndOutputResults(program.file, program.checks);
}

//var checkJson = checkHtmlFile(resultsFile, program.checks);
//var outJson = JSON.stringify(checkJson, null, 4);
//console.log(outJson);
}else{
  exports.checkHtmlFile = checkHtmlFile;
}
