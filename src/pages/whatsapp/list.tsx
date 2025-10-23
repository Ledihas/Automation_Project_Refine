import React, { useEffect, useState } from "react";
import { account, appwriteClient } from "../../utility";
import { Databases, Query } from "appwrite"; // 👈 OJO: aquí debe ser "appwrite", no "@refinedev/appwrite"

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const collectionId = import.meta.env.VITE_APPWRITE_WHATSAPP_COLLECTION_ID;

export const ShowInstances: React.FC = () => {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const user = await account.get();
        const databases = new Databases(appwriteClient);

        const res = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.equal("user_id", user.$id)]
        );

        setInstances(res.documents);
      } catch (error) {
        console.error("Error obteniendo instancias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Cargando instancias...</p>;
  }

  if (instances.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No tienes instancias registradas.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">Mis Instancias de WhatsApp</h1>

      <ul className="space-y-4">
        {instances.map((instance) => (
          <li
            key={instance.$id}
            className="p-4 border rounded-xl bg-gray-50 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{instance.instance_name}</p>
              <p className="text-sm text-gray-500">
                Estado:{" "}
                <span
                  className={
                    instance.status === "connected"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {instance.status}
                </span>
              </p>
            </div>
            <div className="text-sm text-gray-400">
              {new Date(instance.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
