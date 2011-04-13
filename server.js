var express = require('express'),
    easyoauth = require('easy-oauth'),
    app = express.createServer(),
    port = 80;

app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/static'));
  app.use(easyoauth(require('./keys_file')));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  port = 3000;
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index.jade');
});

app.listen(port);