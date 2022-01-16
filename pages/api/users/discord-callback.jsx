import {withSessionRoute} from '../../../util/useSession';
import stateStorage from '../../../util/stateStorage';
import withMongo from '../../../util/useMongo';
import {randomUUID} from 'crypto';
import {getClientIp} from 'request-ip';
import axios from 'axios';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function discordCallbackHandler
 * @description callback handler for discord login
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function discordCallbackHandler(req, res) {
  if (!stateStorage.delete(req.query.state) || !req.query.code) {
    return res.redirect('/admin/login');
  }
  let userData;
  try {
    const accessToken = await axios
      .post(
        `https://discord.com/api/v8/oauth2/token`,
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          code: req.query.code,
          redirect_uri: process.env.DISCORD_OAUTH_REDIRECT_URI,
          grant_type: 'authorization_code',
          scope: 'identify email',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .then(x => x.data);
    userData = await axios
      .get('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${accessToken.token_type} ${accessToken.access_token}`,
        },
      })
      .then(x => x.data);
  } catch (error) {
    console.error(error);
    return res.redirect('/admin/login');
  }
  if (!userData) {
    return res.redirect('/admin/login');
  }
  const db = await withMongo();
  const user = await db.collection('users').findOne({
    email: userData.email,
  });
  if (!user) {
    return res.redirect('/admin/login');
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
  return res.redirect('/admin/verify-2fa');
}

export default withSessionRoute(discordCallbackHandler);
