import { useState } from "react";

const MANUAL_TEXT = `Pizza Matrix Instruction Manual
Version 1.1.2

1. Overview

Pizza Matrix is a browser-based pizza planning and prep tool. It lets you:
- define pizzas and their ingredients
- define reusable libraries for sauces, cheeses, toppings, seasonings, doughs, sizes, units, and locations
- plan pizza parties
- estimate serving coverage
- generate print-friendly prep output
- save parties to history
- reload past parties into the planner
- export and import full JSON backups

Data is currently stored in browser local storage unless restored from a backup file.

2. Main Screens

Planner
Use this screen to build the active pizza party.

Pizza Setup
Use this screen to create and edit pizza definitions.

Library Setup
Use this screen to manage ingredient libraries, doughs, sizes, units, locations, backups, and release notes.

Pizza Menu
Shows all defined pizzas with descriptions.

History
Shows previously saved parties and lets you load one back into the planner.

Print Friendly View
Shows a printable version of the current plan and prep output.

3. Planner Screen

The Planner is the working screen for an event.

Fields:
- Date
- Diners
- Guest Names
- Pizza rows
- Notes per row

Per row:
- Qty
- Pizza
- Size
- Sauce summary
- Cheese summary
- Toppings summary
- Seasonings summary
- Post-bake summary
- Row notes
- Remove button

Buttons:
- Save Party
- New Party
- Show/Hide Descriptions
- Add Pizza Row
- Print Friendly View

How quantity entry works:
- Numeric text is accepted
- The program extracts an integer from the entered value
- Blank or invalid input becomes 1
- 0 becomes 1

Examples:
- 3 -> 3
- to4 -> 4
- aa -> 1
- blank -> 1

Planner coverage:
- Planned servings are compared against diner count
- Pizza-specific servings override size defaults
- If no pizza-specific servings are entered, size defaults are used

New Party:
- Clears the active planner after confirmation
- Recommended when starting a fresh event
- Changing the date alone does not erase the current party

Save Party:
- Saves the current party into History
- Stores date, diners, guest names, and pizzas served

4. Pizza Setup

Pizza Setup is where each pizza definition is built.

General fields:
- Pizza name
- Description
- Dough type
- Notes

Supported pizza structure:
- 0 or 1 sauce
- 1 primary cheese
- 0 or more secondary cheeses
- 0 or more toppings
- 0 or more seasonings
- 0 or more post-bake cheeses
- 0 or more post-bake toppings
- 0 or more post-bake seasonings

For each line you can define:
- item
- pizza-specific mise en place
- notes
- amounts by size
- unit by size
- direct checkbox

Servings by size:
- Optional pizza-specific override
- If blank, the size default servings are used

Dough weight by size:
- Optional pizza-specific override
- If blank, the size default dough weight is used

Pizza actions:
- New Pizza
- Load existing pizza
- Duplicate
- Save Pizza
- Delete

5. Library Setup

Library Setup manages reusable reference data.

Available library tabs:
- Sauces
- Cheeses
- Toppings
- Seasonings
- Doughs
- Sizes
- Locations
- Units

Ingredient libraries:
Each ingredient can store:
- name
- default location
- default unit
- default mise en place
- notes

Dough library:
Each dough can store:
- name
- default location
- default mise en place
- notes

Sizes:
Each size can store:
- name
- shape
- dimensions
- calculated area
- default servings
- default dough weight

Locations:
Examples:
- Freezer
- Refrigerator
- Pantry
- Purchase

Units:
Examples:
- g
- oz
- fl oz
- each
- inches
- to taste

Deletion protection:
- Ingredients used by pizzas cannot be removed
- Doughs used by pizzas cannot be removed

6. Pizza Menu

Pizza Menu displays all defined pizzas and their descriptions.
Use it as a quick reference menu of available options.

7. History

History stores saved pizza parties.

Each record can show:
- date
- diners
- guest names
- pizzas served
- sizes
- quantities

History actions:
- Load into Planner

Load into Planner:
- Replaces the active planner after confirmation
- Attempts to reconnect pizzas and sizes by name
- Restores date, diners, guest names, and planned rows

8. Print Friendly View

Print Friendly View is intended for execution and printing.

It includes:
- pizza plan
- ingredient pull list
- mise en place list

Important behavior:
- Blank planner rows are hidden
- Dough prep lines are grouped by dough type
- Dough lines appear at the top of the mise en place list
- If pizza-specific dough weight is blank, the size default dough weight is used
- If pizza-specific servings are blank, the size default servings are used

9. Backup and Restore

Backup tools are available on Library Setup.

Export Full Backup:
- Saves the full app dataset as JSON

Import Full Backup:
- Replaces current data with the selected backup
- Newer versions try to normalize older backups into the current schema

Recommended practice:
- Export before major edits
- Keep dated backups
- Export before merging new versions
- Test important changes on a backup copy

10. Version Display

The current app version is shown near the title on the main screen.

11. Release Notes

Release Notes can be displayed from the Library Setup screen.

12. Recommended Workflow

Initial setup:
1. Define units
2. Define locations
3. Define sizes
4. Define doughs
5. Define ingredients
6. Define pizzas

Planning an event:
1. Open Planner
2. Enter date
3. Enter diners
4. Enter guest names
5. Add pizza rows
6. Select pizza and size
7. Adjust quantities
8. Review coverage
9. Save Party
10. Open Print Friendly View
11. Print prep sheets if needed

Starting another event:
1. Save Party if you want it in history
2. Click New Party
3. Confirm clear
4. Enter the new event details

Reusing an old event:
1. Open History
2. Find the saved party
3. Click Load into Planner
4. Confirm replacement

13. Known Limitations

Current limitations:
- History reconnects planner rows by pizza name and size name
- Renaming pizzas or sizes after saving history can reduce match accuracy
- Setup notes are not yet fully surfaced across all non-setup screens
- Cloud sync is not yet implemented
- CSV import/export is not yet fully implemented for all entities
- PWA support is still under active build/deploy refinement

14. Current Version Summary

Version 1.1.2 includes:
- planner
- pizza setup
- library setup
- dough library
- sizes with default servings and default dough weight
- pizza menu
- party history
- guest names
- new party clearing
- print-friendly output
- release notes access
- backup and restore`;

export function InstructionManual() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="rounded bg-slate-700 px-3 py-2 text-white"
        onClick={() => setOpen(true)}
      >
        Instruction Manual
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              width: "700px",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>Instruction Manual</h2>
              <button
                className="rounded bg-red-600 px-2 py-1 text-white"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              {MANUAL_TEXT}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
