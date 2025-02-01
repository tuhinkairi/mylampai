"use client";

export const sendNewsLetter = async (
    emails: string[],
    subject: string,
    content: string
) => {
    try {
        const response = await fetch("/api/newsletteremails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails, subject, content }),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                message: "Emails sent successfully",
                newsletter: data.newsletter,
            };
        } else {
            const errorData = await response.json();
            return { message: "Failed to send emails", error: `${errorData.error}` };
        }
    } catch (error) {
        console.error("Error in sendNewsLetter:", error);
        throw new Error("An error occurred while sending the newsletter");
    }
};

export const scheduleNewsLetter = async (
    emails: string[],
    subject: string,
    content: string,
    date: string,
    time: string,
    frequency: string
) => {
    try {
        console.log(emails,subject,content,date,time,frequency);
        const response = await fetch("/api/ScheduleNewsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails, subject, content, date,time,frequency})
        });
    
        if (response.ok) {
            const data = await response.json();
            return {
                message: "Emails sent successfully",
                newsletter: data.newsletter,
            };
        }else {
            const errorData = await response.json();
            return { message: "Failed to send emails", error: `${errorData.error}` };
        }
    } catch (error) {
        console.error("Error in sendNewsLetter:", error);
        throw new Error("An error occurred while sending the newsletter");
    }
}