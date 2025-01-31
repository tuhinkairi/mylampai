"use client";
// fetch nessesary details first from the apis then load to the db
import { useEffect, useRef, useState, useCallback } from "react";
import { useInterviewStore } from "@/utils/store";
import * as pdfjsLib from "pdfjs-dist/webpack";
import Image from "next/image";
import { useUserStore } from "@/utils/userStore";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import Mark from "mark.js";
import "./highlight.css";
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

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const baseUrl = process.env.NEXT_PUBLIC_RESUME_API_ENDPOINT;

interface PDFViewerProps {
  profile: string | null;
  structuredData: any;
  localResume: any;
  cvId: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ profile, cvId }) => {
  const { userData } = useUserStore();
  const { extractedText, structuredData, resumeFile, resumeId } = useInterviewStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [reviewedData, setReviewedData] = useState<any>({}); //reviewedData state
  const [isRendered, setIsRendered] = useState(false); // Define isRendered state
  const [isTextLayerReady, setIsTextLayerReady] = useState(false);
  const [loading, setLoading] = useState(false)

  const [sentencesToHighlight, setSentencesToHighlight] = useState<string[]>(
    []
  );
  const { token } = useUserStore();
  const [experience, setExperience] = useState<string>("FRESHER")

  // fetch resume analysis data via id from db and then update the reviewedData state 
  // console.log("\ncvId: ", cvId, "\nprofile:: ", profile)

  const fetchResumeAnalysis2 = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/interviewer/fetchAnalysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: resumeId }),
      });
      const result = await response.json();
      console.log("result in 3rd step:: ", result)
      if (response.ok) {
        setReviewedData((data: any) => ({ ...data, ...result }));
        console.log("reviewedData:: ", reviewedData);
      } else {
        console.error("Failed to fetch resume analysis:", result);
      }
    } catch (error) {
      console.error("Error fetching resume analysis:", error);
    }
  };

  // const runAnalysis = (data: string) => {
  //   console.log(data)
  // }
  const analyzeResume = useCallback(
    async (endpoint: string, data: any, query: string) => {
      setLoading(true)
      // console.log("data here", data)
      try {
        const response = await fetch(`${baseUrl}${endpoint}${query}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        // console.log("result here", result)
        if (response.ok) {

          setLoading(false)
          return result;
        }
        setLoading(false)
        return null;
      } catch (error) {
        setLoading(false)
        console.error("Error:", error);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    console.log("reviewed Data:: ", reviewedData)
  }, [reviewedData])

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
            console.log("call for /resume_score")
            const dbResult = await fetchResumeAnalysis({
              cvId: cvId,
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
              console.log("resume_score not found in DB")
              endpoint = "/resume_score";
              data = {
                cv_text: {
                  cv_text: extractedText,
                },
                job_text: {
                  job_text: profile,
                },
              };

              result = await analyzeResume(endpoint, data, query);

              if (result?.message) {
                // Handle sentence highlighting
                console.log("resume_score: ", result.message)
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
                  cvId: cvId,
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
          }
          break;
        case "resume_length":
          if (!reviewedData.resume_length) {
            endpoint = "/resume_length";
            data = {
              text: extractedText,
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
              text: extractedText,
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
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
              console.log("bullentpoint length not found in DB ")
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
                  cvId,
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
          } else {
            console.log("found bullet point length: ", reviewedData.bullet_point_length)
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
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
          }
          break;
        case "personal_info":
          if (!reviewedData.personal_info) {
            // First check if data exists in DB
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
              console.log(structuredData);
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
                  cvId,
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
          }
          break;
        case "responsibility":
          if (!reviewedData.responsibility) {
            // First check if data exists in DB
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
          } else {
            const sentencesToHighlight = Object.values(
              reviewedData.responsibility
            ).flatMap((item: any) => item.correction);

            if (sentencesToHighlight.length > 0) {
              setSentencesToHighlight(sentencesToHighlight);
            }
          }
          break;

        case "summary":
          if (!reviewedData.summary) {
            // First check if data exists in DB
            console.log("call for /summary")
            const dbResult = await fetchResumeAnalysis({
              cvId: cvId, // Ensure you have access to the current CV ID
              section: ["summary", "score"]
            });

            if (dbResult.success && dbResult?.data?.summary) {
              // If data exists in DB, update the state
              setReviewedData((prevData: any) => ({
                ...prevData,
                summary: dbResult.data.summary,
                score: dbResult.data.score
              }));
            } else {
              // If not in DB, make API call and store result
              console.log("summary and score not found in DB")
              endpoint = "/summary";
              data = {
                cv_text: extractedText,
              };

              result = await analyzeResume(endpoint, data, query);

              if (result?.message) {
                // Update state with new data
                console.log("summary: ", result.message["Summary"], "\nscore: ", result.message["Score"])
                setReviewedData((prevData: any) => ({
                  ...prevData,
                  summary: result.message["Summary"],
                  score: result.message["Score"]
                }));

                // Store in DB for future use
                await updateResumeAnalysis({
                  cvId: cvId,
                  section: "summary",
                  data: result.message["Summary"]
                });

                // Store score separately
                await updateResumeAnalysis({
                  cvId: cvId,
                  section: "score",
                  data: result.message["Score"]
                });
              }
            }
          }
          break;
        case "quantification_checker":
          // console.log("quantifincation: ", reviewedData.quantification)
          if (!reviewedData.quantification) {
            try {
              // First check if data exists in DB
              const dbResult = await fetchResumeAnalysis({
                cvId: cvId,
                section: "quantification"
              });

              if (dbResult.success && dbResult?.data?.quantification) {
                // If data exists in DB, update state and highlight sentences
                const quantificationData = dbResult.data.quantification;

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
                console.log("quantification is not found in DB")
                endpoint = "/quantification";
                data = {
                  extracted_data: structuredData,
                };

                result = await analyzeResume(endpoint, data, query);

                if (result?.message) {
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
                    cvId: cvId,
                    section: "quantification",
                    data: JSON.parse(result.message)
                  });
                }
              }
            } catch (error) {
              console.error("Error processing quantification analysis:", error);
              // Optionally show error to user through your notification system
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
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
          } else {
            const sentencesToHighlight = Object.values(
              reviewedData.verbtense
            ).flatMap((item: any) => item.correction);

            
            if (sentencesToHighlight.length > 0) {
              console.log("debug in verb_: ",sentencesToHighlight)
              setSentencesToHighlight(sentencesToHighlight);
              highlightSentences(sentencesToHighlight, "highlighted", false);
            }
          }
          break;
        case "weak_verb_checker":
          if (!reviewedData.verbstrength) {
            // First check if data exists in DB
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
          }
          break;
        case "skill_checker":
          if (!reviewedData?.skillsassessment) {
            // First check if data exists in DB
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                profile: profile
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
                  cvId,
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
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
            const dbResult = await fetchResumeAnalysis({
              cvId,
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
                  cvId,
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
    [structuredData, extractedText, profile, reviewedData]
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
    if (!resumeFile || !canvasRef.current) {
      console.error("Canvas reference is null or resumeFile is not set.");
      return;
    }
    try {
      const pdfData = base64ToUint8Array(resumeFile);
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      await page.render(renderContext).promise;

      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = "";

        const textContent = await page.getTextContent();
        textLayerRef.current.style.width = `${canvas.offsetWidth}px`;
        textLayerRef.current.style.height = `${canvas.offsetHeight}px`;

        await pdfjsLib.renderTextLayer({
          textContent: textContent,
          container: textLayerRef.current,
          viewport: viewport,
          textDivs: [],
        }).promise;

        setIsTextLayerReady(true);
      }
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  }, [resumeFile, base64ToUint8Array]);

  const getColor = useCallback(
    (score: number | undefined) => {
      if (score === undefined) return "#FF0000";
      if (score < 50) return "#FF0000";
      if (score < 70) return "#FFA500";
      return "#00FF00";
    },
    [reviewedData.resume_score]
  );

  const getColorClass = useCallback(
    (score: number | undefined) => {
      if (score === undefined) return "text-red-500";
      if (score < 50) return "text-red-500";
      if (score < 70) return "text-yellow-500";
      return "text-green-500";
    },
    [reviewedData.resume_score]
  );

  useEffect(() => {
    setLoading(true)
    if (resumeId) {
      (async () => {
        await fetchResumeAnalysis(resumeId);
        setLoading(false)
      })()
    }
    if (resumeFile && !isRendered) {
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
  }, [isTextLayerReady, sentencesToHighlight, resumeFile, resumeId, setLoading]);

  // console.log("structuredData:: ", structuredData)

  //console.log("Reviewed Data:", reviewedData);
  useEffect(() => {
    let isMounted = true;

    const runInitialAnalysis = async () => {
      if (!isMounted) return;

      try {
        await runAnalysis("summary");
        if (!isMounted) return;
        await runAnalysis("resume_score");
      } catch (error) {
        console.error("Analysis error:", error);
      }
    };

    runInitialAnalysis();

    return () => {
      isMounted = false;
    };
  }, []); // No dependencies needed

  return (
    <div className="flex h-full justify-between bg-primary-foreground items-stretch gap-2 px-2 pl-0">
      {loading ? (<div className="flex items-center justify-center w-full min-h-screen"><span className="w-16 h-16 border-4 border-x-gray-400 border-t-gray-400 rounded-full animate-spin"></span></div>) : (
        <>
          <div
            className="w-full bg-[#fafafa] rounded-tr-lg max-w-[220px] flex flex-col gap-2 "
            style={{
              boxShadow: "0px 0px 15px -5px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              className={`w-full p-8 text-[1.6rem] font-semibold ${getColorClass(
                reviewedData?.score
              )} rounded-lg`}
            >
              <CircularProgressbarWithChildren
                strokeWidth={6}
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
            </div>
            <div className="h-full p-4 rounded-lg flex-grow">
              <h2 className="text-lg font-semibold">Resume Evaluation</h2>
              <div className="h-[1px] bg-slate-300 w-full mb-4"></div>
              <div className="flex flex-col w-full">
                <div className="flex items-center hover:bg-slate-200 duration-300 py-2 px-4 relative group rounded-md cursor-pointer ">
                  <span className="font-medium">Hard Skill:</span>
                  <span
                    className={`ml-2 ${getColorClass(
                      reviewedData?.resume_score?.DETAILS?.HARD_SKILLS_SCORE?.score
                    )}`}
                  >
                    {reviewedData?.resume_score?.DETAILS?.HARD_SKILLS_SCORE?.score ??
                      "N/A"}
                    <div className="absolute right-0 min-h-full top-1/2 -translate-y-1/2 transform z-10 translate-x-full mb-2 hidden group-hover:block p-2 bg-gray-800 text-white text-sm rounded">
                      {reviewedData?.resume_score?.DETAILS?.HARD_SKILLS_SCORE
                        ?.reason ?? "No details available"}
                    </div>
                  </span>
                </div>
                <div className="flex items-center hover:bg-slate-200 duration-300 py-2 px-4 relative group rounded-md cursor-pointer ">
                  <span className="font-medium">Soft Skill:</span>
                  <span
                    className={`ml-2 ${getColorClass(
                      reviewedData?.resume_score?.DETAILS?.SOFT_SKILLS_SCORE?.score
                    )}`}
                  >
                    {reviewedData?.resume_score?.DETAILS?.SOFT_SKILLS_SCORE?.score ??
                      "N/A"}
                    <div className="absolute right-0 min-h-full top-1/2 -translate-y-1/2 transform z-10 translate-x-full mb-2 hidden group-hover:block p-2 bg-gray-800 text-white text-sm rounded">
                      {reviewedData?.resume_score?.DETAILS?.SOFT_SKILLS_SCORE
                        ?.reason ?? "No details available"}
                    </div>
                  </span>
                </div>
                <div className="flex items-center hover:bg-slate-200 duration-300 py-2 px-4 relative group rounded-md cursor-pointer ">
                  <span className="font-medium">Experience:</span>
                  <span
                    className={`ml-2 ${getColorClass(
                      reviewedData?.resume_score?.DETAILS?.EXPERIENCE_SCORE?.score
                    )}`}
                  >
                    {reviewedData?.resume_score?.DETAILS?.EXPERIENCE_SCORE?.score ??
                      "N/A"}
                    <div className="absolute right-0 min-h-full top-1/2 -translate-y-1/2 transform z-10 translate-x-full mb-2 hidden group-hover:block p-2 bg-gray-800 text-white text-sm rounded">
                      {reviewedData?.resume_score?.DETAILS?.EXPERIENCE_SCORE
                        ?.reason ?? "No details available"}
                    </div>
                  </span>
                </div>
                <div className="flex items-center hover:bg-slate-200 duration-300 py-2 px-4 relative group rounded-md cursor-pointer ">
                  <span className="font-medium">Education:</span>
                  <span
                    className={`ml-2 ${getColorClass(
                      reviewedData?.resume_score?.DETAILS?.EDUCATION_SCORE?.score
                    )}`}
                  >
                    {reviewedData?.resume_score?.DETAILS?.EDUCATION_SCORE?.score ??
                      "N/A"}
                    <div className="absolute right-0 min-h-full top-1/2 -translate-y-1/2 transform z-10 translate-x-full mb-2 hidden group-hover:block p-2 bg-gray-800 text-white text-sm rounded">
                      {reviewedData?.resume_score?.DETAILS?.EDUCATION_SCORE?.reason ??
                        "No details available"}
                    </div>
                  </span>
                </div>
                {!reviewedData?.resume_score && (
                  <div className="text-sm text-gray-500">
                    Scores are not available at the moment.{" "}
                    <button
                      // onClick={() => runAnalysis("resume_score")}
                      className="underline hover:text-primary"
                    >
                      Please try again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full px-2 py-4 rounded-lg h-[calc(100vh-5rem)] overflow-auto scrollbar-hide text-[#202020] ">
            <div>
              <h3 className="text-lg text-primary font-bold text-[#666]">
                Hello, {userData?.name?.trim().split(" ")[0] || "User"}!
              </h3>
              <p className="pl-2 text-[#888] font-semibold text-sm">
                Click on different parameters to get detailed analysis
              </p>
              <h2 className="text-xl font-bold mt-2">Summary</h2>
              <Dialog>
                <DialogTrigger className="px-4 py-2 bg-white shadow rounded-lg ">
                  <div className="line-clamp-3 rounded-lg text-left text-sm font-medium text-[#333]">
                    {reviewedData?.summary || "No summary available"}
                  </div>
                </DialogTrigger>
                <DialogContent className="">
                  <DialogHeader>
                    <DialogTitle>Summary</DialogTitle>
                    <DialogDescription className="text-sm">
                      {reviewedData?.summary || "No summary available"}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <h2 className="text-xl font-bold h-full">Fixes or Corrections</h2>
              <div className="flex flex-wrap justify-between bg-[#fafafa] shadow rounded-lg items-start gap-y-4 gap-x-2 p-4 ">
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("quantification_checker")}
                  >
                    <div className="flex items-center justify-center flex-col">
                      <Image
                        src="/cvreviewer/2.svg"
                        height={30}
                        width={30}
                        alt="icon"
                        className="-translate-y-5"
                      ></Image>
                      <div className="absolute top-[70px] w-full text-sm px-3 ">
                        {" "}
                        Quantification Checker
                      </div>
                    </div>
                  </DialogTrigger>
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
                                {"N/A"}
                              </AccordionContent>)}
                          </AccordionItem>
                        </Accordion>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => {
                      runAnalysis("bullet_point_length")
                    }}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                    <DialogHeader>
                      <DialogTitle>Bullet Point Length</DialogTitle>
                      <DialogDescription>
                        {reviewedData?.bullet_point_length &&
                          reviewedData?.bullet_point_length["Result"].length !== 0 ? (
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
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("bullet_point_improver")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("total_bullet_points")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                    <DialogHeader>
                      <DialogTitle> Total Bullet Points </DialogTitle>
                      <DialogDescription>
                        {reviewedData?.total_bullet_points ?
                          reviewedData?.total_bullet_points.Result : <h1>data not found</h1>}
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("verb_tense_checker")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                    <DialogHeader>
                      <DialogTitle> Verb Tense Checker </DialogTitle>
                      <DialogDescription>
                        <Accordion type="single" collapsible>
                          {reviewedData?.verbtense && (
                            <div>
                              {" "}
                              {Object.keys(reviewedData?.verbtense).map(
                                (key, ind: number) => (
                                  <AccordionItem
                                    value={`item-${ind + 1}`}
                                    key={ind}
                                  >
                                    <AccordionTrigger className="text-left">
                                      {key}
                                    </AccordionTrigger>
                                    {Object.keys(reviewedData?.verbtense[key]).map((key1, ind1: number) => (
                                      <>
                                        <AccordionContent>
                                          <span className="mr-2">Correction:</span>
                                          {
                                            reviewedData?.verbtense[key][key1].correction
                                          }
                                        </AccordionContent>
                                        <AccordionContent>
                                          <span className="mr-2">
                                            Reason:
                                          </span>
                                          {reviewedData?.verbtense[key][key1].explanation}
                                        </AccordionContent>
                                        <AccordionContent>
                                          <span className="mr-2">
                                            Impact:
                                          </span>
                                          {reviewedData?.verbtense[key][key1].impact}
                                        </AccordionContent>
                                      </>
                                    ))}
                                  </AccordionItem>
                                )
                              )}
                            </div>
                          )}
                        </Accordion>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("weak_verb_checker")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("section_checker")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("skill_checker")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("repetition_checker")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                                    return <>
                                      <AccordionTrigger className="text-left">
                                        {key1}
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {reviewedData?.repetition[key][key1]}
                                      </AccordionContent>
                                    </>
                                  }
                                  )}

                                </AccordionItem>
                              )
                            )}
                        </Accordion>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("personal_info")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                    <DialogTitle> Personal Info </DialogTitle>
                    <DialogDescription>
                      <Accordion type="single" collapsible>
                        {reviewedData?.personal_info &&
                          Object.keys(reviewedData?.personal_info).map(
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
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("responsibility")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger
                    className="max-w-[140px] bg-primary text-white rounded-lg font-semibold capitalize w-full min-h-[130px] flex items-center relative justify-center shadow-lg hover:scale-[1.02] duration-200 text-center "
                    onClick={() => runAnalysis("spelling_checker")}
                  >
                    <div className="flex items-center justify-center flex-col">
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
                  <DialogContent className="max-h-[95vh] overflow-y-scroll scrollbar-hide max-w-[60vw]">
                    <DialogHeader>
                      <DialogTitle>Spelling Checker</DialogTitle>
                      <DialogDescription>
                        {reviewedData?.spellingerrors &&
                          reviewedData?.spellingerrors["Result"].join(", ")}
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </>
      )}
      <div className=" py-2">
        <div
          className="pdf-viewer-container shadow-lg rounded-md  overflow-hidden"
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          <div
            className="h-[calc(100vh-5rem)] max-w-[595px] overflow-auto scrollbar-hide"
            style={{ position: "relative", width: "100%" }}
          >
            <canvas ref={canvasRef} className={"pdfCanvas "} />
            <div ref={textLayerRef} className={"textLayer"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
