let programLinesStore: any[] = [];

export const setProgramLines = (lines: any[]) => {
  programLinesStore = lines;
};

export const getProgramLines = () => programLinesStore;
export const clearProgramLines = () => {
  programLinesStore = [];
};