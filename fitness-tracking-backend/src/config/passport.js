// Passport configuration (placeholder for future implementation)
// For now, we're using JWT directly, but this file is kept for future extensibility

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

// Strategy would be used if implementing passport middleware
// const strategy = new JwtStrategy(opts, async (jwt_payload, done) => {
//   try {
//     const user = await User.findById(jwt_payload.userId);
//     if (user) {
//       return done(null, user);
//     } else {
//       return done(null, false);
//       // or you could create a new account
//     }
//   } catch (err) {
//     return done(err, false);
//   }
// });

module.exports = {
  // Uncomment when implementing passport middleware
  // initialize: () => new JwtStrategy(opts, (jwt_payload, done) => {
  //   User.findById(jwt_payload.userId, (err, user) => {
  //     if (err) return done(err, false);
  //     if (user) return done(null, user);
  //     return done(null, false);
  //     // or you could create a new account
  //   });
  // })
};