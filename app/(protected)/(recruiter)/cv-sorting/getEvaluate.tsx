import React, { useEffect, useState } from 'react'
import { IoCloudUploadOutline, IoDocumentAttach, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import * as pdfjsLib from "pdfjs-dist";
import { useWebSocketContext } from '@/hooks/interviewersocket/webSocketContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Custom hook for file upload status
const useFileUploadStatus = () => {
    const [fileUploadStatus, setFileUploadStatus] = useState<{
        fileName: string;
        progress: number;
        isUploading: boolean;
        isComplete: boolean;
        error?: string;
    }>({
        fileName: '',
        progress: 0,
        isUploading: false,
        isComplete: false
    });

    const startFileUpload = (fileName: string) => {
        setFileUploadStatus({
            fileName,
            progress: 0,
            isUploading: true,
            isComplete: false
        });
    };

    const updateFileUploadProgress = (progress: number) => {
        setFileUploadStatus(prev => ({
            ...prev,
            progress,
            isUploading: progress < 100
        }));
    };

    const completeFileUpload = () => {
        setFileUploadStatus(prev => ({
            ...prev,
            progress: 100,
            isUploading: false,
            isComplete: true
        }));
    };

    const handleFileUploadError = (errorMessage: string) => {
        setFileUploadStatus({
            fileName: '',
            progress: 0,
            isUploading: false,
            isComplete: false,
            error: errorMessage
        });
    };

    return {
        fileUploadStatus,
        startFileUpload,
        updateFileUploadProgress,
        completeFileUpload,
        handleFileUploadError
    };
};


function GetEvaluate({ parameters }: { parameters: any }) {
    const [uploading, setUploading] = useState(false);
    const [resumeList, setResumeList] = useState<string[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);
    const { rubricsWs } = useWebSocketContext();
    const [analysisStatus, setAnalysisStatus] = useState<{
        status?: string;
        progress?: number;
        currentFile?: string;
    }>({});
    const {
        fileUploadStatus,
        startFileUpload,
        updateFileUploadProgress,
        completeFileUpload,
        handleFileUploadError
    } = useFileUploadStatus();

    // WebSocket message handler
    useEffect(() => {
        if (!rubricsWs) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);

                // Update analysis status from WebSocket
                if (data.action === 'analysis_status') {
                    setAnalysisStatus({
                        status: data.status,
                        progress: data.progress,
                        currentFile: data.currentFile
                    });
                }

                if(data.action === 'analysis_complete') {
                    toast.success('Analysis complete');
                    console.log('Analysis complete:', data.result);
                }

            } catch (error) {
                console.error('Error parsing WebSocket message', error);
            }
        };

        rubricsWs.addEventListener('message', handleMessage);

        return () => {
            rubricsWs.removeEventListener('message', handleMessage);
        };
    }, [rubricsWs]);

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        event.preventDefault();
        const files = event.target.files;

        if (!files || files.length === 0) return;

        setUploading(true);
        const newResumeTexts: string[] = [];
        const newFileNames: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.type !== "application/pdf") {
                toast.error(`${file.name} is not a PDF file`);
                continue;
            }

            if (file.size > 1 * 1024 * 1024) {
                toast.error(`${file.name} is larger than 1MB`);
                continue;
            }

            try {
                startFileUpload(file.name);

                // Track PDF extraction progress
                const extractedText = await extractTextFromPDF(file, (progress) => {
                    updateFileUploadProgress(progress);
                });
                newResumeTexts.push(extractedText);
                newFileNames.push(file.name);
                completeFileUpload();
            } catch (error) {
                handleFileUploadError(`Failed to process ${file.name}`);
                toast.error(`Failed to process ${file.name}`);
                console.error("Error:", error);
            }
        }

        // Update resumeList and fileNames
        setResumeList(prevList => [...prevList, ...newResumeTexts]);
        setFileNames(prevNames => [...prevNames, ...newFileNames]);
        setUploading(false);
    };

    // Helper function to extract text from a PDF
    const extractTextFromPDF = (
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = async function () {
                try {
                    const typedArray = new Uint8Array(this.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let extractedText = "";

                    // Loop through each page
                    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                        const page = await pdf.getPage(pageNumber);
                        const textContent = await page.getTextContent();

                        // Track extraction progress
                        if (onProgress) {
                            onProgress(Math.round((pageNumber / pdf.numPages) * 100));
                        }

                        // Extract text
                        const pageText = textContent.items
                            .map((item: any) => item.str)
                            .join(" ");
                        extractedText += pageText + "\n";
                    }

                    resolve(extractedText);
                } catch (error) {
                    reject(error);
                }
            };

            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(file);
        });
    };

    // Remove a specific resume from the list
    const removeResume = (index: number) => {
        setResumeList(prevList =>
            prevList.filter((_, i) => i !== index)
        );
        setFileNames(prevNames =>
            prevNames.filter((_, i) => i !== index)
        );
    };

    useEffect(() => {
        if (resumeList.length > 0) {
            console.log("Resumes:", resumeList);
        }
    }
        , [resumeList]);

    // Analyze uploaded resumes
    const analyze = async () => {
        if (resumeList.length > 0) {
            try {
                if (rubricsWs && rubricsWs.readyState === WebSocket.OPEN) {
                    rubricsWs.send(JSON.stringify({
                        action: 'start_analysis',
                        resume_list: resumeList,
                        parameters: parameters
                    }));
                }
            } catch (error) {
                toast.error("Failed to analyze resumes");
                console.error("Analysis Error:", error);
            }
        } else {
            toast.error("No resumes uploaded");
        }
    };

    return (
        <div>
            <div className="bg-white py-4 px-8 rounded-3xl w-full md:max-w-[350px] lg:max-w-[400px] shadow-lg text-center">
                {fileUploadStatus.isUploading && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            Uploading: {fileUploadStatus.fileName}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${fileUploadStatus.progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {analysisStatus.status && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">
                            {analysisStatus.status}
                            {analysisStatus.currentFile && `: ${analysisStatus.currentFile}`}
                        </p>
                        {analysisStatus.progress !== undefined && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div
                                    className="bg-green-600 h-2.5 rounded-full"
                                    style={{ width: `${analysisStatus.progress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-center text-primary mb-2 relative top-0 text-3xl">
                    <IoDocumentAttach />
                </div>

                <div
                    className="border-dashed border-2 border-slate-500 rounded-xl p-2 flex flex-col items-center justify-center"
                >
                    <div className="text-gray-500 mt-2 text-sm">Drag & Drop or</div>
                    <label
                        htmlFor="resumeUpload"
                        className="text-gray-500 cursor-pointer text-sm"
                    >
                        Click to{" "}
                        <span className="font-semibold text-primary ">
                            Upload Resumes
                        </span>
                    </label>
                    <input
                        id="resumeUpload"
                        type="file"
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="text-4xl mt-3 text-slate-500">
                        <IoCloudUploadOutline />
                    </div>

                    <p className="text-slate-500 text-sm mt-2">
                        Supported file format: .PDF File size limit 1MB.
                    </p>
                </div>

                {/* Uploaded Resumes List */}
                {fileNames.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold mb-2">Uploaded Resumes:</h3>
                        <div className="space-y-2">
                            {fileNames.map((filename, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
                                >
                                    <span className="text-sm truncate max-w-[200px]">
                                        {filename}
                                    </span>
                                    <button
                                        onClick={() => removeResume(index)}
                                        className="text-red-500 hover:bg-red-100 rounded-full p-1"
                                    >
                                        <IoTrashOutline />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-center mt-4">
                    <button
                        onClick={analyze}
                        disabled={resumeList.length === 0}
                        className={`bg-primary text-base px-10 relative text-white font-semibold py-[6px] rounded-xl hover:bg-primary focus:ring-4 focus:ring-primary-foreground transition 
                        ${resumeList.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 inline-block mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {uploading ? "Processing..." : "Analyze Resumes"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GetEvaluate