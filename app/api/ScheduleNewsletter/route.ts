import prisma from "@/lib";
import { sendEmail } from "@/lib/nodemailer";
import { NextRequest, NextResponse } from "next/server";
import * as cronJob from "node-cron";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { emails, subject, content, date, time, frequency } = body;

        console.log(body);

        if (!emails || !subject || !content || !date) {
            return NextResponse.json(
                { error: "Emails, subject, content and time are required" },
                { status: 400 }
            );
        }
        const EmailsMailString = emails.join(", ");
        const [hours, minutes] = time.split(":").map(Number);
        const [year, month, day] = date.split("-").map(Number);
        let cronExp;

        switch (frequency.toLowerCase()) {
            case "daily":
                cronExp = `${minutes} ${hours} * * *`;
                break;
            case "weekly":
                cronExp = `${minutes} ${hours} * * ${new Date(date).getDay()}`;
                break;
            case "monthly":
                cronExp = `${minutes} ${hours} ${day} * *`;
                break;
            case "one-time":
                cronExp = `${minutes} ${hours} ${day} ${month} *`;
                break;
            default:
                return NextResponse.json(
                    { error: "Invalid schedule frequency. Valid options are: one-time, daily, weekly, monthly." },
                    { status: 400 }
                );

        }

        const JobPromise = new Promise<string>((resolve, reject) => {
            const task = cronJob.schedule(cronExp, async () => {
                try {
                    const res = await sendEmail(EmailsMailString, subject, content);
                    console.log(res);
                    task.stop();
                    resolve(res);
                } catch (err) {
                    task.stop();
                    reject(err);
                }
            });
            // console.log("res:",res);

            if (frequency.toLowerCase() === "one-time") {
                const runAt = new Date(year, month - 1, day, hours, minutes);
                const delay = runAt.getTime() - Date.now();
                if (delay > 0) {
                    setTimeout(() => task.start(), delay);
                } else {
                    task.start();
                }
            } else {
                task.start();
            }
        });

        const res = await JobPromise;

        if (res === "success") {
            const newNewsletter = await prisma.newsletter.create({
                data: {
                    subject,
                    content,
                    sentTimestamp: new Date(),
                    openCount: 0,
                },
            });

            const createdEmails = await Promise.all(
                emails.map((email: any) =>
                    prisma.email.create({
                        data: {
                            emailAddress: email,
                            status: "sent",
                            newsletterId: newNewsletter.id,
                        },
                    })
                )
            );

            const updatedNewsletter = await prisma.newsletter.update({
                where: { id: newNewsletter.id },
                data: {
                    emails: {
                        connect: createdEmails.map((email) => ({ id: email.id })),
                    },
                },
            });

            return NextResponse.json(
                {
                    message: "Emails sent successfully",
                    newsletter: updatedNewsletter,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: "Failed to send Emails" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in sendNewsLetter:", error);
        return NextResponse.json(
            { error: "An error occurred while sending the newsletter" },
            { status: 500 }
        );
    }
}