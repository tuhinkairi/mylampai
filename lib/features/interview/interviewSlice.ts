import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AnalysisDataState {
  interviewId: string;
  Introduction: any;
  Project: any;
  Coding: any;
  Technical: any;
  Outro: any;
}

interface interviewData {
  analysisData: AnalysisDataState;
  interviewVideoUrl: string;
}

const initialState: interviewData = {
  interviewVideoUrl: "",
  analysisData: {
    interviewId: "",
    Introduction: null,
    Project: null,
    Coding: null,
    Technical: null,
    Outro: null,
  },
};

const interviewDataSlice = createSlice({
  name: "interviewData",
  initialState,
  reducers: {
    setAnalysisData: (state, action: PayloadAction<AnalysisDataState>) => {
      state.analysisData = action.payload;
    },
    setInterviewVideoUrl: (state, action: PayloadAction<string>) => {
      state.interviewVideoUrl = action.payload;
    },
  },
});

export const { setAnalysisData, setInterviewVideoUrl } =
  interviewDataSlice.actions;
export default interviewDataSlice.reducer;
