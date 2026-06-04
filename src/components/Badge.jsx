const colorStyles = {
  gray: { background: "#f1efe8", color: "#5f5e5a" },
  blue: { background: "#e6f1fb", color: "#0c447c" },
  green: { background: "#eaf3de", color: "#3b6d11" },
  amber: { background: "#faeeda", color: "#854f0b" },
  purple: { background: "#eeedfe", color: "#3c3489" },
  coral: { background: "#faece7", color: "#993c1d" },
};

export function Badge({ value, color = "gray", small = false }) {
  if (!value) return null;
  return (
    <span
      style={{
        display: "inline-block",
        padding: small ? "1px 4px" : "2px 8px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 500,
        margin: "1px",
        ...(colorStyles[color] || colorStyles.gray),
      }}
    >
      {value}
    </span>
  );
}

export function MultiTag({ val, small = false }) {
  if (!val) return <span style={{ color: "#999" }}>—</span>;
  return <>{val.split("|").map((v, i) => <Badge key={i} value={v.trim()} small={small} />)}</>;
}

export function TopikBadge({ v, small = false }) {
  if (!v) return null;
  const color = v <= 2 ? "green" : v <= 4 ? "blue" : v <= 6 ? "amber" : "purple";
  return <Badge value={`T${v}`} color={color} small={small} />;
}

export function StatutBadge({ s, small = false }) {
  const colors = { inconnu: "gray", "à apprendre": "amber", reconnu: "blue", utilisable: "purple", maîtrisé: "green" };
  return <Badge value={s || "—"} color={colors[s] || "gray"} small={small} />;
}
