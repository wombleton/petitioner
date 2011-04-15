var express = require('express'),
    easyoauth = require('easy-oauth'),
    app = express.createServer(),
    config = require('./config').cfg,
    fs = require('fs'),
    FSDocs = require('./lib/fsdocs').FSDocs,
    signups = new FSDocs('./signups')
    md = require('node-markdown').Markdown,
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
  fs.readFile('petition.md', function(err, file) {
    res.render('index.jade', {
      locals: {
        title: config.title,
        user: details,
        petition: md(file.toString())
      }
    });
  });
});

app.get ('/retract', function(req, res, params) {
  var details = getAuth(req);
  removeSignup(details.url, function() {
    req.logout();
    res.writeHead(303, { 'Location': "/" });
    res.end('');
  });
});

function removeSignup(url, callback) {
  var list = signups.get('list') || {};
  delete list[url];
  signups.put('list', list, callback);
}


function saveSignup(name, url, callback) {
  var list = signups.get('list') || {};
  list[url] = {
    name: name,
    url: url,
    date: new Date()
  };
  signups.put('list', list, callback)
}

app.get('/authenticated', function(req, res) {
  var details,
      mode = req.params.mode,
      name,
      url;
  req.authenticate([mode], function(err, authenticated) {
    if (authenticated) {
      details = getAuth(req);
      if (mode === 'twitter') {
        name = details.name;
        url = details.url;
      } else if (mode === 'facebook') {
        name = details.name;
        url = details.url;
      }
      saveSignup(name, url, function() {
        res.redirect('/');
      })
    } else {
      res.redirect('/loginfail');
    }
  });
});

app.listen(port);