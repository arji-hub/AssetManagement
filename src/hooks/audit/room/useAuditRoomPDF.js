import { useState, useEffect, useMemo } from "react";
import { subscribeToAuditByID } from "../../../services/audit";

function useAuditRoomPDF(auditID) {
  const [auditPDF, setAuditPDF] = useState(null);
  const [rawItems, setRawItems] = useState([]);
  const [rawDiscrepancies, setRawDiscrepancies] = useState([]);

  useEffect(() => {
    if (!auditID) {
      setAuditPDF(null);
      setRawItems([]);
      setRawDiscrepancies([]);
      return;
    }

    const unsubscribe = subscribeToAuditByID(
      auditID,
      (data) => {
        const { items, discrepancyItems, ...auditData } = data;
        setAuditPDF(auditData);
        setRawItems(items || []);
        setRawDiscrepancies(discrepancyItems || []);
      },
      (err) => console.error(err),
    );

    return () => unsubscribe?.();
  }, [auditID]);

  const auditItemsPDF = useMemo(() => {
    const discrepancyIds = new Set(rawDiscrepancies.map((d) => d.asset_id));
    const regularItems = rawItems.filter(
      (i) => !discrepancyIds.has(i.asset_id),
    );

    return [...regularItems, ...rawDiscrepancies];
  }, [rawItems, rawDiscrepancies]);

  return { auditPDF, auditItemsPDF };
}

export default useAuditRoomPDF;
