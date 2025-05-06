import { createSlice, PayloadAction } from "@reduxjs/toolkit";


type RubricsType={
  parameter:string,
  description:string,
  weightage:number
}

type TalentPoolProfileDataType = {
  id: string;
  resumeId: string;
  resumeUrl?: string;
  resumeFileText?: string;
  role: string;
  targetFor: string;
  skills: string[];
  availability: "FULL_TIME" | "PART_TIME" | "FREELANCE" | null;
  locationPref: "Onsite" | "Remote" | "Hybrid" | null;
  interviewDate?: string;
  interviewState?: "pending" | "completed" | "cancelled";
  interviewId: string;
  rubrics:RubricsType[]
};

interface CareerProfilesState {
  talentPoolProfiles: TalentPoolProfileDataType[];
}

const initialState: CareerProfilesState = {
  talentPoolProfiles: [],
};

const talentPoolProfileSlice = createSlice({
  name: "talentPoolProfile",
  initialState,
  reducers: {
    setCareerProfiles: (
      state,
      action: PayloadAction<TalentPoolProfileDataType[]>
    ) => {
      state.talentPoolProfiles = action.payload;
    },
    addCareerProfile: (
      state,
      action: PayloadAction<TalentPoolProfileDataType>
    ) => {
      state.talentPoolProfiles.push(action.payload);
    },
    removeCareerProfile: (state, action: PayloadAction<string>) => {
      state.talentPoolProfiles = state.talentPoolProfiles.filter(
        (profile) => profile.id !== action.payload
      );
    },
  },
});

export const { setCareerProfiles, addCareerProfile } =
  talentPoolProfileSlice.actions;
export default talentPoolProfileSlice.reducer;
