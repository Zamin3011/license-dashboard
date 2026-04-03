"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    disabled: 0,
    devices: 0,
    activeDevices: 0,
    distributors: 0,
    activeDistributors: 0,
  });

  const [recentDevices, setRecentDevices] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const licSnap = await getDocs(collection(db, "license_keys"));
      const devSnap = await getDocs(collection(db, "licensed_devices"));
      const distSnap = await getDocs(collection(db, "distributors"));

      let total = 0;
      let active = 0;
      let expired = 0;
      let disabled = 0;

      let devices = 0;
      let activeDevices = 0;

      let distributors = distSnap.size;
      let activeDistributors = 0;

      const now = new Date();
      const recent: any[] = [];

      licSnap.forEach(doc => {
        total++;
        const data = doc.data();
        let expiry = null;

        if (data.expires_at) {
          expiry = new Date(data.expires_at);
        }

        if (!data.active) disabled++;
        else if (expiry && expiry < now) expired++;
        else active++;
      });

      devSnap.forEach(doc => {
        devices++;
        const d = doc.data();

        if (d.active) activeDevices++;

        if (d.last_seen) {
          const last = d.last_seen.toDate();
          const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

          if (diff < 24) {
            recent.push({
              device_id: d.device_id,
              license_key: d.license_key,
              last_seen: last
            });
          }
        }
      });

      distSnap.forEach(doc => {
        if (doc.data().active) activeDistributors++;
      });

      setStats({
        total,
        active,
        expired,
        disabled,
        devices,
        activeDevices,
        distributors,
        activeDistributors,
      });

      recent.sort((a, b) => b.last_seen - a.last_seen);
      setRecentDevices(recent.slice(0, 5));
    }

    load();
  }, []);

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* MAIN STATS */}
      <div className="grid grid-cols-4 gap-4">

        <BigCard title="Total Licenses" value={stats.total} />

        <BigCard title="Active" value={stats.active} color="green" />

        <BigCard title="Expired" value={stats.expired} color="orange" />

        <BigCard title="Disabled" value={stats.disabled} color="red" />

      </div>

      {/* SECONDARY STATS */}
      <div className="grid grid-cols-4 gap-4">

        <Card title="Total Devices" value={stats.devices} />

        <Card title="Active Devices" value={stats.activeDevices} color="green" />

        <Card title="Distributors" value={stats.distributors} />

        <Card title="Active Distributors" value={stats.activeDistributors} color="green" />

      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-[#1e293b] rounded-xl p-5 shadow">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Activity (24h)</h2>
          <span className="text-sm text-gray-400">
            {recentDevices.length} active devices
          </span>
        </div>

        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="text-left py-2">Device</th>
              <th className="text-left py-2">License</th>
              <th className="text-left py-2">Last Seen</th>
            </tr>
          </thead>

          <tbody>
            {recentDevices.map((d, i) => (
              <tr key={i} className="border-t border-gray-700 hover:bg-[#273449]">

                <td className="py-2 text-white">
                  {d.device_id}
                </td>

                <td className="text-blue-400">
                  {d.license_key}
                </td>

                <td className="text-gray-300">
                  {d.last_seen.toLocaleString()}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* ========================= */
/* COMPONENTS */
/* ========================= */

function BigCard({ title, value, color }: any) {
  return (
    <div className="bg-[#1e293b] p-6 rounded-xl shadow border border-gray-700">

      <p className="text-gray-400 text-sm">{title}</p>

      <h2 className={`text-4xl font-bold mt-2 ${
        color === "green"
          ? "text-green-400"
          : color === "red"
          ? "text-red-400"
          : color === "orange"
          ? "text-orange-400"
          : "text-white"
      }`}>
        {value}
      </h2>

    </div>
  );
}

function Card({ title, value, color }: any) {
  return (
    <div className="bg-[#1e293b] p-5 rounded-xl shadow border border-gray-700">

      <p className="text-gray-400 text-sm">{title}</p>

      <h2 className={`text-2xl font-bold mt-1 ${
        color === "green"
          ? "text-green-400"
          : "text-white"
      }`}>
        {value}
      </h2>

    </div>
  );
}
