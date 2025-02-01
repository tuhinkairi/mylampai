import React, { useState, useEffect } from "react";
import PastResumeViewer from "./pastResumes";

type Resume = {
  id: string;
  resume: string;
  analysis: any;
  createdAt: string;
};

const ResumePage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/interviewer/get_all_cv", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch resumes");
        }

        const data = await response.json();
        setResumes(data.cvs || []);
        setSelectedResume(data.cvs[0] || null);
      } catch (error: any) {
        console.error("Error fetching resumes:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);

  return (
    <div className="flex h-screen justify-between items-stretch gap-4 px-4">
      <div className="w-1/4 bg-gray-100 rounded-lg shadow-md p-4 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Previous Resumes</h3>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : resumes.length === 0 ? (
          <p>No resumes found.</p>
        ) : (
          resumes.map((resume, index) => (
            <div
              key={resume.id}
              className={`p-2 mb-2 rounded cursor-pointer ${
                selectedResume?.id === resume.id
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
              onClick={() => setSelectedResume(resume)}
            >
              <h4 className="font-medium">Resume {index + 1}</h4>
              <p className="text-sm text-gray-500">
                Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {selectedResume ? (
        <PastResumeViewer
          resume={selectedResume.resume}
          analysis={selectedResume.analysis}
          createdAt={selectedResume.createdAt}
        />
      ) : (
        <div className="flex-grow flex justify-center items-center">
          <p>No resume selected</p>
        </div>
      )}
    </div>
  );
};

export default ResumePage;
