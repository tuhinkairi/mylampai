import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Label } from "@/components/ui/label";
import { handleMessageUpload } from "@/actions/interviewActions";
import { useWebSocketContext } from "@/hooks/interviewersocket/webSocketContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const initialCode = {
  javascript: 'console.log("hello");',
  python: 'print("hello")',
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "hello";
    return 0;
}`,
};

interface CodeEditorProps {
  language: "javascript" | "python" | "cpp";
  code: string;
  setCode: (code: string) => void;
  fontSize: number;
}

type Language = "javascript" | "python" | "cpp";

type OnlineCompilerProp = {
  codingQuestion: string;
  showCompiler: boolean;
  interviewId: string;
  setShowCompiler: (showCompiler: boolean) => void;
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  setCode,
  fontSize,
}) => {
  return (
    <div className="editor-container">
      <Editor
        height="600px"
        language={language}
        value={code}
        theme="dark"
        onChange={(value) => setCode(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          fontFamily: "Fira Code, monospace",
          automaticLayout: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
};

export default function OnlineCompiler({
  codingQuestion,
  showCompiler,
  setShowCompiler,
  interviewId,
}: OnlineCompilerProp) {
  const { ws } = useWebSocketContext();
  const [language, setLanguage] = useState<Language>("cpp"); // Type the language state
  const [code, setCode] = useState(initialCode.cpp);
  const [output, setOutput] = useState("");
  const [fontSize, setFontSize] = useState(14);

  const editorRef = useRef(null);
  const outputRef = useRef(null);

  const increaseFontSize = () => {
    setFontSize((prevSize) => (prevSize < 30 ? prevSize + 1 : prevSize));
  };

  const decreaseFontSize = () => {
    setFontSize((prevSize) => (prevSize > 10 ? prevSize - 1 : prevSize));
  };

  const runCode = async () => {
    let version;
    if (language === "cpp") {
      version = "10.2.0";
    } else if (language === "python") {
      version = "3.10.0";
    } else if (language === "javascript") {
      version = "18.15.0";
    }

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          version: version,
          files: [
            {
              name: `main.${
                language === "cpp" ? "cpp" : language === "python" ? "py" : "js"
              }`,
              content: code,
            },
          ],
        }),
      });

      const result = await response.json();
      setOutput(result.run.stdout || result.run.stderr);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput("An unknown error occurred");
      }
    }
  };

  const handleLanguageChange = (value: string) => {
    const newLanguage = value as Language;
    setLanguage(newLanguage);
    setCode(initialCode[newLanguage]);
  };

  const handleSubmitCode = useCallback(
    async (code: string, question: string) => {
      if (ws) {
        ws.send(
          JSON.stringify({
            type: "coding",
            code: code,
            ques: question,
          }),
        );

        const res = await handleMessageUpload({
          interviewId,
          sender: "user",
          type: "coding",
          code,
          response: question,
        });
        if (res.status === "failed") toast.error("Failed to send code");

        setShowCompiler(false);
      }
    },
    [ws, setShowCompiler, interviewId],
  );

  return (
    <>
      <div
        className={`fixed z-20 inset-y-0 right-0 w-full bg-white shadow-lg transition-transform duration-500 ease-in-out transform ${
          showCompiler ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="relative px-6">
          <div className="min-h-screen p-4 gap-4 bg-light-gray transition-colors duration-500">
            <div className="text-3xl font-semibold text-center text-slate-800">
              Online Compiler
            </div>

            <div className="flex">
              <ResizablePanelGroup
                direction="horizontal"
                className="min-h-[calc(100vh-80px)] w-full rounded-lg border "
              >
                <ResizablePanel defaultSize={20}>
                  <div className="bg-white w-full h-full text-black p-4 md:p-6 rounded-lg border">
                    Write a python, javascript or cpp code to print &quot;Hello
                    World&quot;.
                  </div>
                </ResizablePanel>
                <ResizablePanel defaultSize={60}>
                  <div
                    ref={editorRef}
                    className="bg-white h-full text-black w-full p-4 md:p-6 rounded-lg flex flex-col justify-between"
                  >
                    <div className="flex items-center">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                        <Label
                          htmlFor="language-select"
                          className="text-lg font-semibold"
                        >
                          Choose Language:
                        </Label>
                        <Select
                          value={language}
                          onValueChange={handleLanguageChange}
                        >
                          <SelectTrigger
                            id="language-select"
                            className="w-full sm:w-56"
                          >
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">
                              JavaScript
                            </SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="cpp">C/C++</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decreaseFontSize}
                          aria-label="Decrease font size"
                          className="p-1"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium w-16 text-center">
                          {fontSize}px
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={increaseFontSize}
                          aria-label="Increase font size"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CodeEditor
                      language={language}
                      code={code}
                      setCode={setCode}
                      fontSize={fontSize}
                    />

                    <div className="gap-2 flex">
                      <Button
                        onClick={runCode}
                        className="mt-4 md:mt-6 py-2 md:py-3 px-6 bg-primary text-white rounded-md hover:bg-primary transition duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        Run Code
                      </Button>

                      <Button
                        onClick={() => handleSubmitCode(code, codingQuestion)}
                        className="mt-4 md:mt-6 py-2 md:py-3 px-6 bg-primary text-white rounded-md hover:bg-primary transition duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        Submit Code
                      </Button>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={20}>
                  <div
                    ref={outputRef}
                    className="bg-white w-full h-full text-black p-4 md:p-6 rounded-lg flex flex-col justify-start border"
                  >
                    <h2 className="text-2xl font-semibold mb-2 md:mb-4 text-gray-700">
                      Output:
                    </h2>
                    <pre className=" text-black p-3 md:p-4 rounded-lg overflow-auto transition-all duration-500 ease-in-out whitespace-pre-wrap">
                      {output}
                    </pre>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
