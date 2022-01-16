import {ObjectId} from 'mongodb';
import withMongo from '../../../util/useMongo';
import {withSessionRoute} from '../../../util/useSession';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function logOutHandler
 * @description logs out the user and invalidates the session
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function logOutHandler(req, res) {
  if (!req.session.user) {
    req.session.destroy();
    return res.redirect('/admin/login');
  }
  const db = await withMongo();
  const user = await db.collection('users').findOne({
    _id: new ObjectId(req.session.user.id),
  });
  const dbSession = user.sessions.find(
    x => x.sessionID === req.session.user.sessionID
  );
  if (dbSession) {
    dbSession.revoked = true;
    dbSession.revokeReason = 'User logged out';
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
  }
  req.session.destroy();
  return res.redirect('/admin/login');
}

export default withSessionRoute(logOutHandler);
