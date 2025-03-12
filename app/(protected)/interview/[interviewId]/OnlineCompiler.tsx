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
import {
  Plus,
  Minus,
  Play,
  Save,
  Upload,
  Download,
  X,
  Settings,
  Loader2,
  Send,
  Copy,
  Terminal
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// Extended language support
const LANGUAGES = {
  javascript: {
    name: "JavaScript",
    extension: "js",
    version: "18.15.0",
    initialCode: 'console.log("Hello, World!");',
  },
  python: {
    name: "Python",
    extension: "py",
    version: "3.10.0",
    initialCode: 'print("Hello, World!")',
  },
  cpp: {
    name: "C++",
    extension: "cpp",
    version: "10.2.0",
    initialCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  },
  java: {
    name: "Java",
    extension: "java",
    version: "17.0.0",
    initialCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  },
  go: {
    name: "Go",
    extension: "go",
    version: "1.18.0",
    initialCode: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  },
  rust: {
    name: "Rust",
    extension: "rs",
    version: "1.60.0",
    initialCode: `fn main() {
    println!("Hello, World!");
}`,
  },
};

type LanguageKey = keyof typeof LANGUAGES;

interface CodeEditorProps {
  language: LanguageKey;
  code: string;
  setCode: (code: string) => void;
  fontSize: number;
  theme: string;
  readOnly: boolean;
}

type OnlineCompilerProp = {
  codingQuestion: string;
  showCompiler: boolean;
  interviewId: string;
  setShowCompiler: (showCompiler: boolean) => void;
};

interface EditorSettings {
  fontSize: number;
  theme: string;
  wordWrap: "on" | "off";
  minimap: boolean;
  lineNumbers: "on" | "off";
  autoIndent: boolean;
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  theme: "vs-dark",
  wordWrap: "on",
  minimap: false,
  lineNumbers: "on",
  autoIndent: true,
};

// Custom themes
const EDITOR_THEMES = [
  { value: "vs", label: "Light" },
  { value: "vs-dark", label: "Dark" },
  { value: "hc-black", label: "High Contrast Dark" },
  { value: "hc-light", label: "High Contrast Light" },
];

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  setCode,
  fontSize,
  theme,
  readOnly,
}) => {
  const editorRef = useRef<any>(null);
  const internalClipboardRef = useRef<string | null>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Add event listeners for copy and paste
    editor.onDidChangeModelContent((e: any) => {
      if (e.isFlush) return;

      // Check if the change is a paste operation
      const isPaste = e.changes.some((change: any) =>
        change.text.length > 1 || change.text.includes("\n")
      );

      if (isPaste) {
        const model = editor.getModel();
        const clipboardData = window.navigator.clipboard.readText();

        // Allow paste only if it's from internal clipboard
        clipboardData.then((pastedText) => {
          if (pastedText !== internalClipboardRef.current) {
            // External paste detected, revert changes
            const value = code;
            model.setValue(value);
            toast.error("Pasting external content is not allowed");
          }
        });
      }
    });

    // Capture internal copy operations
    editor.onKeyDown((e: any) => {
      // Check for copy command (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 67) {
        const selection = editor.getSelection();
        if (!selection.isEmpty()) {
          const model = editor.getModel();
          const selectedText = model.getValueInRange(selection);
          internalClipboardRef.current = selectedText;
        }
      }
    });

    // Disable browser's paste event
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('paste', (e: ClipboardEvent) => {
        const clipboardData = e.clipboardData;
        if (clipboardData) {
          const pastedText = clipboardData.getData('text');
          if (pastedText !== internalClipboardRef.current) {
            e.preventDefault();
            toast.error("Pasting external content is not allowed");
          }
        }
      });
    }
  };

  return (
    <div className="editor-container h-full">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme={theme}
        onChange={(value) => setCode(value || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: fontSize,
          fontFamily: "Fira Code, monospace",
          automaticLayout: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          readOnly: readOnly,
          wordWrap: "on",
          // Disable built-in paste behavior
          quickSuggestions: false,
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
  const [language, setLanguage] = useState<LanguageKey>("cpp");
  const [code, setCode] = useState(LANGUAGES.cpp.initialCode);
  const [output, setOutput] = useState("");
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [isRunning, setIsRunning] = useState(false);
  const [savedCodes, setSavedCodes] = useState<Record<LanguageKey, string>>(() => {
    const initialSaved: Record<LanguageKey, string> = {} as Record<LanguageKey, string>;
    Object.keys(LANGUAGES).forEach((lang) => {
      initialSaved[lang as LanguageKey] = LANGUAGES[lang as LanguageKey].initialCode;
    });
    return initialSaved;
  });
  const [customInput, setCustomInput] = useState("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [memoryUsed, setMemoryUsed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"output" | "input">("output");
  const [error, setError] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(true);

  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // Load saved codes from localStorage if available
    const savedCodesFromStorage = localStorage.getItem("savedCodes");
    if (savedCodesFromStorage) {
      try {
        const parsed = JSON.parse(savedCodesFromStorage);
        setSavedCodes(parsed);
        // Set initial code to the saved one for current language
        if (parsed[language]) {
          setCode(parsed[language]);
        }
      } catch (e) {
        console.error("Failed to parse saved codes from storage", e);
      }
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("editorSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings from storage", e);
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("savedCodes", JSON.stringify(savedCodes));
  }, [savedCodes]);

  useEffect(() => {
    localStorage.setItem("editorSettings", JSON.stringify(settings));
  }, [settings]);

  // Update code when language changes
  useEffect(() => {
    setCode(savedCodes[language] || LANGUAGES[language].initialCode);
  }, [language, savedCodes]);

  const increaseFontSize = () => {
    setSettings((prev) => ({
      ...prev,
      fontSize: prev.fontSize < 30 ? prev.fontSize + 1 : prev.fontSize
    }));
  };

  const decreaseFontSize = () => {
    setSettings((prev) => ({
      ...prev,
      fontSize: prev.fontSize > 10 ? prev.fontSize - 1 : prev.fontSize
    }));
  };

  const saveCurrentCode = () => {
    setSavedCodes((prev) => ({
      ...prev,
      [language]: code,
    }));
    toast.success(`Code saved for ${LANGUAGES[language].name}`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      toast.success(`File uploaded successfully`);
    };
    reader.readAsText(file);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `code.${LANGUAGES[language].extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success("Output copied to clipboard");
    }
  };

  const clearOutput = () => {
    setOutput("");
    setExecutionTime(null);
    setMemoryUsed(null);
    setError(null);
  };

  const runCode = async () => {
    setIsRunning(true);
    setError(null);
    setActiveTab("output");
    clearOutput();

    const startTime = performance.now();

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: language,
          version: LANGUAGES[language].version,
          files: [
            {
              name: `main.${LANGUAGES[language].extension}`,
              content: code,
            },
          ],
          stdin: customInput,
          args: [],
          compile_timeout: 10000,
          run_timeout: 5000,
        }),
      });

      const result = await response.json();
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      if (result.run) {
        setOutput(result.run.stdout || "");
        if (result.run.stderr) {
          setError(result.run.stderr);
        }

        if (result.run.output) {
          setMemoryUsed(formatBytes(result.run.memory || 0));
        }
      } else if (result.message) {
        setError(result.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsRunning(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleLanguageChange = (value: string) => {
    const newLanguage = value as LanguageKey;
    // Save current code before switching
    setSavedCodes((prev) => ({
      ...prev,
      [language]: code,
    }));
    setLanguage(newLanguage);
  };

  const resetCode = () => {
    setCode(LANGUAGES[language].initialCode);
    toast.info("Code reset to default");
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

        if (res.status === "failed") {
          toast.error("Failed to send code");
        } else {
          toast.success("Code submitted successfully");
          setShowCompiler(false);
        }
      } else {
        toast.error("WebSocket connection not available");
      }
    },
    [ws, setShowCompiler, interviewId],
  );

  const toggleConsole = () => {
    setShowConsole(!showConsole);
  };

  return (
    <div
      className={`fixed z-20 inset-0 bg-white dark:bg-slate-900 shadow-lg transition-transform duration-300 ease-in-out transform ${showCompiler ? "translate-x-0" : "translate-x-full"
        }`}
    >
      <div className="relative h-screen flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <div className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            Code Editor
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editor Settings</DialogTitle>
                        <DialogDescription>
                          Customize your editor experience
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="theme">Theme</Label>
                          <Select
                            value={settings.theme}
                            onValueChange={(value) =>
                              setSettings((prev) => ({ ...prev, theme: value }))
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              {EDITOR_THEMES.map((theme) => (
                                <SelectItem key={theme.value} value={theme.value}>
                                  {theme.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSettings((prev) => ({
                                  ...prev,
                                  fontSize: Math.max(10, prev.fontSize - 1)
                                }))
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSettings((prev) => ({
                                  ...prev,
                                  fontSize: Math.min(30, prev.fontSize + 1)
                                }))
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="word-wrap">Word Wrap</Label>
                          <Switch
                            id="word-wrap"
                            checked={settings.wordWrap === "on"}
                            onCheckedChange={(checked) =>
                              setSettings((prev) => ({
                                ...prev,
                                wordWrap: checked ? "on" : "off"
                              }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="minimap">Minimap</Label>
                          <Switch
                            id="minimap"
                            checked={settings.minimap}
                            onCheckedChange={(checked) =>
                              setSettings((prev) => ({ ...prev, minimap: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="line-numbers">Line Numbers</Label>
                          <Switch
                            id="line-numbers"
                            checked={settings.lineNumbers === "on"}
                            onCheckedChange={(checked) =>
                              setSettings((prev) => ({
                                ...prev,
                                lineNumbers: checked ? "on" : "off"
                              }))
                            }
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCompiler(false)}
              className="rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full border-0"
          >
            <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
              <div className="bg-white dark:bg-slate-800 p-4 h-full overflow-auto border-r flex flex-col">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                  Problem Statement
                </h2>
                <div className="flex-1 prose dark:prose-invert max-w-none">
                  {codingQuestion ? (
                    <div dangerouslySetInnerHTML={{ __html: codingQuestion }} />
                  ) : (
                    <p>
                      Write a program in your preferred language to solve the problem
                      described by your interviewer.
                    </p>
                  )}
                </div>
              </div>
            </ResizablePanel>

            <ResizablePanel defaultSize={60} minSize={40}>
              <div className="h-full flex flex-col bg-white dark:bg-slate-800">
                <div className="border-b p-2 bg-slate-50 dark:bg-slate-800 flex flex-wrap gap-2 items-center">
                  <div className="flex items-center">
                    <Label
                      htmlFor="language-select"
                      className="mr-2 text-sm font-medium"
                    >
                      Language:
                    </Label>
                    <Select
                      value={language}
                      onValueChange={handleLanguageChange}
                    >
                      <SelectTrigger id="language-select" className="h-8 w-32">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LANGUAGES).map(([key, lang]) => (
                          <SelectItem key={key} value={key}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-1 ml-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={decreaseFontSize}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Decrease font size</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <span className="text-xs font-medium w-10 text-center">
                      {settings.fontSize}px
                    </span>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={increaseFontSize}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Increase font size</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={saveCurrentCode}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">Save</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={resetCode}
                          >
                            <span className="text-xs">Reset</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reset to default code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={downloadCode}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            <span className="text-xs">Download</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download code</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="cursor-pointer">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => { }}
                              tabIndex={-1}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              <span className="text-xs">Upload</span>
                            </Button>
                            <Input
                              type="file"
                              className="hidden"
                              accept=".js,.py,.cpp,.java,.go,.rs"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload code file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex-1">
                  <CodeEditor
                    language={language}
                    code={code}
                    setCode={setCode}
                    fontSize={settings.fontSize}
                    theme={settings.theme}
                    readOnly={false}
                  />
                </div>

                <div className="border-t p-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <Button
                    variant="default"
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Code
                      </>
                    )}
                  </Button>

                  <Button
                    variant="default"
                    onClick={() => handleSubmitCode(code, codingQuestion)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Solution
                  </Button>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {showConsole && (
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-l">
                  <div className="border-b p-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 ${activeTab === "output" ? "bg-slate-200 dark:bg-slate-700" : ""
                          }`}
                        onClick={() => setActiveTab("output")}
                      >
                        <Terminal className="h-4 w-4 mr-1" />
                        Output
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 ${activeTab === "input" ? "bg-slate-200 dark:bg-slate-700" : ""
                          }`}
                        onClick={() => setActiveTab("input")}
                      >
                        Input
                      </Button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={copyOutput}
                              disabled={!output && !error}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={clearOutput}
                              disabled={!output && !error}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear console</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="flex-1 p-2 overflow-auto">
                    {activeTab === "output" ? (
                      <div className="h-full">
                        {executionTime !== null && (
                          <div className="text-xs text-slate-500 mb-2">
                            Execution time: {executionTime.toFixed(2)}ms
                            {memoryUsed && ` • Memory: ${memoryUsed}`}
                          </div>
                        )}

                        {error && (
                          <pre className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded-md overflow-auto whitespace-pre-wrap text-sm mb-2">
                            {error}
                          </pre>
                        )}

                        <pre
                          ref={outputRef}
                          className="font-mono text-sm dark:text-slate-200 overflow-auto whitespace-pre-wrap h-full"
                        >
                          {output || (
                            <span className="text-slate-400 dark:text-slate-500">
                              {isRunning
                                ? "Running code..."
                                : "Run your code to see output here"}
                            </span>
                          )}
                        </pre>
                      </div>
                    ) : (
                      <div className="h-full">
                        <Label htmlFor="custom-input" className="text-sm mb-1 block">
                          Standard Input
                        </Label>
                        <textarea
                          id="custom-input"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Enter input for your program here..."
                          className="w-full h-[calc(100%-30px)] p-2 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-4 right-4 bg-slate-200 dark:bg-slate-700 rounded-full shadow-lg"
          onClick={toggleConsole}
        >
          <Terminal className="h-4 w-4 mr-1" />
          {showConsole ? "Hide Console" : "Show Console"}
        </Button>
      </div>
    </div>
  );
}