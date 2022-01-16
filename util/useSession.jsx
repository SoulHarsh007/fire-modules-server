import {withIronSessionApiRoute, withIronSessionSsr} from 'iron-session/next';

const sessionOptions = {
  password: process.env.COOKIE_SECRET,
  cookieName: 'identity',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
};

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @param {import('next').NextApiHandler} handler - api route handler
 * @returns {import('next').NextApiHandler} the handler with req.session populated
 */
export function withSessionRoute(handler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @param {*} handler - ssr getServerSideProps function
 * @returns {*} the context with req.session populated
 */
export function withSessionSsr(handler) {
  return withIronSessionSsr(handler, sessionOptions);
}
