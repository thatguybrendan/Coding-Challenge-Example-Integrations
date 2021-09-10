import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

const defaultOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}

export const getStrategy = (): JwtStrategy => {
  return new JwtStrategy(defaultOptions, function (jwt_payload, done) {
    // If no JWT user info, return 'unauthorized'.
    if (!jwt_payload?.sub) done(null, false)

    // Normally we'd have more user info here.
    // This is a barebones example to keep things clean.
    const user = {
      id: jwt_payload.sub,
    }
    done(null, user)
  })
}
