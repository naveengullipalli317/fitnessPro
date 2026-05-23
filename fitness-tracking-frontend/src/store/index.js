// Placeholder for state management (Redux/Zustand/etc.)
// For this MVP, we're using React Context and custom hooks instead
// This file is kept for future extensibility when state management becomes complex

export const initialState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false
  },
  workouts: [],
  exercises: [],
  goals: [],
  routines: []
};

// Action types (for future Redux implementation)
export const actionTypes = {
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  SET_WORKOUTS: 'SET_WORKOUTS',
  SET_EXERCISES: 'SET_EXERCISES',
  SET_GOALS: 'SET_GOALS',
  SET_ROUTINES: 'SET_ROUTINES'
};

// Reducer (for future Redux implementation)
export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
          isAuthenticated: !!action.payload
        }
      };
    case actionTypes.SET_TOKEN:
      return {
        ...state,
        auth: {
          ...state.auth,
          token: action.payload
        }
      };
    case actionTypes.SET_WORKOUTS:
      return {
        ...state,
        workouts: action.payload
      };
    case actionTypes.SET_EXERCISES:
      return {
        ...state,
        exercises: action.payload
      };
    case actionTypes.SET_GOALS:
      return {
        ...state,
        goals: action.payload
      };
    case actionTypes.SET_ROUTINES:
      return {
        ...state,
        routines: action.payload
      };
    default:
      return state;
  }
};

export default { initialState, actionTypes, reducer };