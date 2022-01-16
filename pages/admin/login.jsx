import {LockClosedIcon} from '@heroicons/react/solid';
import {FaDiscord} from 'react-icons/fa';
import {useState} from 'react';
import axios from 'axios';
import {useRouter} from 'next/router';
import Image from 'next/image';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminLogin
 * @returns {any} renders admin login page
 */
export default function RenderAdminLogin() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [discordLogin, setDiscordLogin] = useState(false);
  const router = useRouter();
  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Image height={96} width={96} src="/fire.svg" alt="RebornOS FIRE" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-50">
              Sign in to your account
            </h2>
          </div>
          <form
            className="mt-8 space-y-6"
            onSubmit={e => {
              e.preventDefault();
              axios
                .post(
                  '/api/users/login',
                  {
                    email: email.toLowerCase(),
                    pwd,
                  },
                  {
                    withCredentials: true,
                  }
                )
                .then(() => router.push('/admin/verify-2fa'))
                .catch(x => setMsg(x.response?.data.msg));
            }}
          >
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required={!discordLogin}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 bg-transparent"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required={!discordLogin}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm  dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 bg-transparent"
                  placeholder="Password"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon
                    className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                </span>
                Sign in
              </button>
            </div>
            <div>
              <button
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  setDiscordLogin(true);
                  router.push('/api/users/discord-login');
                }}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <FaDiscord
                    className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                </span>
                Sign in with Discord
              </button>
            </div>
          </form>
          <div className="text-indigo-600 font-mono text-center">{msg}</div>
        </div>
      </div>
    </>
  );
}
