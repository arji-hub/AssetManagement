// pdfAssetsContext.js
import { createContext, useContext } from "react";
export const PDFAssetsContext = createContext({});
export const usePDFAssets = () => useContext(PDFAssetsContext);
