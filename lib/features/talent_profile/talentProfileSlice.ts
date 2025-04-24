import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ExperiencesData = {
  id: string;
  company: string;
  position: string;
  location: string;
  skills: string[];
  startDate: string;
  endDate?: string;
  description?: string;
};

type EducationData = {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  grade?: string;
  skills: string[];
  startDate: string;
  endDate?: string;
  description?: string;
};

type LanguageData = {
  id: string;
  language: string;
  proficiency: string;
};

type ProjectDataType = {
  id: string;
  title: string;
  description: string;
  role?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  skills: string[];
};

interface ProfileState {
  id: string | null;
  resumeUrl: string | null;
  title: string | null;
  bio: string | null;
  rate: string | null;
  skills: string[];
  profiles: string[];
  hours: string | null;
  experiences: ExperiencesData[];
  educations: EducationData[];
  languages: LanguageData[];
  projects: ProjectDataType[];
}

const initialState: ProfileState = {
  id: null,
  resumeUrl: null,
  title: null,
  bio: null,
  rate: null,
  skills: [],
  profiles: [],
  hours: null,
  experiences: [],
  educations: [],
  languages: [],
  projects: [],
};

const talentProfileSlice = createSlice({
  name: "talentProfile",
  initialState,
  reducers: {
    setId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    setResumeUrl: (state, action: PayloadAction<string>) => {
      state.resumeUrl = action.payload;
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setBio: (state, action: PayloadAction<string>) => {
      state.bio = action.payload;
    },
    setRate: (state, action: PayloadAction<string>) => {
      state.rate = action.payload;
    },
    setSkills: (state, action: PayloadAction<string[]>) => {
      state.skills = action.payload;
    },
    setProfiles: (state, action: PayloadAction<string[]>) => {
      state.profiles = action.payload;
    },
    setHours: (state, action: PayloadAction<string>) => {
      state.hours = action.payload;
    },
    setExperiences: (state, action: PayloadAction<ExperiencesData[]>) => {
      state.experiences = action.payload;
    },
    setEducations: (state, action: PayloadAction<EducationData[]>) => {
      state.educations = action.payload;
    },

    addEducation: (state, action: PayloadAction<EducationData>) => {
      state.educations.push(action.payload);
    },
    updateEducation: (state, action: PayloadAction<EducationData>) => {
      const index = state.educations.findIndex(
        (edu) => edu.id === action.payload.id
      );
      if (index !== -1) {
        state.educations[index] = {
          ...state.educations[index],
          ...action.payload,
        };
      }
    },
    deleteEducation: (state, action: PayloadAction<EducationData["id"]>) => {
      state.educations = state.educations.filter(
        (edu) => edu.id !== action.payload
      );
    },

    addExperience: (state, action: PayloadAction<ExperiencesData>) => {
      state.experiences.push(action.payload);
    },
    updateExperience: (state, action: PayloadAction<ExperiencesData>) => {
      const index = state.experiences.findIndex(
        (exp) => exp.id === action.payload.id
      );
      if (index !== -1) {
        state.experiences[index] = {
          ...state.experiences[index],
          ...action.payload,
        };
      }
    },
    deleteExperience: (state, action: PayloadAction<ExperiencesData["id"]>) => {
      state.experiences = state.experiences.filter(
        (exp) => exp.id !== action.payload
      );
    },

    setLanguages: (state, action: PayloadAction<LanguageData[]>) => {
      state.languages = action.payload;
    },
    setProjects: (state, action: PayloadAction<ProjectDataType[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectDataType>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<ProjectDataType>) => {
      const index = state.projects.findIndex(
        (proj) => proj.id === action.payload.id
      );
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
      }
    },
    deleteProject: (state, action: PayloadAction<ProjectDataType["id"]>) => {
      state.projects = state.projects.filter(
        (proj) => proj.id !== action.payload
      );
    },

    clearProfile: () => initialState,
  },
});

export const {
  setId,
  setResumeUrl,
  setTitle,
  setBio,
  setRate,
  setSkills,
  setProfiles,
  setHours,
  setExperiences,
  setEducations,
  setLanguages,
  updateEducation,
  addEducation,
  deleteEducation,
  addExperience,
  deleteExperience,
  updateExperience,
  addProject,
  updateProject,
  deleteProject,
  setProjects,
  clearProfile,
} = talentProfileSlice.actions;

export default talentProfileSlice.reducer;
