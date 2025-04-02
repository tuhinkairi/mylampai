"use client";
import React from "react";
import dynamic from "next/dynamic";
import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';

// const ReactQuill = dynamic(
//   () => import("react-quill")
//   ,
//   {
//     ssr: false,
//     loading: () => <p>Loading editor...</p>,
//   }
// );

interface QuillWrapperProps {
  value: string;
  onChange: (value: string) => void;
}

const QuillWrapper: React.FC<QuillWrapperProps> = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <div className="quill-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Enter Email body here"
      />
    </div>
  );
};

export default QuillWrapper;