const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  // Use to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Use to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true     // allows us to pass bach the entire request token
  }, (req, email, password, done) => {
    // User.findOne wont fire unless data is sent back
    User.findOne({ 'local.email': email }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (user) {
        return done(null, false, req.flash('signupMessage', 'Este correo ya ha sido tomado'));
      } else {
        let newUser = new User();

        // set the user's local credentials
        newUser.local.email = email;
        newUser.local.password = newUser.generateHash(password);

        // save the user
        newUser.save(err => {
          if (err) {
            throw err;
          }

          return done(null, newUser);
        });
      }
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, email, password, done) => {
    // Find a user whose email is the same as the forms email
    User.findOne({ 'local.email': email }, (err, user) => {
      if (err) return done(err);

      if (!user) {
        return done(null, false, req.flash('loginMessage', 'Algo anda mal, checa tu contraseña y correo.'));
      }

      if (!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Algo anda mal, checa tu contraseña y correo.'))
      }

      return done(null, user);
    })
  }))
};
