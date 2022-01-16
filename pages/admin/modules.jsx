import withSWR from 'swr';
import axios from 'axios';
import {useRouter} from 'next/router';
import {CloudUploadIcon, UploadIcon} from '@heroicons/react/solid';
import NextError from 'next/error';
import {useState, useRef} from 'react';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminModules
 * @returns {any} renders admin modules management page
 */
export default function RenderAdminModules() {
  const [file, setFile] = useState();
  const [msg, setMsg] = useState('');
  const [upload, setUpload] = useState('');
  const [json, setJson] = useState();
  const [otp, setOtp] = useState(false);
  const fileUpload = useRef();
  const {data, error} = withSWR('/api/users/me', () =>
    axios
      .get('/api/users/me', {
        withCredentials: true,
      })
      .then(x => x.data)
  );
  const router = useRouter();
  if (error) {
    return (
      <NextError
        title="Oops! It seems we ran into an error, Please reference this code when reporting: 'E-SWR-FTC-ERR-ADM-EDT'"
        statusCode={422}
      />
    );
  }
  if (data) {
    if (!data.data.hasTwoFA) {
      return (
        <NextError
          title={'You must have 2FA enabled in-order to update modules'}
          statusCode={403}
        />
      );
    }
    if (!data.data.sessionActive) {
      router.push('/admin/verify-2fa');
      return <></>;
    }
  }
  return (
    <div className="justify-center">
      <div className="flex gap-4 flex-col justify-between text-center items-center mt-5 text-xl px-10">
        <input
          type="file"
          className="hidden"
          ref={fileUpload}
          onChange={e => {
            setMsg('');
            e.target.files[0]
              .text()
              .then(x => {
                const modules = Object.keys(JSON.parse(x));
                const defaultKeys = [
                  'version',
                  'resourceTag',
                  'uploader',
                  'appearance',
                  'dms',
                  'kernels',
                  'utils',
                ];
                const missingKeys = defaultKeys
                  .filter(x => !modules.includes(x))
                  .join(' ');
                const extraKeys = modules
                  .filter(x => !defaultKeys.includes(x))
                  .join(' ');
                if (missingKeys && extraKeys) {
                  setMsg(
                    `Missing Keys: ${missingKeys}\nExtra Keys: ${extraKeys}`
                  );
                } else if (missingKeys) {
                  setMsg(`Missing Keys: ${missingKeys}`);
                } else if (extraKeys) {
                  setMsg(`Extra Keys: ${extraKeys}`);
                } else {
                  setJson(JSON.parse(x));
                }
              })
              .catch(e => setMsg(`Invalid JSON: ${e.message}`));
            setFile(e.target.files[0]);
          }}
        />
        <button
          className="rounded-xl bg-white dark:text-gray-100 dark:bg-gray-900 shadow-2xl p-24 items-center flex flex-col"
          onClick={() => {
            if (fileUpload) {
              return fileUpload.current.click();
            }
          }}
        >
          <CloudUploadIcon className="h-7 w-7" aria-hidden="true" />
          Upload Modules JSON
        </button>
        {file ? (
          <>
            <span className="text-white">
              Selected: {file.name} (Type:{' '}
              {
                <span
                  className={
                    file.type === 'application/json'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }
                >
                  {file.type}
                </span>
              }
              {' Modification Date: '}
              {new Date(file.lastModified).toDateString()})
            </span>
            {msg ? (
              <></>
            ) : (
              <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                  <div>
                    <h2 className="mt-6 text-center text-xl text-gray-900 dark:text-gray-50">
                      Enter your 6 Digit T-OPT to continue updating modules
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
                        .then(() => {
                          if (json) {
                            axios
                              .post('/api/users/modules', json, {
                                withCredentials: true,
                              })
                              .then(x => {
                                setUpload(
                                  `Modules updated! Some clients may take upto 120 seconds to the reflect new version due to caching.\nNew Version: ${x.data.version}\nNew Resource Tag: ${x.data.resourceTag}`
                                );
                                setMsg(' ');
                              })
                              .catch(x => setMsg(x.response?.data.msg));
                          }
                        })
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
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                          <UploadIcon
                            className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                            aria-hidden="true"
                          />
                        </span>
                        {'Verify & Upload'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <></>
        )}
        <p className="text-red-600 whitespace-pre-wrap">{msg}</p>
        <p className="text-green-600 whitespace-pre-wrap">{upload}</p>
      </div>
    </div>
  );
}
