"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Licenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [key, setKey] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const licSnap = await getDocs(collection(db, "license_keys"));
    const distSnap = await getDocs(collection(db, "distributors"));

    const licData: any[] = [];
    const distData: any[] = [];

    licSnap.forEach(doc =>
      licData.push({ id: doc.id, ...doc.data() })
    );

    distSnap.forEach(doc =>
      distData.push({ id: doc.id, ...doc.data() })
    );

    setLicenses(licData);
    setDistributors(distData);
  }

  async function create() {
    if (!key) return;

    const existing = licenses.find(l => l.key === key);
    if (existing) {
      alert("License already exists");
      return;
    }

    setLoading(true);

    await setDoc(doc(db, "license_keys", key), {
      key,
      distributor_id: selectedDistributor || null,
      expires_at: "2026-12-31",
      max_devices: 3,
      used_devices: 0,
      active: true,
      created_at: new Date()
    });

    setKey("");
    setSelectedDistributor("");
    setLoading(false);

    load();
  }

  function getStatus(l: any) {
    const now = new Date();
    const expiry = new Date(l.expires_at);

    if (!l.active) return "Disabled";
    if (expiry < now) return "Expired";

    return "Active";
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Licenses</h1>

      {/* CREATE */}
      <div className="flex gap-3">

        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="License key..."
          className="bg-[#1e293b] px-4 py-2 rounded border border-gray-700"
        />

        <select
          value={selectedDistributor}
          onChange={(e) => setSelectedDistributor(e.target.value)}
          className="bg-[#1e293b] px-4 py-2 rounded border border-gray-700"
        >
          <option value="">No Distributor</option>
          {distributors.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <button
          onClick={create}
          disabled={loading}
          className="bg-blue-600 px-5 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e293b] rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-[#334155] text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">Distributor</th>
              <th className="px-4 py-3 text-left">Expiry</th>
              <th className="px-4 py-3 text-left">Devices</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {licenses.map((l) => {
              const status = getStatus(l);

              return (
                <tr key={l.id} className="border-t border-gray-700">

                  {/* KEY */}
                  <td className="px-4 py-3 text-white">
                    {l.key}
                  </td>

                  {/* DISTRIBUTOR */}
                  <td className="px-4 py-3">
                    <select
                      value={l.distributor_id || ""}
                      onChange={async (e) => {
                        await updateDoc(doc(db, "license_keys", l.id), {
                          distributor_id: e.target.value || null
                        });
                        load();
                      }}
                      className="bg-transparent border-b border-gray-600 text-blue-400"
                    >
                      <option value="">No Distributor</option>
                      {distributors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* EXPIRY */}
                  <td className={`px-4 py-3 ${
                    new Date(l.expires_at) < new Date()
                      ? "text-red-400"
                      : "text-gray-300"
                  }`}>
                    <input
                      type="date"
                      value={l.expires_at}
                      onChange={async (e) => {
                        await updateDoc(doc(db, "license_keys", l.id), {
                          expires_at: e.target.value
                        });
                        load();
                      }}
                      className="bg-transparent border-b border-gray-600"
                    />
                  </td>

                  {/* DEVICES */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={l.max_devices}
                      onChange={async (e) => {
                        await updateDoc(doc(db, "license_keys", l.id), {
                          max_devices: Number(e.target.value)
                        });
                        load();
                      }}
                      className="bg-transparent border-b border-gray-600 w-16"
                    />
                    <span className="ml-2 text-gray-400">
                      / {l.used_devices}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <span className={
                      status === "Active"
                        ? "bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs"
                        : status === "Expired"
                        ? "bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs"
                        : "bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs"
                    }>
                      {status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 flex gap-2">

                    <button
                      onClick={async () => {
                        await updateDoc(doc(db, "license_keys", l.id), {
                          active: !l.active
                        });
                        load();
                      }}
                      className="bg-yellow-500 px-2 py-1 rounded text-xs"
                    >
                      {l.active ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm("Delete license?")) return;

                        await deleteDoc(doc(db, "license_keys", l.id));
                        load();
                      }}
                      className="bg-red-500 px-2 py-1 rounded text-xs"
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
