import { useMemo, useState } from "react";
                ...draft,
                postBakeToppingLines: removeLineArray(draft.postBakeToppingLines, index),
        }

      <section className="rounded-2xl bg-white p-4 shadow md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Post-bake Seasonings</h3>
          <button
            type="button"
            className="rounded bg-slate-700 px-2 py-1 text-white"
            onClick={() =>
              setDraft({
                ...draft,
                postBakeSeasoningLines: [...draft.postBakeSeasoningLines, createEmptyEditableLine(data)],
              })
            }
          >
            Add Post-bake Seasoning
          </button>
        </div>

        {draft.postBakeSeasoningLines.map((line, index) => (
          <RecipeLineEditor
            key={line.id}
            data={data}
            title={`Post-bake Seasoning ${index + 1}`}
            category="seasonings"
            line={line}
            onChange={(nextLine) =>
              setDraft({
                ...draft,
                postBakeSeasoningLines: updateLineArray(draft.postBakeSeasoningLines, index, nextLine),
              })
            }
            onRemove={() =>
              setDraft({
                ...draft,
                postBakeSeasoningLines: removeLineArray(draft.postBakeSeasoningLines, index),
              })
            }
          />
        ))}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow md:p-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AmountGrid
          data={data}
          rows={draft.servingsBySize}
          onChange={(rows) => setDraft({ ...draft, servingsBySize: rows })}
          label="Servings by size"
        />

        <AmountGrid
          data={data}
          rows={draft.doughWeightBySize}
          onChange={(rows) => setDraft({ ...draft, doughWeightBySize: rows })}
          label="Dough weight by size"
        />
      </section>
    </div>
  );
} // end of PizzaEditor()
