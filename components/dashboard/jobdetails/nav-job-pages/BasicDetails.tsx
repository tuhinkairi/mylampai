import React, { useState } from "react";

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
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                skills: [...prevFormData.skills, e.currentTarget.value.trim()],
            }));
            e.currentTarget.value = "";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form Data:", formData);
    };

    return (
        <div className="p-2 flex justify-center ">
            <form
                onSubmit={handleSubmit}
                className="w-full border p-2 rounded-lg space-y-6 "
            >
                <label className="block">
                    Job Title/Role:
                    <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className="w-full p-2 mt-1  border  rounded-md"
                    />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                        Hiring Type:
                        <div className="flex gap-4 mt-2">

                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="HiringType"
                                    value="Job"
                                    checked={formData.HiringType === "Job"}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Job
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="HiringType"
                                    value="Internship"
                                    checked={formData.HiringType === "Internship"}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Internship
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="HiringType"
                                    value="Contract"
                                    checked={formData.HiringType === "Contract"}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Contract
                            </label>
                        </div>
                    </label>

                    <label className="block">
                        Employment Type:
                        <select
                            name="employmentType"
                            value={formData.employmentType}
                            onChange={handleChange}
                            className="w-full p-2 mt-1 border rounded-md"
                        >
                            <option value="" disabled>
                                Select Employment Type
                            </option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Part-Time">Part-Time</option>
                        </select>
                    </label>
                </div>

                <label className="block">
                    Skills (Press Enter to Add):
                    <input
                        type="text"
                        onKeyDown={handleSkillChange}
                        className="w-full p-2 mt-1  border  rounded-md"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-700 rounded-md">
                                {skill}
                            </span>
                        ))}
                    </div>
                </label>

                <label className="block">
                    Salary Figure (USD):
                    <input
                        type="number"
                        name="salaryFigure"
                        value={formData.salaryFigure}
                        onChange={handleChange}
                        className="w-full p-2 mt-1  border  rounded-md"
                    />
                </label>

                <label className="block">
                    Job Description:
                    <textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleChange}
                        className="w-full p-2 mt-1  border  rounded-md"
                        rows={4}
                    ></textarea>
                </label>

                <div className="flex justify-between">
                    <button type="button" className="border  px-4 py-2 rounded-md">
                        Save as Draft
                    </button>
                    <button type="submit" className="bg-white text-black px-4 py-2 rounded-md">
                        Publish
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BasicDetails;
