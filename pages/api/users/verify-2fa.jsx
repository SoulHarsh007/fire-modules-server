import withMongo from '../../../util/useMongo';
import {withSessionRoute} from '../../../util/useSession';
import {verifyToken} from 'node-2fa';
import {ObjectId} from 'mongodb';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function twoFAVerificationHandler
 * @description handles 2fa verification
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function twoFAVerificationHandler(req, res) {
  if (!req.body.token) {
    return res.status(400).json({
      success: false,
      msg: 'No token was provided',
    });
  }
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
  if (!dbSession || dbSession.revoked) {
    req.session.destroy();
    return res.status(401).send('');
  }
  const result = verifyToken(user.twoFASecret, req.body.token, 1);
  if (!result) {
    return res.status(400).json({
      success: false,
      msg: 'Incorrect token was provided',
    });
  }
  if (!user.twoFAActive && user.twoFASecret) {
    await db.collection('users').updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          twoFAActive: true,
        },
      }
    );
    return res.status(200).json({
      success: true,
      msg: '2FA has been activated for your account',
    });
  }
  req.session.user.sessionActive = true;
  await req.session.save();
  return res.status(200).json({
    success: true,
    msg: `Welcome: ${user.name}`,
  });
}

export default withSessionRoute(twoFAVerificationHandler);
