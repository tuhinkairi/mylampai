import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormData{
    id: string|null
    jobTitle: string;
    HiringType: string;
    workplaceType: string;
    skills: string[];
    salaryType: string;
    salaryFigure: string;
    jobDescription: string;
    employmentType: string;
    expectedStartDate: string;
    currentState: 'Pending' | 'Completed'
}

interface JobState {
    id: string | null;
    jobTitle: string;
    HiringType: string;
    workplaceType: string;
    skills: string[];
    salaryType: string;
    salaryFigure: string;
    jobDescription: string;
    employmentType: string;
    expectedStartDate: string;
    currentState:"Pending" | "Completed"
}
const initialState: JobState = {
    id: null,
    jobTitle: '',
    HiringType: '',
    workplaceType: '',
    skills: [],
    salaryType: '',
    salaryFigure: '',
    jobDescription: '',
    employmentType: '',
    expectedStartDate: '',
    currentState:"Pending"
};


const jobReducer = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setIdStore: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        clearIdStore: (state) => {
            state.id = null;
        },
        setFormDataStore: (state, action: PayloadAction<FormData>) => {
            state = action.payload;
        },
        clearFormDataStore: (state) => {
            state = initialState;
        },
    },
});

export const { setIdStore, clearIdStore, setFormDataStore, clearFormDataStore } = jobReducer.actions;

export const selectFormData = (state: { job: JobState }) => state.job;

export default jobReducer;