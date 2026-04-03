import { AppData } from "../types";

export function PizzaMenu({ data }: { data: AppData }) {
  return (
    <div style={{ padding: 16 }}>
      <h2>Pizza Menu</h2>

      {data.pizzas.map((pizza) => (
        <div
          key={pizza.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700 }}>{pizza.name}</div>

          {pizza.description && (
            <div style={{ fontStyle: "italic" }}>
              {pizza.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
