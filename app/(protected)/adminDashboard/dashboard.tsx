"use client";
import React, { useState, useEffect } from "react";
import QuillWrapper from "@/components/adminDashboard/QuillWrapper";
// import emailtemplate from "@/utils/newsletter";
// import otptemplate from "@/utils/otptemplate";
// import { sendNewsLetter, scheduleNewsLetter } from "@/utils/newlettermailing";
import { getTemplates } from "@/actions/emailfetch";

// const availableTemplates = [
//   { name: "Standard Template", template: emailtemplate },
//   { name: "OTP Template", template: otptemplate },
// ];

interface TemplateType {
  id: string;
  name: string;
  subject: string;
  html_body: string;
}

export default function AdminDashboard() {
  const [value, setValue] = useState(""); 
  const [emailTemplate, setEmailTemplate] = useState<TemplateType | null>(null);
  const [finalHTMLTemplate, setFinalHtmlTemplate] = useState("");
  const [subject, setSubject] = useState(""); 
  const [emailIds, setEmailIds] = useState(""); 
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleFrequency, setScheduleFrequency] = useState("One-Time");
  const [availableTemplates, setAvailableTemplates] = useState<TemplateType[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templates = await getTemplates();
        console.log("asshedwuhd", templates)
        if (templates.length > 0) {
          setAvailableTemplates(templates);
          setEmailTemplate(templates[0]); 
          setSubject(templates[0].subject);
          setFinalHtmlTemplate(templates[0].html_body); 
        } else {
          console.error("No templates found");
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    if (emailTemplate) {
      const updatedHtml = emailTemplate.html_body.replace("{{EMAIL_CONTENT}}", value);
      setFinalHtmlTemplate(updatedHtml);
    }
  }, [value, emailTemplate]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplate = availableTemplates[parseInt(e.target.value)];
    setEmailTemplate(selectedTemplate);
    setSubject(selectedTemplate.subject);
  };

  const handleSendEmail = async () => {
    const recipientEmails = emailIds.split(",").map((email) => email.trim());

    console.log("Sending Email...", {
      to: recipientEmails,
      subject,
      template_id: emailTemplate?.id,
      finalHTMLTemplate,
    });

    const response = await fetch("/api/sendEmails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: recipientEmails,
        sender: "Support <support@wize.co.in>",
        subject,
        html_body:finalHTMLTemplate
      }),
    });

    const data = await response.json();
    console.log("Email Send Response:", data);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h2 className="text-center text-violet-500 font-semibold text-2xl bg-gray-100 p-4">
        {scheduleMode ? "Schedule an Email" : "Send an Email"}
      </h2>

      {/* Subject Input */}
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

      {/* Email Content Editor */}
      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-700">Email Body</label>
        <QuillWrapper value={value} onChange={setValue} />
      </div>

      {/* Template Selection */}
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

      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Live Preview</h3>
        <div dangerouslySetInnerHTML={{ __html: finalHTMLTemplate }} className="border p-4 bg-gray-50" />
      </div>

      {/* Recipient Emails Input */}
      <div className="space-y-2">
        <label className="block text-lg font-medium text-gray-700">Recipient Emails</label>
        <textarea
          value={emailIds}
          onChange={(e) => setEmailIds(e.target.value)}
          placeholder="Enter email IDs separated by commas"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* Schedule Mode Inputs */}
      {scheduleMode && (
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">Schedule Date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">Schedule Time</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700">Frequency (Optional)</label>
            <select
              value={scheduleFrequency}
              onChange={(e) => setScheduleFrequency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="One-Time">One-Time</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
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
      </div>
    </div>
  );
}

