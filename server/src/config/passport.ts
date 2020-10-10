// tslint:disable: indent
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import { UserDBController } from '../dbControllers/usersController';
import { Config } from './config';

export class Passport {
  private userDbCtrl: UserDBController = new UserDBController();

  private opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    // issuer: 'auth@mywebmaster.pp.ua',
    audience: Config.WEB_URL
  };

  public authenticate() {
    return passport.authenticate('jwt', {
      session: false,
      failWithError: true
    });
  }

  init(): void {
    passport.initialize();
    // passport.session();
    passport.use(
      new Strategy(this.opts, (jwtPayload, done) => {
        this.userDbCtrl
          .getById(jwtPayload.userId)
          .then((user) => {
            if (user) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          })
          .catch((error) => {
            return done(error, false);
          });
      })
    );
  }
}

export default new Passport();
