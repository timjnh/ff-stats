var System = require('es6-module-loader').System;

System.import('./index')
.catch(function(err){
    console.log('err', err);
});
