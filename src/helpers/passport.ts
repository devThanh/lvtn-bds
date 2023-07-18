import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import { User } from "../modules/user/entities/user.model";
import bcrypt from "../util/bcrypt";
import { authService } from "../service";
const GoogleStrategy = passportGoogle.Strategy;
const FacebookStrategy  = require('passport-facebook').Strategy
let data:Object = {}

// GOOGLE LOGIN
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOneBy({email:profile.emails[0].value, type:'GG'})
      const accesstoken = await authService.signToken(profile.displayName,profile.emails[0].value,'GG')
        const refreshtoken = await authService.signRefreshToken(profile.displayName,profile.emails[0].value,'GG')
      if(user===null){
        let newUser = new User()
        newUser.email = profile.emails[0].value
        newUser.password =  await bcrypt.encode(profile.id)
        newUser.fullname=profile.displayName
        newUser.type = 'GG'
        newUser.isActive=true
        newUser.avatar = profile.photos[0].value
        
        accessToken:accesstoken
        refreshToken:refreshtoken
        const res = await newUser.save()
        data ={
          "id":res.id,
          "email":res.email,
          "fullname":res.fullname,
          "avatar": res.avatar,
          "type":res.type,
          "isActive":res.isActive,
          "accessToken":accesstoken,
          "refreshToken":refreshtoken
        }
        return done(null, data)
      }else
      //let user = new User()
        //console.log(accessToken, newUser)
        return done(null, {user, accesstoken,refreshtoken})
      // get profile details
      // save profile details in db
    }
  )
);

passport.serializeUser(function(user, done){
  console.log('TSTSTS: ', user)
    done(null, user)
})


passport.deserializeUser(function(user, done){
  console.log('TSTSTS: ', user)
    done(null, user)
})



// FACEBOOK LOGIN
const facebook_key = process.env.FACEBOOK_KEY
const facebook_secret = process.env.FACEBOOK_SECRET
const facebook_callback_url = process.env.FACEBOOK_CALLBACK_URL
passport.use(new FacebookStrategy({
  clientID: facebook_key,
  clientSecret: facebook_secret ,
  callbackURL: facebook_callback_url,
  profileFields: ['id', 'displayName', 'photos', 'email'],
  enableProof: true
},
// function(accessToken, refreshToken, profile, done) {
//   process.nextTick(function () {
//     //Check whether the User exists or not using profile.id
//     if(config.use_database) {
//        //Further code of Database.
//     }
//     return done(null, profile);
//   });
// }
async function(request, accessToken, refreshToken, profile, done) {
  console.log('SSS: ', profile.emails[0].value)
  const user = await User.findOneBy({email:profile.emails[0].value, type:'FB'})
  console.log(user)
  const accesstoken = await authService.signToken(profile.displayName,profile.emails[0].value,'FB')
        const refreshtoken = await authService.signRefreshToken(profile.displayName,profile.emails[0].value,'FB')
      if(user===null){
        let newUser = new User()
        newUser.email = profile.emails[0].value
        newUser.password =  await bcrypt.encode(profile.id)
        newUser.avatar = profile.photos[0].value
        newUser.fullname = profile.displayName
        newUser.type = 'FB'
        newUser.isActive=true
        
        accessToken:accesstoken
        refreshToken:refreshtoken
        const res = await newUser.save()
        console.log(res)
        data ={
          "id":res.id,
          "email":res.email,
          "fullname":res.fullname,
          "avatar": res.avatar,
          "type":res.type,
          "isActive":res.isActive,
          "accessToken":accesstoken,
          "refreshToken":refreshtoken
        }
        return done(null, data)
      }else{
        return done(null, {user, accesstoken,refreshtoken})
      }
      }
  // User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
        
));

passport.serializeUser(function(user, done){
  console.log(user)
  done(null, user)
})


passport.deserializeUser(function(user, done){
  console.log(user)
  done(null, user)
})
