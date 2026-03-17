import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { d as db, v as verification, b as account, s as session, u as user } from './index_BQXN-BIF.mjs';

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification
    }
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  secret: "55ab5dc181b4607ed3f64580bbb9073c081e7e3c70942d24748223277bef1c0e",
  baseURL: "http://localhost:4321"
});

export { auth as a };
