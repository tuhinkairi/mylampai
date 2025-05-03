import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormData{
    id: string;
    jobTitle: string;
    HiringType: string;
    workplaceType: string;
    skills: string[];
    salaryType:  "FIXED" | "RANGE" | "INCENTIVE";
    salaryFigure: string;
    showSalary:boolean;
    jobDescription: string;
    expectedStartDate: string;
    currentState: 'PENDING' | 'COMPLETED'
}

export interface JobState {
    id: string ;
    jobTitle: string;
    HiringType: string;
    workplaceType: string;
    skills: string[];
    salaryType: "FIXED" | "RANGE" | "INCENTIVE";
    salaryFigure: string;
    showSalary:boolean;
    jobDescription: string;
    expectedStartDate: string;
    currentState:'PENDING' | 'COMPLETED'
}
const initialState: JobState = {
    id:'',
    jobTitle: '',
    HiringType: '',
    workplaceType: '',
    skills: [],
    salaryType:  "FIXED",
    salaryFigure: '',
    showSalary:false,
    jobDescription: '',
    expectedStartDate: '',
    currentState:"PENDING"
};


const jobReducer = createSlice({
    name: 'job',
    initialState,
    reducers: {
        setIdStore: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        clearIdStore: (state) => {
            state.id = '';
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