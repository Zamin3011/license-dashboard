"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Devices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [distributors, setDistributors] = useState<any[]>([]);

  async function updateDistributor(deviceId: string, distributorId: string) {
    await updateDoc(doc(db, "licensed_devices", deviceId), {
      distributor_id: distributorId
    });
  }

  async function removeDevice(id: string) {
    if (!confirm("Delete this device?")) return;

    await deleteDoc(doc(db, "licensed_devices", id));
  }

  async function toggleDevice(id: string, current: boolean) {
    await updateDoc(doc(db, "licensed_devices", id), {
      active: !current
    });
  }

  async function extendExpiry(id: string) {
    const newDate = prompt("Enter new expiry (YYYY-MM-DD)");
    if (!newDate) return;

    await updateDoc(doc(db, "licensed_devices", id), {
      expires_at: newDate
    });

  }

  function getStatus(device: any) {
    const now = new Date();

    const distributor = distributors.find(
      (d) => d.id === device.distributor_id
    );

    // 🔥 If distributor disabled → device inactive
    if (distributor && !distributor.active) return "Inactive";

    if (!device.active) return "Inactive";

    if (!device.expires_at) return "Active";

    const expiry = new Date(device.expires_at);

    if (expiry < now) return "Expired";

    return "Active";
  }

  function formatDate(ts: any) {
    if (!ts) return "-";
    return ts.toDate().toLocaleString();
  }

  const filtered = devices.filter(d =>
    d.device_id?.toLowerCase().includes(search.toLowerCase()) ||
    d.license_key?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const unsubscribeDevices = onSnapshot(
      collection(db, "licensed_devices"),
      (snap) => {
        const data: any[] = [];

        snap.forEach(d => {
          data.push({
            id: d.id,
            ...d.data()
          });
        });

        setDevices(data);
      }
    );

    const unsubscribeDistributors = onSnapshot(
      collection(db, "distributors"),
      (snap) => {
        const distData: any[] = [];

        snap.forEach(d => {
          distData.push({
            id: d.id,
            ...d.data()
          });
        });

        setDistributors(distData);
      }
    );

    return () => {
      unsubscribeDevices();
      unsubscribeDistributors();
    };
  }, []);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Devices</h1>

      {/* SEARCH */}
      <input
        placeholder="Search device or license..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-[#1e293b] px-4 py-2 rounded-lg border border-gray-700 w-80"
      />

      {/* TABLE */}
      <div className="bg-[#1e293b] rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-[#334155] text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Device</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Distributor</th>
              <th className="px-4 py-3 text-left">License</th>
              <th className="px-4 py-3 text-left">Last Seen</th>
              <th className="px-4 py-3 text-left">Expiry</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((d) => {
              const status = getStatus(d);

              return (
                <tr key={d.id} className="border-t border-gray-700 hover:bg-[#273449]">

                  <td className="px-4 py-3 text-white font-medium">
                    {d.device_id}
                  </td>

                  <td className="px-4 py-3 text-gray-300">
                    {d.device_label || "-"}
                  </td>

                  {/* ✅ DISTRIBUTOR DROPDOWN */}
                  <td className="px-4 py-3">
                    <select
                      value={d.distributor_id || ""}
                      onChange={(e) => updateDistributor(d.id, e.target.value)}
                      className="bg-[#1e293b] border border-gray-600 rounded px-2 py-1 text-sm"
                    >
                      <option value="">None</option>
                      {distributors.map(dist => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-blue-400">
                    {d.license_key}
                  </td>

                  <td className="px-4 py-3 text-gray-400">
                    {formatDate(d.last_seen)}
                  </td>

                  <td className="px-4 py-3 text-gray-300">
                    {d.expires_at}
                  </td>

                  <td className="px-4 py-3">
                    <span className={
                      status === "Active"
                        ? "bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs"
                        : "bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs"
                    }>
                      {status}
                    </span>
                  </td>

                  <td className="px-4 py-3 flex gap-2">

                    {/* ENABLE / DISABLE */}
                    <button
                      onClick={() => toggleDevice(d.id, d.active)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-xs"
                    >
                      {d.active ? "Disable" : "Enable"}
                    </button>

                    {/* EXTEND */}
                    <button
                      onClick={() => extendExpiry(d.id)}
                      className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
                    >
                      Extend
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => removeDevice(d.id)}
                      className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

      </div>

    </div>
  );
}
