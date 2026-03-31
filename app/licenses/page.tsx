"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Licenses() {
  const [licenses, setLicenses] = useState([]);
  const [key, setKey] = useState("");

  async function load() {
    const snap = await getDocs(collection(db, "license_keys"));
    const data: any = [];
    snap.forEach(doc => data.push(doc.data()));
    setLicenses(data);
  }

  async function create() {
    await addDoc(collection(db, "license_keys"), {
      key,
      expires_at: "2026-12-31",
      max_devices: 3,
      used_devices: 0,
      active: true,
    });

    setKey("");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">Licenses</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="border p-2"
          placeholder="License Key"
        />
        <button onClick={create} className="bg-blue-500 px-4 py-2">
          Create
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Key</th>
            <th>Expiry</th>
            <th>Devices</th>
          </tr>
        </thead>

        <tbody>
          {licenses.map((l: any, i) => (
            <tr key={i}>
              <td>{l.key}</td>
              <td>{l.expires_at}</td>
              <td>{l.used_devices}/{l.max_devices}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}