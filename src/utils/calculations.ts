import {
    });
  });

  return rows.sort((a, b) => {
    if (a.pizzaName !== b.pizzaName) return a.pizzaName.localeCompare(b.pizzaName);
    return a.task.localeCompare(b.task);
  });
}

export function summarizePlanRow(
  data: AppData,
  row: PizzaPlanRow,
): {
  pizzaName: string;
  sizeName: string;
  sauce: string;
  cheese: string;
  toppings: string;
  seasonings: string;
  postBake: string;
  servings: number;
} {
  const pizza = data.pizzas.find((p) => p.id === row.pizzaId);
  const size = data.sizes.find((s) => s.id === row.sizeId);

  if (!pizza || !size) {
    return {
      pizzaName: "",
      sizeName: "",
      sauce: "",
      cheese: "",
      toppings: "",
      seasonings: "",
      postBake: "",
      servings: 0,
    };
  }

  const getName = (category: LibraryCategory, itemId?: string): string => {
    if (!itemId) return "";
    return getLibraryCollection(data, category).find((item) => item.id === itemId)?.name ?? "";
  };

  const toppings = pizza.toppingLines
    .map((line) => getName("toppings", line.itemId))
    .filter(Boolean)
    .join(", ");

  const seasonings = pizza.seasoningLines
    .map((line) => getName("seasonings", line.itemId))
    .filter(Boolean)
    .join(", ");

  const cheese = [
    getName("cheeses", pizza.primaryCheeseLine.itemId),
    ...pizza.secondaryCheeseLines.map((line) => getName("cheeses", line.itemId)),
  ]
    .filter(Boolean)
    .join(", ");

  const postBake = [
    ...pizza.postBakeCheeseLines.map((line) => getName("cheeses", line.itemId)),
    ...pizza.postBakeToppingLines.map((line) => getName("toppings", line.itemId)),
    ...pizza.postBakeSeasoningLines.map((line) => getName("seasonings", line.itemId)),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    pizzaName: pizza.name,
    sizeName: size.name,
    sauce: pizza.sauceLine ? getName("sauces", pizza.sauceLine.itemId) : "",
    cheese,
    toppings,
    seasonings,
    postBake,
    servings: resolveServingsForSize(pizza, size.id, data.sizes) * row.quantity,
  };
}
