import { useMemo, useState } from "react";
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-2">
                <button
                  className="rounded bg-blue-700 px-3 py-1.5 text-white"
                  onClick={addPlanRow}
                >
                  Add Pizza Row
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
} // end of PlannerScreen()

function AppInner() {
  return <PlannerScreen />;
} // end of AppInner()

export default function App() {
  return (
    <AppStateProvider>
      <AppInner />
    </AppStateProvider>
  );
} // end of App()
