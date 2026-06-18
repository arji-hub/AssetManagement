import { useState, useEffect, useCallback } from "react";
import { fetchAssetInRoom } from "../services/room";

export function useRoomAssets(room_id) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAssetInRoom(room_id);
      setAssets(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [room_id]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return { assets, loading, error, refetch: loadAssets };
}