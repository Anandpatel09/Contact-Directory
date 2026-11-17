import { createSlice, PayloadAction } from '@reduxjs/toolkit';

//type
type ThemePreference = 'light' | 'dark';
type DisplayPreference = 'list' | 'cards';

//type 
type SettingsState = {
  theme: ThemePreference;
  displayMode: DisplayPreference;
};

const initialState: SettingsState = {
  theme: 'light',
  displayMode: 'list',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,

  reducers: {
    // Change light/dark theme
    setTheme: (state, action: PayloadAction<ThemePreference>) => {
      state.theme = action.payload;
    },

    // Switch between light and dark
    toggleTheme: state => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Change list/cards display
    setDisplayMode: (state, action: PayloadAction<DisplayPreference>) => {
      state.displayMode = action.payload;
    },

    // Switch between list and cards
    toggleDisplayMode: state => {
      state.displayMode = state.displayMode === 'list' ? 'cards' : 'list';
    },

     // Restore saved settings from AsyncStorage
    hydrateSettings: (
      state,
      action: PayloadAction<SettingsState>,
    ) => {
      state.theme = action.payload.theme;
      state.displayMode = action.payload.displayMode;
    },
  },
});

export const { setTheme, toggleTheme, setDisplayMode, toggleDisplayMode,hydrateSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
