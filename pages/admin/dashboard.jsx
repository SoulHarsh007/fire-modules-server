import withSWR from 'swr';
import axios from 'axios';
import {useRouter} from 'next/router';
import Head from 'next/head';
import {
  ExclamationIcon,
  BadgeCheckIcon,
  CollectionIcon,
  AdjustmentsIcon,
  UsersIcon,
  LockClosedIcon,
} from '@heroicons/react/solid';
import NextError from 'next/error';
import Link from 'next/link';
import Loader from '../../util/loader';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminDashboard
 * @returns {any} renders admin dashboard
 */
export default function RenderAdminDashboard() {
  const {data, error} = withSWR('/api/users/me', () =>
    axios
      .get('/api/users/me', {
        params: {
          redirect: true,
        },
        withCredentials: true,
      })
      .then(x => x.data)
  );
  const router = useRouter();
  if (error) {
    return (
      <NextError
        title="Oops! It seems we ran into an error, Please reference this code when reporting: 'E-SWR-FTC-ERR-ADM-DSH'"
        statusCode={422}
      />
    );
  }
  if (data) {
    if (data.data.redirect) {
      router.push('/admin/login');
      return <></>;
    }
    let accountType = (
      <div className="flex flex-row text-red-600">
        <ExclamationIcon className="h-9 w-7" />
        {' Un-Verified Account'}
      </div>
    );
    if (data.data.superAdmin) {
      accountType = (
        <div className="flex flex-row text-green-600">
          <BadgeCheckIcon className="h-9 w-7" />
          {' Super Admin Account'}
        </div>
      );
    } else if (data.data.admin) {
      accountType = (
        <div className="flex flex-row text-green-600">
          <BadgeCheckIcon className="h-9 w-7" />
          {' Admin Account'}
        </div>
      );
    }
    return (
      <div className="justify-center">
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center items-center text-3xl dark:text-gray-100">
            {`👋 Hello, ${data.data.name}`}
          </div>
          <div className="text-center items-center text-3xl">{accountType}</div>
        </div>
        <div className="flex gap-4 flex-col justify-between text-center items-center mt-5 text-xl px-10">
          <div className="flex gap-4 flex-row">
            <Link href="/admin/modules" passHref>
              <button className="rounded-xl bg-white dark:text-gray-100 dark:bg-gray-900 shadow-2xl p-24 items-center flex flex-col">
                <CollectionIcon className="h-7 w-7" aria-hidden="true" />
                Manage Modules
              </button>
            </Link>
            <Link href="/admin/sessions" passHref>
              <button className="rounded-xl bg-white dark:text-gray-100 dark:bg-gray-900 shadow-2xl p-24 items-center flex flex-col">
                <AdjustmentsIcon className="h-7 w-7" aria-hidden="true" />
                Manage Sessions
              </button>
            </Link>
          </div>
          <div className="flex gap-4 flex-row">
            {data.data.superAdmin ? (
              <Link href="/admin/accounts" passHref>
                <button className="rounded-xl bg-white dark:text-gray-100 dark:bg-gray-900 shadow-2xl p-24 items-center flex flex-col">
                  <UsersIcon className="h-7 w-7" aria-hidden="true" />
                  Manage Accounts
                </button>
              </Link>
            ) : (
              <></>
            )}
            <Link href="/admin/set-2fa" passHref>
              <button className="rounded-xl bg-white dark:text-gray-100 dark:bg-gray-900 shadow-2xl p-24 items-center flex flex-col">
                <LockClosedIcon className="h-7 w-7" aria-hidden="true" />
                2FA Setup
              </button>
            </Link>
          </div>
        </div>
        <div className="justify-center flex mt-4">
          <button
            className="rounded text-white p-2 text-center bg-indigo-700"
            onClick={() => router.push('/api/users/logout')}
          >
            Logout
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <Head>
          <title>Loading...</title>
          <meta property="og:title" content="" />
        </Head>
        <Loader />;
      </>
    );
  }
}
