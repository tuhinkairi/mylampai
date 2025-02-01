import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useInterviewStore = create(
  persist(
    (set) => ({
      resumeFile: null,
      jobDescriptionFile: null,
      extractedText: '',
      resumeId:'',
      summaryData:null,
      structuredData: null,
      setResumeId:(data)=>set({resumeId:data}),
      setStructuredData: (data) => set({ structuredData: data }),
      setSummaryData: (data) => set({ summaryData: data }),
      setResumeFile: (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64File = reader.result;
          set({ resumeFile: base64File });
        };
        reader.readAsDataURL(file); // Convert the file to a base64 string
      },
      setJobDescriptionFile: (file) => set({ jobDescriptionFile: file }),
      setExtractedText: (text) => set({ extractedText: text }),
    }),
    {
      name: "interview-storage", // unique name for the storage (localStorage key)
      getStorage: () => localStorage, // default localStorage
    }
  )
);
