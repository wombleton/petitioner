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

app.get('/', function(req, res) {
  var details = req.getAuthDetails();
  console.log(details);
  res.render('index.jade', {
    locals: {
      title: config.title,
      twitter: details && details.user && details.user.username,
      facebook: details && details.user && details.user.name
    }
  });
});

app.get ('/logout', function(req, res, params) {
  req.logout();
  res.writeHead(303, { 'Location': "/" });
  res.end('');
})

app.get('/authenticated/', function(req, res) {
  req.authenticate(['facebook'], function(err, authenticated) {
    res.redirect('/');
  });
});

app.get('/authenticated', function(req, res) {
  req.authenticate(['twitter'], function(err, authenticated) {
    res.redirect('/');
  });
});

app.listen(port);