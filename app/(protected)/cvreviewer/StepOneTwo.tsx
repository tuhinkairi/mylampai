"use client";
import {
  useState,
  DragEvent,
  useEffect,
  useRef,
} from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { useUserStore } from "@/utils/userStore";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setExtractedText, setJobProfile, setJobDescription, setResumeBase64, setResumeFileText, setResumeFileUrl, setResumeId, setResumeName, setStructuredData } from "@/lib/features/cv_reviewer/cvReviewerSlice";
import { getUserResumesList } from "@/actions/resumeActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FiX } from "react-icons/fi";
import { Circles } from "react-loader-spinner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createReusmeAnalysis, updateResumeAnalysis } from "@/actions/resumeAnalysis";

const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function generateFileName(
  originalFileName: string,
  filetype: string,
) {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  const fileExtension = originalFileName.split(".").pop();
  return `${timestamp}_${filetype}.${fileExtension}`;
}

type ResumeList = {
  id: string;
  resumeName: string | null;
  resumeFileText?: string | null;
  resumeUrl: string | null;
}[];

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

const StepOneTwo = () => {
  const [otherProfile, setOtherProfile] = useState("");
  const dispatch = useAppDispatch();
  const { token } = useUserStore();
  const cvReviewerStorage = useAppSelector((state) => state.cvReviewer);

  const { jobProfile, structuredData } = cvReviewerStorage;
  const router = useRouter();

  const [resumeList, setResumeList] = useState<ResumeList>([]);
  const { userData } = useUserStore();
  const [cvId, setCvId] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingJD, setIsUploadingJD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jdFile, setJDFile] = useState<File | null>(null);
  const [JD, setJD] = useState<string>("")
  const [structuredTextData, setStructuredTextData] = useState("")


  // Set initial job profile from redux if available
  useEffect(() => {
    if (jobProfile && jobProfile === "Other") {
      setOtherProfile(jobProfile);
    }
  }, []);

  useEffect(() => {
    if (JD) {
      // console.log("final JD:: ", JD)
      dispatch(setJobDescription(JD));
    }
  }, [JD])

  useEffect(() => {
    if (!userData || !userData.id) return;

    const fetchResumeList = async () => {
      const resumes = await getUserResumesList(userData.id);
      setResumeList(resumes);
    };

    fetchResumeList();
  }, [userData]);

  // Single unified function to handle resume file processing
  const processResumeFile = async (file: File) => {

    setResumeFile(file);
    setIsUploadingResume(true)
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("File size should be less than 1MB");
      return;
    }

    try {
      // 2. Save file to Redux
      const resumeBase64 = await fileToBase64(file);
      const resumeName = file.name;
      if (resumeBase64) {
        // console.log("hereeerrrrrrfrrfff")
        dispatch(setResumeBase64(resumeBase64));
        dispatch(setResumeName(resumeName));
      }

      // 3. Extract text from PDF
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText) {
        toast.error("Failed to extract text from PDF");
        return;
      }

      dispatch(setExtractedText(extractedText));

      // 4. Convert file to base64 for API
      const base64String = await fileToBase64(file);
      if (!base64String) {
        toast.error("Failed to convert file to base64");
        return;
      }

      // 5. Extract structured data
      // console.log("debug1213: ", extractedText)
      const structuredDataResult = await extractStructuredData(extractedText);
      if (structuredDataResult && structuredDataResult.message) {
        dispatch(setStructuredData(structuredDataResult.message));
        const temp = JSON.stringify(structuredDataResult.message)
        setStructuredTextData(temp)
      } else {
        toast.error("Failed to extract structured data");
      }

      // 6. Upload CV and job description to API
      // await uploadCVAndJobDescription(file, extractedText);
      setResumeText(extractedText)
    } catch (error) {
      console.error("Error processing resume:", error);
      toast.error("Failed to process the resume");
    } finally {
      setIsUploadingResume(false)
    }
  };

  // Helper functions
  const extractTextFromPdf = async (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      let extractedText = "";

      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;

          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            extractedText += pageText + "\n";
          }

          resolve(extractedText);
        } catch (error) {
          console.error("Error extracting text from PDF:", error);
          reject(error);
        }
      };

      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1] || null;
        resolve(base64String);
      };
      reader.onerror = () => reject(null);
      reader.readAsDataURL(file);
    });
  };

  const extractStructuredData = async (text: string) => {
    try {
      // console.log("debugp1:: ", text)
      const response = await fetch(`${baseUrl}/extract_structured_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cv_text: text }),
      });

      const result = await response.json();
      // console.log("p2:: ", result)
      if (response.ok) {
        return result;
      }
      return null;
    } catch (error) {
      console.error("Error extracting structured data:", error);
      return null;
    }
  };

  useEffect(() => {
    if (resumeFile && structuredTextData && structuredTextData.length > 0) {
      const resAsync = async () => {
        await uploadCVAndJobDescription(resumeFile, structuredTextData)
      }
      resAsync()
    }
  }, [resumeFile, structuredTextData])

  const uploadCVAndJobDescription = async (file: File, structuredData: string) => {
    try {
      if (!token) {
        toast.error("Authorization required");
        return;
      }
      const formData = new FormData();
      formData.append("resumeFile", file);
      // console.log("data to store:: ", structuredData)
      formData.append("resumeFileText", structuredData)
      const response = await fetch("/api/resume/add_new", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: (formData),
      });

      const res = await response.json();

      // Handle resume ID based on response status
      let tempId: string = "";
      if (res.status == 409 || res.status == 200) {
        tempId = res.resume?.id;
        dispatch(setResumeId(tempId));
        setCvId(tempId);
      } else if (res.error) {
        toast.error("Error Uploading Resume, Try after a while");
      }

    } catch (error) {
      console.error("Error uploading CV:", error);
      toast.error("Resume upload failed");
    }
  };

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

  // Event handlers
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Handle resume upload events
  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      await processResumeFile(file);
    }
  };

  const handleResumeDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (validateFile(file)) {
      await processResumeFile(file);
    }
  };

  const handleJDSubmit = (jobProfile: string) => {
    if (!jobProfile) {
      return;
    }
    setJD(jobProfile);
    toast.success("Job Description analysed successfully");
  };

  const handleJDAnalysis = async (file: File) => {
    setJDFile(file);
    setIsUploadingJD(true);
    const extractedText = await extractTextFromPdf(file);

    if (extractedText) {
      setJD(extractedText);

      toast.success("Job Description analysed successfully");
      setIsUploadingJD(false);
    } else {
      console.error("websocket is not initialised or no extracted text");
    }
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


  const handleStartAnalysis = async () => {
    try {
      setLoading(true);

      // Make sure we have either job description or job profile
      if (!resumeText || !JD) {
        toast.error("Upload CV and Job Description");
        setLoading(false)
        return;
      }

      // Make sure we have a resume ID
      if (!cvId) {
        toast.error("Please select or upload a resume");
        setLoading(false);
        return;
      }

      const res = await createReusmeAnalysis({
        resumeId: cvId,
        jobDescription: JD
      });
      // console.log("resss:: ", res)
      if (res.status == 200 && res.data) {
        router.push(`/cvreviewer/${cvId}/analysis`);
      } else if (res.status == 209) {
        toast.warning(res.message)
        router.push(`/cvreviewer/${cvId}/analysis`);
      }

      // Use router.push instead of redirect
    } catch (error) {
      console.error("Error navigating to analysis page:", error);
      toast.error("Navigation error, please try again");
      setLoading(false);
    }
  };

  // Check if we have valid selection for the Start button
  const hasValidSelections = () => {
    return !!cvId && (!!JD || !!jobProfile);
  };

  return (
    <div className="flex items-center md:justify-center justify-top w-full relative">
      <div className="max-w-[1200px] w-full flex flex-col items-center">
        <div className="w-full border-t-white border-t-2 md:max-w-[700px] scrollbar-hide overflow-hidden overflow-x-hidden flex flex-col items-center justify-center bg-primary-foreground p-4 rounded-lg">
          <div className="text-2xl font-semibold mb-4 text-primary text-center">
            Upload Your Resume & Job Description
          </div>

          <div className="flex justify-center gap-6 w-full">
            {/* Resume Upload Section */}
            <div className="bg-white py-3 px-4 rounded-xl w-full shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Resume/CV</h3>

              {/* Existing Resume Selection */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Existing Resume
                </label>
                <Select
                  onValueChange={(value) => {
                    const selectedResume = resumeList.find(resume => resume.id === value);
                    if (selectedResume) {
                      dispatch(setResumeFileText(selectedResume.resumeFileText || ''));
                      dispatch(setResumeName(selectedResume.resumeName))
                      dispatch(setResumeFileUrl(selectedResume.resumeUrl))
                      dispatch(setResumeId(selectedResume.id))
                      setResumeText(selectedResume.resumeFileText || "")
                      setCvId(selectedResume.id)
                      // Additional logic to handle selection
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {(resumeList && resumeList.length > 0) ? resumeList.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.resumeName || 'Unnamed Resume'}
                      </SelectItem>
                    )) : "No resumes available"}
                  </SelectContent>
                </Select>

                {/* Divider */}
                <div className="flex items-center my-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="px-3 text-xs text-gray-500">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>


              {/* Upload New Resume */}
              {resumeText !== "" && resumeFile ? (
                <div className="text-center text-gray-600 font-medium relative h-[80px] flex items-center justify-center border border-gray-200 rounded-md p-2">
                  Resume Uploaded: {resumeFile?.name}
                  <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-destructive focus:outline-none"
                    onClick={() => setResumeText("")}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-dashed border-2 border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center bg-white h-[100px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleResumeDrop(e)}
                >
                  <p className="text-gray-500 mt-1 text-xs">
                    Drag & Drop or
                  </p>
                  <label
                    htmlFor="resumeUpload"
                    className="text-gray-500 cursor-pointer text-xs"
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
                  <div className="text-3xl mt-1 text-gray-300">
                    {isUploadingResume ? (
                      <Circles
                        height="20"
                        width="20"
                        color="text-gray-400"
                        ariaLabel="circles-loading"
                        visible={true}
                      />) : <IoCloudUploadOutline />}
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    PDF format only. Max 1 MB
                  </p>
                </div>
              )}
            </div>

            {/* Job Description Section */}


            <div className="bg-white py-3 px-4 rounded-xl w-full shadow-md">
              <h3 className="text-lg font-medium mb-3 text-gray-800">Job Description</h3>

              <div className="w-full mb-3 relative">
                <textarea
                  id="JD"
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${isUploadingJD ? 'bg-gray-100' : ''}`}
                  rows={4}
                  placeholder="Paste or type job description here..."
                  value={JD || ""}
                  onChange={(e) => setJD(e.target.value)}
                  disabled={isUploadingJD}
                />

                {isUploadingJD && (
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="flex gap-1 items-center">
                      <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-black rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>


              {/* Divider */}
              <div className="relative w-full py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-500">OR</span>
                </div>
              </div>

              {/* JD File Upload */}
              {JD !== "" && jdFile ? (
                <div className="text-center text-gray-600 font-medium mt-2 p-2 border border-gray-200 rounded-md flex items-center justify-between">
                  <span className="text-sm truncate max-w-[85%]">{jdFile?.name}</span>
                  <button
                    className="text-gray-600 hover:text-red-600 focus:outline-none"
                    onClick={() => setJD("")}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border border-dashed border-gray-300 rounded-md p-2 mt-2 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onDragOver={handleDragOver}
                  onDrop={handleJDDrop}
                >
                  <div className="flex items-center text-gray-500 text-xs">
                    <IoCloudUploadOutline className="text-gray-400 mr-1 text-lg" />
                    Drag & Drop Files Here
                  </div>
                  <label
                    htmlFor="jdUpload"
                    className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded text-xs cursor-pointer"
                  >
                    Browse
                  </label>
                  <input
                    id="jdUpload"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    className="hidden"
                    onChange={handleJDUpload}
                  />
                </div>
              )}
              <p className="text-slate-500 text-xs mt-1">
                Supported file format: PDF. File size limit: 1 MB
              </p>
            </div>

          </div>

          {/* Action Button */}
          <div className="mt-6 w-full">
            <Button
              onClick={handleStartAnalysis}
              disabled={loading || (!resumeText || !JD)}
              className="w-full py-2"
              variant="default"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Preparing Analyser...
                </span>
              ) : (
                <span>Start Analysis</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepOneTwo;