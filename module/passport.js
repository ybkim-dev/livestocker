var passport = require('passport');
const { nextTick } = require('process');
var localStrategy = require('passport-local').Strategy
const pool = require('../database/pool');
const crypto = require('crypto');

// session에 저장
passport.serializeUser(function (user, done) {
  console.log('passport session save : ', user)
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  const sessionUser = {
    userId: user.userId,
    email: user.email,
    nickname: user.nickname
  }
  console.log('passport session get data : ', sessionUser);
  done(null, sessionUser);
})

//passport module 정의 local-join 이라는 규칙을 만듬.
passport.use('local-join', new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async function (req, username, password, done) {
  try {
    var [userCheck] = await pool.query('SELECT * FROM user where email = ?', [username])
    if (userCheck.length) {
      // 같은 user 이미 가입되어 있다면 에러.
      return done(null, false, {'pass': false})
    } else {
      // 가입되어 있지 않다면 추가해주기.

      console.log("user is admitted")
      var userContents = {
        email: username,
        password: crypto.createHash('sha512').update(password).digest('base64'),
        nickname: req.body.nickname
      };
      var addMember = await pool.query('INSERT INTO user set ?', userContents)
      return done(null, { 'userId': addMember[0].insertId, 'email': username, 'nickname': userContents.nickname }); // session에 담을 id
    }
  } catch (e) {
    return done(e);
  }
}))

passport.use('local-login', new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async function (req, username, password, done) {
  try {
    password = crypto.createHash('sha512').update(password).digest('base64')
    var [loginCheck] = await pool.query("SELECT * FROM user WHERE email = ? AND password = ?", [username, password])
    if (loginCheck.length) {
        return done(null, { 'userId': loginCheck[0].id, 'email': username, 'nickname': loginCheck[0].nickname })
    } else {
        return done(null, false, { 'pass': false })
    }
  } catch (e) {
    return done(e)
  }
}))