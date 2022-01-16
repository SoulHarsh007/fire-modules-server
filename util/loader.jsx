import {LightningBoltIcon} from '@heroicons/react/solid';

/**
 * @author SoulHarsh007 <harsh.peshwani@outlook.com>
 * @function RenderAdminVerify2FA
 * @returns {any} renders loader component
 */
export default function loader() {
  return (
    <div
      className="text-indigo-500 text-2xl flex flex-rows absolute"
      style={{top: '50%', left: '50%'}}
    >
      <LightningBoltIcon className="h-6 w-5" />
      Loading...
    </div>
  );
}
