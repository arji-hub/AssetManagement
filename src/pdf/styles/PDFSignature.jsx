// Signature blocks
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

/**
 * signers: [{ label: "Prepared by:", caption: "Signature Over Printed Name", name?: "Juan" }]
 * 1-2 signers get 45% width each, 3 get 30%.
 */
export function Signatures({ signers }) {
  const width = signers.length >= 3 ? "30%" : "45%";
  return (
    <View style={styles.signatureWrap}>
      <View style={styles.signatureRow}>
        {signers.map((s) => (
          <View style={[styles.signatureBlock, { width }]} key={s.label}>
            <Text style={styles.signatureLabel}>{s.label}</Text>
            <View style={styles.signatureLine}>
              {s.name ? (
                <Text style={styles.signatureName}>{s.name}</Text>
              ) : null}
            </View>
            <Text style={styles.signatureCaption}>{s.caption}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}