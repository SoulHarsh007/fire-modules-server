import withMongo from '../../../util/useMongo';
import {ObjectId} from 'mongodb';
import {withSessionRoute} from '../../../util/useSession';
import {predicates, objects} from 'friendly-words';
import bump from 'semver/functions/inc';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function modulePatchHandler
 * @description patches the modules data
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function modulePatchHandler(req, res) {
  if (!req.session.user || !req.session.user.sessionActive) {
    req.session.destroy();
    return res.status(400).json({
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
  if (!user || user.disabled) {
    req.session.destroy();
    return res.status(403).json({
      success: false,
      msg: 'Invalid user session',
    });
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
  if (!req.body) {
    return res.status(400).json({
      success: false,
      msg: 'No modules were provided',
    });
  }
  const defaultKeys = [
    'version',
    'resourceTag',
    'uploader',
    'appearance',
    'dms',
    'kernels',
    'utils',
  ];
  if (
    defaultKeys.filter(x => !Object.keys(req.body).includes(x)).length ||
    Object.keys(req.body).filter(x => !defaultKeys.includes(x)).length
  ) {
    return res.status(400).json({
      success: false,
      msg: 'Invalid modules json, It either has extra keys or some missing keys',
    });
  }
  const data = await db.collection('modules').findOne(
    {},
    {
      projection: {
        _id: 0,
      },
    }
  );
  if (
    data.resourceTag !== req.body.resourceTag ||
    data.version !== req.body.version
  ) {
    return res.status(403).json({
      success: false,
      msg: 'You are using an outdated modules version to patch current modules',
    });
  }
  const resourceTag = `${
    predicates[Math.floor(Math.random() * predicates.length)]
  }-${objects[Math.floor(Math.random() * objects.length)]}-${
    predicates[Math.floor(Math.random() * predicates.length)]
  }`;
  const version = bump(req.body.version, 'patch');
  await db.collection('modules').findOneAndReplace(
    {},
    {
      ...req.body,
      resourceTag,
      version,
      uploader: `${user.name}`,
    }
  );
  return res.status(200).json({
    success: true,
    version,
    resourceTag,
  });
}

export default withSessionRoute(modulePatchHandler);
