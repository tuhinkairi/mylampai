import { getNewsletter } from "@/actions/emailfetch";
import prisma from "@/lib"
import { Newsletter } from "@prisma/client";
import { useEffect, useState } from "react";

interface EmailStatsProps { newsletterId: string; onBack: () => void };

// const initialNewletter = {
//     id: '',
//     subject: '',
//     content: null,
//     template: null,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     sentTimestamp: new Date(),
//     openCount: null
// }

export default function EmailStats({ newsletterId, onBack }: EmailStatsProps) {
    const [newsletter, setNewsletter] = useState<Newsletter>();
    const getData = async (id: string) => {
        const data = await getNewsletter(id);
        if (data) {
            setNewsletter(data[0]);
        }
    }

    useEffect(() => {
        const data = getData(newsletterId);
        if (data) {
            // setNewsletter(data[0]);
            console.log("data", data);
        }
    }, []);

    if (!newsletter) {
        return (
            <div>
                <h2>Loading...</h2>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <button onClick={onBack} className="mb-4 px-4 py-2 text-base text-white bg-violet-500 rounded hover:bg-violet-400">Create new newsletter</button>
            <h2 className="text-2xl font-bold mb-4">Newsletter Details</h2>
            <div className="space-y-4">
                <div>
                    <span className="font-semibold">Subject : </span>{" "}{newsletter.subject || "Not available"}
                </div>
                <div>
                    <span className="font-semibold">Open Count:</span>{" "}{newsletter.openCount ?? "N/A"}
                </div>
                {/* <div>
                    <span className="font-semibold">Content : </span>{" "}{newsletter.content || "Not Available"}
                </div> */}
                <div>
                    <label className="font-semibold">
                        Template sent:
                    </label>
                    <div
                        dangerouslySetInnerHTML={{ __html: newsletter.content || '' }}
                        className="p-4 border border-gray-300 rounded-lg bg-gray-300 h-96 overflow-y-scroll"
                    />
                </div>
                {/* <div>
                    <span className="font-semibold">Template : </span>{" "}{newsletter.template || "Not Available"}
                </div> */}
                <div>
                    <span className="font-semibold">Sent At:</span>{" "}
                    {new Date(newsletter.sentTimestamp).toLocaleString()}
                </div>
                {/* <div>
                    <span className="font-semibold">Emails:</span>{" "}
                    {newsletter.emails.length > 0
                        ? newsletter.emails.join(", ")
                        : "No emails available"}
                </div> */}
            </div>
        </div>
    )
}