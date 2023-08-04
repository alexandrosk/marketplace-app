import React, { createContext, useContext, useReducer } from 'react';
import {useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import { authenticate } from '~/shopify.server';


const MetafieldContext = createContext(
  { state: {}, dispatch: ({}) => {}} // default value
);

export const useMetafields = () => {
  const context = useContext(MetafieldContext);

  if (!context) {
    throw new Error('useMetafields must be used within a MetafieldProvider');
  }
  return context;
};


export const MetafieldProvider = ({ children, initialAppInstallationId, currentSubscription, metafields}) => {

  const metafieldReducer = (state, action) => {
    switch (action.type) {
      case 'ADD_METAFIELD':
        return {
          ...state,
          [action.resourceId]: [
            ...(state[action.resourceId] || []),
            action.metafield,
          ],
        };
      case 'SET_METAFIELDS':
        return {
          ...state,
          [action.resourceId]: action.metafields,
        };
      case 'UPDATE_METAFIELD_VALUE': {
        const newState = { ...state };

        // Find the metafield with the specified key
        const metafield = newState.metafields.find((m) => m.key === action.key);
        if (metafield) {
          // Parse the existing value as JSON
          const valueObj = JSON.parse(metafield.value);

          // Update the specified property with the new value
          valueObj[action.property] = action.value;

          // Convert the value back to a JSON string and update the metafield
          metafield.value = JSON.stringify(valueObj);
        }

        return newState;
      }
      case 'UPDATE_METAFIELD':
        return {
          ...state,
          [action.resourceId]: (state[action.resourceId] || []).map((metafield) =>
            metafield.id === action.metafield.id ? action.metafield : metafield
          ),
        };
      case 'REMOVE_METAFIELD':
        return {
          ...state,
          [action.resourceId]: (state[action.resourceId] || []).filter(
            (metafield) => metafield.id !== action.metafield.id
          ),
        };
      default:
        return state;
    }
  };

  const initialState = {
    'appId': initialAppInstallationId,
    'activePlan': currentSubscription.name,
    'onboarding': false,
    'metafields': metafields,
  };


  const [state, dispatch] = useReducer(metafieldReducer, initialState);

  return (
    <MetafieldContext.Provider value={{ state, dispatch }}>
      {children}
    </MetafieldContext.Provider>
  );
};
