"use client";

import { useSession } from "next-auth/react";
import AsistenciaApp from "../marcation";

export default function SystemPage() {
  const session = useSession();

  return (
    <div>
      {session.data?.user.role === "ADMIN" ? (
        <div>Addiv</div>
      ) : (
        <div>
          <AsistenciaApp></AsistenciaApp>
        </div>
      )}
    </div>
  );
}
