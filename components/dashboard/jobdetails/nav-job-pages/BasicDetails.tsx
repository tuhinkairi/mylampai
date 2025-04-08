import { CalendarIcon, X } from "lucide-react";
import React, { useState } from "react";
import { RiEjectFill } from "react-icons/ri";

type FormData = {
    jobTitle: string;
    HiringType: string;
    workplaceType: string;
    jobLocation: string;
    skills: string[];
    salaryType: string;
    salaryFigure: string;
    jobDescription: string;
    employmentType: string;
    expectedStartDate: string;
};

const BasicDetails = () => {
    const [formData, setFormData] = useState<FormData>({
        jobTitle: "",
        HiringType: "",
        workplaceType: "",
        jobLocation: "",
        skills: [],
        salaryType: "",
        salaryFigure: "",
        jobDescription: "",
        employmentType: "",
        expectedStartDate: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
            const newSkill = e.currentTarget.value.trim();
            setFormData((prev) => ({
                ...prev,
                skills: [...prev.skills, newSkill],
            }));
            e.currentTarget.value = "";
        }
    };

    const handleStartDateSelection = (option: string) => {
        setFormData((prev) => ({ ...prev, expectedStartDate: option }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
    };

    return (
        <div className="p-2 flex justify-center text-sm min-w-full">
            <form 
                onSubmit={handleSubmit}
                className="w-full border p-2 rounded-lg space-y-6"
            >
                <section className="_part1 grid gap-4  border rounded-lg px-4 py-3">
                    <label className="block">
                        Job Title/Role:
                        <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded-md focus:outline-primary"
                        />
                    </label>

                    {/* Column 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Hiring Type */}
                        <label className="block">
                            Hiring Type:
                            <div className="flex gap-4 mt-2">
                                {["Job", "Internship", "Contract"].map((type) => (
                                    <label key={type} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="HiringType"
                                            value={type}
                                            checked={formData.HiringType === type}
                                            onChange={handleChange}
                                            className="mr-2 accent-primary checked:border-primary"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </label>

                        {/* Employment Type */}
                        <label className="block">
                            Employment Type:
                            <select
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border rounded-md focus:outline-primary"
                            >
                                <option value="" disabled>
                                    Select Employment Type
                                </option>
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                            </select>
                        </label>

                        {/* Workplace Type */}
                        <label className="block">
                            Workplace Type:
                            <select
                                name="workplaceType"
                                value={formData.workplaceType}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border rounded-md focus:outline-primary"
                            >
                                <option value="" disabled>
                                    Select Workplace
                                </option>
                                <option value="In Office">In Office</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </label>
                    </div>

                    {/* Skills */}
                    <label className="block">
                        Skills Required:
                        <input
                            type="text"
                            onKeyDown={handleSkillChange}
                            className="w-full p-2 mt-1 border rounded-md focus:outline-primary"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 border rounded-md border-primary flex items-center gap-3">
                                    {skill} <button><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                    </label>

                    {/* Expected Start Date */}
                    <div className="rounded-lg">
                        <p className="text-sm mb-2">Expected Start Date*</p>
                        <div className="flex gap-4">
                            {["Less than 7 days", "7-15 days", "After 15+ days"].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleStartDateSelection(option)}
                                    className={`focus:outline-primary flex items-center px-4 py-2 border rounded-lg transition ${formData.expectedStartDate === option
                                        ? "bg-primary text-white"
                                        : "bg-inherit"
                                        }`}
                                >
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {option}
                                </button>
                            ))}
                            <div className="ml-auto">
                                <p className="text-xs text-gray-400 mb-1">Or Enter manually</p>
                                <input
                                    type="text"
                                    name="expectedStartDate"
                                    value={formData.expectedStartDate}
                                    onChange={handleChange}
                                    placeholder="in new season......."
                                    className="px-4 py-2 border rounded-lg bg-transparent  focus:outline-none focus:outline-primary"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Salary */}
                {/* <label className="block">
                    Salary Figure (USD):
                    <input
                        type="number"
                        name="salaryFigure"
                        value={formData.salaryFigure}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border rounded-md"
                    />
                </label> */}

                {/* Job Description */}
                {/* <label className="block">
                    Job Description:
                    <textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleChange}
                        className="w-full p-2 mt-1 border rounded-md"
                        rows={4}
                    ></textarea>
                </label> */}

                {/* Action Buttons */}
                <div className="flex justify-between">
                    <button type="button" className="border bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-md">
                        Save as Draft
                    </button>
                    <button type="submit" className=" px-4 py-2 rounded-md border bg-primary text-white hover:bg-primary-dark">
                        Publish
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BasicDetails;
