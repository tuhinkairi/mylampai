"use client";

import {  useState } from "react";

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: "",
    internalNote: "",
    requiredSkills: "",
    employmentType: "FULL_TIME",
    workNature: "ONSITE",
    salary: "",
    benefits: "",
    jobCategory: "",
    subDomain: "",
    eligibility: "",
    openings: "",
    recruiterId: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const jobData = {
      ...formData,
      requiredSkills: formData.requiredSkills.split(",").map((skill) => skill.trim()), // Convert to array
      salary: formData.salary ? Number(formData.salary) : undefined,
      openings: formData.openings ? Number(formData.openings) : undefined,
    };

    try {
      const response = await fetch("/api/recruiter/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Job created successfully!");
        setFormData({
          title: "",
          internalNote: "",
          requiredSkills: "",
          employmentType: "FULL_TIME",
          workNature: "ONSITE",
          salary: "",
          benefits: "",
          jobCategory: "",
          subDomain: "",
          eligibility: "",
          openings: "",
          recruiterId: "",
        });
      } else {
        setMessage(result.error || "Failed to create job.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create a Job</h2>
      {message && <p className="mb-4 text-center text-lg font-semibold">{message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" className="w-full p-2 border rounded-md" required />
        
        <textarea name="internalNote" value={formData.internalNote} onChange={handleChange} placeholder="Internal Note" className="w-full p-2 border rounded-md" />

        <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleChange} placeholder="Required Skills (comma-separated)" className="w-full p-2 border rounded-md" required />

        <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full p-2 border rounded-md">
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
        </select>

        <select name="workNature" value={formData.workNature} onChange={handleChange} className="w-full p-2 border rounded-md">
          <option value="ONSITE">Onsite</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
        </select>

        <input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="Salary (Optional)" className="w-full p-2 border rounded-md" />

        <input type="text" name="benefits" value={formData.benefits} onChange={handleChange} placeholder="Benefits (Optional)" className="w-full p-2 border rounded-md" />

        <input type="text" name="jobCategory" value={formData.jobCategory} onChange={handleChange} placeholder="Job Category (Optional)" className="w-full p-2 border rounded-md" />

        <input type="text" name="subDomain" value={formData.subDomain} onChange={handleChange} placeholder="Sub Domain (Optional)" className="w-full p-2 border rounded-md" />

        <input type="text" name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="Eligibility (Optional)" className="w-full p-2 border rounded-md" />

        <input type="number" name="openings" value={formData.openings} onChange={handleChange} placeholder="Openings (Optional)" className="w-full p-2 border rounded-md" />

        <input type="text" name="recruiterId" value={formData.recruiterId} onChange={handleChange} placeholder="Recruiter ID" className="w-full p-2 border rounded-md" required />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700" disabled={loading}>
          {loading ? "Submitting..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}
