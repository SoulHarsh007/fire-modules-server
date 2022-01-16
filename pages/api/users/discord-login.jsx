import {withSessionRoute} from '../../../util/useSession';
import stateStorage from '../../../util/stateStorage';
import {randomUUID} from 'crypto';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @async
 * @function discordLoginHandler
 * @description initiates discord login
 * @param {import('next').NextApiRequest} _req - An instance of http.IncomingMessage, plus some next.js middleware
 * @param {import('next').NextApiResponse} res - An instance of http.IncomingMessage, plus some next.js middleware
 * @returns {void}
 */
async function discordLoginHandler(_req, res) {
  const state = randomUUID();
  stateStorage.add(state);
  const redirectUri = new URL('https://discord.com/api/oauth2/authorize');
  redirectUri.searchParams.append('response_type', 'code');
  redirectUri.searchParams.append('scope', 'identify email');
  redirectUri.searchParams.append('prompt', 'none');
  redirectUri.searchParams.append(
    'redirect_uri',
    process.env.DISCORD_OAUTH_REDIRECT_URI
  );
  redirectUri.searchParams.append('client_id', process.env.DISCORD_CLIENT_ID);
  redirectUri.searchParams.append('state', state);
  return res.redirect(redirectUri.toString());
}

export default withSessionRoute(discordLoginHandler);
