'use strict';

const md5 = require('md5');

module.exports = (app, passport) => {
  // Login
  app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('loginMessage') });
  });

  app.get('/signup', (req, res) => {
    res.render('signup', { message: req.flash('signupMessage') });
  });

  app.get('/profile', isLoggedIn, (req, res) => {
    let imgUrl = 'https://www.gravatar.com/avatar/';

    res.render('profile', {
      user: req.user,
      srcImg: imgUrl + md5(req.user.local.email) + '?s=100'// get the user out of session and pass to template
    })
  })

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  })

  // process the signup form
  app.post('/signup', passport.authenticate('signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.post('/login', passport.authenticate('login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}
