"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
  });

  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(collection(db, "license_keys"));

      let total = 0;
      let active = 0;
      let expired = 0;

      const now = new Date();

      snapshot.forEach(doc => {
        total++;
        const data = doc.data();

        const expiry = new Date(data.expires_at);

        if (expiry >= now && data.active) active++;
        else expired++;
      });

      setStats({ total, active, expired });
    }

    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Total Licenses" value={stats.total} />
        <Card title="Active" value={stats.active} />
        <Card title="Expired" value={stats.expired} />
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-lg">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}