import {withSessionSsr} from '../../util/useSession';
import {LockClosedIcon} from '@heroicons/react/solid';
import {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {useRouter} from 'next/router';
import Image from 'next/image';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminVerify2FA
 * @returns {any} renders admin 2fa verification page
 */
export default function RenderAdminVerify2FA() {
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const input = useRef();
  const router = useRouter();
  useEffect(() => {
    input.current.focus();
  }, [input]);
  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Image height={96} width={96} src="/fire.svg" alt="RebornOS FIRE" />
            <h2 className="mt-6 text-xl text-gray-900 dark:text-gray-50">
              Enter your 6 Digit T-OPT
            </h2>
          </div>
          <form
            className="mt-8 space-y-6"
            onSubmit={e => {
              e.preventDefault();
              axios
                .post(
                  '/api/users/verify-2fa',
                  {
                    token: otp,
                  },
                  {
                    withCredentials: true,
                  }
                )
                .then(x => {
                  setMsg(x.data.msg);
                  router.push('/admin/dashboard');
                })
                .catch(x => {
                  setMsg(x.response?.data.msg);
                });
            }}
          >
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="otp-input" className="sr-only">
                  T-OPT
                </label>
                <input
                  id="otp-input"
                  type="number"
                  autoComplete="off"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:border-gray-700 dark:placeholder-gray-500 dark:text-gray-100 bg-transparent"
                  placeholder="6 Digit T-OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  ref={input}
                />
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
                Verify
              </button>
            </div>
          </form>
          <div className="text-indigo-600 font-mono text-center">{msg}</div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = withSessionSsr(async ({req}) => {
  if (!req.session.user) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    };
  }
  if (!req.session.user.hasTwoFA) {
    return {
      redirect: {
        destination: '/admin/dashboard',
        permanent: false,
      },
    };
  }
  if (req.session.user.sessionActive) {
    return {
      redirect: {
        destination: '/admin/dashboard',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
});
