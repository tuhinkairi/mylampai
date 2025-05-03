"use server";

import prisma from "@/lib";
import axios from "axios";

const smtp2GoAPI = process.env.SMTP2GO_API_KEY as string;

export const fetchEmails = async () => {
  try {
    const emails = await prisma.newsletter.findMany();
    return emails;
  } catch (error) {
    console.error("Error in fetchEmails:", error);
  }
};

export const getNewsletter = async (newsletterId: string) => {
  try {
    const newsletter = await prisma.newsletter.findMany({
      where: {
        id: newsletterId,
      },
    });
    return newsletter;
  } catch (error) {
    console.error("Error in fetchEmails:", error);
  }
};
const templateType = [
  {
    id: String,
    name: String,
    subject: String,
    html_body: String,
  },
];
export const getTemplates = async () => {
  try {
    const response = await axios.post(
      "https://api.smtp2go.com/v3/template/search",
      {}, // Ensure payload is sent if required
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-Smtp2go-Api-Key": smtp2GoAPI,
        },
      }
    );
    // console.log("ersa: ",response.data.data.templates)
    const templates = response.data.data.templates || [];
    const templatesWithHtml = await Promise.all(
      templates.map(async (temp: any) => {
        try {
          const htmlResponse = await axios.post(
            "https://api.smtp2go.com/v3/template/view",
            { id: temp?.id },
            {
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                "X-Smtp2go-Api-Key": smtp2GoAPI,
              },
            }
          );

          return {
            id: temp.id,
            name: temp.name,
            subject: temp.subject,
            html_body: htmlResponse.data?.data?.html_body || "",
          };
        } catch (htmlError) {
          console.error(
            `Error fetching HTML body for template ${temp.id}:`,
            htmlError
          );
          return { ...temp, html_body: "Error fetching HTML body" };
        }
      })
    );
    //  console.log("all templates::",templatesWithHtml)
    return templatesWithHtml;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};
