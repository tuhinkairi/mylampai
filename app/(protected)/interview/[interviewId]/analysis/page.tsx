"use client";
import React, { useState, useEffect, useRef, use } from "react";
import { Bar } from "react-chartjs-2";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaPlay, FaPause, FaExpand } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import FullScreenLoader from "@/components/global/FullScreenLoader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getConversation, getInterviewVideo } from "@/actions/interviewActions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatInterface from "./ChatInterface";
import VideoPlayer from "./VideoPlayer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface LineAnalysis {
  line: string;
  clarity: { reasoning: string; score: number };
  depth: { reasoning: string; score: number };
  professionalism: { reasoning: string; score: number };
  relevance: { reasoning: string; score: number };
  technical_accuracy: { reasoning: string; score: number };
}

interface OverallAssessment {
  overall_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  suggestions: string[];
}

interface weightedScroe {
  score: number;
  max_score: number;
  percentage: number;
}

interface AnalysisItem {
  analysis: {
    line_analysis: LineAnalysis[];
    overall_assessment: OverallAssessment;
    weighted_score: weightedScroe
  };
  conversationChat: []
}

interface TranscriptItem {
  speaker: string;
  text: string;
  timestamp: number;
}

const INTERVIEW_SECTIONS = ["Introduction", "Project", "Coding", "Technical", "Outro"];
const SECTION_DESCRIPTIONS = {
  Introduction: "Personal background and career overview",
  Project: "Discussion about past projects and experiences",
  Coding: "Programming implementation and approach",
  Technical: "Technical knowledge and problem-solving abilities",
  Outro: "Concluding thoughts and follow-up questions"
};

