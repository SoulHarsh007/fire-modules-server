import {withSessionRoute} from '../../../util/useSession';
import withMongo from '../../../util/useMongo';
import {ObjectId} from 'mongodb';
import {randomBytes} from 'crypto';
import {hashSync} from 'bcrypt';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function sessionHandler
 * @description responds with user's sessions
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function sessionHandler(req, res) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      msg: 'Invalid user session',
    });
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
  if (!user.superAdmin) {
    return res.status(403).json({
      success: false,
      msg: 'You are not permitted to access this endpoint',
    });
  }
  if (!user.twoFAActive) {
    return res.status(403).json({
      success: false,
      msg: 'You are not permitted to access this endpoint without 2FA enabled',
    });
  }
  if (req.method === 'GET') {
    const users = await db
      .collection('users')
      .find(
        {},
        {
          projection: {
            pwd: 0,
            twoFASecret: 0,
          },
        }
      )
      .toArray();
    return res.status(200).json({
      success: true,
      users: users.map(x => ({
        ...x,
        lastSeen: x?.sessions.sort((a, b) => b.lastSeenAt - a.lastSeenAt)[0]
          .lastSeenAt,
        rank: x.superAdmin ? 'Super Admin' : x.admin ? 'Admin' : 'Guest',
        sessions: undefined,
      })),
      id: user._id,
    });
  }
  if (!req.body || !req.body.id) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid request body',
    });
  }
  const targetUser = await db.collection('users').findOne({
    _id: new ObjectId(req.body.id),
  });
  if (!targetUser) {
    req.session.destroy();
    return res.status(404).json({
      success: false,
      msg: 'No user found',
    });
  }
  if (req.method === 'POST') {
    if (req.body.resetPwd) {
      const newPwd = randomBytes(4).toString('hex');
      targetUser.sessions = targetUser.sessions?.map(x => ({
        ...x,
        revoked: true,
        revokeReason: `Account password reset from administration panel by: ${user.name} (${user._id})`,
      }));
      await db.collection('users').updateOne(
        {
          _id: targetUser._id,
        },
        {
          $set: {
            pwd: hashSync(newPwd, 10),
            sessions: targetUser.sessions,
          },
        }
      );
      return res.status(200).json({
        success: true,
        newPwd,
      });
    }
    if (req.body.disable) {
      targetUser.sessions = targetUser.sessions?.map(x => ({
        ...x,
        revoked: true,
        revokeReason: `Account disabled from administration panel by: ${user.name} (${user._id})`,
      }));
      await db.collection('users').updateOne(
        {
          _id: targetUser._id,
        },
        {
          $set: {
            disabled: !!req.body.status,
            sessions: targetUser.sessions,
          },
        }
      );
      return res.status(200).json({
        success: true,
      });
    }
    await db.collection('users').updateOne(
      {
        _id: targetUser._id,
      },
      {
        $set: {
          twoFAActive: false,
        },
      }
    );
    return res.status(200).json({
      success: true,
    });
  }
  return res.status(405).send('');
}

export default withSessionRoute(sessionHandler);
