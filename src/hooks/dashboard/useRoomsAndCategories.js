import { useEffect, useState } from "react";
import { subscribeToRooms } from "../../services/room";
import { subscribeToCategories } from "../../services/category";
import { fetchRoom } from "../../services/room";
import { ROLES } from "../../data/roles";

export function useRoomsAndCategories(user, assets) {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === ROLES.ADMIN;

  // ── Admin: full live collections ──────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    let roomsLoading = true;
    let categoriesLoading = true;
    const checkDone = () => {
      if (!roomsLoading && !categoriesLoading) setLoading(false);
    };

    const unsubRooms = subscribeToRooms(
      (data) => {
        setRooms(data);
        roomsLoading = false;
        checkDone();
      },
      (err) => {
        setError(err);
        roomsLoading = false;
        checkDone();
      },
    );

    const unsubCategories = subscribeToCategories(
      (data) => {
        setCategories(data);
        categoriesLoading = false;
        checkDone();
      },
      (err) => {
        setError(err);
        categoriesLoading = false;
        checkDone();
      },
    );

    return () => {
      unsubRooms();
      unsubCategories();
    };
  }, [isAdmin]);

  // ── Custodian: derive from their own assets ───────────────────
  useEffect(() => {
    if (isAdmin) return;
    if (!assets) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        // categories: doc id IS the category name, no lookup needed
        const categoryCounts = assets.reduce((acc, a) => {
          if (!a.category_id) return acc;
          acc[a.category_id] = (acc[a.category_id] ?? 0) + 1;
          return acc;
        }, {});
        const derivedCategories = Object.entries(categoryCounts).map(
          ([id, assetCount]) => ({ id, name: id, assetCount }),
        );

        // rooms: doc id is normalized, need fetchRoom for display name
        const roomCounts = assets.reduce((acc, a) => {
          if (!a.room_id) return acc;
          acc[a.room_id] = (acc[a.room_id] ?? 0) + 1;
          return acc;
        }, {});

        const roomEntries = await Promise.all(
          Object.entries(roomCounts).map(async ([roomId, assetCount]) => {
            try {
              const roomData = await fetchRoom(roomId);
              return { id: roomId, name: roomData.name, assetCount };
            } catch {
              return { id: roomId, name: roomId, assetCount };
            }
          }),
        );

        setCategories(derivedCategories);
        setRooms(roomEntries);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    })();
  }, [isAdmin, assets]);

  return { rooms, categories, loading, error };
}