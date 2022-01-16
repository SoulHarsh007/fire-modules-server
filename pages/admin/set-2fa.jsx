import withMongo from '../../util/useMongo';
import {generateSecret} from 'node-2fa';
import {ObjectId} from 'mongodb';
import {withSessionSsr} from '../../util/useSession';
import {LockClosedIcon, ShieldCheckIcon} from '@heroicons/react/solid';
import {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import {ReactQrcode} from 'reactjs-qrcode-generator';
import {useRouter} from 'next/router';
import Image from 'next/image';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminSet2FA
 * @param {{secret?: string, uri?: string, qr?: string, msg?: string, id?: string}} props - props from the server
 * @returns {any} renders admin 2fa setup page
 */
export default function RenderAdminSet2FA(props) {
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [hide, setHide] = useState(false);
  const [renderContent, setRenderContent] = useState('Loading...');
  const router = useRouter();
  const input = useRef();
  useEffect(() => {
    input.current.focus();
  }, [input]);
  useEffect(() => {
    setRenderContent(props.uri ? <ReactQrcode qrvalue={props.uri} /> : '');
  }, [props.uri]);
  return (
    <>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Image height={96} width={96} src="/fire.svg" alt="RebornOS FIRE" />
            <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {props.msg ? (
                <>
                  <ShieldCheckIcon className="h-10 w-10 text-green-600 absolute pb-2 flex items-center pl-3" />
                  {` ${props.msg}`}
                  <br />
                  <button
                    className={
                      hide ? 'hidden' : 'p-2 text-gray-50 bg-indigo-600 text-sm'
                    }
                    disabled={hide}
                    onClick={() => {
                      axios
                        .post(
                          '/api/users/accounts',
                          {
                            id: props.id,
                          },
                          {
                            withCredentials: true,
                          }
                        )
                        .then(() => {
                          setHide(true);
                          setRenderContent('2FA Disabled');
                        })
                        .catch(x => setMsg(x.response?.data.msg));
                    }}
                  >
                    Disable 2FA
                  </button>
                </>
              ) : (
                'Scan this code with your 2FA provider:'
              )}
            </h2>
            <span className="mx-auto items-center flex justify-center mt-4 text-center text-xl font-mono text-gray-800 dark:text-gray-100">
              {renderContent}
            </span>
          </div>
          <form
            className={props.msg ? 'hidden' : 'mt-8 space-y-6'}
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
                .then(() => router.push('/admin/dashboard'))
                .catch(x => setMsg(x.response?.data.msg));
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
          <div className="text-red-600 font-mono text-center">{msg}</div>
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
  const db = await withMongo();
  const user = await db.collection('users').findOne({
    _id: new ObjectId(req.session.user.id),
  });
  if (user.twoFAActive) {
    return {
      props: {
        msg: '2FA is already enabled for your account!',
        id: req.session.user.id,
      },
    };
  }
  const secret = generateSecret({
    name: 'RebornOS FIRE',
    account: user.name,
  });
  await db.collection('users').updateOne(
    {
      _id: new ObjectId(req.session.user.id),
    },
    {
      $set: {
        twoFAActive: false,
        twoFASecret: secret.secret,
      },
    }
  );
  return {
    props: secret,
  };
});
