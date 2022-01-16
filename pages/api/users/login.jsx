import withMongo from '../../../util/useMongo';
import {withSessionRoute} from '../../../util/useSession';
import {compareSync} from 'bcrypt';
import {randomUUID} from 'crypto';
import {getClientIp} from 'request-ip';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function loginHandler
 * @description initiates login flow
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function loginHandler(req, res) {
  if (!req.body.email || !req.body.pwd) {
    return res.status(400).json({success: false});
  }
  const db = await withMongo();
  const user = await db.collection('users').findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.status(404).json({
      success: false,
      msg: `No user found with email: ${req.body.email}`,
    });
  }
  if (req.body.pwd.length > 128) {
    return res.status(400).json({
      success: false,
      msg: 'Incorrect password',
    });
  }
  if (!compareSync(req.body.pwd, user.pwd)) {
    return res.status(401).json({
      success: false,
      msg: 'Incorrect password',
    });
  }
  if (user.disabled) {
    return res.status(403).json({
      success: false,
      msg: 'Your account is not permitted to access the administration panel',
    });
  }
  const sessionID = randomUUID();
  req.session.user = {
    id: user._id,
    name: user.name,
    hasTwoFA: user.twoFAActive,
    sessionActive: !user.twoFAActive,
    sessionID,
    admin: user.admin,
    superAdmin: user.superAdmin,
  };
  const session = {
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'],
    sessionID,
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    revoked: false,
    revokeReason: '',
  };
  await req.session.save();
  await db.collection('users').updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        sessions: user.sessions ? [...user.sessions, session] : [session],
      },
    }
  );
  return res.status(200).json({
    success: true,
    msg: `Welcome: ${user.name}`,
  });
}

export default withSessionRoute(loginHandler);
