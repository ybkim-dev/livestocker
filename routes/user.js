var express = require('express');
var router = express.Router();
var passport = require('passport');
var passport2 = require('../module/passport')
var pool = require('../database/pool')

/* GET user listing. */
router.get('/join', function(req, res, next) {
  res.render('join.ejs');
})

router.post('/join', function(req, res, next) {
  passport.authenticate('local-join', function(err,user,info) {
    if (err) return next(err);
    if (!user) return res.render('login.ejs', {pass: info.pass})
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/user/login')
    })
  })(req, res, next)
})

router.get('/login', function(req, res, next) {
  return res.render('login', {pass: true})
})

router.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) return next(err);

    if (!user) return res.render('login.ejs', {pass: info.pass})
    req.logIn(user, function(err) {
      console.log(user)
      if (err) return next(err);
      return res.redirect('/')
    });
  })(req, res, next)
});

router.get('/logout', function(req, res,next){
  try {
    req.session.destroy();
    return res.redirect('/');
  } catch (e) {
    return next(e);
  }
})

router.get('/config', function(req, res, next){
  try{
    return res.render('config',{ isLogin: isLogin, nickname: req.user.nickname });
  }catch(e){
    return next(e);
  }
})

module.exports = router;
