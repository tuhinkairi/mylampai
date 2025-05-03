import { JobProfile } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface JobProfilesState {
  list: JobProfile[];
}

const initialState: JobProfilesState = {
  list: [],
};

const joblistSlice = createSlice({
  name: "jobliststate",
  initialState,
  reducers: {
    addJobProfile: (state, action: PayloadAction<JobProfile>) => {
      state.list.push(action.payload);
    },
    updateJobProfile: (state, action: PayloadAction<JobProfile>) => {
      const index = state.list.findIndex(job => job.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    removeJobProfile: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(job => job.id !== action.payload);
    },
    setJobProfiles: (state, action: PayloadAction<JobProfile[]>) => {
      state.list = action.payload;
    },
    resetJobProfiles: (state) => {
      state.list = [];
    },
  },
});

export const {
  addJobProfile,
  updateJobProfile,
  removeJobProfile,
  setJobProfiles,
  resetJobProfiles,
} = joblistSlice.actions;

export default joblistSlice;
