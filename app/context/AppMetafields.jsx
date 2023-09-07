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
      case 'UPDATE_METAFIELD_VALUE':
        const { key, value } = action;
        return {
          ...state,
          metafields: {
            ...state.metafields,
            [key]: value,
          },
        };
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
    'activePlan': currentSubscription?.name?.toLowerCase() || 'free',
    /*'onboarding': false,*/
    'metafields': metafields || []
  };


  const [state, dispatch] = useReducer(metafieldReducer, initialState);

  return (
    <MetafieldContext.Provider value={{ state, dispatch }}>
      {children}
    </MetafieldContext.Provider>
  );
};
