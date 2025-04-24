import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CvReviewerState {
  resumeBase64: string | null;
  jobDescriptionFile?: File | null;
  resumeName?: string | null;
  extractedText: string;
  resumeId: string;
  summaryData: any | null;
  structuredData: any | null;
  jobProfile?: string | null;
  jobDescription?: string | null;
  resumeFileText?: string | null;
  resumeUrl?: string | null;
}

const initialState: CvReviewerState = {
  resumeBase64: null,
  jobDescriptionFile: null,
  resumeName: null,
  extractedText: "",
  resumeId: "",
  summaryData: null,
  structuredData: null,
  jobProfile: null,
  jobDescription: null,
  resumeFileText: null,
  resumeUrl: null,
};

const cvReviewerSlice = createSlice({
  name: "cvReviewer",
  initialState,
  reducers: {
    setResumeId: (state, action: PayloadAction<string>) => {
      state.resumeId = action.payload;
    },
    setStructuredData: (state, action: PayloadAction<any>) => {
      state.structuredData = action.payload;
    },
    setSummaryData: (state, action: PayloadAction<any>) => {
      state.summaryData = action.payload;
    },
    setResumeBase64: (state, action: PayloadAction<string>) => {
      state.resumeBase64 = action.payload;
    },
    setJobDescriptionFile: (state, action: PayloadAction<File>) => {
      state.jobDescriptionFile = action.payload;
    },
    setExtractedText: (state, action: PayloadAction<string>) => {
      state.extractedText = action.payload;
    },
    setJobProfile: (state, action: PayloadAction<string | null>) => {
      state.jobProfile = action.payload;
    },
    setJobDescription: (state, action: PayloadAction<string | null>) => {
      state.jobDescription = action.payload;
    },
    setResumeName: (state, action: PayloadAction<string | null>) => {
      state.resumeName = action.payload;
    },
    setResumeFileText: (state, action: PayloadAction<string | null>) => {
      state.resumeFileText = action.payload;
    },
    setResumeFileUrl: (state, action: PayloadAction<string | null>) => {
      state.resumeUrl = action.payload;
    },
    clearState: (state) => {
      state.resumeBase64 = null;
      state.jobDescriptionFile = null;
      state.extractedText = "";
      state.resumeId = "";
      state.summaryData = null;
      state.structuredData = null;
      state.jobProfile = null;
      state.resumeUrl = null;
    },
  },
});

export const {
  setResumeId,
  setStructuredData,
  setSummaryData,
  setResumeBase64,
  setJobDescriptionFile,
  setExtractedText,
  setJobProfile,
  setResumeName,
  setResumeFileUrl,
  setResumeFileText,
  setJobDescription,
} = cvReviewerSlice.actions;

export default cvReviewerSlice.reducer;
