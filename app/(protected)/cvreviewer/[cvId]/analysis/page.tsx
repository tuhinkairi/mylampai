"use client";
import { useEffect, useRef, useState, useCallback, Fragment } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";
import Image from "next/image";
import { useUserStore } from "@/utils/userStore";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import Mark from "mark.js";
import "../analysis/highlight.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchResumeAnalysis, updateResumeAnalysis } from "@/actions/resumeAnalysis";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import LoadingGlobal from "@/components/ui/loading";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams, useSearchParams } from "next/navigation";
// import { setJobDescription, setResumeFileUrl } from "@/lib/features/cv_reviewer/cvReviewerSlice";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";


const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT;

interface PDFViewerProps {
  jobDescription: string | null;
  structuredData: any;
  localResume: any;
  resumeId: string;
}

function base64ToFile(base64: string, filename: string, mimeType = "application/pdf"): File {
  const byteString = atob(base64); // decode base64
  const byteArray = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return new File([byteArray], filename, { type: mimeType });
}

const ResumeAnalyser = () => {
  const { userData } = useUserStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [reviewedData, setReviewedData] = useState<any>({}); //reviewedData state
  const [isRendered, setIsRendered] = useState(false); // Define isRendered state
  const [isTextLayerReady, setIsTextLayerReady] = useState(false);
  const [loading, setLoading] = useState(false)
  const cvReviewerStorage = useAppSelector((state) => state.cvReviewer);
  // const { resumeName, resumeUrl } = cvReviewerStorage;
  const params = useParams();
  const resumeId = params.cvId as string;
  const [sentencesToHighlight, setSentencesToHighlight] = useState<string[]>(
    []
  );
  const [cvText, setCvText] = useState<string>("")
  const [resumeBase64, setResumeBase64] = useState<string>("")
  const [structuredData, setStructuredData] = useState<any>(null)
  const [jobDescription, setJobDescription] = useState<string>("")
  const [resumeUrl, setResumeUrl] = useState<string>("")

  const dispatch = useAppDispatch()

  const [experience, setExperience] = useState<string>("FRESHER")
  const [loadingStates, setLoadingStates] = useState({
    summary: false,
    resume_score: false,
    quantification: false,
    bullet_point_length: false,
    bullet_points_improver: false,
    total_bullet_points: false,
    verb_tense: false,
    weak_verb: false,
    section_checker: false,
    skill_checker: false,
    repetition: false,
    personal_info: false,
    responsibility: false,
    spelling: false
  });

  // useEffect(() => {
  //   // console.log("sd,jp,ru:: " + JSON.stringify(structuredData) + "\nJd::" + jobDescription + "\nurl:" + resumeUrl)
  //   if (structuredData && jobDescription && resumeUrl && resumeUrl.length > 0) {
  //     // console.log("is this calling")
  //     setCvText(JSON.stringify(structuredData))
  //     // setJD(jobDescription)
  //     // setResume_Url(resumeUrl)
  //   }
  // }, [structuredData, jobDescription, resumeUrl])


  interface ResumeAnalysisResponse {
    status: number;
    data?: {
      resume?: {
        resumeFileText?: string;
        resumeUrl?: string;
      };
      jobDescription?: string;
    };
  }

  useEffect(() => {
    if (resumeId) {
      (async () => {
        const res = await fetchResumeAnalysis({ resumeId }) as ResumeAnalysisResponse;
        if (res.status === 200 && res.data && res.data.resume) {
          setStructuredData(JSON.parse(res.data.resume.resumeFileText || "") || "")
          setCvText(res.data.resume.resumeFileText || "")
          setResumeUrl(res.data.resume.resumeUrl || "")
          setJobDescription(res.data.jobDescription || "")
        }
      })()
    }
  }, [resumeId])




  useEffect(() => {
    const urlToBase64 = async (url: string) => {
      try {
        // Fetch the file from the URL
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        // Get the file as an array buffer
        const arrayBuffer = await response.arrayBuffer();

        // Convert array buffer to base64
        const base64String = btoa(
          new Uint8Array(arrayBuffer)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        return base64String;
      } catch (error) {
        console.error("Error converting URL to base64:", error);
        return null;
      }
    };
    // console.log("jdsjfkdf:: ", resume_Url)
    if (!resumeBase64 && resumeUrl) {
      const runAsync = async () => {
        const base64 = await urlToBase64(resumeUrl)
        // console.log("huuuuuuu")
        if (base64) {
          setResumeBase64(base64)
        }
      }
      runAsync()
    }
  }, [resumeUrl, resumeBase64])

  const analyzeResume = useCallback(
    async (endpoint: string, data: any, query: string) => {
      try {
        const response = await fetch(`${baseUrl}${endpoint}${query}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (response.ok) {
          return result;
        }
        return null;
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    },
    []
  );

  const highlightSentences = useCallback(
    (
      list_of_sentences: any,
      class_name: string,
      case_sensitive_flag: boolean
    ) => {
      const options_general = {
        ignorePunctuation: ":;.,-–—‒_(){}[]!'\"+=".split(""),
        separateWordSearch: false,
        accuracy: "partially" as any,
        className: class_name,
        acrossElements: true,
        caseSensitive: case_sensitive_flag,
      };

      // Ensure list_of_sentences is an array
      if (!Array.isArray(list_of_sentences)) {
        console.error(
          "Expected list_of_sentences to be an array, but got:",
          list_of_sentences
        );
        return;
      }

      list_of_sentences.forEach((sentence: string) => {
        if (typeof sentence === "string") {
          if (textLayerRef.current) {
            const normalizedSentence = sentence.trim().replace(/\s+/g, " ");
            const instance = new Mark(textLayerRef.current);
            instance.mark(normalizedSentence, options_general);
          }
        } else {
          console.warn("Skipping non-string sentence:", sentence);
        }
      });
    },
    []
  );



  const base64ToUint8Array = useCallback((base64: string): Uint8Array => {
    // Remove data URL prefix if present
    const base64Data = base64.split(",").pop();

    if (!base64Data) {
      throw new Error("Invalid base64 string");
    }

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }, []);

  const renderPDF = useCallback(async () => {
    if (!canvasRef.current) {
      console.error("Canvas reference is null.");
      return;
    }

    try {
      let loadingTask;

      // Handle either resumeBase64 or resumeUrl
      if (resumeBase64) {
        const pdfData = base64ToUint8Array(resumeBase64);
        loadingTask = pdfjsLib.getDocument({ data: pdfData });
      } else {
        console.error("No PDF source available (neither base64 nor URL)");
        return;
      }

      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions to match PDF page
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        const renderContext = {
          canvasContext: context,
          viewport,
        };
        await page.render(renderContext).promise;
      } else {
        console.error("Canvas context is null.");
      }

      // Render text layer for highlighting
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = "";
        const textContent = await page.getTextContent();
        textLayerRef.current.style.width = `${canvas.offsetWidth}px`;
        textLayerRef.current.style.height = `${canvas.offsetHeight}px`;

        const textLayer = new TextLayer({
          textContentSource: textContent,
          container: textLayerRef.current,
          viewport: viewport
        });

        await textLayer.render();
        setIsTextLayerReady(true);
      }
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  }, [resumeBase64]);

  const getColor = useCallback(
    (score: number | undefined) => {
      if (score === undefined) return "#FF0000";
      if (score < 50) return "#FF0000";
      if (score < 70) return "#FFA500";
      return "#00FF00";
    }, []
  );

  const getColorClass = useCallback(
    (score: number | undefined) => {
      if (score === undefined) return "text-red-500";
      if (score < 50) return "text-red-500";
      if (score < 70) return "text-yellow-500";
      return "text-green-500";
    }, []
  );



  useEffect(() => {
    // setLoading(true)

    if (resumeBase64 && !isRendered) {
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          renderPDF(); // Render the PDF using the resumeFile from interviewStore
          setIsRendered(true);
        }
      }, 100); // Delay to ensure the component is fully mounted

      return () => clearTimeout(timer); // Cleanup the timer
    }
    if (isTextLayerReady) {
      highlightSentences(sentencesToHighlight, "highlighted", false);
    }
  }, [isTextLayerReady, sentencesToHighlight, resumeBase64, resumeId, setLoading, highlightSentences, isRendered, renderPDF]);

  const runAnalysis = useCallback(
    async (analysisType: string) => {
      setIsTextLayerReady(false);
      let endpoint = "";
      let data: any = {};
      let query = "";
      let result: any = null;

      if (textLayerRef.current) {
        const instance = new Mark(textLayerRef.current);
        instance.unmark();
      }

      switch (analysisType) {
        case "resume_score":
          if (!reviewedData.resume_score) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, resume_score: true }));
              // console.log("call for /resume_score")
              const dbResult = await fetchResumeAnalysis({
                resumeId: resumeId,
                section: "resume_score"
              });

              if (dbResult.success && dbResult?.data?.resume_score) {
                // If data exists in DB, update the state and highlight sentences
                const resumeScoreData = dbResult.data.resume_score;

                if (resumeScoreData["Result"]) {
                  setSentencesToHighlight(resumeScoreData["Result"]);
                  highlightSentences(
                    resumeScoreData["Result"],
                    "highlighted",
                    false
                  );
                }

                setReviewedData((prevData: any) => ({
                  ...prevData,
                  resume_score: resumeScoreData
                }));
              } else {
                // If not in DB, make API call
                // console.log("resume_score not found in DB")
                endpoint = "/resume_score";
                data = {
                  cv_text: {
                    cv_text: cvText,
                  },
                  job_text: {
                    job_text: jobDescription,
                  },
                };

                // console.log("datacheck:: ", data)

                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Handle sentence highlighting
                  // console.log("resume_score: ", result.message)
                  if (result.message["Result"]) {
                    setSentencesToHighlight(result.message["Result"]);
                    highlightSentences(
                      result.message["Result"],
                      "highlighted",
                      false
                    );
                  }

                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    resume_score: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId: resumeId,
                    section: "resume_score",
                    data: result.message
                  });
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    resume_score: "not available"
                  }));
                }
              }
            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, resume_score: false }));
            }
          }
          break;
        case "resume_length":
          if (!reviewedData.resume_length) {
            endpoint = "/resume_length";
            data = {
              text: cvText,
              experience: "FRESHER",
            };
            result = await analyzeResume(endpoint, data, query);
            setReviewedData((prevData: any) => ({
              ...prevData,
              resume_length: result?.message ? result?.message : "not available",
            }));
          }
          break;
        case "analyze":
          if (!reviewedData.resume_length) {
            endpoint = "/analyze";
            data = {
              extracted_data: structuredData,
              text: cvText,
              experience: "FRESHER",
            };
            result = await analyzeResume(endpoint, data, query);
            setReviewedData((prevData: any) => ({
              ...prevData,
              resume_length: result?.message ? result?.message : "not available",
            }));
          }
          break;
        case "bullet_point_length":
          if (!reviewedData?.bullet_point_length) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, bullet_point_length: true }));
              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "bullet_point_length"
              });

              if (dbResult.success && dbResult?.data?.bullet_point_length) {
                // If data exists in DB, update state and highlight sentences
                const bulletPointData = dbResult.data.bullet_point_length;

                if (bulletPointData["Result"]) {
                  setSentencesToHighlight(bulletPointData["Result"]);
                  highlightSentences(
                    bulletPointData["Result"],
                    "highlighted",
                    false
                  );
                }

                setReviewedData((prevData: any) => ({
                  ...prevData,
                  bullet_point_length: bulletPointData
                }));
              } else {
                // If not in DB, make API call
                // console.log("bullentpoint length not found in DB ")
                endpoint = "/bullet_point_length";
                data = {
                  extracted_data: structuredData,
                };

                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Handle sentence highlighting
                  if (result.message["Result"]) {
                    setSentencesToHighlight(result.message["Result"]);
                    highlightSentences(
                      result.message["Result"],
                      "highlighted",
                      false
                    );
                  }

                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    bullet_point_length: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "bullet_point_length",
                    data: result.message
                  });
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    bullet_point_length: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, bullet_point_length: false }));
            }
          } else {
            // console.log("found bullet point length: ", reviewedData.bullet_point_length)
            setSentencesToHighlight(reviewedData.bullet_point_length.Result);
            highlightSentences(
              reviewedData.bullet_point_length,
              "highlighted",
              false
            );
          }
          break;
        case "bullet_point_improver":
          if (!reviewedData.bullet_point_improver) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, bullet_points_improver: true }));
              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "bullet_point_improver"
              });

              if (dbResult.success && dbResult?.data?.bullet_point_improver) {
                // If data exists in DB, update state and highlight sentences
                const bulletPointsImproverData = dbResult.data.bullet_point_improver;

                if ((bulletPointsImproverData as any)?.bulletPoints) {
                  (bulletPointsImproverData as any)?.bulletPoints.forEach((bulletPoint: any) => {
                    const textToHighlight = [bulletPoint.original];
                    setSentencesToHighlight((prevState) => [
                      ...prevState,
                      ...textToHighlight
                    ]);
                    highlightSentences(textToHighlight, "highlighted", false);
                  });
                }

                setReviewedData((prevData: any) => ({
                  ...prevData,
                  bullet_point_improver: bulletPointsImproverData
                }));
              } else {
                // If not in DB, make API call
                endpoint = "/bullet_points_improver";
                data = {
                  extracted_data: structuredData,
                };

                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Handle highlighting
                  if (result.message?.bulletPoints) {
                    result.message.bulletPoints.forEach((bulletPoint: any) => {
                      const textToHighlight = [bulletPoint.original];
                      setSentencesToHighlight((prevState) => [
                        ...prevState,
                        ...textToHighlight
                      ]);
                      highlightSentences(textToHighlight, "highlighted", false);
                    });
                  }

                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    bullet_point_improver: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "bullet_point_improver",
                    data: result.message
                  });
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    bullet_point_improver: "not available"
                  }));
                }
              }


            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, bullet_points_improver: false }));

            }
          } else {
            const bulletPoints = reviewedData.bullet_point_improver.bulletPoints;
            bulletPoints?.forEach((bulletPoint: any) => {
              const textToHighlight = [bulletPoint.original]; // Wrap in array
              setSentencesToHighlight((prevState) => [
                ...prevState,
                ...textToHighlight,
              ]);
              highlightSentences(textToHighlight, "highlighted", false);
            });
          }
          break;
        case "total_bullet_points":
          if (!reviewedData.total_bullet_points) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, total_bullet_points: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "total_bullet_points"
              });

              if (dbResult.success && dbResult?.data?.total_bullet_points) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  total_bullet_points: dbResult.data.total_bullet_points
                }));
              } else {
                // If not in DB, make API call
                endpoint = "/total_bullet_points";
                data = {
                  extracted_data: structuredData,
                  experience: experience
                };

                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    total_bullet_points: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "total_bullet_points",
                    data: result.message
                  });
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    total_bullet_points: "not available"
                  }));
                }
              }


            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, total_bullet_points: false }));

            }
          }
          break;
        case "personal_info":
          if (!reviewedData.personal_info) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, personal_info: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "personal_info"
              });

              if (dbResult.success && dbResult?.data?.personal_info) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  personal_info: dbResult.data.personal_info
                }));
              } else {
                // If not in DB, make API call
                endpoint = "/personal_info";
                data = {
                  extracted_data: structuredData,
                };

                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    personal_info: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "personal_info",
                    data: result.message
                  });
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    personal_info: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, personal_info: false }));

            }
          }
          break;
        case "responsibility":
          if (!reviewedData.responsibility) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, responsibility: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "responsibility"
              });

              if (dbResult.success && dbResult?.data?.responsibility) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  responsibility: dbResult.data.responsibility
                }));

                // Extract and set sentences to highlight from DB data
                const sentencesToHighlight = Object.values(
                  dbResult.data.responsibility
                ).flatMap((item: any) => item.correction);

                if (sentencesToHighlight.length > 0) {
                  setSentencesToHighlight(sentencesToHighlight);
                  highlightSentences(sentencesToHighlight, "highlighted", false);
                }
              } else {
                // If not in DB, make API call
                endpoint = "/responsibility_checker";
                data = {
                  extracted_data: structuredData,
                };
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    responsibility: result.message["mistakes"]
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "responsibility",
                    data: result.message["mistakes"]
                  });

                  // Extract and set sentences to highlight
                  const sentencesToHighlight = Object.values(
                    result.message["mistakes"]
                  ).flatMap((item: any) => item?.correction);

                  if (sentencesToHighlight.length > 0) {
                    setSentencesToHighlight(sentencesToHighlight);
                    highlightSentences(sentencesToHighlight, "highlighted", false);
                  }
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    responsibility: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, responsibility: false }));

            }
          } else {
            const sentencesToHighlight = Object.values(
              reviewedData.responsibility
            ).flatMap((item: any) => item.correction);

            if (sentencesToHighlight.length > 0) {
              setSentencesToHighlight(sentencesToHighlight);
            }
          }
          break;

        case "summary": {
          if (!reviewedData.summary) {
            // Set loading state to true at the start
            setLoadingStates(prev => ({ ...prev, summary: true }));

            try {
              // console.log("call for /summary")
              const dbResult = await fetchResumeAnalysis({
                resumeId: resumeId,
                section: ["summary", "score"]
              });

              if (dbResult.success && dbResult?.data?.summary) {
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  summary: dbResult.data.summary,
                  score: dbResult.data.score
                }));
              } else {
                // console.log("summary and score not found in DB")
                endpoint = "/summary";
                data = {
                  cv_text: cvText,
                };
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // console.log("summary: ", result.message["Summary"], "\nscore: ", result.message["Score"])
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    summary: result.message["Summary"],
                    score: result.message["Score"]
                  }));

                  await updateResumeAnalysis({
                    resumeId: resumeId,
                    section: "summary",
                    data: result.message["Summary"],
                  });

                  await updateResumeAnalysis({
                    resumeId: resumeId,
                    section: "score",
                    data: result.message["Score"]
                  });
                }
              }
            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              // Set loading state to false when done
              setLoadingStates(prev => ({ ...prev, summary: false }));
            }
          }
          break;
        }
        case "quantification_checker":
          // console.log("quantifincation: ", reviewedData.quantification)
          if (!reviewedData.quantification) {
            try {
              // First check if data exists in DB
              setLoadingStates(prev => ({ ...prev, quantification: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId: resumeId,
                section: "quantification"
              });

              if (dbResult.success && dbResult?.data?.quantification) {
                // If data exists in DB, update state and highlight sentences
                const quantificationData = dbResult.data.quantification;
                //console.log("found in db")
                if (quantificationData["Not Quantify"]) {
                  setSentencesToHighlight(quantificationData["Not Quantify"]);
                  highlightSentences(
                    quantificationData["Not Quantify"],
                    "highlighted",
                    false
                  );
                }

                setReviewedData((prevData: any) => ({
                  ...prevData,
                  quantification: quantificationData
                }));
              } else {
                // If not in DB, make API call
                // console.log("quantification is not found in DB")
                endpoint = "/quantification";
                data = {
                  extracted_data: structuredData,
                };
                // console.log("body::", data)
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  //console.log("result:::", result)
                  // Handle sentence highlighting
                  if (result.message["Not Quantify"]) {
                    setSentencesToHighlight(result.message["Not Quantify"]);
                    highlightSentences(
                      result.message["Not Quantify"],
                      "highlighted",
                      false
                    );
                  }

                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    quantification: JSON.parse(result.message)
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId: resumeId,
                    section: "quantification",
                    data: JSON.parse(result.message)
                  });
                }
              }
            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, quantification: false }));
            }
          } else {
            // console.log(
            //   "Sentences to highlight:",
            //   reviewedData.quantification["Not Quantify"]
            // )
            setSentencesToHighlight(
              reviewedData.quantification["Not Quantify"]
            );
            highlightSentences(
              reviewedData.quantification["Not Quantify"],
              "highlighted",
              false
            );
          }
          break;

        case "verb_tense_checker":
          if (!reviewedData.verbtense) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, verb_tense: true }));
              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "verbtense"
              });

              if (dbResult.success && dbResult?.data?.verbtense) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  verbtense: dbResult.data.verbtense
                }));


                // Extract and set sentences to highlight from DB data
                const sentencesToHighlight = Object.values(
                  dbResult.data.verbtense
                ).flatMap((item: any) => item.correction);

                if (sentencesToHighlight.length > 0) {
                  setSentencesToHighlight(sentencesToHighlight);
                  highlightSentences(sentencesToHighlight, "highlighted", false);
                }
              } else {
                // If not in DB, make API call
                endpoint = "/verb_tense_checker";
                data = {
                  extracted_data: structuredData,
                };
                query = "";
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    verbtense: result.message["mistakes"]
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "verbtense",
                    data: result.message["mistakes"]
                  });

                  // Extract and set sentences to highlight
                  const sentencesToHighlight = Object.values(
                    result.message["mistakes"]
                  ).flatMap((item: any) => item.correction);

                  if (sentencesToHighlight.length > 0) {
                    setSentencesToHighlight(sentencesToHighlight);
                    highlightSentences(sentencesToHighlight, "highlighted", false);
                  }
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    verbtense: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, verb_tense: false }));

            }
          } else {
            const sentencesToHighlight = Object.values(
              reviewedData.verbtense
            ).flatMap((item: any) => item.correction);

            if (sentencesToHighlight.length > 0) {
              //console.log("debug in verb_: ", JSON.stringify(reviewedData.verbtense))
              setSentencesToHighlight(sentencesToHighlight);
              highlightSentences(sentencesToHighlight, "highlighted", false);
            }
          }
          break;
        case "weak_verb_checker":
          if (!reviewedData.verbstrength) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, weak_verb: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "verbstrength"
              });

              if (dbResult.success && dbResult?.data?.verbstrength) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  verbstrength: dbResult.data.verbstrength
                }));

                // Extract and set sentences to highlight from DB data
                const sentencesToHighlight = Object.keys(
                  dbResult.data.verbstrength
                );

                if (sentencesToHighlight.length > 0) {
                  setSentencesToHighlight(sentencesToHighlight);
                  highlightSentences(sentencesToHighlight, "highlighted", false);
                } else {
                  console.error("No sentences to highlight found.");
                }
              } else {
                // If not in DB, make API call
                endpoint = "/weak_verb_checker";
                data = {
                  extracted_data: structuredData,
                };
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    verbstrength: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "verbstrength",
                    data: result.message
                  });

                  // Extract and set sentences to highlight
                  const sentencesToHighlight = Object.keys(result.message);

                  if (sentencesToHighlight.length > 0) {
                    setSentencesToHighlight(sentencesToHighlight);
                    highlightSentences(sentencesToHighlight, "highlighted", false);
                  } else {
                    console.error("No sentences to highlight found.");
                  }
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    verbstrength: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, weak_verb: false }));

            }
          } else {
            const sentencesToHighlight = Object.keys(
              reviewedData.verbstrength
            );

            if (sentencesToHighlight.length > 0) {
              setSentencesToHighlight(sentencesToHighlight);
              highlightSentences(sentencesToHighlight, "highlighted", false);
            }
          }
          break;
        case "section_checker":
          if (!reviewedData.sectionanalysis) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, section_checker: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "sectionanalysis"
              });

              if (dbResult.success && dbResult?.data?.sectionanalysis) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  sectionanalysis: dbResult.data.sectionanalysis
                }));
              } else {
                // If not in DB, make API call
                endpoint = "/section_checker";
                data = {
                  extracted_data: structuredData,
                };
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    sectionanalysis: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "sectionanalysis",
                    data: result.message
                  });

                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    sectionanalysis: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, section_checker: false }));

            }
          }
          break;
        case "skill_checker":
          if (!reviewedData?.skillsassessment) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, skill_checker: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "skillsassessment"
              });

              if (dbResult.success && dbResult?.data?.skillsassessment) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  skillsassessment: dbResult.data.skillsassessment
                }));

                // Handle highlighting for hard skills
                const hardSkills = (dbResult.data.skillsassessment as any).HARD;
                if (hardSkills?.length > 0) {
                  setSentencesToHighlight(hardSkills);
                  highlightSentences(hardSkills, "highlighted", false);
                }

                // Handle highlighting for soft skills
                const softSkills = (dbResult.data.skillsassessment as any).SOFT;
                if (softSkills?.length > 0) {
                  setSentencesToHighlight(softSkills);
                  highlightSentences(softSkills, "highlighted", false);
                }
              } else {
                // If not in DB, make API call
                endpoint = "/skill_checker";
                data = {
                  extracted_data: structuredData,
                  profile: jobDescription
                };
                query = '';
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    skillsassessment: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "skillsassessment",
                    data: result.message
                  });

                  // Handle highlighting for hard skills
                  if (result.message?.["HARD"]) {
                    setSentencesToHighlight(result.message["HARD"]);
                    highlightSentences(result.message["HARD"], "highlighted", false);
                  }

                  // Handle highlighting for soft skills
                  if (result.message?.["SOFT"]) {
                    setSentencesToHighlight(result.message["SOFT"]);
                    highlightSentences(result.message["SOFT"], "highlighted", false);
                  }
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    skillsassessment: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, skill_checker: false }));

            }
          } else {
            const hardSkills = reviewedData?.skillsassessment.HARD;
            const softSkills = reviewedData?.skillsassessment.SOFT;

            if (hardSkills.length > 0) {
              setSentencesToHighlight(hardSkills);
              highlightSentences(hardSkills, "highlighted", false);
            }
            if (softSkills.length > 0) {
              setSentencesToHighlight(softSkills);
              highlightSentences(softSkills, "highlighted", false);
            }
          }
          break;
        case "repetition_checker":
          if (!reviewedData.repetition) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, repetition: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "repetition"
              });

              if (dbResult.success && dbResult?.data?.repetition) {
                // If data exists in DB, update state
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  repetition: dbResult.data.repetition
                }));

                // Extract and set sentences to highlight from DB data
                const sentencesToHighlight = Object.values(
                  dbResult.data.repetition
                ).flatMap((item: any) => item.text);

                if (sentencesToHighlight.length > 0) {
                  setSentencesToHighlight(sentencesToHighlight);
                  highlightSentences(sentencesToHighlight, "highlighted", false);
                }
              } else {
                // If not in DB, make API call
                endpoint = "/repetition_checker";
                data = {
                  extracted_data: structuredData,
                };
                query = "";
                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
                  // Update state
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    repetition: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "repetition",
                    data: result.message
                  });

                  // Extract and set sentences to highlight
                  const sentencesToHighlight = Object.values(
                    result.message
                  ).flatMap((item: any) => item.text);

                  if (sentencesToHighlight.length > 0) {
                    setSentencesToHighlight(sentencesToHighlight);
                    highlightSentences(sentencesToHighlight, "highlighted", false);
                  }
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    repetition: "not available"
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, repetition: false }));

            }
          } else {
            const sentencesToHighlight = Object.values(
              reviewedData.repetition
            ).flatMap((item: any) => item.text);

            if (sentencesToHighlight.length > 0) {
              setSentencesToHighlight(sentencesToHighlight);
            }
          }
          break;

        case "spelling_checker":
          if (!reviewedData.spellingerrors) {
            // First check if data exists in DB
            try {
              setLoadingStates(prev => ({ ...prev, spelling: true }));

              const dbResult = await fetchResumeAnalysis({
                resumeId,
                section: "spellingerrors"
              });

              if (dbResult.success && dbResult?.data?.spellingerrors) {
                // If data exists in DB, update states
                setSentencesToHighlight(dbResult.data.spellingerrors["Result"]);
                highlightSentences(
                  dbResult.data.spellingerrors["Result"],
                  "highlighted",
                  false
                );
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  spellingerrors: dbResult.data.spellingerrors
                }));
              } else {
                // If not in DB, make API call
                endpoint = "/spelling_checker";
                data = {
                  extracted_data: structuredData,
                };

                result = await analyzeResume(endpoint, data, query);

                if (result?.message?.["Result"]) {
                  // Update states
                  setSentencesToHighlight(result.message["Result"]);
                  highlightSentences(
                    result.message["Result"],
                    "highlighted",
                    false
                  );
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    spellingerrors: result.message
                  }));

                  // Store in DB for future use
                  await updateResumeAnalysis({
                    resumeId,
                    section: "spellingerrors",
                    data: result.message
                  });
                } else {
                  // Handle case where API returns no message
                  setReviewedData((prevData: any) => ({
                    ...prevData,
                    spellingerrors: { Result: [] }
                  }));
                }
              }

            } catch (error) {
              console.error(`Error fetching ${analysisType}:`, error);
            } finally {
              setLoadingStates(prev => ({ ...prev, spelling: false }));
            }
          } else {
            setSentencesToHighlight(reviewedData.spellingerrors.Result);
          }
          break;
        default:
          //console.log("Unknown analysis type");
          return;

      }
      setIsTextLayerReady(true);
      // console.log("lorem", reviewedData)
    },
    [structuredData, cvText, jobDescription, reviewedData, analyzeResume, resumeId, experience, highlightSentences]
  );




  const isFirstRender = useRef(true);

  useEffect(() => {
    let isMounted = true;

    const runInitialAnalysis = async () => {
      if (!isMounted || !isFirstRender.current) return;
      isFirstRender.current = false;

      try {
        if (isMounted) {
          // Run both analyses in parallel
          await Promise.all([
            runAnalysis("summary"),
            runAnalysis("resume_score")
          ]);
        }
      } catch (error) {
        console.error("Analysis error:", error);
      }
    };

    if (cvText && jobDescription) {
      runInitialAnalysis();
    } else {
      // console.log("not run::", cvText, "\n\n ", jobDescription)
    }
    return () => {
      isMounted = false;
    };
  }, [runAnalysis, cvText, jobDescription]);

  return (
    <div className="flex h-full justify-between bg-primary-foreground items-stretch gap-2 px-2 pl-0">
      {loading ? <LoadingGlobal text={"Analysis"} /> : (
        <>
          <div className="flex flex-col h-screen max-w-[70%]">
            <div
              className="w-full  bg-[#fafafa] rounded-lg flex mt-1 ml-1 flex-row items-center justify-between gap-2 "
              style={{
                boxShadow: "0px 0px 15px -5px rgba(0, 0, 0, 0.3)",
              }}
            >
              {loadingStates.summary ? (
                <div className="flex items-center w-[30%] p-6 justify-center">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Loading Score...</span>
                </div>) : (
                <div
                  className={`w-[30%] p-6 text-[1.6rem] font-semibold ${getColorClass(
                    reviewedData?.score
                  )} rounded-lg`}
                >
                  <CircularProgressbarWithChildren
                    strokeWidth={4}
                    value={
                      reviewedData?.score
                        ? reviewedData?.score.toFixed(1)
                        : 0
                    }
                    styles={{
                      path: {
                        stroke: getColor(reviewedData?.score),
                        strokeLinecap: "round",
                      },
                    }}
                  >
                    {reviewedData?.score &&
                      reviewedData?.score.toFixed(0)}
                  </CircularProgressbarWithChildren>
                </div>)
              }
              <div className="h-full flex flex-col justify-center p-2 rounded-lg flex-grow">
                <h2 className="text-lg font-semibold">Resume Evaluation</h2>
                <div className="h-[1px] bg-slate-300 w-full mb-1"></div>
                <div className="flex flex-col w-full">
                  {/* Hard Skills Section */}
                  <div className="flex items-center hover:bg-slate-200 duration-300 py-1 px-4 relative group rounded-md cursor-pointer">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-row">
                            <span className="font-medium">Hard Skill:</span>
                            {loadingStates.resume_score ? (
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin ml-2" />
                            ) : (
                              <span
                                className={`ml-2 ${getColorClass(
                                  reviewedData?.resume_score?.DETAILS?.HARD_SKILLS_SCORE?.score
                                )}`}
                              >
                                {reviewedData?.resume_score?.DETAILS?.HARD_SKILLS_SCORE?.score ??
                                  "N/A"}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="py-3" side="right" sideOffset={5}>
                          <div className="space-y-1">
                            <p className="text-[13px] font-medium">Hard Skill</p>
                            <p className="text-xs">
                              {reviewedData?.resume_score?.DETAILS?.HARD_SKILLS_SCORE
                                ?.reason ?? "No details available"}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Soft Skills Section */}
                  <div className="flex items-center hover:bg-slate-200 duration-300 py-1 px-4 relative group rounded-md cursor-pointer">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-row">
                            <span className="font-medium">Soft Skill:</span>
                            {loadingStates.resume_score ? (
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin ml-2" />
                            ) : (
                              <span
                                className={`ml-2 ${getColorClass(
                                  reviewedData?.resume_score?.DETAILS?.SOFT_SKILLS_SCORE?.score
                                )}`}
                              >
                                {reviewedData?.resume_score?.DETAILS?.SOFT_SKILLS_SCORE?.score ??
                                  "N/A"}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="py-3" side="right" sideOffset={5}>
                          <div className="space-y-1">
                            <p className="text-[13px] font-medium">Soft Skill</p>
                            <p className="text-xs">
                              {reviewedData?.resume_score?.DETAILS?.SOFT_SKILLS_SCORE
                                ?.reason ?? "No details available"}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Experience Section */}
                  <div className="flex items-center hover:bg-slate-200 duration-300 py-1 px-4 relative group rounded-md cursor-pointer">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-row">
                            <span className="font-medium">Experience:</span>
                            {loadingStates.resume_score ? (
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin ml-2" />
                            ) : (
                              <span
                                className={`ml-2 ${getColorClass(
                                  reviewedData?.resume_score?.DETAILS?.EXPERIENCE_SCORE?.score
                                )}`}
                              >
                                {reviewedData?.resume_score?.DETAILS?.EXPERIENCE_SCORE?.score ??
                                  "N/A"}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="py-3" side="right" sideOffset={5}>
                          <div className="space-y-1">
                            <p className="text-[13px] font-medium">Experience</p>
                            <p className="text-xs">
                              {reviewedData?.resume_score?.DETAILS?.EXPERIENCE_SCORE
                                ?.reason ?? "No details available"}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Education Section */}
                  <div className="flex items-center hover:bg-slate-200 duration-300 py-1 px-4 relative group rounded-md cursor-pointer">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-row">
                            <span className="font-medium">Education:</span>
                            {loadingStates.resume_score ? (
                              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin ml-2" />
                            ) : (
                              <span
                                className={`ml-2 ${getColorClass(
                                  reviewedData?.resume_score?.DETAILS?.EDUCATION_SCORE?.score
                                )}`}
                              >
                                {reviewedData?.resume_score?.DETAILS?.EDUCATION_SCORE?.score ??
                                  "N/A"}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="py-3" side="right" sideOffset={5}>
                          <div className="space-y-1">
                            <p className="text-[13px] font-medium">Education</p>
                            <p className="text-xs">
                              {reviewedData?.resume_score?.DETAILS?.EDUCATION_SCORE?.reason ??
                                "No details available"}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* No data message */}
                  {!reviewedData?.resume_score && (
                    <div className="text-sm text-gray-500">
                      Scores are not available at the moment.{" "}
                      <button
                        className="underline hover:text-primary"
                      >
                        Please try again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full px-2 py-4 rounded-lg h-[calc(100vh-40px)] overflow-auto scrollbar-hide text-[#202020] ">
              <div>
                <h3 className="text-lg text-primary font-bold text-[#666]">
                  Hello, {userData?.name?.trim().split(" ")[0] || "User"}!
                </h3>
                <p className="pl-2 text-[#888] font-semibold text-sm">
                  Click on different parameters to get detailed analysis
                </p>
                <h2 className="text-xl font-bold mt-2">Summary</h2>
                <Dialog>
                  <DialogTrigger className="px-4 py-2 bg-white shadow rounded-lg " asChild>
                    <button className="w-full px-4 py-2 bg-white shadow rounded-lg text-left mt-2 hover:bg-gray-50 transition-colors">
                      {loadingStates.summary ? (
                        <div className="flex items-center justify-center space-x-2 h-[60px]">
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gray-500">Loading summary...</span>
                        </div>
                      ) : (
                        <div className="line-clamp-3 rounded-lg text-left text-sm font-medium text-gray-800">
                          {reviewedData?.summary || "No summary available"}
                        </div>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Summary</DialogTitle>
                      <div className="mt-2 text-sm text-gray-700">
                        {reviewedData?.summary || "No summary available"}
                      </div>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              <div>
                <h2 className="text-xl font-bold h-full">Fixes or Corrections</h2>
                <div className="flex flex-wrap justify-between bg-[#fafafa] shadow rounded-lg items-start gap-y-4 gap-x-2 p-4 ">
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.quantification}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.quantification && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.quantification && runAnalysis("quantification_checker")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.quantification && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/2.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className={cn(
                            "-translate-y-5",
                            loadingStates.quantification && "opacity-50"
                          )}
                        />
                        <div
                          className={cn(
                            "absolute top-[70px] w-full text-sm px-3",
                            loadingStates.quantification && "opacity-50"
                          )}
                        >
                          Quantification Checker
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.quantification && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle>Quantification Checker</DialogTitle>
                          <DialogDescription className="">
                            <Accordion type="single" collapsible>
                              <AccordionItem value={`item-1`}>
                                {reviewedData?.quantification && (
                                  <AccordionTrigger>
                                    Needs Quantification
                                  </AccordionTrigger>
                                )}
                                {reviewedData?.quantification &&
                                  reviewedData?.quantification["Not Quantify"]?.map((data: string, index: number) => {
                                    return (
                                      <AccordionContent key={index}>
                                        {data}
                                      </AccordionContent>
                                    );
                                  })}
                              </AccordionItem>
                              <AccordionItem value={`item-2`}>
                                {reviewedData?.quantification && (
                                  <AccordionTrigger>Quantified</AccordionTrigger>
                                )}
                                {reviewedData?.quantification ?
                                  reviewedData?.quantification["Quantify"]?.map((data: string, index: number) => {
                                    return (
                                      <AccordionContent key={index}>
                                        {data}
                                      </AccordionContent>
                                    );
                                  }) : (<AccordionContent key={"N/A"}>
                                    N/A
                                  </AccordionContent>)}
                              </AccordionItem>
                            </Accordion>
                          </DialogDescription>

                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.bullet_point_length}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.bullet_point_length && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.bullet_point_length &&
                        runAnalysis("bullet_point_length")
                      }
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.bullet_point_length && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/3.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Bullet Point Length
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.bullet_point_length && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle>Bullet Point Length</DialogTitle>
                          <DialogDescription>
                            {reviewedData?.bullet_point_length &&
                              reviewedData?.bullet_point_length["Result"]?.length !== 0 ? (
                              reviewedData?.bullet_point_length["Result"]?.map(
                                (data: string, ind: number) => {
                                  return <div key={ind}>{data}</div>;
                                }
                              )
                            ) : (
                              <div>Nothing to Show</div>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.bullet_points_improver}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.bullet_points_improver && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.bullet_points_improver && runAnalysis("bullet_point_improver")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.bullet_points_improver && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/4.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Bullet Points Improver
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.bullet_points_improver && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle> Bullet Points Improver </DialogTitle>
                          <DialogDescription>
                            <Accordion type="single" collapsible>
                              {reviewedData?.bullet_point_improver &&
                                reviewedData?.bullet_point_improver?.bulletPoints?.map(
                                  // reviewedData?.bullet_point_improver?.map(
                                  (value: any, ind: number) => (
                                    <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                      {value ?
                                        (<>
                                          <AccordionTrigger className="text-left">
                                            Original: {value.original}
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            Improved: {value.improved}
                                          </AccordionContent>
                                        </>) : (<h1>data not found</h1>)
                                      }
                                    </AccordionItem>
                                  )
                                )}
                            </Accordion>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.total_bullet_points}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.total_bullet_points && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.total_bullet_points && runAnalysis("total_bullet_points")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.total_bullet_points && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/5.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Total Bullet Points
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.total_bullet_points && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle> Total Bullet Points </DialogTitle>
                          <div>
                            {reviewedData?.total_bullet_points ?
                              reviewedData?.total_bullet_points.Result : "Nothing to show"}
                          </div>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.verb_tense}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.verb_tense && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.verb_tense && runAnalysis("verb_tense_checker")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.verb_tense && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/6.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Verb Tense Checker
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.verb_tense && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle>Verb Tense Checker</DialogTitle>
                          <DialogDescription>
                            <Accordion type="single" collapsible>
                              {reviewedData?.verbtense && (
                                <div>
                                  {Object.keys(reviewedData?.verbtense).map((key, ind) => (
                                    <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                      <AccordionTrigger className="text-left">
                                        {key}
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="mb-2">
                                          <span className="font-semibold">Correction:</span>{" "}
                                          {reviewedData.verbtense[key].correction}
                                        </div>
                                        <div className="mb-2">
                                          <span className="font-semibold">Reason:</span>{" "}
                                          {reviewedData.verbtense[key].reason}
                                        </div>
                                        <div>
                                          <span className="font-semibold">Impact:</span>{" "}
                                          {reviewedData.verbtense[key].impact}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </div>
                              )}
                            </Accordion>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.weak_verb}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.weak_verb && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.weak_verb && runAnalysis("weak_verb_checker")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.weak_verb && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/7.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Weak Verb Checker
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.weak_verb && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle> Weak Verb Checker </DialogTitle>
                          <DialogDescription>
                            <Accordion type="single" collapsible>
                              {reviewedData?.verbstrength &&
                                Object.keys(reviewedData?.verbstrength).map(
                                  (key, ind: number) => (
                                    <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                      <AccordionTrigger className="text-left">
                                        {key}
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {reviewedData?.verbstrength[key].join(", ")}
                                      </AccordionContent>
                                    </AccordionItem>
                                  )
                                )}
                            </Accordion>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.section_checker}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.section_checker && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.section_checker && runAnalysis("section_checker")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.section_checker && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/8.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Section Checker
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.section_checker && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle> Section Checker </DialogTitle>
                          <DialogDescription>
                            <Accordion type="single" collapsible>
                              {reviewedData?.sectionanalysis &&
                                Object.keys(reviewedData?.sectionanalysis).map(
                                  (key, ind: number) => (
                                    <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                      <AccordionTrigger className="text-left">
                                        {key}
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {reviewedData?.sectionanalysis[key]}
                                      </AccordionContent>
                                    </AccordionItem>
                                  )
                                )}
                            </Accordion>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.skill_checker}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.skill_checker && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.skill_checker && runAnalysis("skill_checker")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.skill_checker && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/9.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Skill Checker
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.skill_checker && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle> Skill Checker </DialogTitle>
                          <DialogDescription>
                            <Accordion type="single" collapsible>
                              {reviewedData?.skillsassessment &&
                                Object.keys(reviewedData?.skillsassessment).map(
                                  (key, ind: number) => (
                                    <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                      <AccordionTrigger className="text-left">
                                        {key}
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {reviewedData?.skillsassessment[key].join(", ")}
                                      </AccordionContent>
                                    </AccordionItem>
                                  )
                                )}
                            </Accordion>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.repetition}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.repetition && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.repetition && runAnalysis("repetition_checker")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.repetition && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/10.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Repetition Checker
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.repetition && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle> Repetition Checker </DialogTitle>
                          <DialogDescription>
                            <Accordion type="single" collapsible>
                              {reviewedData?.repetition &&
                                Object.keys(reviewedData?.repetition).map(
                                  (key, ind: number) => (
                                    <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                      {Object.keys(reviewedData?.repetition[key])?.map((key1, ind1: number) => {
                                        return (
                                          <Fragment key={ind1 + key1}>
                                            <AccordionTrigger key={ind1 + key1} className="text-left">
                                              {key1}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                              {reviewedData?.repetition[key][key1]}
                                            </AccordionContent>
                                          </Fragment>
                                        );
                                      }
                                      )}

                                    </AccordionItem>
                                  )
                                )}
                            </Accordion>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.personal_info}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.personal_info && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.personal_info && runAnalysis("personal_info")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.personal_info && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/11.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Personal Info
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.personal_info && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogTitle> Personal Info </DialogTitle>
                        <DialogDescription>
                          <Accordion type="single" collapsible>
                            {reviewedData?.personal_info &&
                              Object.keys(reviewedData?.personal_info).length > 0 && Object.keys(reviewedData?.personal_info).map(
                                (key, ind: number) => (
                                  <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                    <AccordionTrigger className="text-left">
                                      {key}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      {reviewedData?.personal_info[key]}
                                    </AccordionContent>
                                  </AccordionItem>
                                )
                              )
                            }
                          </Accordion>


                        </DialogDescription>
                        {
                          reviewedData?.personal_info && Object.keys(reviewedData?.personal_info).length == 0 && "There no irrelevant or problematic information found"
                        }
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.responsibility}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.responsibility && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.responsibility && runAnalysis("responsibility")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.responsibility && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/12.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Responsibilty
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.responsibility && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          {/* this section update the data in future */}
                          <DialogTitle> Responsibility Checker </DialogTitle>
                          <DialogDescription>
                            <Accordion type="single" collapsible>
                              {reviewedData?.responsibility &&
                                Object.keys(reviewedData?.responsibility).map(
                                  (key, ind: number) => (
                                    <AccordionItem value={`item-${ind + 1}`} key={ind}>
                                      {!key ? <h1>data not found</h1> :
                                        <>
                                          <AccordionTrigger className="text-left">
                                            {key}
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            Correction:{" "}
                                            {
                                              reviewedData?.responsibility[key]
                                                .correction
                                            }
                                          </AccordionContent>
                                          <AccordionContent>
                                            Reason:{" "}
                                            {
                                              reviewedData?.responsibility[key]
                                                .reason
                                            }
                                          </AccordionContent>
                                        </>
                                      }
                                    </AccordionItem>
                                  )
                                )}
                            </Accordion>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>)}
                  </Dialog>
                  <Dialog>
                    <DialogTrigger
                      disabled={loadingStates.spelling}
                      className={cn(
                        "max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px]",
                        "flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center",
                        loadingStates.spelling && "bg-transparent relative"
                      )}
                      onClick={() => !loadingStates.spelling && runAnalysis("spelling_checker")}
                    >
                      <div className="flex items-center justify-center flex-col">
                        {loadingStates.spelling && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary">
                            <Spinner className="text-orange-500" size={"medium"} />
                          </div>
                        )}
                        <Image
                          src="/cvreviewer/13.svg"
                          height={30}
                          width={30}
                          alt="icon"
                          className="-translate-y-5"
                        ></Image>
                        <div className="absolute top-[70px] w-full text-sm px-3 ">
                          {" "}
                          Spelling Checker
                        </div>
                      </div>
                    </DialogTrigger>
                    {!loadingStates.spelling && (
                      <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                        <DialogHeader>
                          <DialogTitle>Spelling Checker</DialogTitle>
                          <DialogDescription>
                            <div>
                              {reviewedData?.spellingerrors?.Statistics && (
                                <div className="mb-4 p-3 bg-gray-100 rounded-md">
                                  <p className="font-medium">Summary</p>
                                  <p>Total Words: {reviewedData.spellingerrors.Statistics.totalWords}</p>
                                  <p>Unique Words: {reviewedData.spellingerrors.Statistics.uniqueWords}</p>
                                  <p>Potential Misspellings: {reviewedData.spellingerrors.Statistics.misspellings}</p>
                                  <p>Score: {reviewedData.spellingerrors.Score}/100</p>
                                </div>
                              )}

                              {reviewedData?.spellingerrors && reviewedData?.spellingerrors["Result"]?.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                  {reviewedData.spellingerrors.Result.map((ele: any, index: number) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                      <AccordionTrigger className="text-left">
                                        <span className="font-medium text-red-500">{ele.word}</span> - found in:{ele.context}
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="pl-2 border-l-2 border-gray-200">
                                          <p className="mb-2 font-medium">Suggested corrections:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {ele.suggestions.map((suggestion: string, idx: number) => (
                                              <span
                                                key={idx}
                                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 cursor-pointer"
                                              >
                                                {suggestion}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              ) : (
                                <p className="text-green-600 font-medium">No spelling errors detected!</p>
                              )}
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </>
      )
      }
      <div className=" py-1">
        <div
          className="pdf-viewer-container shadow-lg rounded-md  overflow-hidden"
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          <div
            className="h-screen max-w-[595px] overflow-auto scrollbar-hide"
            style={{ position: "relative", width: "100%" }}
          >
            <canvas ref={canvasRef} className={"pdfCanvas "} />
            <div ref={textLayerRef} className={"textLayer"} />
          </div>
        </div>
      </div>
    </div >
  );
};

export default ResumeAnalyser;
