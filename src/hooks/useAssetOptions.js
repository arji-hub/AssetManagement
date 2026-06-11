import { useState, useEffect } from "react";
import { fetchCustodians } from "../../services/user";
import { fetchRooms } from "../../services/room";

export function useAssetOptions() {
  const [custodians, setCustodians] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [fetchedCustodians, fetchedRooms] = await Promise.all([
          fetchCustodians(),
          fetchRooms(),
        ]);
        setCustodians(fetchedCustodians);
        setRooms(fetchedRooms);
      } catch (err) {
        console.error("Failed to load custodians/rooms:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const fulltimeCustodians = custodians.filter((c) => c.role === "fulltime");
  const parttimeCustodians = custodians.filter((c) => c.role === "parttime");

  return { fulltimeCustodians, parttimeCustodians, rooms, loadingOptions };
}