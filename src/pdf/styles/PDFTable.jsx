// Meta rows + data table
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

export function insertSoftBreaks(text, chunkSize = 20) {
  if (!text) return text;
  const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [text];
  return chunks.join("\n");
}

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

export function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function MetaGrid({ rows }) {
  return rows.map((cells, r) => (
    <View
      style={[styles.metaRow, r > 0 && styles.metaRowStacked]}
      key={r}
      wrap={false}
    >
      {cells.map(({ label, value }, c) => (
        <View
          key={label}
          style={c === cells.length - 1 ? styles.metaCellLast : styles.metaCell}
        >
          <Text style={styles.metaLabelSmall}>{label}</Text>
          <Text style={styles.metaValue}>
            {value === undefined || value === null || value === ""
              ? "—"
              : String(value)}
          </Text>
        </View>
      ))}
    </View>
  ));
}
export function PDFTable({
  columns,
  rows = [],
  tailRows = 3,
  totalRow,
  summary,
  footer,
  repeatHeader = true,
  zebra = false,
  headerFill = false,
}) {
  const data = rows.length ? rows : [null];
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
        value = insertSoftBreaks(value, col.chunkSize);
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
              col.mono && styles.textMono,
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
    <View
      style={[styles.tableRow, zebra && index % 2 === 1 && styles.tableRowAlt]}
      key={index}
      wrap={false}
    >
      {renderCells(row, index)}
    </View>
  );

  return (
    <>
      <View style={styles.tableGap} />
      <View style={styles.tableTopLine} fixed />

      <View
        style={[styles.tableHeaderRow, headerFill && styles.tableHeaderFill]}
        fixed={repeatHeader}
      >
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
        {summary ? <Text style={styles.totalLine}>{summary}</Text> : null}
        {footer}
      </View>
    </>
  );
}
