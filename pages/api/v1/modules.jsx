import {SignJWT, importJWK} from 'jose';
import withMongo from '../../../util/useMongo';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function moduleRequestHandler
 * @description responds with the latest module version information, also signs the outgoing response
 * @param {import('next').NextApiRequest} req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
export default async function moduleRequestHandler(req, res) {
  const db = await withMongo();
  const modulesData = await db.collection('modules').findOne(
    {},
    {
      projection: {
        _id: 0,
      },
    }
  );
  res
    .setHeader(
      'Cache-Control',
      'public, s-maxage=120, stale-while-revalidate=240'
    )
    .setHeader('Access-Control-Allow-Origin', '*');
  if (req.query.raw) {
    return res.status(200).json(modulesData);
  }
  const privateKey = await importJWK(
    {
      kty: process.env.PRIVATE_KEY_KTY,
      x: process.env.PRIVATE_KEY_X,
      y: process.env.PRIVATE_KEY_Y,
      crv: process.env.PRIVATE_KEY_CRV,
      d: process.env.PRIVATE_KEY_D,
    },
    process.env.PRIVATE_KEY_ALG
  );
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      modules: await new SignJWT(modulesData)
        .setAudience('RebornOS Fire')
        .setIssuer('RebornOS Fire Modules Server')
        .setSubject('RebornOS Fire Modules')
        .setProtectedHeader({alg: 'ES512'})
        .sign(privateKey),
    });
  }
  return res.status(400).send();
}
