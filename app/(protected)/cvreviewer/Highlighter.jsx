import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "mark.js";

// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const Highlighter = () => {
  const [pdfDocument, setPdfDocument] = useState(null);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = (e.target).elements.namedItem("pdf");
    
    if (file.files && file.files[0]) {
      const fileUrl = URL.createObjectURL(file.files[0]);
      displayPDF(fileUrl);
    }
  };

  const displayPDF = async () => {
    const pdfDoc = await pdfjs.getDocument(url).promise;
    setPdfDocument(pdfDoc);
    const pdfContainer = document.getElementById("pdf-container");
    if (pdfContainer) {
      pdfContainer.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const pageContainer = document.createElement("div");
        pageContainer.className = "page";
        pageContainer.style.width = `${viewport.width}px`;
        pageContainer.style.height = `${viewport.height}px`;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const textLayerDiv = document.createElement("div");
        textLayerDiv.className = "textLayer";
        textLayerDiv.style.pointerEvents = "auto";

        pageContainer.appendChild(canvas);
        pageContainer.appendChild(textLayerDiv);
        pdfContainer.appendChild(pageContainer);

        const textContent = await page.getTextContent();
        textLayerDiv.style.width = `${canvas.offsetWidth}px`;
        textLayerDiv.style.height = `${canvas.offsetHeight}px`;
        textLayerDiv.style.left = `${canvas.offsetLeft}px`;
        textLayerDiv.style.top = `${canvas.offsetTop}px`;

        pdfjs.renderTextLayer({
          textContent: textContent,
          container: textLayerDiv,
          viewport: viewport,
          textDivs: [],
        }).promise.then(() => {
          highlightSentences(["Kota"], "highlighted", false);
        });
      }
    }
  };

  const highlightSentences = (list_of_sentences, class_name, case_sensitive_flag) => {
    const options_general = {
      ignorePunctuation: ":;.,-–—‒_(){}[]!'\"+=".split(""),
      separateWordSearch: false,
      accuracy: "partially",
      className: class_name,
      acrossElements: true,
      caseSensitive: case_sensitive_flag,
      noMatch: function (node) {
        highlightSentenceBackup(node.textContent || "", class_name, case_sensitive_flag);
      },
    };

    list_of_sentences.forEach((sentence) => {
      document.querySelectorAll(".textLayer").forEach((layer) => {
        new (window).Mark(layer).mark(sentence, options_general);
      });
    });
  };

  const highlightSentenceBackup = (sentence, class_name, case_sensitive_flag) => {
    const options_general = {
      ignorePunctuation: ":;.,-–—‒_(){}[]!'\"+=".split(""),
      separateWordSearch: false,
      accuracy: "partially",
      className: class_name,
      acrossElements: true,
      caseSensitive: case_sensitive_flag,
      noMatch: function (node) {
        highlightSentenceBackupTwo(node.textContent || "", class_name, case_sensitive_flag, 0);
      },
    };

    document.querySelectorAll(".textLayer").forEach((layer) => {
      new (window).Mark(layer).mark(sentence, options_general);
    });
  };

  const highlightSentenceBackupTwo = (node, class_name, case_sensitive_flag, level) => {
    // Implement the backup highlighting logic if necessary
  };

  return (
    <div>
      <h1>Upload and View PDF</h1>
      <form id="upload-form" onSubmit={handleFileUpload}>
        <input
          type="file"
          id="pdf-file"
          name="pdf"
          accept="application/pdf"
          required
        />
        <button type="submit">Upload PDF</button>
      </form>
      <div id="pdf-container" style={{ width: "100%", height: "600px", border: "1px solid #ccc", overflow: "auto", position: "relative" }}></div>
    </div>
  );
};

export default Highlighter;