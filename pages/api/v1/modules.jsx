import {SignJWT, importJWK} from 'jose';
import modulesData from '../../../public/modules.json';

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
  const privateKey = await importJWK(
    {
      kty: 'EC',
      x: 'AGoV_wMGCPXHV55cHzGkNyCPYztlstCJ8EUMlEPTRXz-2KNNG7Mrb3Gev-qVZ5JkMmwwzxseckdKXTM9To9zHf6R',
      y: 'AODbsRgg0np-h5Bq8Wxn4PhheH88D2CzWBK5HFnpPfetkAygArdCvWifX6qpXpmbHPDygpBwD22v69olUBUnMpVu',
      crv: 'P-521',
      d: 'ACXYK7Zh_2iniQ1ZX4ai9Ru6qFWunvGqiVGX2RayMikkVR642Zde9OCXwebyQUCENy3o7fryhaA330SAfFd90vgA',
    },
    'ES512'
  );
  res
    .setHeader(
      'Cache-Control',
      'public, s-maxage=120, stale-while-revalidate=240'
    )
    .setHeader('Access-Control-Allow-Origin', '*');
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
