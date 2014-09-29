var express = require('express');
var path = require('path');
var logger = require('morgan');
var routes = require('./routes/index');
var users = require('./routes/users');
var globalVar=require('./routes/global/global');
var vhost_config=require('./vhosthandle.js');
var vhost=require('vhost');
var config=require('./vhost.config.json');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname,'public')));
/*app.use(function(res,req,next){
    process.on('uncaughtException',function(err){
        console.log(err);
    });
    next();
});*/

app.use(globalVar);
app.use(vhost_config);

//app.use('/', routes);
//app.use('/users', users);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
app.set('env','production');
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port',config.port);
app.listen(app.get('port'),function(){
    console.log('listen port on '+app.get('port'));
});
