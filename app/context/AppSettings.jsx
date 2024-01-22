import React, { createContext, useContext, useReducer } from "react";

const SettingsContext = createContext(
  { state: {}, dispatch: ({}) => {} }, // default value
);

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingProvider = ({
  children,
  initialAppInstallationId,
  settings,
}) => {
  const SettingReducer = (state, action) => {
    switch (action.type) {
      case "ADD_SETTING":
        return {
          ...state,
          [action.resourceId]: [
            ...(state[action.resourceId] || []),
            action.setting,
          ],
        };
      case "SET_SETTING":
        return {
          ...state,
          settings: {
            ...state.settings,
            [action.resourceId]: action.value,
          },
        };
      default:
        return state;
    }
  };

  const initialState = {
    appId: initialAppInstallationId,
    activePlan: "free",
    settings: settings || {},
  };

  const [state, dispatch] = useReducer(SettingReducer, initialState);

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};
