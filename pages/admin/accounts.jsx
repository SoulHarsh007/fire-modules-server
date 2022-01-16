import Loader from '../../util/loader';
import axios from 'axios';
import NextError from 'next/error';
import withSWR from 'swr';
import {useCallback, useState} from 'react';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminSessions
 * @returns {any} renders admin session management page
 */
export default function RenderAdminSessions() {
  const [data, setData] = useState();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState();
  const fetcher = useCallback(() => {
    axios
      .get('/api/users/accounts', {
        withCredentials: true,
      })
      .then(x => setData(x.data))
      .catch(x => setError(x));
  }, []);
  withSWR('/api/users/accounts', fetcher);
  if (error) {
    return (
      <NextError
        title={
          error.response?.data.msg ??
          "Oops! It seems we ran into an error, Please reference this code when reporting: 'E-SWR-FTC-ERR-ADM-ACC'"
        }
        statusCode={403}
      />
    );
  }
  if (!data) {
    return <Loader />;
  }
  const sessions = data.users.sort((a, b) => {
    if (a.id === data.id) {
      return -1;
    } else if (b.id === data.id) {
      return 1;
    }
    return b.startTS - a.startTS;
  });
  return (
    <div className="flex overflow-hidden flex-col dark:bg-gray-900">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    2FA Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Account Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Last Seen At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200  dark:bg-gray-900">
                {sessions.map(x => (
                  <tr key={x._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {x.name}
                          {data.id === x._id ? (
                            <div className="text-sm text-gray-500 dark:text-gray-200">
                              (You)
                            </div>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-50">
                        {x.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-200">
                        {x._id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-visible">
                      {x.twoFAActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          In-Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-visible">
                      {x.disabled ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          In-Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                      {x.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                      {new Date(x.lastSeen).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm grid grid-cols-1 divide-y">
                      <button
                        className="text-gray-50 hover:text-gray-400 bg-indigo-600 p-2"
                        onClick={() => {
                          if (x._id === data.id) {
                            return setMsg(
                              'Are you nuts? You cannot disable your account!'
                            );
                          }
                          axios
                            .post('/api/users/accounts', {
                              id: x._id,
                              status: x.disabled ? false : true,
                              disable: true,
                            })
                            .then(() => {
                              fetcher();
                              setMsg(
                                `Account for ${x.name} (${x.email}) has been ${
                                  x.disabled ? 'enabled' : 'disabled'
                                }`
                              );
                            })
                            .catch(console.error);
                        }}
                      >
                        {x.disabled ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        className="text-gray-50 hover:text-gray-400 bg-indigo-600 p-2"
                        onClick={() => {
                          axios
                            .post('/api/users/accounts', {
                              id: x._id,
                              resetPwd: true,
                            })
                            .then(y =>
                              setMsg(
                                `Password for ${x.name} (${x.email}) has been reset to ${y.data.newPwd}`
                              )
                            )
                            .catch(console.error);
                        }}
                      >
                        Reset Password
                      </button>
                      <button
                        className={
                          x.twoFAActive
                            ? 'text-gray-50 hover:text-gray-400 bg-indigo-600 p-2'
                            : 'hidden'
                        }
                        onClick={() => {
                          axios
                            .post('/api/users/accounts', {
                              id: x._id,
                            })
                            .then(() => {
                              fetcher();
                              setMsg(
                                `Account for ${x.name} (${x.email}) has been ${
                                  x.disabled ? 'enabled' : 'disabled'
                                }`
                              );
                            })
                            .catch(console.error);
                        }}
                      >
                        Disable 2FA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-indigo-600 dark:text-white font-sans text-lg text-center">
            {msg}
          </div>
        </div>
      </div>
    </div>
  );
}
