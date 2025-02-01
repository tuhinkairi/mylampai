"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";
import Mark from "mark.js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";

import "./highlight.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PastResumeViewerProps {
  resume: string; // Base64 resume
  analysis: any; // Analysis data
  createdAt: string; // Resume upload date
}

const PastResumeViewer: React.FC<PastResumeViewerProps> = ({
  resume,
  analysis,
  createdAt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  const [isRendered, setIsRendered] = useState(false);
  const [sentencesToHighlight, setSentencesToHighlight] = useState<string[]>([]);

  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const highlightSentences = useCallback(
    (list_of_sentences: any, class_name: string) => {
      const options_general = {
        ignorePunctuation: ":;.,-–—‒_(){}[]!'\"+=".split(""),
        separateWordSearch: false,
        accuracy: "partially",
        className: class_name,
        acrossElements: true,
      };

      if (!Array.isArray(list_of_sentences)) return;

      list_of_sentences.forEach((sentence: string) => {
        if (typeof sentence === "string" && textLayerRef.current) {
          const normalizedSentence = sentence.trim().replace(/\s+/g, " ");
          const instance = new Mark(textLayerRef.current);
          instance.mark(normalizedSentence, options_general);
        }
      });
    },
    []
  );

  const renderPDF = useCallback(async () => {
    if (!resume || !canvasRef.current) return;

    try {
      const pdfData = base64ToUint8Array(resume);
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;

      if (textLayerRef.current) {
        const textContent = await page.getTextContent();
        textLayerRef.current.innerHTML = "";
        textLayerRef.current.style.width = `${canvas.offsetWidth}px`;
        textLayerRef.current.style.height = `${canvas.offsetHeight}px`;

        await pdfjsLib.renderTextLayer({
          textContent,
          container: textLayerRef.current,
          viewport,
          textDivs: [],
        }).promise;

        if (analysis?.highlights) {
          setSentencesToHighlight(analysis.highlights);
        }
      }
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  }, [resume, analysis]);

  useEffect(() => {
    if (!isRendered) {
      renderPDF();
      setIsRendered(true);
    }
  }, [isRendered, renderPDF]);

  useEffect(() => {
    if (sentencesToHighlight.length > 0) {
      highlightSentences(sentencesToHighlight, "highlighted");
    }
  }, [sentencesToHighlight, highlightSentences]);

  return (
    <div className="flex h-full justify-between bg-primary-foreground items-stretch gap-2 px-2">
      <div className="w-full bg-[#fafafa] rounded-lg max-w-[220px] flex flex-col gap-2 shadow-md p-4">
        <h3 className="text-lg font-bold text-center">Resume Analysis</h3>
        <CircularProgressbarWithChildren
          strokeWidth={6}
          value={analysis?.resume_score?.FINAL_SCORE || 0}
          styles={{
            path: {
              stroke: analysis?.resume_score?.FINAL_SCORE > 70 ? "#00FF00" : "#FFA500",
              strokeLinecap: "round",
            },
          }}
        >
          {analysis?.resume_score?.FINAL_SCORE || 0}
        </CircularProgressbarWithChildren>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Uploaded: {createdAt}</p>
        </div>
      </div>

      <div className="flex-grow px-2 py-4">
        <h3 className="text-xl font-bold mb-4">Summary</h3>
        <Dialog>
          <DialogTrigger className="px-4 py-2 bg-white shadow rounded-lg cursor-pointer">
            <div className="line-clamp-3 text-left text-sm font-medium">
              {analysis?.summary || "No summary available"}
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Summary</DialogTitle>
              <DialogDescription>{analysis?.summary}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <h3 className="text-xl font-bold mt-6">Detailed Analysis</h3>
        <Accordion type="single" collapsible>
          {Object.keys(analysis).map((key, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{key}</AccordionTrigger>
              <AccordionContent>
                {typeof analysis[key] === "object"
                  ? JSON.stringify(analysis[key], null, 2)
                  : analysis[key]}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="w-1/3 py-2">
        <div
          className="pdf-viewer-container shadow-md rounded-lg overflow-hidden"
          style={{ width: "100%", height: "100%" }}
        >
          <canvas ref={canvasRef} />
          <div ref={textLayerRef} className="textLayer" />
        </div>
      </div>
    </div>
  );
};

export default PastResumeViewer;
