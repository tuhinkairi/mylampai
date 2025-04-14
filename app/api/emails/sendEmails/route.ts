import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Smtp2go-Api-Key": process.env.SMTP2GO_API_KEY as string, // Use environment variable
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: body.to, // Array of recipient emails
        sender: body.sender || "support@wize.co.in",
        subject: body.subject,
        html_body: body.html_body || ""
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to send email" }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
