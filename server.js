var express = require('express'),
    easyoauth = require('easy-oauth'),
    app = express.createServer(),
    config = require('./config').cfg,
    port = 80;

app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: config.session_secret }));
  app.use(express.static(__dirname + '/static'));
  app.use(easyoauth(require('./keys_file')));
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

function getAuth(req) {
  var details = req.getAuthDetails();
  return {
    name: 'abcd',
    url: 'http://fake.url/abcd'
  }
}

app.get('/', function(req, res) {
  var details = getAuth(req);
  res.render('index.jade', {
    locals: {
      title: config.title,
      user: details
    }
  });
});

app.get ('/retract', function(req, res, params) {
  req.logout();
  res.writeHead(303, { 'Location': "/" });
  res.end('');
})

app.get('/authenticated', function(req, res) {
  var mode = req.params.mode;
  req.authenticate([mode], function(err, authenticated) {
    if (authenticated) {
      res.redirect('/');
    } else {
      res.redirect('/loginfail');
    }
  });
});

app.listen(port);