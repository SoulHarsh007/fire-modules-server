import {MdOutlineWatch, MdOutlineTv} from 'react-icons/md';
import {AiOutlineTablet, AiOutlineMobile} from 'react-icons/ai';
import {FaDesktop} from 'react-icons/fa';
import Loader from '../../util/loader';
import axios from 'axios';
import NextError from 'next/error';
import withSWR from 'swr';
import {useState} from 'react';
import {useRouter} from 'next/router';
import {Popover} from '@headlessui/react';
import {prettyMS} from '@nia3208/pretty-ms';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminSessions
 * @returns {any} renders admin session management page
 */
export default function RenderAdminSessions() {
  const [data, setData] = useState();
  const router = useRouter();
  const {error} = withSWR('/api/users/sessions', () =>
    axios
      .get('/api/users/sessions', {
        withCredentials: true,
      })
      .then(x => setData(x.data))
  );
  if (error) {
    if (!error?.response.data.success) {
      router.push('/admin/login');
    }
    return (
      <NextError
        title="Oops! It seems we ran into an error, Please reference this code when reporting: 'E-SWR-FTC-ERR-ADM-SES'"
        statusCode={422}
      />
    );
  }
  if (!data) {
    return <Loader />;
  }
  if (data.redirect) {
    router.push('/admin/login');
    return <></>;
  }
  const sessions = data.sessions
    .map(x => {
      switch (x.device) {
        case 'wearable': {
          x.device = <MdOutlineWatch className="h-7 w-7 dark:text-gray-100" />;
          break;
        }
        case 'tablet': {
          x.device = <AiOutlineTablet className="h-7 w-7 dark:text-gray-100" />;
          break;
        }
        case 'mobile': {
          x.device = <AiOutlineMobile className="h-7 w-7 dark:text-gray-100" />;
          break;
        }
        case 'tv': {
          x.device = <MdOutlineTv className="h-7 w-7 dark:text-gray-100" />;
          break;
        }
        default: {
          x.device = <FaDesktop className="h-7 w-7 dark:text-gray-100" />;
          break;
        }
      }
      return x;
    })
    .sort((a, b) => {
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
                    IP Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Browser
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    Started At
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
                  <tr key={x.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {x.device}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            {x.ip}
                            {data.id === x.id ? (
                              <div className="text-sm text-gray-500 dark:text-gray-200">
                                (Current Session)
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-50">
                        {x.browser}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-200">
                        {x.os}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-visible">
                      <Popover className="relative">
                        <Popover.Button>
                          {x.revoked ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Revoked
                            </span>
                          ) : Date.now() - new Date(x.lastTS).getTime() >
                            1209600000 ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-orange-800">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </Popover.Button>
                        <Popover.Panel className="absolute w-auto max-w-sm px-4 mt-3 transform -translate-y-16 left-1/2 sm:px-0 lg:max-w-3xl">
                          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="p-4 bg-black/80 divide-y text-center">
                              {x.revoked ? (
                                <>
                                  <span className="text-center">
                                    <span className="font-medium text-gray-50">
                                      This session was revoked!
                                    </span>
                                  </span>
                                  <span className="block text-sm text-gray-100">
                                    {x.revokeReason}
                                  </span>
                                </>
                              ) : Date.now() - new Date(x.lastTS).getTime() >
                                1209600000 ? (
                                <>
                                  <span className="text-center">
                                    <span className="font-medium text-gray-50">
                                      This session expired!
                                    </span>
                                  </span>
                                  <span className="block text-sm text-gray-100">
                                    Sessions have a limit of 14 days and,
                                    inactive sessions expire automatically
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-center">
                                    <span className="font-medium text-gray-50">
                                      This session is active!
                                    </span>
                                  </span>
                                  <span className="block text-sm text-gray-100">
                                    {`This session will expire in ${prettyMS(
                                      new Date(x.lastTS).getTime() +
                                        1209600000 -
                                        Date.now(),
                                      {
                                        verbose: true,
                                      }
                                    )}`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Popover.Panel>
                      </Popover>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                      {new Date(x.startTS).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-200">
                      {new Date(x.lastTS).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        className={
                          x.revoked
                            ? 'text-gray-50 hover:text-gray-400 bg-indigo-600 p-2 cursor-not-allowed'
                            : 'text-gray-50 hover:text-gray-400 bg-indigo-600 p-2'
                        }
                        disabled={x.revoked}
                        onClick={() => {
                          axios
                            .post('/api/users/revoke-session', {
                              session: x.id,
                            })
                            .then(res => setData(res.data))
                            .catch(() => router.reload());
                        }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
