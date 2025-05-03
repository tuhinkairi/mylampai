import { updateJobDetails } from "@/actions/createJobActions";
import Loading from "@/app/(protected)/(recruiter)/dashboard/loading";
import {
    selectFormData,
    setFormDataStore,
    setIdStore,
} from "@/lib/features/jobSlice/jobSlice";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { JobProfile } from "@prisma/client";
import { CalendarIcon, ImageIcon, X } from "lucide-react";
import React, {
    useCallback,
    useEffect,
    useState,
    FormEvent,
    ChangeEvent,
    KeyboardEvent,
} from "react";
import { TextCenter, TextLeft, TextRight } from "react-bootstrap-icons";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export type FormData = {
    id: string;
    jobTitle: string;
    HiringType: string;
    workplaceType: string;
    skills: string[];
    salaryType: "FIXED" | "RANGE" | "INCENTIVE";
    salaryFigure: string;
    showSalary: boolean;
    jobDescription: string;
    expectedStartDate: string;
    currentState: 'PENDING' | 'COMPLETED';
};

const BasicDetails = ({ job_data }: { job_data: JobProfile }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const Data = useAppSelector((state) => state.job);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<FormData>({
        id: Data.id || job_data?.id || "",
        jobTitle: Data.jobTitle || job_data?.jobTitle || "",
        HiringType:
            Data.HiringType ||
            job_data?.availability?.toLowerCase().replace("_", " ") ||
            "",
        workplaceType: Data.workplaceType || job_data?.location || "",
        skills: Data.skills.length ? Data.skills : job_data?.skills || [],
        salaryType: (Data.salaryType as "FIXED" | "RANGE" | "INCENTIVE") || (job_data?.salaryType as "FIXED" | "RANGE" | "INCENTIVE") || "",
        salaryFigure: Data.salaryFigure || job_data?.salary || "",
        showSalary: job_data?.showSalary ,
        jobDescription: Data.jobDescription || job_data?.jobDescription || "",
        expectedStartDate: Data.expectedStartDate || job_data.startWithIn || "",
        currentState: Data.currentState || job_data.status,
    });

    useEffect(() => {
        if (job_data?.id) dispatch(setIdStore(job_data.id));
        
    }, [dispatch, job_data?.id]);

    const handleChange = useCallback(
        (
            e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
        ) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        },
        []
    );

    const handleSkillChange = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
            e.preventDefault();
            const newSkill = e.currentTarget.value.trim();
            setFormData((prev) => ({
                ...prev,
                skills: [...prev.skills, newSkill],
            }));
            e.currentTarget.value = "";
        }
    }, []);

    const handelRemoveSkill = useCallback((indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((_, index) => index !== indexToRemove),
        }));
    }, []);

    const handleStartDateSelection = useCallback((option: string) => {
        setFormData((prev) => ({
            ...prev,
            expectedStartDate: option,
        }));
    }, []);

    const handelSalaryShow = useCallback((e: boolean) => {
        setFormData((prev) => ({
            ...prev, showSalary: !e
        }))
    }, [])

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            const updatedData: FormData = { ...formData, currentState: "COMPLETED" };
            // console.log(updatedData)
            dispatch(setFormDataStore(updatedData));
            setLoading(true)
            const data = await updateJobDetails(formData.id, updatedData)
            console.log(data)
            if (data) {
                setLoading(false)
                toast.success("Job details published successfully!");
            } else {
                setLoading(false)
                toast.error("Job details published faild!")
            }
        },
        [dispatch, formData]
    );

    const handelDraft = useCallback(() => {
        const updatedData: FormData = { ...formData, currentState: "PENDING" };
        toast.success("Job details saved as draft successfully!");
        dispatch(setFormDataStore(updatedData));
    }, [dispatch, formData]);

    // handel update

    // admin dashboard
    // empty state
    return (
        <>
        {loading && <Loading/>}
        {!loading && <div className="p-2 flex justify-center text-sm min-w-full">
            <form
                onSubmit={(e) => e.preventDefault()}

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
                            required
                            className="w-full p-2 mt-1 border rounded-md focus:outline-primary"
                        />
                    </label>

                    {/* Column 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Hiring Type */}
                        <label className="block">
                            Hiring Type:
                            <div className="flex gap-4 mt-2">
                                {["Full Time", "Part Time", "Intern", "Contract"].map((type) => (
                                    <label key={type} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="HiringType"
                                            value={type.toLowerCase()}
                                            checked={formData.HiringType == type.toLowerCase()}
                                            onChange={handleChange}
                                            required
                                            className="mr-2 accent-primary checked:border-primary"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </label>

                        {/* Employment Type */}
                        {/* <label className="block">
                            Employment Type:
                            <select
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                                required
                                className="w-full p-2 mt-1 border rounded-md focus:outline-primary"
                            >
                                <option value="" disabled>
                                    Select Employment Type
                                </option>
                                <option value="Full-Time">Full-Time</option>
                                <option value="Part-Time">Part-Time</option>
                            </select>
                        </label> */}

                        {/* Workplace Type */}
                        <label className="block">
                            Workplace Type:
                            <select
                                name="workplaceType"
                                value={formData.workplaceType}
                                onChange={handleChange}
                                required
                                className="w-full p-2 mt-1 border rounded-md focus:outline-primary"
                            >
                                <option value="" disabled>
                                    Select Workplace
                                </option>
                                <option value="On_SITE">On Site </option>
                                <option value="REMOTE">Remote </option>
                                <option value="HYBRID">Hybrid </option>
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
                                    {skill} <button type="button" onClick={() => handelRemoveSkill(index)}><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                    </label>

                    {/* Expected Start Date */}
                    <div className="rounded-lg">
                        <p className="text-sm mb-2">Expected Start Date*</p>
                        <div className="flex gap-4">
                            {["Less than 7 days", "7-15 days", "After 15+ days"].map((option) => (
                                <button type="button"
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
                                    required
                                    placeholder="in new season......."
                                    className="px-4 py-2 border rounded-lg bg-transparent  focus:outline-none focus:outline-primary"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="_part2 grid gap-4 border rounded-lg px-4 py-3">
                    {/* Salary Type Selection */}
                    <div className="grid grid-cols-2 items-center justify-between ">

                        <div className="flex flex-wrap gap-4 items-center">
                            <p className="text-sm font-semibold w-full">Salary Type</p>
                            {["FIXED", "RANGE", "INCENTIVE"].map((type) => (
                                <button type="button"
                                    key={type}
                                    onClick={() => setFormData((prev) => ({ ...prev, salaryType: type as "FIXED" | "RANGE" | "INCENTIVE" }))}
                                    className={`px-4 py-2 border rounded-lg transition ${formData.salaryType === type ? "bg-primary text-white" : "bg-inherit"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Hide Salary Toggle */}
                        <div className="flex flex-wrap gap-4 items-start justify-end h-full">
                            <p className="text-sm font-semibold text-end">Hide Salary from candidates</p>
                            <label className="relative inline-flex items-center cursor-pointer justify-center">
                                <input type="checkbox" className="sr-only peer" onClick={() => handelSalaryShow(formData.showSalary)} />
                                <div className={`w-9 h-[20px] bg-primary-dark rounded-full flex items-center px-1 transition-all ${!formData.showSalary ? "justify-end" : "justify-start"}`}>
                                    <span className="w-3 h-3 bg-primary-foreground inline-block rounded-full "></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Salary Figure Input */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold">Salary Figure</label>
                        <div className="flex items-center border rounded-lg px-3  mt-1">
                            <span className="mr-2 w-1/5 py-2 border-r">$ (USA Dollars)</span>
                            <input
                                type="text"
                                name="salaryFigure"
                                value={formData.salaryFigure}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent focus:outline-none py-2"
                                placeholder="Enter salary amount..."
                            />
                        </div>
                    </div>
                </section>


                {/* Job Description */}
                <section className="_part3 grid gap-4 border rounded-lg px-4 py-3">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold">Job Description* <span className="text-gray-400">({formData.jobDescription.length}/2500)</span></p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <button type="button" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-primary hover:text-white transition">
                            🌐 Generate with AI
                        </button>
                        <button type="button" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-primary hover:text-white transition">
                            📄 Upload PDF
                        </button>
                        <button type="button" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-primary hover:text-white transition">
                            🔗 Link with existing JD
                        </button>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="border rounded-lg p-2 ">
                        {/* Toolbar */}
                        <div className="flex gap-3 border-b pb-2">
                            <button type="button" className=" font-semibold hover:text-gray-300">B</button>
                            <button type="button" className=" font-semibold hover:text-gray-300 italic">I</button>
                            <button type="button" className=" font-semibold hover:text-gray-300 underline">U</button>
                            <button type="button" className=" font-semibold hover:text-gray-300"><TextLeft /></button>
                            <button type="button" className=" font-semibold hover:text-gray-300"><TextCenter /></button>
                            <button type="button" className=" font-semibold hover:text-gray-300"><TextRight /></button>
                            <button type="button" className=" font-semibold hover:text-gray-300"><ImageIcon className="w-4" /></button>
                        </div>

                        {/* Text Editor */}
                        <textarea
                            className="w-full h-64 p-3 focus:outline-none resize-none"
                            placeholder="Enter job description..."
                            onChange={handleChange}
                            required
                            name="jobDescription"
                            value={formData.jobDescription}
                            spellCheck={true}
                        />
                    </div>
                </section>
                <div className="flex justify-between">
                    <button type="button" onClick={handelDraft} className="border bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-md">
                        Save as Draft
                    </button>
                    <button type="submit" onClick={handleSubmit} className=" px-4 py-2 rounded-md border bg-primary text-white hover:bg-primary-dark">
                        Publish
                    </button>
                </div>
            </form>
        </div>}
        </>

    );
};

export default BasicDetails;
