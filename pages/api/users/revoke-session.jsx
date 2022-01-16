import {withSessionRoute} from '../../../util/useSession';
import withMongo from '../../../util/useMongo';
import {ObjectId} from 'mongodb';
import {UAParser} from 'ua-parser-js';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function sessionRevokeHandler
 * @description revokes a specific user session from the dashboard
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function sessionRevokeHandler(req, res) {
  if (!req.session.user) {
    req.session.destroy();
    return res.status(401).json({
      success: false,
      msg: 'Invalid user session',
    });
  }
  const db = await withMongo();
  const user = await db.collection('users').findOne({
    _id: new ObjectId(req.session.user.id),
  });
  if (!user) {
    return res.status(401).send('');
  }
  const dbSession = user.sessions.find(x => x.sessionID === req.body.session);
  if (!dbSession || dbSession.revoked) {
    return res.status(400).json({
      success: false,
      msg: "Session doesn't exist or is already revoked",
    });
  }
  dbSession.revoked = true;
  dbSession.revokeReason = 'Session revoked from dashboard';
  await db.collection('users').updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        sessions: user.sessions,
      },
    }
  );
  if (dbSession.sessionID === req.session.user.sessionID) {
    req.session.destroy();
    res.status(200).json({
      success: true,
      redirect: true,
    });
  }
  return res.status(200).json({
    success: true,
    sessions: user.sessions.map(x => {
      const browser = new UAParser(x.userAgent);
      return {
        browser: browser.getBrowser().name,
        device: browser.getDevice().type ?? 'desktop',
        os: browser.getOS().name,
        ip: x.ip,
        startTS: x.createdAt,
        lastTS: x.lastSeenAt,
        revoked: x.revoked,
        revokeReason: x.revokeReason,
        id: x.sessionID,
      };
    }),
    id: req.session.user.sessionID,
  });
}

export default withSessionRoute(sessionRevokeHandler);
