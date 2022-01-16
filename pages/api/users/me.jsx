import {withSessionRoute} from '../../../util/useSession';
import withMongo from '../../../util/useMongo';
import {ObjectId} from 'mongodb';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function idHandler
 * @description responds with the session information
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function idHandler(req, res) {
  if (!req.session.user) {
    return res.status(200).json({
      success: true,
      data: req.query.redirect ? {redirect: true} : {},
    });
  }
  const db = await withMongo();
  const user = await db.collection('users').findOne({
    _id: new ObjectId(req.session.user.id),
  });
  if (!user) {
    req.session.destroy();
    return res.status(401).send('');
  }
  const dbSession = user.sessions.find(
    x => x.sessionID === req.session.user.sessionID
  );
  if (!dbSession || dbSession.revoked) {
    req.session.destroy();
    return res.status(401).send('');
  }
  dbSession.lastSeenAt = Date.now();
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
  req.session.user = {
    id: user._id,
    name: user.name,
    hasTwoFA: user.twoFAActive,
    sessionActive: req.session.user.sessionActive,
    sessionID: req.session.user.sessionID,
    admin: user.admin,
    superAdmin: user.superAdmin,
  };
  return res.status(200).json({
    success: true,
    data: req.session.user,
  });
}

export default withSessionRoute(idHandler);
