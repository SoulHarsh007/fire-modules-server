import {DownloadIcon} from '@heroicons/react/solid';
import axios from 'axios';
import withSWR from 'swr';
import Loader from '../util/loader';
import Link from 'next/link';
import Head from 'next/head';
import NextError from 'next/error';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderIndex
 * @returns {any} renders index page
 */
export default function RenderIndex() {
  const {data, error} = withSWR('modules', () =>
    axios
      .get('/api/v1/modules', {
        params: {
          raw: true,
        },
      })
      .then(x => x.data)
  );
  if (error) {
    return (
      <>
        <Head>
          <title>Modules Index</title>
          <meta property="og:title" content="RebornOS FIRE - Modules Index" />
          <meta
            property="og:description"
            content="RebornOS FIRE - Modules Index"
          />
        </Head>
        <NextError
          title="Oops! It seems we ran into an error, Please reference this code when reporting: 'E-SWR-FTC-ERR-INX'"
          statusCode={422}
        />
      </>
    );
  }
  if (data) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-gray-900">
        <Head>
          <title>Modules Index</title>
          <meta property="og:title" content="RebornOS FIRE - Modules Index" />
          <meta
            property="og:description"
            content="RebornOS FIRE - Modules Index"
          />
        </Head>
        <div className="px-4 py-5 sm:px-6 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-50">
            Welcome to RebornOS Fire Modules Server!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-200">
            Current modules information
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-500">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Modules Version
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.version}
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Uploader
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.uploader}
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Modules Resource Tag
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.resourceTag}
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Included Appearance Modules
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.appearance.map(x => x.name).join(', ')}
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Included Display Manager Modules
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.dms.map(x => x.name).join(', ')}
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Included Kernel Modules
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.kernels.map(x => x.name).join(', ')}
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Included Software Modules
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.utils.packages.map(x => x.name).join(', ')}
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Included Software Categories
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                {data.utils.categories.join(', ')}
              </dd>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Downloads
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-50 sm:mt-0 sm:col-span-2">
                <ul role="list" className="rounded-md divide-y divide-gray-200">
                  <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <DownloadIcon
                        className="flex-shrink-0 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="ml-2 flex-1 w-0 truncate">
                        data.json
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link
                        href={{
                          pathname: '/api/v1/modules',
                          query: {
                            raw: true,
                          },
                        }}
                        passHref
                      >
                        <button className="focus:ring-2 rounded font-medium bg-indigo-600 hover:bg-indigo-500 p-2 text-gray-100">
                          Download
                        </button>
                      </Link>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }
  return (
    <>
      <Head>
        <title>Modules Index</title>
        <meta property="og:title" content="RebornOS FIRE - Modules Index" />
        <meta
          property="og:description"
          content="RebornOS FIRE - Modules Index"
        />
      </Head>
      <Loader />
    </>
  );
}
