"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Distributors() {
  const [list, setList] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [maxDevices, setMaxDevices] = useState(100);

  async function load() {
    const snap = await getDocs(collection(db, "distributors"));
    const data: any[] = [];

    for (let d of snap.docs) {
      const dist = { id: d.id, ...d.data() };

      // 🔥 get usage
      const devicesSnap = await getDocs(
        query(
          collection(db, "licensed_devices"),
          where("distributor_id", "==", d.id)
        )
      );

      data.push({
        ...dist,
        used: devicesSnap.size
      });
    }

    setList(data);
  }

  async function create() {
    if (!name) return;

    await addDoc(collection(db, "distributors"), {
      name,
      max_devices: maxDevices,
      active: true,
      expires_at: null,
      created_at: new Date()
    });

    setName("");
    setMaxDevices(100);
    load();
  }

  async function updateField(id: string, field: string, value: any) {
    await updateDoc(doc(db, "distributors", id), {
      [field]: value
    });
    load();
  }

  async function toggleActive(id: string, current: boolean) {
    await updateDoc(doc(db, "distributors", id), {
      active: !current
    });
    load();
  }

  async function removeDistributor(id: string) {
    await deleteDoc(doc(db, "distributors", id));
    load();
  }

  async function disableAllDevices(distributorId: string) {
    const snap = await getDocs(
      query(
        collection(db, "licensed_devices"),
        where("distributor_id", "==", distributorId)
      )
    );

    for (let d of snap.docs) {
      await updateDoc(d.ref, { active: false });
    }

    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Distributors</h1>

      {/* CREATE */}
      <div className="flex gap-3">
        <input
          placeholder="Distributor name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#1e293b] px-4 py-2 rounded border border-gray-700"
        />

        <input
          type="number"
          value={maxDevices}
          onChange={(e) => setMaxDevices(Number(e.target.value))}
          className="bg-[#1e293b] px-4 py-2 rounded border border-gray-700 w-32"
        />

        <button
          onClick={create}
          className="bg-blue-600 px-5 py-2 rounded"
        >
          Create
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e293b] rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-[#334155] text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Usage</th>
              <th className="px-4 py-3 text-left">Max</th>
              <th className="px-4 py-3 text-left">Expiry</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((d) => (
              <tr key={d.id} className="border-t border-gray-700">

                {/* NAME */}
                <td className="px-4 py-3">
                  <input
                    value={d.name}
                    onChange={(e) =>
                      updateField(d.id, "name", e.target.value)
                    }
                    className="bg-transparent text-white border-b border-gray-600 outline-none"
                  />
                </td>

                {/* USAGE */}
                <td className="px-4 py-3 text-blue-400">
                  {d.used || 0}
                </td>

                {/* MAX DEVICES */}
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={d.max_devices}
                    onChange={(e) =>
                      updateField(d.id, "max_devices", Number(e.target.value))
                    }
                    className="bg-transparent border-b border-gray-600 w-20"
                  />
                </td>

                {/* EXPIRY */}
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={d.expires_at || ""}
                    onChange={(e) =>
                      updateField(d.id, "expires_at", e.target.value)
                    }
                    className="bg-transparent border-b border-gray-600"
                  />
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  <span className={
                    d.active
                      ? "bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs"
                      : "bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs"
                  }>
                    {d.active ? "Active" : "Disabled"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-3 flex gap-2">

                  <button
                    onClick={() => toggleActive(d.id, d.active)}
                    className="bg-yellow-500 px-2 py-1 rounded text-xs"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => disableAllDevices(d.id)}
                    className="bg-orange-500 px-2 py-1 rounded text-xs"
                  >
                    Disable Devices
                  </button>

                  <button
                    onClick={() => removeDistributor(d.id)}
                    className="bg-red-500 px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}
