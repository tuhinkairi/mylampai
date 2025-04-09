"use client";
import React, { useState, useEffect, useCallback, use } from "react";
import Image from "next/image";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import { IoDocumentAttach, IoCloudUploadOutline } from "react-icons/io5";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocketContext } from "@/hooks/interviewersocket/webSocketContext";
import { Input } from "@/components/ui/input";
import { generateSasToken } from "@/actions/azureActions";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    createInterview,
    handleCVUpload,
    handleInterviewState,
    handleJDTextUpload,
} from "@/actions/interviewActions";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import FullScreenLoader from "@/components/global/FullScreenLoader";
import { useAppSelector } from "@/lib/hooks";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT;

function generateFileName(
    interviewId: string,
    originalFileName: string,
    filetype: string
) {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const fileExtension = originalFileName.split(".").pop();
    return `${interviewId}_${timestamp}_${filetype}.${fileExtension}`;
}

const InterviewComponent = () => {
    const form = useForm<{ jobProfile: string }>({
        defaultValues: {
            jobProfile: "",
        },
    });
    const router = useRouter();
    const searchParams = useSearchParams()
    const interviewType = searchParams.get("type") || "mockInterview";

    // const { interviewerWs, connectInterviewer } = useWebSocketContext();
    // const ws = interviewerWs;
    const [step, setStep] = useState(1);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdFile, setJDFile] = useState<File | null>(null);
    const [interviewId, setInterviewId] = useState<string>("");

    const [selectedJobProfile, setSelectedJobProfile] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [JD, setJD] = useState("");

    const [loading, setLoading] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const profile = useAppSelector((state) => state.talentProfile);
    const talentProfileId = profile.id as string;

    const jobProfiles = [
        "Software Engineer",
        "Data Scientist",
        "Product Manager",
        "UI/UX Designer",
        "Business Analyst",
        "DevOps Engineer",
        "System Administrator",
        "Other",
    ];

    const handleSubmit = form.handleSubmit((data) => {
        handleJDSubmit(data.jobProfile);
    });

    // useEffect(() => {
    //     if (ws) {
    //         ws.onopen = () => {
    //             console.log("WebSocket connection established");
    //         };

    //         ws.onclose = () => {
    //             console.log("WebSocket connection closed");
    //         };
    //     } else {
    //         connectInterviewer();
    //     }
    // }, [ws, connectInterviewer]);

    // useEffect(() => {
    //     if (ws) {
    //         ws.onmessage = async (event) => {
    //             const data = JSON.parse(event.data);

    //             switch (data.type) {
    //                 case "cv_uploaded":
    //                     setResumeText(data.cv_text);
    //                     toast.success("Resume analysed successfully");
    //                     setStep(2);
    //                     break;

    //                 case "jd_analyzed":
    //                     setJD(data.job_description);
    //                     toast.success("Job Description analysed successfully");
    //                     setStep(3);
    //                     break;
    //                 // case "interview_started":
    //                 //     console.log("Interview started", interviewType);
    //                 //     try {
    //                 //         const res = await handleInterviewState(interviewId, "In_Progress", interviewType);
    //                 //         if (res.status === "success") {
    //                 //             router.push(`/interview/${interviewId}?type=${interviewType}`);
    //                 //         } else {
    //                 //             toast.error("Failed to start interview");
    //                 //         }
    //                 //     } catch (error) {
    //                 //         toast.error("Internal Server Error");
    //                 //         console.error(error);
    //                 //     }
    //                 //     break;

    //                 default:
    //                     break;
    //             }
    //         };
    //     }
    // }, [ws, interviewId]);

    const handleResumeAnalysis = useCallback(
        async (file: File) => {
            setIsUploading(true);
            setResumeFile(file);

            // const reader = new FileReader();

            // reader.onload = async (e) => {
            //     const binaryData = e.target?.result as ArrayBuffer;

            //     if (binaryData && ws) {
            //         try {
            //             ws?.send(
            //                 JSON.stringify({
            //                     type: "upload_cv",
            //                     cv_data: Array.from(new Uint8Array(binaryData)),
            //                 })
            //             );
            //         } catch (error) {
            //             setResumeFile(null);
            //             console.log("Socket is not initialised");
            //             if (fileInputRef.current) fileInputRef.current.value = "";
            //         } finally {
            //             setIsUploading(false);
            //         }
            //     } else {
            //         console.log("websocket is not initialised or no extracted text");
            //         setIsUploading(false);
            //     }
            // };

            // reader.readAsArrayBuffer(file);

            const resumeText = await extractTextFromPDF(file);
            if (!resumeText) {
                toast.error("Error extracting text from PDF");
                return;
            }
            console.log("Extracted Resume Text:", resumeText);
            setResumeText(resumeText);
            // if (resumeText) {
            //     const extractStructuredData = async (text: string) => {
            //         try {
            //             const response = await fetch(`${baseUrl}/extract_structured_data`, {
            //                 method: "POST",
            //                 headers: {
            //                     "Content-Type": "application/json",
            //                 },
            //                 body: JSON.stringify({ cv_text: text }),
            //             });

            //             const result = await response.json();
            //             if (response.ok) {
            //                 return result;
            //             }
            //             return null;
            //         } catch (error) {
            //             console.error("Error extracting structured data:", error);
            //             return null;
            //         }
            //     };

            //     const structuredData = await extractStructuredData(resumeText);

            //     if (structuredData) {
            //         console.log("Structured Data:", structuredData);
            //          setResumeText(structuredData.message);
            //     }
            // }

            const blobName = generateFileName("", file.name, "cv");
            const sasUrl = await generateSasToken(blobName);

            if (!sasUrl) {
                toast.error("Error uploading resume");
                return;
            }

            try {
                const uploadResponse = await fetch(sasUrl, {
                    method: "PUT",
                    headers: {
                        "x-ms-blob-type": "BlockBlob",
                    },
                    body: file,
                });

                if (!uploadResponse.ok) {
                    toast.error("Resume Upload Failed");
                }
                setStep(2);
            } catch (error) {
                console.error(error);
            }
        },
        [interviewId]
    );

    const extractTextFromPDF = useCallback((file: File): Promise<string> => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async function (event) {
                const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);

                if (typeof window !== "undefined") {
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
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
                } else {
                    reject(
                        new Error("pdfjs-dist is not available in the server environment")
                    );
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }, []);

    const handleJDAnalysis = async (file: File) => {
        setJDFile(file);

        const extractedText = await extractTextFromPDF(file);

        if (extractedText) {
            // ws.send(
            //     JSON.stringify({ type: "analyze_jd", job_description: extractedText })
            // );
            setJD(extractedText);
            toast.success("Job Description analysed successfully");
            setStep(3);
        } else {
            console.error("websocket is not initialised or no extracted text");
        }

        // const blobName = generateFileName(interviewId, file.name, "jd");
        // const sasUrl = await generateSasToken(blobName);

        // if (!sasUrl) {
        //     toast.error("Error uploading Job description");
        //     return;
        // }

        // try {
        //     const uploadResponse = await fetch(sasUrl, {
        //         method: "PUT",
        //         headers: {
        //             "x-ms-blob-type": "BlockBlob",
        //         },
        //         body: file,
        //     });

        //     if (!uploadResponse.ok) {
        //         toast.error("Job description Upload Failed");
        //     }
        // } catch (error) {
        //     console.error(error);
        // }
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

    // Handle resume upload events
    const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && validateFile(file)) {
            handleResumeAnalysis(file);
        }
    };

    const handleResumeDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (validateFile(file)) {
            handleResumeAnalysis(file);
        }
    };

    const handleProfileChange = (profile: string) => {
        setSelectedJobProfile(profile);

        if (profile === "Other") {
            setJD("");
            return;
        }

        setJD(profile);
        toast.success("Job Description analysed successfully");
        setStep(3);

        // ws?.send(
        //     JSON.stringify({
        //         type: "analyze_jd",
        //         job_description: profile,
        //     })
        // );
    };

    const handleJDSubmit = (jobProfile: string) => {
        if (!jobProfile) {
            return;
        }

        setJD(jobProfile);
        toast.success("Job Description analysed successfully");
        setStep(3);

        // ws?.send(
        //     JSON.stringify({
        //         type: "analyze_jd",
        //         job_description: jobProfile,
        //     })
        // );
    };

    const handleJDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            setJDFile(file);
            await handleJDAnalysis(file);
        }
    };

    const handleJDDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setJDFile(file);
            await handleJDAnalysis(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        console.log("JD11", JD);
        console.log("step", step);
    }, [JD, step]);


    const startInterview = useCallback(async () => {
        if (!resumeText || !JD) {
            toast.error("Upload CV and Job Description");
            return;
        }

        setLoading(true);

        // Create interview first
        try {
            const res = await createInterview(talentProfileId);

            if (res.status === "success" && res.interviewId) {
                setInterviewId(res.interviewId);

                // Verify media devices access without actually using them
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true,
                    });

                    // Release streams immediately
                    stream.getTracks().forEach(track => track.stop());

                    if (res.status === "success" && res.interviewId) {
                        // Store interview data in sessionStorage
                        sessionStorage.setItem('interviewData', JSON.stringify({
                            pdf_text: resumeText,
                            job_description: JD,
                            interview_id: res.interviewId
                        }));

                        // Navigate to interview page
                        router.push(`/interview/${res.interviewId}?type=${interviewType}`);
                    } else {
                        toast.error(res.message || "Failed to create interview");
                        setLoading(false);
                    }
                } catch (err) {
                    toast.error("Failed to access microphone and camera. Please check your permissions.");
                    setLoading(false);
                }
            } else {
                toast.error(res.message || "Failed to create interview");
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating interview");
            setLoading(false);
        }
    }, [resumeText, JD, talentProfileId]);

    return (
        <>
            <div className="min-h-screen bg-primary-foreground flex items-center md:justify-center justify-top w-full relative">
                <div className="max-w-[1200px] gap-4 w-full flex flex-col items-center md:flex-row justify-between">
                    <div className="hidden sm:flex max-w-[400px] flex-col items-center justify-end bg-primary shadow-lg text-white rounded-2xl p-8 gap-8 relative">
                        <Image
                            src={"/images/Globe.svg"}
                            className="w-10/12 h-auto"
                            alt="image"
                            width={100}
                            height={100}
                        />
                        <div className="relative flex flex-col items-center mt-auto">
                            <h2 className="text-xl font-semibold w-full leading-snug">
                                Take the wiZe AI mock Interview
                            </h2>
                            <p className="mt-2 text-sm w-full ">
                                You&apos;ll be taking a 20-minute interview to have your skills
                                evaluated. Just relax and take the interview.{" "}
                                <span className="font-semibold"> All the best!</span>
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:max-w-[500px] max-h-[90vh] scrollbar-hide overflow-hidden lg:max-w-[700px] overflow-x-hidden flex flex-col items-center justify-center bg-primary-foreground p-10 md:mr-8 lg:mr-0">
                        <div className="text-2xl font-semibold mb-2 text-primary">
                            Get Started!
                        </div>
                        {step === 1 ? (
                            <>
                                <div className="flex mx-auto items-center max-w-[450px] justify-center w-full">
                                    <div className="relative flex-1">
                                        <div
                                            className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-white"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div
                                            className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-slate-500 w-full z-0`}
                                        ></div>
                                    </div>

                                    <div className="relative flex-1">
                                        <div
                                            className={`w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center`}
                                        >
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                        <div
                                            className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-slate-500 w-full z-0`}
                                        ></div>
                                    </div>

                                    <div className="relative flex items-center">
                                        <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center my-4 w-full text-xl font-semibold">
                                    Upload your latest CV/Resume
                                </div>

                                <div className="bg-white py-4 px-8 rounded-2xl w-full md:max-w-[350px] lg:max-w-[400px] shadow-lg text-center">
                                    <div className="text-primary flex justify-center mb-2 text-center w-full text-3xl">
                                        <IoDocumentAttach />
                                    </div>

                                    {resumeText ? (
                                        <div className="text-center text-gray-600 font-semibold relative h-[135px] flex items-center justify-center">
                                            Resume Uploaded: {resumeFile?.name}
                                            <button
                                                className="absolute top-0 right-4 text-gray-600 hover:text-destructive focus:outline-none"
                                                onClick={() => setResumeText("")}
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-dashed border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white h-[150px] lg:h-[135px]"
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleResumeDrop(e)}
                                        >
                                            <p className="text-gray-500 mt-2 text-sm lg:text-xs">
                                                Drag & Drop or
                                            </p>
                                            <label
                                                htmlFor="resumeUpload"
                                                className="text-gray-500 cursor-pointer text-sm lg:text-xs"
                                            >
                                                Click to{" "}
                                                <span className="font-semibold text-primary">
                                                    Upload Resume
                                                </span>
                                            </label>
                                            <input
                                                id="resumeUpload"
                                                type="file"
                                                name="resumeUpload"
                                                accept=".pdf, application/pdf"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleResumeUpload}
                                            />

                                            <div className="text-4xl mt-3 text-gray-300">
                                                <IoCloudUploadOutline />
                                            </div>

                                            <p className="text-slate-500 text-sm mt-3 lg:text-xs">
                                                Supported file format: PDF. File size limit: 1 MB
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        className={`flex justify-center items-center mt-2 mx-auto bg-primary text-lg md:w-full relative text-white font-bold py-3 px-3 rounded-xl lg:max-h-[40px]   ${!!resumeText
                                            ? "cursor-not-allowed bg-slate-500"
                                            : "hover:bg-primary focus:ring-4 focus:ring-primary-foreground transition"
                                            }`}
                                        onClick={handleUploadClick}
                                        disabled={resumeText !== ""}
                                    >
                                        {isUploading
                                            ? "Uploading..."
                                            : resumeText !== ""
                                                ? "Resume Uploaded"
                                                : "Upload Resume"}
                                    </button>
                                </div>
                            </>
                        ) : step === 2 ? (
                            <>
                                {loading && <FullScreenLoader message="Starting Interview" />}{" "}
                                <div className="flex mx-auto items-center max-w-[450px] justify-center mb-2 w-full">
                                    <div className="relative flex-1">
                                        <div
                                            className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-white"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div
                                            className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-primary w-full z-0`}
                                        ></div>
                                    </div>

                                    <div className="relative flex-1">
                                        <div
                                            className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-white"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div
                                            className={`absolute top-1/2 left-8 h-0.5 transition-all duration-500 ease-in-out bg-slate-500 w-full z-0`}
                                        ></div>
                                    </div>

                                    <div className="relative flex items-center">
                                        <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-sm xl:text-2xl mb-6 font-bold text-gray-800">
                                    Choose your Interview Profile
                                </h3>
                                <div className="bg-white py-4 px-8 rounded-2xl w-full md:max-w-[450px] lg:max-w-[450px] shadow-lg text-center flex flex-col items-center">
                                    <Tabs defaultValue="profile" className="w-[400px]">
                                        <TabsList className="grid w-full grid-cols-2 p-2 h-auto">
                                            <TabsTrigger className="p-2" value="profile">
                                                Choose Profile
                                            </TabsTrigger>
                                            <TabsTrigger className="p-2" value="jd">
                                                Upload JD
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="profile">
                                            <Select
                                                value={selectedJobProfile}
                                                onValueChange={handleProfileChange}
                                            >
                                                <SelectTrigger
                                                    id="jobProfileDropdown"
                                                    className="w-full p-4 mb-2"
                                                >
                                                    <SelectValue placeholder="Select a profile" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jobProfiles.map((profile) => (
                                                        <SelectItem key={profile} value={profile}>
                                                            {profile}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedJobProfile === "Other" && (
                                                <Form {...form}>
                                                    <form onSubmit={handleSubmit} className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="jobProfile"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Enter profile name"
                                                                            className="text-center"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button type="submit" className="w-full">
                                                            Submit
                                                        </Button>
                                                    </form>
                                                </Form>
                                            )}
                                        </TabsContent>
                                        <TabsContent value="jd">
                                            <div className="border-dashed border-2 border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-white h-[160px] mt-4">
                                                {JD !== "" ? (
                                                    <div className="text-center text-gray-600 font-semibold relative h-[150px] flex items-center justify-center">
                                                        Job Description Uploaded: {jdFile?.name}
                                                        <button
                                                            className="absolute top-[44%] right-6 text-gray-600 hover:text-red-600 focus:outline-none"
                                                            onClick={() => setJD("")}
                                                        >
                                                            <FiX className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onDragOver={handleDragOver}
                                                        onDrop={handleJDDrop}
                                                    >
                                                        <p className="text-gray-500 mt-2 text-sm">
                                                            Drag & Drop or
                                                        </p>
                                                        <label
                                                            htmlFor="jdUpload"
                                                            className="text-gray-500 cursor-pointer text-sm"
                                                        >
                                                            Click to{" "}
                                                            <span className="font-semibold text-primary">
                                                                Upload Job Description
                                                            </span>
                                                        </label>
                                                        <input
                                                            id="jdUpload"
                                                            type="file"
                                                            accept=".doc,.docx,.pdf"
                                                            className="hidden"
                                                            onChange={handleJDUpload}
                                                        />

                                                        <div className="text-4xl mt-3 flex justify-center text-gray-300">
                                                            <IoCloudUploadOutline />
                                                        </div>

                                                        <p className="text-slate-500 text-sm mt-3">
                                                            Supported file format: PDF. File size limit: 1 MB
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </>
                        ) : (<>
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Step 3: Start Interview</h2>
                                <div className="p-6 bg-gray-50 rounded-lg">
                                    <div className="mb-4">
                                        <h3 className="font-medium">Resume: </h3>
                                        <p className="text-sm text-gray-600">✓ Successfully analyzed</p>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="font-medium">Job Profile: </h3>
                                        <p className="text-sm text-gray-600">✓ Successfully analyzed</p>
                                    </div>
                                    <Button
                                        onClick={startInterview}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                Preparing Interview...
                                            </span>
                                        ) : (
                                            <span>Start Interview</span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>)}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InterviewComponent;
