"use client";
import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import emailtemplate from "@/utils/newsletter";
import otptemplate from "@/utils/otptemplate";
import { sendNewsLetter, scheduleNewsLetter } from "@/utils/newlettermailing";

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

const availableTemplates = [
  { name: "Standard Template", template: emailtemplate },
  { name: "OTP Template", template: otptemplate },
];

export default function AdminDashboard() {
  const [value, setValue] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [emailTemplate, setEmailTemplate] = useState(emailtemplate);
  const [finalHTMLTemplate, setFinalHtmlTemplate] = useState(emailTemplate);
  const [subject, setSubject] = useState("");
  const [emailIds, setEmailIds] = useState("");
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleFrequency, setScheduleFrequency] = useState("One-Time");

  const createMarkup = (html: any) => {
    setEmailContent(html);
    const htmlTemplate = emailTemplate.replace(
      "{{EMAIL_CONTENT}}",
      emailContent
    );
    setFinalHtmlTemplate(htmlTemplate);
  };

  useEffect(() => {
    const htmlTemplate = emailTemplate.replace(
      "{{EMAIL_CONTENT}}",
      emailContent
    );
    setFinalHtmlTemplate(htmlTemplate);
  }, [emailContent]);

  const handleSendEmail = async () => {
    const recipientEmails = emailIds.split(",").map((email) => email.trim());
    const res = await sendNewsLetter(recipientEmails, subject, finalHTMLTemplate);
    console.log(res);
    if(res.message === "Emails sent successfully"){
      alert("Email sent successfully!");
    }else{
      alert("Failed to send Emails");
    }
  };

  const handleScheduleEmail = async () => {
    const recipientEmails = emailIds.split(",").map((email) => email.trim());
    const res = await scheduleNewsLetter(
      recipientEmails,
      subject,
      finalHTMLTemplate,
      scheduleDate as string,
      scheduleTime as string,
      scheduleFrequency as string
    );
    console.log(res);
    console.log(scheduleDate, scheduleTime, scheduleFrequency);
    // if()
    // alert("Email scheduled successfully!");
  };

  const handleTemplateChange = (e: any) => {
    setEmailTemplate(availableTemplates[e.target.value].template);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h2 className="text-center text-violet-500 font-semibold text-2xl bg-gray-100 p-4">
        {scheduleMode ? "Schedule an Email" : "Send an Email"}
      </h2>

      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-700">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter the email subject"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-700">Email Body</label>
        <ReactQuill
          value={value}
          onChange={setValue}
          modules={modules}
          placeholder="Enter Email body here"
          className="bg-white border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="text-lg font-medium text-gray-700">Choose Template</label>
        <select
          onChange={handleTemplateChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableTemplates.map((temp, idx) => (
            <option key={idx} value={idx}>
              {temp.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => createMarkup(value)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
      >
        Generate Template
      </button>

      <div>
        <label className="block text-lg font-medium text-gray-700">Preview</label>
        <div
          dangerouslySetInnerHTML={{ __html: finalHTMLTemplate }}
          className="p-4 border border-gray-300 rounded-lg bg-gray-300 h-96 overflow-y-scroll"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-700">
          Recipient Emails
        </label>
        <textarea
          value={emailIds}
          onChange={(e) => setEmailIds(e.target.value)}
          placeholder="Enter email IDs separated by commas"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {scheduleMode && (
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Schedule Date
            </label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">
              Schedule Time
            </label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">
              Frequency (Optional)
            </label>
            <select
              defaultValue={"One-Time"}
              value={scheduleFrequency}
              onChange={(e) => setScheduleFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">One-Time</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleSendEmail}
          className="px-6 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition"
        >
          Send Email
        </button>
        <button
          onClick={() => setScheduleMode(!scheduleMode)}
          className="px-6 py-2 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition"
        >
          {scheduleMode ? "Switch to Send Now" : "Schedule Email"}
        </button>
        {scheduleMode && (
          <button
            onClick={handleScheduleEmail}
            className="px-6 py-2 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition"
          >
            Schedule Email
          </button>
        )}
      </div>
    </div>
  );
}
