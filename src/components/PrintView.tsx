import { AppData } from "../types";
import {
  buildCoverageSummary,
  buildIngredientPullList,
  buildMiseEnPlaceList,
  summarizePlanRow,
} from "../utils/calculations";
import { formatAmount } from "../utils/units";

const styles = {
  page: {
    backgroundColor: "#ffffff",
    color: "#000000",
    padding: "24px",
    fontFamily: "Arial, Helvetica, sans-serif",
  } as const,
  section: {
    marginBottom: "32px",
    breakInside: "avoid",
  } as const,
  title: {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "12px",
  } as const,
  subtitle: {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "12px",
  } as const,
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  } as const,
  summaryCard: {
    border: "1px solid #94a3b8",
    backgroundColor: "#f8fafc",
    padding: "12px 14px",
  } as const,
  summaryCardWarn: {
    border: "1px solid #fca5a5",
    backgroundColor: "#fef2f2",
    padding: "12px 14px",
  } as const,
  summaryCardOk: {
    border: "1px solid #86efac",
    backgroundColor: "#f0fdf4",
    padding: "12px 14px",
  } as const,
  summaryLabel: {
    fontSize: "13px",
    color: "#475569",
    marginBottom: "4px",
  } as const,
  summaryValue: {
    fontSize: "20px",
    fontWeight: 700,
  } as const,
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: "14px",
  } as const,
  th: {
    border: "1px solid #94a3b8",
    backgroundColor: "#e2e8f0",
    padding: "10px 12px",
    textAlign: "left" as const,
    verticalAlign: "top" as const,
  } as const,
  td: {
    border: "1px solid #94a3b8",
    padding: "10px 12px",
    verticalAlign: "top" as const,
    wordWrap: "break-word" as const,
    overflowWrap: "break-word" as const,
  } as const,
  rowEven: {
    backgroundColor: "#ffffff",
  } as const,
  rowOdd: {
    backgroundColor: "#f8fafc",
  } as const,
};

export function PrintView({ data }: { data: AppData }) {
  const summary = buildCoverageSummary(data);
  const ingredientRows = buildIngredientPullList(data);
  const miseRows = buildMiseEnPlaceList(data);

  const planRows = data.activeParty.rows.map((row) => ({
    row,
    summaryRow: summarizePlanRow(data, row),
  }));

  const showNotesColumn = planRows.some(
    ({ row }) => (row.notes ?? "").trim() !== "",
  );

  const showPostBakeColumn = planRows.some(
    ({ summaryRow }) => summaryRow.postBake.trim() !== "",
  );

  return (
    <div style={styles.page}>
      <section style={styles.section}>
        <h1 style={styles.title}>Pizza Plan</h1>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Diners</div>
            <div style={styles.summaryValue}>{summary.diners}</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Planned servings</div>
            <div style={styles.summaryValue}>
              {Math.round(summary.plannedServings * 100) / 100}
            </div>
          </div>

          <div
            style={summary.needsMore ? styles.summaryCardWarn : styles.summaryCardOk}
          >
            <div style={styles.summaryLabel}>Coverage</div>
            <div style={styles.summaryValue}>
              {summary.needsMore
                ? `Need more (${Math.abs(Math.round(summary.delta * 100) / 100)})`
                : `Enough (+${Math.round(summary.delta * 100) / 100})`}
            </div>
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "7%" }}>Qty</th>
              <th style={{ ...styles.th, width: "14%" }}>Pizza</th>
              <th style={{ ...styles.th, width: "9%" }}>Size</th>
              <th style={{ ...styles.th, width: "12%" }}>Sauce</th>
              <th style={{ ...styles.th, width: "15%" }}>Cheese</th>
              <th style={{ ...styles.th, width: "18%" }}>Toppings</th>
              <th style={{ ...styles.th, width: "12%" }}>Seasonings</th>
              {showPostBakeColumn && (
                <th style={{ ...styles.th, width: "13%" }}>Post-bake</th>
              )}
              {showNotesColumn && (
                <th style={{ ...styles.th, width: "14%" }}>Notes</th>
              )}
              <th style={{ ...styles.th, width: "10%" }}>Servings</th>
            </tr>
          </thead>

          <tbody>
            {planRows.map(({ row, summaryRow }, index) => (
              <tr
                key={row.id}
                style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
              >
                <td style={styles.td}>{row.quantity}</td>
                <td style={styles.td}>{summaryRow.pizzaName}</td>
                <td style={styles.td}>{summaryRow.sizeName}</td>
                <td style={styles.td}>{summaryRow.sauce}</td>
                <td style={styles.td}>{summaryRow.cheese}</td>
                <td style={styles.td}>{summaryRow.toppings}</td>
                <td style={styles.td}>{summaryRow.seasonings}</td>
                {showPostBakeColumn && (
                  <td style={styles.td}>{summaryRow.postBake}</td>
                )}
                {showNotesColumn && <td style={styles.td}>{row.notes ?? ""}</td>}
                <td style={styles.td}>
                  {Math.round(summaryRow.servings * 100) / 100}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>Ingredient Pull List</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "24%" }}>Item</th>
              <th style={{ ...styles.th, width: "14%" }}>Amt</th>
              <th style={{ ...styles.th, width: "18%" }}>Location</th>
              <th style={{ ...styles.th, width: "36%" }}>Used For</th>
              <th style={{ ...styles.th, width: "8%" }}>☐</th>
            </tr>
          </thead>

          <tbody>
            {ingredientRows.map((row, index) => (
              <tr
                key={row.key}
                style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
              >
                <td style={styles.td}>{row.itemName}</td>
                <td style={styles.td}>{formatAmount(row.totalValue, row.unitName)}</td>
                <td style={styles.td}>{row.locationName ?? ""}</td>
                <td style={styles.td}>{row.usedFor.join(", ")}</td>
                <td style={styles.td}>☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>Mise en Place</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "32%" }}>Task</th>
              <th style={{ ...styles.th, width: "24%" }}>Item</th>
              <th style={{ ...styles.th, width: "16%" }}>Amount</th>
              <th style={{ ...styles.th, width: "22%" }}>Pizza</th>
              <th style={{ ...styles.th, width: "6%" }}>☐</th>
            </tr>
          </thead>

          <tbody>
            {miseRows.map((row, index) => (
              <tr
                key={row.id}
                style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
              >
                <td style={styles.td}>{row.task}</td>
                <td style={styles.td}>{row.itemName ?? ""}</td>
                <td style={styles.td}>{row.amountText ?? ""}</td>
                <td style={styles.td}>{row.pizzaName}</td>
                <td style={styles.td}>☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
