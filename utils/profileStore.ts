import { create } from "zustand";
import { persist } from "zustand/middleware";

type ExperiencesData = {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
};

type EducationData = {
  school: string;
  degree: string;
  field?: string;
  grade?:string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
};

type LanguageData = {
  language: string;
  proficiency: string;
};

interface TalentProfile {
  id: string | null;
  resumeUrl: string | null;
  title: string | null;
  description: string | null;
  rate: string | null;
  skills: string[];
  profiles: string[];
  hours: string | null;
  experiences: ExperiencesData[];
  educations: EducationData[];
  languages: LanguageData[];
  setId: (id: string) => void;
  setResumeUrl: (resumeUrl: string) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setRate: (rate: string) => void;
  setSkills: (skills: string[]) => void;
  setProfiles: (profiles: string[]) => void;
  setHours: (hours: string) => void;
  setExperiences: (experiences: ExperiencesData[]) => void;
  setEducations: (educations: EducationData[]) => void;
  setLanguages: (languages: LanguageData[]) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<TalentProfile>()(
  persist(
    (set) => ({
      id: null,
      resumeUrl: null,
      title: null,
      description: null,
      rate: null,
      skills: [],
      profiles: [],
      hours: null,
      experiences: [],
      educations: [],
      languages: [],
      setId: (id: string) => set({ id }),
      setResumeUrl: (resumeUrl: string) => set({ resumeUrl }),
      setTitle: (title: string) => set({ title }),
      setDescription: (description: string) => set({ description }),
      setRate: (rate: string) => set({ rate }),
      setSkills: (skills: string[]) => set({ skills }),
      setProfiles: (profiles: string[]) => set({ profiles }),
      setHours: (hours: string) => set({ hours }),
      setExperiences: (experiences: ExperiencesData[]) => set({ experiences }),
      setEducations: (educations: EducationData[]) => set({ educations }),
      setLanguages: (languages: LanguageData[]) => set({ languages }),
      clearProfile: () =>
        set({
          id: null,
          resumeUrl: null,
          title: null,
          description: null,
          rate: null,
          skills: [],
          profiles: [],
          hours: null,
          experiences: [],
          educations: [],
          languages: [],
        }),
    }),
    {
      name: "profile-storage",
    }
  )
);
