import { useState, useEffect } from "react";
import { subscribeToAuditByID } from "../../../services/audit";

function useAuditRoomPDF(auditID) {
  const [auditPDF, setAuditPDF] = useState(null);
  const [auditItemsPDF, setAuditItemsPDF] = useState([]);

  useEffect(() => {
    if (!auditID) {
      setAuditPDF(null);
      setAuditItemsPDF([]);
      return;
    }

    const unsubscribe = subscribeToAuditByID(
      auditID,
      (data) => {
        setAuditPDF(data);
        setAuditItemsPDF([
          ...(data.items || []),
          ...(data.discrepancyItems || []),
        ]);
      },
      (err) => {
        console.error(err);
      },
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auditID]);
  return {
    auditPDF,
    auditItemsPDF,
  };
}

export default useAuditRoomPDF;
