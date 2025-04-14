// /pages/api/webhooks/handle-event.ts
import { NextResponse } from "next/server";

export default async function handler(req: Request, res: Response) {
  if (req.method === "POST") {
    try {
      const eventData = req.body;
      console.log("Received webhook:", eventData);
      // Do something with the eventData

      return NextResponse.json(eventData, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  } else {
    NextResponse.json({ message: "Method Not Allowed" }, { status: 404 });
  }
}
