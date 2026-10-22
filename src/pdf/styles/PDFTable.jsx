// Meta rows + data table
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

// react-pdf only wraps text at spaces/hyphens, so long unbroken IDs overflow.
// Forcing a newline every few characters guarantees they wrap.
export function insertSoftBreaks(text, chunkSize = 20) {
  if (!text) return text;
  const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [text];
  return chunks.join("\n");
}

/**
 * Bordered label rows.
 * rows: array of rows; each row is an array of strings (1 = full width, 2+ = split).
 * <MetaRows rows={[["ROOM: A", "DATE: x"], ["NOTES: y"]]} />
 */
export function MetaRows({ rows }) {
  return rows.map((cells, r) => (
    <View style={styles.metaRow} key={r}>
      {cells.map((text, c) => (
        <View
          key={c}
          style={c === cells.length - 1 ? styles.metaCellLast : styles.metaCell}
        >
          <Text style={styles.metaLabel}>{text}</Text>
        </View>
      ))}
    </View>
  ));
}

/**
 * Table with a repeating top line, header on page 1, and the last `tailRows`
 * rows kept together with the `footer` (signatures) so they never sit alone.
 *
 * columns: [{
 *   key, header, width: "30%",
 *   align?: "center",
 *   render?: (row, index) => string | number,
 *   textStyle?: (row) => style,   // e.g. status colors
 *   softBreak?: boolean,          // wrap long unbroken strings
 * }]
 * totalRow?: { [columnKey]: value } rendered bold after the last row.
 * footer?: node kept with the tail rows (e.g. <Signatures />).
 */
export function PDFTable({
  columns,
  rows = [],
  tailRows = 3,
  totalRow,
  footer,
}) {
  const data = rows.length ? rows : [null]; // never an empty table
  const splitAt = Math.max(0, data.length - tailRows);

  const renderCells = (row, index, { bold = false, useKeys = false } = {}) =>
    columns.map((col, c) => {
      let value = "";
      if (row) {
        value = useKeys
          ? row[col.key]
          : col.render
            ? col.render(row, index)
            : row[col.key];
      }
      value = value ?? "";
      if (col.softBreak && typeof value === "string") {
        value = insertSoftBreaks(value);
      }

      return (
        <View
          key={col.key}
          style={[
            styles.cell,
            { width: col.width },
            c < columns.length - 1 && styles.cellDivider,
            col.align === "center" && styles.cellCenterAlign,
          ]}
        >
          <Text
            style={[
              styles.cellText,
              col.align === "center" && styles.textCenter,
              bold && styles.textBold,
              row && !useKeys && col.textStyle?.(row),
            ]}
          >
            {String(value)}
          </Text>
        </View>
      );
    });

  const renderRow = (row, index) => (
    <View style={styles.tableRow} key={index} wrap={false}>
      {renderCells(row, index)}
    </View>
  );

  return (
    <>
      <View style={styles.tableGap} />
      <View style={styles.tableTopLine} fixed />

      {/* Header prints on page 1 only */}
      <View style={styles.tableHeaderRow}>
        {columns.map((col, c) => (
          <View
            key={col.key}
            style={[
              styles.cell,
              { width: col.width },
              c < columns.length - 1 && styles.cellDivider,
            ]}
          >
            <Text style={styles.headerCellText}>{col.header}</Text>
          </View>
        ))}
      </View>

      {data.slice(0, splitAt).map(renderRow)}

      <View wrap={false}>
        {data.slice(splitAt).map((row, i) => renderRow(row, splitAt + i))}
        {totalRow && (
          <View style={styles.tableRow}>
            {renderCells(totalRow, 0, { bold: true, useKeys: true })}
          </View>
        )}
        {footer}
      </View>
    </>
  );
}
