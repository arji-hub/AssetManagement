import { useState, useEffect } from "react";
import { subscribeToAssetsInRoom, fetchRoom } from "../../services/room";

export function useRoomAssets(room_id) {
  const [assets, setAssets] = useState([]);
  const [roomName, setRoomName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!room_id) return;

    setLoading(true);
    setError(null);

    fetchRoom(room_id)
      .then((room) => setRoomName(room.name))
      .catch((err) => setError(err));

    const unsubscribe = subscribeToAssetsInRoom(
      room_id,
      (assets) => {
        setAssets(assets);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [room_id]);

  return { assets, roomName, loading, error };
}