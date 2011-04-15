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
  var details = req.getAuthDetails(),
      facebookish,
      twitterish;
  if (details.user) {
    twitterish = details.user.user_id && details.user.username;
    facebookish = details.user.name && details.user.link;
    if (twitterish) {
      return {
        name: details.user.username,
        url: 'https://twitter.com/' + details.user.username
      }
    } else if (facebookish) {
      return {
        name: details.user.name,
        url: details.user.link
      }
    }
  } else {
    return undefined;
  }

}

app.get('/', function(req, res) {
  var details = getAuth(req);
  fs.readFile('petition.md', function(err, file) {
    signups.get('doc', function(err, doc) {
      res.render('index.jade', {
        locals: {
          title: config.title,
          user: details,
          petition: md(file.toString()),
          signups: doc && doc.signups || []
        }
      });
    });
  });
});

app.get ('/undo', function(req, res, params) {
  var details = getAuth(req);
  removeSignup(details.url, function() {
    req.logout();
    res.writeHead(303, { 'Location': "/" });
    res.end('');
  });
});

function removeSignup(url, callback) {
  signups.get('doc', function(err, doc) {
    var i,
        signup;
    if (err) {
      callback();
    } else {
      for (i = 0; i < doc.signups.length; i++) {
        signup = doc.signups[i];
        if (signup.url === url) {
          doc.signups.splice(i, 1);
          break;
        }
      }
      signups.put('doc', doc, callback);
    }
  });

}

function saveSignup(name, url, callback) {
  var add = true,
      i,
      doc = signups.getSync('doc') || { signups: [] },
      ok,
      signup;
  for (i = 0; i < doc.signups.length; i++) {
    signup = doc.signups[i];
    if (signup.url === url) {
      add = false;
      break;
    }
  }

  if (add) {
    doc.signups.push({
      name: name,
      url: url,
      date: new Date()
    });
  }
  ok = signups.putSync('doc', doc);
  if (ok) {
    callback();
  } else {
    res.setHeader(500, {});
    res.end('<html><h1>Something went wrong. Please try again.</h1></html>');
  }
}

app.get('/authed/twitter/', function(req, res) {
  var details;
  req.authenticate(['twitter'], function(err, authenticated) {
    if (authenticated) {
      details = getAuth(req);
      saveSignup(details.name, details.url, function() {
        res.redirect('/');
      })
    } else {
      res.end(' <html><h1>Twitter authentication failed :( </h1></html>')
    }
  });
});

app.get('/authed/facebook/', function(req, res) {
  var details;
  req.authenticate(['facebook'], function(err, authenticated) {
    if (authenticated) {
      details = getAuth(req);
      saveSignup(details.name, details.url, function() {
        res.redirect('/');
      })
    } else {
      res.end('<html><h1>Facebook authentication failed :( </h1></html>')
    }
  });
});

app.get('/plain', function(req, res) {
  fs.readFile('petition.md', function(err, file) {
    signups.get('doc', function(err, doc) {
      var i,
          list = doc.signups,
          result = [];
      result.push(config.title + '\r\n');
      result.push('====================' + '\r\n');
      result.push('\r\n');
      result.push(file.toString());
      result.push('\r\n');
      result.push('\r\n');
      result.push(list.length + ' signatures:\r\n');
      result.push('\r\n');
      for (i = 0; i < list.length; i++) {
        result.push((i + 1) + '. ' + list[i].name + ' (' + list[i].url + ')\r\n');
      }

      res.send(result.join(''), { 'Content-Type': 'text/plain' }, 200);
    });
  });
});

app.listen(port);