import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { RiArrowDropDownLine } from "react-icons/ri";
import FullScreenLoader from "@/components/global/FullScreenLoader";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface AnalysisItem {
  analysis: {
    line_analysis: LineAnalysis[];
    overall_assessment: OverallAssessment;
  };
  answer: string;
  question: string;
}

interface AnalysisProps {
  analysisData: AnalysisItem[];
}

const Analysis: React.FC<AnalysisProps> = ({ analysisData }) => {
  const [expandedSections, setExpandedSections] = useState<boolean[]>(
    analysisData ? analysisData.map(() => false) : []
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (analysisData && analysisData.length > 0) {
      console.log("Received Analysis Data: ", analysisData);
      setExpandedSections(analysisData.map(() => false));
      setLoading(false);
    }
  }, [analysisData]);

  if (loading) {
    return <FullScreenLoader message="Loading Analysis Data" />;
  }

  // Toggle visibility of analysis and overall assessment
  const toggleSectionVisibility = (index: number) => {
    setExpandedSections((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
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
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
        },
      ],
    };
  };

  return (
    <div className="h-screen w-full relative">
      <div className="flex justify-center items-center py-4">
        <Link
          href="/"
          className="flex items-center justify-center absolute left-8 top-2"
        >
          <Image
            src={"/home/logo.svg"}
            width={180}
            height={180}
            alt="wiZe Logo"
            className="h-auto w-48 ml-2"
          />
        </Link>
        <div className="text-3xl font-semibold flex justify-center flex-col">
          Your Analysis
          <div className="w-full h-[3px] bg-primary rounded-full"></div>
        </div>
      </div>

      <ScrollArea className="px-8 py-4 h-[calc(100vh-2rem)] ">
        {analysisData?.map((analysisItem, index) => (
          <div
            key={index}
            className="mb-8 border-2 p-10 rounded-xl border-primary-foreground"
          >
            {/* Answer and Question */}
            <div className="mt-6 bg-primary rounded-lg border-4 border-primary-foreground shadow-lg p-4 text-lg text-white">
              <p>
                <strong>Question:</strong>{" "}
                {typeof analysisItem.question === "string"
                  ? analysisItem.question
                  : JSON.stringify(analysisItem.question)}
              </p>
              <p>
                <strong>Answer:</strong>{" "}
                {typeof analysisItem.answer === "string"
                  ? analysisItem.answer
                  : JSON.stringify(analysisItem.answer)}
              </p>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => toggleSectionVisibility(index)}
              className="mt-4 mb-2 px-4 py-2 bg-primary flex justify-center items-center text-white rounded-md hover:bg-purple-600 font-semibold transition shadow-lg focus:outline-none"
            >
              {expandedSections[index] ? "Hide Analysis" : "Show Analysis"}
              <RiArrowDropDownLine
                className={`text-3xl ml-2 transition-transform ${
                  expandedSections[index] ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Collapsible Content */}
            {expandedSections[index] && (
              <>
                {/* Line-by-Line Analysis */}
                <div className="mt-6">
                  <strong>Detailed analysis of your reply:</strong>
                  {analysisItem.analysis.line_analysis &&
                  analysisItem.analysis.line_analysis.length > 0 ? (
                    <div className="mt-2">
                      {analysisItem.analysis.line_analysis.map(
                        (line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className="mb-4 p-4 bg-gray-100 rounded-lg"
                          >
                            <p>
                              <strong>Line:</strong>{" "}
                              {typeof line.line === "string"
                                ? line.line
                                : JSON.stringify(line.line)}
                            </p>

                            {/* Display a bar chart for the line analysis */}
                            <div className="mt-4">
                              <Bar
                                data={createChartData(line)}
                                options={{ responsive: true }}
                              />
                            </div>

                            {/* Clarity */}
                            <div className="mt-2">
                              <p>
                                <strong>Clarity:</strong>
                              </p>
                              <p>
                                Reasoning:{" "}
                                {typeof line.clarity.reasoning === "string"
                                  ? line.clarity.reasoning
                                  : JSON.stringify(line.clarity.reasoning)}
                              </p>
                              <p>Score: {line.clarity.score}</p>
                            </div>

                            {/* Depth */}
                            <div className="mt-2">
                              <p>
                                <strong>Depth:</strong>
                              </p>
                              <p>
                                Reasoning:{" "}
                                {typeof line.depth.reasoning === "string"
                                  ? line.depth.reasoning
                                  : JSON.stringify(line.depth.reasoning)}
                              </p>
                              <p>Score: {line.depth.score}</p>
                            </div>

                            {/* Professionalism */}
                            <div className="mt-2">
                              <p>
                                <strong>Professionalism:</strong>
                              </p>
                              <p>
                                Reasoning:{" "}
                                {typeof line.professionalism.reasoning ===
                                "string"
                                  ? line.professionalism.reasoning
                                  : JSON.stringify(
                                      line.professionalism.reasoning
                                    )}
                              </p>
                              <p>Score: {line.professionalism.score}</p>
                            </div>

                            {/* Relevance */}
                            <div className="mt-2">
                              <p>
                                <strong>Relevance:</strong>
                              </p>
                              <p>
                                Reasoning:{" "}
                                {typeof line.relevance.reasoning === "string"
                                  ? line.relevance.reasoning
                                  : JSON.stringify(line.relevance.reasoning)}
                              </p>
                              <p>Score: {line.relevance.score}</p>
                            </div>

                            {/* Technical Accuracy */}
                            <div className="mt-2">
                              <p>
                                <strong>Technical Accuracy:</strong>
                              </p>
                              <p>
                                Reasoning:{" "}
                                {typeof line.technical_accuracy.reasoning ===
                                "string"
                                  ? line.technical_accuracy.reasoning
                                  : JSON.stringify(
                                      line.technical_accuracy.reasoning
                                    )}
                              </p>
                              <p>Score: {line.technical_accuracy.score}</p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p>No detailed line analysis provided.</p>
                  )}
                </div>

                {/* Overall Assessment */}
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Overall Assessment
                  </h3>

                  {/* Overall Score */}
                  <p>
                    <strong>Overall Score:</strong>{" "}
                    {analysisItem.analysis.overall_assessment.overall_score}
                  </p>

                  {/* Strengths */}
                  <div className="mt-4">
                    <strong>Strengths:</strong>
                    {analysisItem.analysis.overall_assessment.strengths &&
                    analysisItem.analysis.overall_assessment.strengths.length >
                      0 ? (
                      <ul className="list-disc list-inside">
                        {analysisItem.analysis.overall_assessment.strengths.map(
                          (strength, i) => (
                            <li key={i}>
                              {typeof strength === "string"
                                ? strength
                                : JSON.stringify(strength)}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No strengths provided.</p>
                    )}
                  </div>

                  {/* Areas for Improvement */}
                  <div className="mt-4">
                    <strong>Areas for Improvement:</strong>
                    {analysisItem.analysis.overall_assessment
                      .areas_for_improvement &&
                    analysisItem.analysis.overall_assessment
                      .areas_for_improvement.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {analysisItem.analysis.overall_assessment.areas_for_improvement.map(
                          (area, i) => (
                            <li key={i}>
                              {typeof area === "string"
                                ? area
                                : JSON.stringify(area)}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No areas for improvement provided.</p>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div className="mt-4">
                    <strong>Suggestions:</strong>
                    {analysisItem.analysis.overall_assessment.suggestions &&
                    analysisItem.analysis.overall_assessment.suggestions
                      .length > 0 ? (
                      <ul className="list-disc list-inside">
                        {analysisItem.analysis.overall_assessment.suggestions.map(
                          (suggestion, i) => (
                            <li key={i}>
                              {typeof suggestion === "string"
                                ? suggestion
                                : JSON.stringify(suggestion)}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No suggestions provided.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Analysis;