const Analysis: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisItem[] | null>(null);
  const [expandedSections, setExpandedSections] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTab, setCurrentTab] = useState("video");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentTranscriptIndex, setCurrentTranscriptIndex] = useState(-1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { interviewId } = useParams<{ interviewId: string }>();
  const searchParams = useSearchParams();
  const interviewType = searchParams.get("type") || "mockInterview";

  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);

  // If you need to track selections separately for each analysis item, use this instead:
  const [selectedLineIndices, setSelectedLineIndices] = useState<Record<number, number | null>>({});
  const [conversationChat, setConversationChat] = useState<any[]>([]);
  // useEffect(() => {
  //   console.log("Video URL:", videoUrl);
  // }, [videoUrl]);
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`/api/interviewer/get_review/${interviewId}`);
        const structuredData = response.data.data;
        // console.log("Structured Analysis Data:", structuredData);
        // Convert structured data to array format based on the interview sections
        const transformedData = Object.keys(structuredData[0])
          .filter((key) => INTERVIEW_SECTIONS.includes(key))
          .map((key) => structuredData[0][key]);

        // console.log("Transformed Data:", transformedData);
        setAnalysisData(transformedData);

        // Initialize expanded sections state once we have data
        setExpandedSections(Array(transformedData.length).fill(false));
      } catch (error) {
        console.error("Error fetching analysis data:", error);
        // setError("Failed to load analysis data");
      }
    };



    const fetchVideo = async () => {
      try {
        setLoading(true);
        // First try to get URL from session storage
        const sessionUrl = sessionStorage.getItem('interviewVideoUrl');

        if (sessionUrl) {
          setVideoUrl(sessionUrl.split("?")[0]);
        } else {
          // If not in session, fetch from API
          const res = await getInterviewVideo(interviewId, interviewType);
          if (res && !Array.isArray(res) && 'status' in res && res.status === 200 && res.data && res.data.videoUrl) {
            const url = res.data.videoUrl.split("?")[0];
            setVideoUrl(url);
            sessionStorage.setItem('interviewVideoUrl', url);
          } else {
            setError('Video not available');
          }
        }
      } catch (err) {
        console.error('Error loading video:', err);
        setError('Failed to load interview recording');
      }
    };

    //function to fetch conversation
    const fetchConversation = async () => {
      try {
        const response = await getConversation(interviewId);
        if (!response || Array.isArray(response) || response.status !== 200) {
          throw new Error("Failed to fetch conversation data");
        }
        const data = response?.data;
        setConversationChat(data);
        // console.log("Conversation Data:", data);
      } catch (error) {
        console.error("Error fetching conversation data:", error);
      }
    }

    // const generateTranscriptFromAnalysis = (data: AnalysisItem[]) => {
    //   if (!data || data.length === 0) return [];

    //   const transcript: TranscriptItem[] = [];
    //   let currentTime = 10; // Start time in seconds

    //   data.forEach((item, index) => {
    //     // Extract question text (handling if it's a string or an object)
    //     let questionText: string;
    //     if (typeof item.question === 'string') {
    //       questionText = item.question;
    //     } else {
    //       // If it's something else, convert to string or use a default
    //       questionText = "Interview question";
    //     }

    //     // Handle the answer which appears to be an object with multiple string keys
    //     let answerText: string;
    //     if (typeof item.answer === 'string') {
    //       answerText = item.answer;
    //     } else if (typeof item.answer === 'object' && item.answer !== null) {
    //       // If answer is an object, we'll concatenate all string values
    //       const answerValues = Object.values(item.answer)
    //         .filter(val => typeof val === 'string')
    //         .join("\n\n");
    //       answerText = answerValues || "No answer provided";
    //     } else {
    //       answerText = "No answer provided";
    //     }

    //     // Add interviewer question
    //     transcript.push({
    //       speaker: "AI Interviewer",
    //       text: questionText.trim(),
    //       timestamp: currentTime
    //     });

    //     currentTime += 15; // Approximate time for question

    //     // Add candidate answer
    //     transcript.push({
    //       speaker: "You",
    //       text: answerText.trim(),
    //       timestamp: currentTime
    //     });

    //     currentTime += 25; // Approximate time for answer
    //   });

    //   return transcript;
    // };
    const initializeData = async () => {
      try {
        setLoading(true);
        await fetchVideo();
        await fetchAnalysis();
        // await fetchConversation();
        setLoading(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setLoading(false);
      }
    };

    initializeData();
  }, [interviewId, interviewType]);

  // Generate transcript from analysis data when it's available
  // useEffect(() => {
  //   if (analysisData && analysisData.length > 0) {
  //     const generatedTranscript = generateTranscriptFromAnalysis(analysisData);
  //     setTranscript(generatedTranscript);
  //   }
  // }, [analysisData]);

  // const generateTranscriptFromAnalysis = (data: AnalysisItem[]) => {
  //   if (!data || data.length === 0) return [];

  //   const transcript: TranscriptItem[] = [];
  //   let currentTime = 10; // Start time in seconds

  //   data.forEach((item, index) => {
  //     // Add interviewer question
  //     transcript.push({
  //       speaker: "AI Interviewer",
  //       text: item.question,
  //       timestamp: currentTime
  //     });

  //     currentTime += 15; // Approximate time for question

  //     // Add candidate answer
  //     transcript.push({
  //       speaker: "You",
  //       text: item.answer,
  //       timestamp: currentTime
  //     });

  //     currentTime += 25; // Approximate time for answer
  //   });

  //   return transcript;
  // };

  useEffect(() => {
    // Update current transcript based on video time
    if (!videoRef.current || transcript.length === 0) return;

    const handleTimeUpdate = () => {
      const currentTime = videoRef.current?.currentTime || 0;

      // Find the transcript item that corresponds to the current time
      let index = transcript.findIndex(item => item.timestamp > currentTime);
      if (index === -1) {
        index = transcript.length - 1; // Last item if we're past all timestamps
      } else if (index > 0) {
        index = index - 1; // Previous item
      }

      if (index !== currentTranscriptIndex) {
        setCurrentTranscriptIndex(index);
      }
    };

    videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [transcript, currentTranscriptIndex]);

  if (loading) {
    return <FullScreenLoader message="Loading Interview Analysis" />;
  }

  const toggleSectionVisibility = (index: number) => {
    setExpandedSections((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const jumpToTimestamp = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const createChartData = (line: LineAnalysis) => {
    return {
      labels: [
        "Clarity",
        "Depth",
        "Professionalism",
        "Relevance",
        "Technical Accuracy",
      ],
      datasets: [
        {
          label: "Scores",
          data: [
            line.clarity.score,
            line.depth.score,
            line.professionalism.score,
            line.relevance.score,
            line.technical_accuracy.score,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(153, 102, 255, 0.8)",
          ],
        },
      ],
    };
  };

  // Calculate overall score for summary display
  const calculateOverallScore = () => {
    if (!analysisData || analysisData.length === 0) return 0;

    const sum = analysisData.reduce((acc, item) =>
      acc + (item.analysis?.weighted_score.score || 0), 0);
    return (sum);
  };

  // Get main strengths and areas to improve for summary
  const getTopStrengths = () => {
    if (!analysisData || analysisData.length === 0) return [];

    const allStrengths = analysisData.flatMap(
      item => item.analysis?.overall_assessment?.strengths || []
    );

    // Return top 3 most common strengths
    return [...new Set(allStrengths)].slice(0, 3);
  };

  const getTopAreasToImprove = () => {
    if (!analysisData || analysisData.length === 0) return [];

    const allAreas = analysisData.flatMap(
      item => item.analysis?.overall_assessment?.areas_for_improvement || []
    );

    // Return top 3 most common areas
    return [...new Set(allAreas)].slice(0, 3);
  };

  const handleLineSelect = (sectionIndex: number, lineIndex: number) => {
    setSelectedLineIndices(prev => ({
      ...prev,
      [sectionIndex]: lineIndex
    }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md py-4 px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/home/navbar/wizelogo.svg"
            width={150}
            height={50}
            alt="wiZe Logo"
            className="h-auto"
          />
        </Link>
        <h1 className="text-3xl font-bold text-primary">Interview Analysis</h1>
        <div className="w-[150px]"></div> {/* Placeholder for balance */}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-primary to-purple-700 text-white rounded-xl p-6 flex flex-col items-center justify-center">
              <h3 className="text-xl font-semibold mb-2">Overall Score</h3>
              <div className="text-5xl font-bold">{calculateOverallScore()}/100</div>
            </div>

            {/* Top Strengths */}
            <div className="bg-white border border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Top Strengths</h3>
              <ul className="space-y-2">
                {getTopStrengths().length > 0 ? (
                  getTopStrengths().map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <span className="inline-block bg-green-100 text-green-600 p-1 rounded-full mr-2">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No specific strengths highlighted</li>
                )}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="bg-white border border-orange-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-orange-600 mb-2">Areas to Improve</h3>
              <ul className="space-y-2">
                {getTopAreasToImprove().length > 0 ? (
                  getTopAreasToImprove().map((area, i) => (
                    <li key={i} className="flex items-start">
                      <span className="inline-block bg-orange-100 text-orange-600 p-1 rounded-full mr-2">↗</span>
                      <span>{area}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No specific areas highlighted</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Video and Transcript */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <Tabs defaultValue="video" onValueChange={setCurrentTab}>
            <div className="border-b p-4">
              <TabsList className="w-full flex justify-start bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="video"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white py-2"
                >
                  Interview Recording
                </TabsTrigger>
                <TabsTrigger
                  value="transcript"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-white py-2"
                // disabled
                >
                  Conversation Transcript
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="video" className="p-0">
              <div className="relative">
                {error ? (
                  <div className="bg-red-50 p-8 text-center rounded-lg">
                    <p className="text-red-600 font-medium">{error}</p>
                    <p className="mt-2">The interview recording could not be loaded.</p>
                  </div>
                ) : videoUrl ? (
                  <div>
                    {/* <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full aspect-video"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      controls={true}
                    /> */}
                    <VideoPlayer videoUrl={videoUrl} />
                    {/* <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                      <button
                        onClick={handlePlayPause}
                        className="flex items-center space-x-2 bg-primary hover:bg-primary/90 py-2 px-4 rounded-lg"
                      >
                        {isPlaying ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                        <span>{isPlaying ? "Pause" : "Play"}</span>
                      </button>
                      <button
                        onClick={handleFullscreen}
                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg"
                      >
                        <FaExpand className="mr-2" />
                        <span>Fullscreen</span>
                      </button>
                    </div> */}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-8 text-center rounded-lg">
                    <p className="text-gray-600">No interview recording available.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="transcript" className="p-0">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Interview Transcript</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-auto">
                  {transcript.length > 0 ? (
                    <div className="space-y-6">
                      {transcript.map((item, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg ${item.speaker === "AI Interviewer"
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : "bg-green-50 border-l-4 border-green-500"
                            } ${currentTranscriptIndex === index ? "ring-2 ring-primary" : ""}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-semibold ${item.speaker === "AI Interviewer" ? "text-blue-700" : "text-green-700"
                              }`}>
                              {item.speaker}
                            </span>
                            <button
                              onClick={() => jumpToTimestamp(item.timestamp)}
                              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                            >
                              {Math.floor(item.timestamp / 60)}:{(item.timestamp % 60).toString().padStart(2, '0')}
                            </button>
                          </div>
                          <p>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No transcript available for this interview.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Question Analysis</h2>

          {analysisData?.length === 0 && (
            <div className="text-center py-10">
              <h1 className="text-2xl font-semibold text-gray-600">
                No analysis data available.
              </h1>
            </div>
          )}

          {analysisData && analysisData.length > 0 && (
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="w-full mb-6 grid"
                style={{ gridTemplateColumns: `repeat(${INTERVIEW_SECTIONS.length}, 1fr)` }}>
                {INTERVIEW_SECTIONS.map((section, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>

              {analysisData.map((analysisItem, index) => (
                <TabsContent key={index} value={index.toString()} className="focus:outline-none">
                  <div className="mb-2 text-sm text-gray-500 italic">
                    {SECTION_DESCRIPTIONS[INTERVIEW_SECTIONS[index] as keyof typeof SECTION_DESCRIPTIONS]}
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Question and Answer Panel */}
                    <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-6">
                      <div className="flex justify-center mt-2 mb-4">
                        <span className="text-lg font-bold bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                          Score: {analysisItem.analysis?.weighted_score.score || "N/A"}/{analysisItem.analysis?.weighted_score?.max_score}
                        </span>
                      </div>

                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleSectionVisibility(index)}
                      className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 py-3 border-t border-gray-200 transition mb-2"
                    >
                      <span className="font-medium mr-2">
                        {expandedSections[index] ? "Hide Analysis" : "Show Detailed Analysis"}
                      </span>
                      <RiArrowDropDownLine
                        className={`text-3xl transition-transform ${expandedSections[index] ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Collapsible Content */}
                    {expandedSections[index] && analysisItem.analysis && (
                      <div className="p-6 border-t border-gray-200">
                        {/* Strengths and Areas to Improve Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          {/* Strengths */}
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="text-lg font-semibold text-green-700 mb-2 flex items-center">
                              <span className="mr-2">✓</span> Strengths
                            </h4>
                            {analysisItem.analysis?.overall_assessment?.strengths &&
                              analysisItem.analysis.overall_assessment.strengths.length > 0 ? (
                              <ul className="space-y-2">
                                {analysisItem.analysis.overall_assessment.strengths.map((strength, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="inline-block bg-green-100 text-green-600 p-1 rounded-full mr-2">•</span>
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No specific strengths highlighted.</p>
                            )}
                          </div>

                          {/* Areas for Improvement */}
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="text-lg font-semibold text-orange-700 mb-2 flex items-center">
                              <span className="mr-2">↗</span> Areas for Improvement
                            </h4>
                            {analysisItem.analysis?.overall_assessment?.areas_for_improvement &&
                              analysisItem.analysis.overall_assessment.areas_for_improvement.length > 0 ? (
                              <ul className="space-y-2">
                                {analysisItem.analysis.overall_assessment.areas_for_improvement.map((area, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="inline-block bg-orange-100 text-orange-600 p-1 rounded-full mr-2">•</span>
                                    <span>{area}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No specific areas for improvement highlighted.</p>
                            )}
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="text-lg font-semibold text-blue-700 mb-2">Key Suggestions</h4>
                          {analysisItem.analysis?.overall_assessment?.suggestions &&
                            analysisItem.analysis.overall_assessment.suggestions.length > 0 ? (
                            <ul className="space-y-2">
                              {analysisItem.analysis.overall_assessment.suggestions.map((suggestion, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="inline-block bg-blue-100 text-blue-600 p-1 rounded-full mr-2">💡</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No specific suggestions provided.</p>
                          )}
                        </div>

                        {/* Detailed Line Analysis */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold mb-4">Detailed Response Analysis</h4>
                          {analysisItem.analysis?.line_analysis &&
                            analysisItem.analysis.line_analysis.length > 0 ? (
                            <div className="space-y-8">
                              {/* Add line selector using Shadcn Select component */}
                              <div className="mb-4">
                                <label htmlFor="lineSelector" className="block text-sm font-medium text-gray-700 mb-1">
                                  Select line to analyze:
                                </label>
                                <Select
                                  onValueChange={(value) => {
                                    const selectedIndex = parseInt(value);
                                    handleLineSelect(index, selectedIndex);
                                  }}
                                  value={selectedLineIndices[index]?.toString() || undefined}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a response line" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {analysisItem.analysis.line_analysis.map((line, idx) => (
                                      <SelectItem key={idx} value={idx.toString()}>
                                        {line.line.length > 50 ? `${line.line.substring(0, 50)}...` : line.line}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Display only the selected line analysis */}
                              {selectedLineIndices[index] !== undefined && selectedLineIndices[index] !== null && (
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                  <p className="font-medium mb-4 pb-3 border-b border-gray-300">
                                    {analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].line}
                                  </p>

                                  {/* Chart */}
                                  <div className="mb-6 bg-white p-4 rounded-lg">
                                    <Bar
                                      data={createChartData(analysisItem.analysis.line_analysis[selectedLineIndices[index] as number])}
                                      options={{
                                        responsive: true,
                                        scales: {
                                          y: {
                                            beginAtZero: true,
                                            max: 10
                                          }
                                        }
                                      }}
                                    />
                                  </div>

                                  {/* Analysis Tabs */}
                                  <Tabs defaultValue="clarity">
                                    <TabsList className="w-full grid grid-cols-5 mb-4">
                                      <TabsTrigger value="clarity">Clarity</TabsTrigger>
                                      <TabsTrigger value="depth">Depth</TabsTrigger>
                                      <TabsTrigger value="professionalism">Professionalism</TabsTrigger>
                                      <TabsTrigger value="relevance">Relevance</TabsTrigger>
                                      <TabsTrigger value="technical">Technical</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="clarity" className="p-4 bg-white rounded-lg border border-gray-200">
                                      <div className="flex justify-between mb-2">
                                        <h5 className="font-bold">Clarity</h5>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                          Score: {analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].clarity.score}/10
                                        </span>
                                      </div>
                                      <p>{analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].clarity.reasoning}</p>
                                    </TabsContent>

                                    <TabsContent value="depth" className="p-4 bg-white rounded-lg border border-gray-200">
                                      <div className="flex justify-between mb-2">
                                        <h5 className="font-bold">Depth</h5>
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                                          Score: {analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].depth.score}/10
                                        </span>
                                      </div>
                                      <p>{analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].depth.reasoning}</p>
                                    </TabsContent>

                                    <TabsContent value="professionalism" className="p-4 bg-white rounded-lg border border-gray-200">
                                      <div className="flex justify-between mb-2">
                                        <h5 className="font-bold">Professionalism</h5>
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                          Score: {analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].professionalism.score}/10
                                        </span>
                                      </div>
                                      <p>{analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].professionalism.reasoning}</p>
                                    </TabsContent>

                                    <TabsContent value="relevance" className="p-4 bg-white rounded-lg border border-gray-200">
                                      <div className="flex justify-between mb-2">
                                        <h5 className="font-bold">Relevance</h5>
                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                                          Score: {analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].relevance.score}/10
                                        </span>
                                      </div>
                                      <p>{analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].relevance.reasoning}</p>
                                    </TabsContent>

                                    <TabsContent value="technical" className="p-4 bg-white rounded-lg border border-gray-200">
                                      <div className="flex justify-between mb-2">
                                        <h5 className="font-bold">Technical Accuracy</h5>
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                                          Score: {analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].technical_accuracy.score}/10
                                        </span>
                                      </div>
                                      <p>{analysisItem.analysis.line_analysis[selectedLineIndices[index] as number].technical_accuracy.reasoning}</p>
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p>No detailed line analysis available.</p>
                          )}
                        </div>
                      </div>
                    )}
                    <ChatInterface conversationChat={analysisItem?.conversationChat} />

                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analysis;

