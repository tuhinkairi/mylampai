// /adminDashboard/create-templates/page.tsx
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist/webpack";

import { IoCloudUploadOutline } from "react-icons/io5";
import { FaFilePdf } from "react-icons/fa";
import { createInterviewTemplate, generateInterviewRubrics } from "@/actions/interviewTemplates/createTemplateActions";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Define types for our template form
type TemplateRubric = {
    id?: string;
    parameter: string;
    description: string;
    weightage: number;
};

type TemplateQuestion = {
    id?: string;
    question: string;
    description?: string;
    category: string;
    difficulty: string;
    expectedAnswer?: string;
    order: number;
};

// Define the form schema using zod
const templateFormSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    jobDescription: z.string().min(10, "Job description must be at least 10 characters."),
    companyName: z.string().min(1, "Company name is required."),
    roleTitle: z.string().min(1, "Role title is required."),
    category: z.string().min(1, "Category is required."),
    difficulty: z.string().min(1, "Difficulty is required."),
    expectedDuration: z.coerce.number().min(5, "Duration must be at least 5 minutes."),
    isActive: z.boolean().default(true),
});

const categories = [
    { value: "Software", label: "Software" },
    { value: "DataScience", label: "Data Science" },
    { value: "Product", label: "Product" },
    { value: "Design", label: "Design" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Finance", label: "Finance" },
    // { value: "HR", label: "HR" },
    // { value: "Operations", label: "Operations" },
    // { value: "CustomerSupport", label: "Customer Support" },
    // { value: "Legal", label: "Legal" },
    // { value: "Management", label: "Management" },
    // { value: "Other", label: "Other" },
]

type TemplateFormValues = z.infer<typeof templateFormSchema>;

export default function CreateTemplatePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingRubrics, setIsGeneratingRubrics] = useState(false);
    const [rubrics, setRubrics] = useState<TemplateRubric[]>([]);
    // const [questions, setQuestions] = useState<TemplateQuestion[]>([]);
    const [JD, setJD] = useState<string>("");
    const [JDFile, setJDFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize the form
    const form = useForm<TemplateFormValues>({
        resolver: zodResolver(templateFormSchema),
        defaultValues: {
            title: "",
            jobDescription: "",
            companyName: "",
            roleTitle: "",
            category: "Technical",
            difficulty: "Intermediate",
            expectedDuration: 30,
            isActive: true,
        },
    });

    async function onSubmit(data: TemplateFormValues) {
        try {
            setIsSubmitting(true);

            if (rubrics.length === 0) {
                toast.error("At least one rubric is required.");
                setIsSubmitting(false);
                return;
            }

            // if (questions.length === 0) {
            //     toast.error("At least one question is required.");
            //     setIsSubmitting(false);
            //     return;
            // }

            // Create the complete template object
            const templateData = {
                ...data
            };

            const response = await createInterviewTemplate(
                templateData,
                rubrics,
            );

            if (response.status !== 200) {
                throw new Error("Failed to create template");
            }

            toast.success("Interview template created successfully!");

            form.reset(); // Reset the form after successful submission
            setJD("");
            setJDFile(null);
            setRubrics([]); // Reset rubrics after submission

        } catch (error) {
            console.error("Error creating template:", error);
            toast.error("Failed to create template. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const extractTextFromPDF = useCallback(async (file: File): Promise<string> => {
        try {
            setIsAnalyzing(true);

            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async function (event) {
                    try {
                        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);

                        // Ensure we're in the browser environment
                        if (typeof window !== "undefined") {
                            try {
                                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
                                let text = "";

                                for (let i = 1; i <= pdf.numPages; i++) {
                                    const page = await pdf.getPage(i);
                                    const textContent = await page.getTextContent();
                                    const pageText = textContent.items
                                        .map((item: any) => item.str)
                                        .join(" ");
                                    text += ` ${pageText}`;
                                }

                                resolve(text.trim());
                            } catch (pdfError) {
                                console.error("PDF processing error:", pdfError);
                                reject(new Error("Failed to process PDF file"));
                            }
                        } else {
                            reject(new Error("PDF processing is not available in server environment"));
                        }
                    } catch (error) {
                        console.error("Error in reader.onload:", error);
                        reject(error);
                    }
                };

                reader.onerror = (error) => {
                    console.error("FileReader error:", error);
                    reject(new Error("Failed to read file"));
                };

                reader.readAsArrayBuffer(file);
            });
        } catch (error) {
            console.error("Error in extractTextFromPDF:", error);
            throw error;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const handleJDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        setIsUploading(true);
        try {
            const file = e.target.files[0];
            if (validateFile(file)) {
                await handleJDAnalysis(file);
            }
        } catch (error) {
            console.error("Error uploading JD:", error);
            toast.error("Failed to upload and process the job description.");
        } finally {
            setIsUploading(false);
            // Reset the input to allow the same file to be selected again
            e.target.value = '';
        }
    };

    const handleJDAnalysis = async (file: File) => {
        if (!validateFile(file)) {
            return;
        }

        setJDFile(file);
        setIsAnalyzing(true);

        try {
            const extractedText = await extractTextFromPDF(file);

            if (extractedText) {
                setJD(extractedText);
                form.setValue("jobDescription", extractedText);
                toast.success("Job Description analyzed successfully");
            } else {
                throw new Error("Failed to extract text from PDF");
            }
        } catch (error) {
            console.error("Error analyzing JD:", error);
            toast.error("Failed to analyze the job description. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // File validation helper
    const validateFile = (file: File) => {
        if (!file) {
            toast.error("No file selected");
            return false;
        }

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return false;
        }

        if (file.size > 1024 * 1024) {
            toast.error("File size should be 1 MB or less");
            return false;
        }

        return true;
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleJDDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
            return;
        }

        setIsUploading(true);
        try {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                await handleJDAnalysis(file);
            }
        } catch (error) {
            console.error("Error handling dropped file:", error);
            toast.error("Failed to process the dropped file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRubricsGeneration = async () => {
        try {
            if (JD.length === 0) {
                toast.error("Please upload a valid Job Description file.");
                return;
            }

            setIsGeneratingRubrics(true);
            const response = await generateInterviewRubrics(JD);
            console.log("Rubrics response:", response);
            if (response.status !== 200) {
                throw new Error("Failed to generate rubrics");
            }

            const data = response.result;
            setRubrics(data.evaluation_criteria);
            form.setValue("roleTitle", data.job_title);
            toast.success("Rubrics generated successfully!");
        } catch (error) {
            console.error("Error generating rubrics:", error);
            toast.error("Failed to generate rubrics. Please try again.");
        } finally {
            setIsGeneratingRubrics(false);
        }
    };

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Create Interview Template</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Details</CardTitle>
                            <CardDescription>
                                Basic information about the interview template
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Template Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Frontend Developer Interview" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Google" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="roleTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="SDE I" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="expectedDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Difficulty</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select difficulty" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                                    <SelectItem value="Expert">Expert</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="jobDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Detailed job description..."
                                                    className="min-h-32"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <FormLabel className="block mb-2">Upload Job Description</FormLabel>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center min-h-32 transition-colors ${isDragging
                                            ? "border-primary bg-primary/5"
                                            : isUploading || isAnalyzing
                                                ? "border-gray-300 bg-gray-50"
                                                : JDFile
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-300 hover:border-gray-400"
                                            }`}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleJDDrop}
                                    >
                                        {isUploading || isAnalyzing ? (
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                                                <p className="text-gray-600 font-medium">
                                                    {isUploading ? "Uploading..." : "Analyzing job description..."}
                                                </p>
                                            </div>
                                        ) : JDFile ? (
                                            <div className="flex flex-col items-center">
                                                <FaFilePdf className="h-10 w-10 text-green-500 mb-3" />
                                                <p className="font-medium text-green-600">
                                                    {JDFile.name}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {(JDFile.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <IoCloudUploadOutline className="h-12 w-12 text-gray-400 mb-3" />
                                                <p className="text-gray-600 font-medium">
                                                    Drag & Drop PDF here
                                                </p>
                                                <p className="text-gray-500 mt-2 text-sm">
                                                    or
                                                </p>
                                                <label
                                                    htmlFor="jdUpload"
                                                    className="mt-2 text-sm font-medium text-primary hover:text-primary/90 cursor-pointer"
                                                >
                                                    Click to upload
                                                </label>
                                                <p className="text-gray-400 text-xs mt-4">
                                                    Supported file format: PDF. File size limit: 1 MB
                                                </p>
                                            </>
                                        )}
                                        <input
                                            id="jdUpload"
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={handleJDUpload}
                                            disabled={isUploading || isAnalyzing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {JD.length > 0 && (
                                <div className="border p-4 rounded-md bg-gray-50">
                                    <Button
                                        type="button"
                                        onClick={handleRubricsGeneration}
                                        disabled={isGeneratingRubrics}
                                        className="w-full sm:w-auto"
                                    >
                                        {isGeneratingRubrics ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating Rubrics...
                                            </>
                                        ) : (
                                            "Generate Rubrics"
                                        )}
                                    </Button>
                                </div>
                            )}
                            {/* <Card>
                                <CardHeader>
                                    <CardTitle>Evaluation Rubrics</CardTitle>
                                    <CardDescription>
                                        Define the criteria that will be used to evaluate the interview
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RubricForm rubrics={rubrics} setRubrics={setRubrics} /> 
                                </CardContent>
                            </Card> */}


                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active Template</FormLabel>
                                            <FormDescription>
                                                Make this template available for users
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>



                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Predefined Questions</CardTitle>
                            <CardDescription>
                                Add questions that will be used in this interview template
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <QuestionForm questions={questions} setQuestions={setQuestions} />
                        </CardContent>
                    </Card> */}

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Template"}
                        </Button>
                    </div>
                </form>
            </Form >
        </div >
    );
}