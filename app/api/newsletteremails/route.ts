import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib";
import { sendEmail } from "@/lib/nodemailer";

const validateEmail = (email: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// export const POST = async (req: NextRequest) => {
//   try {
//     const { email } = await req.json();

//     if (!email) {
//       return NextResponse.json(
//         { message: "Email is required" },
//         { status: 400 },
//       );
//     }

//     const isValidEmail = validateEmail(email);

//     if (!isValidEmail) {
//       return NextResponse.json(
//         { message: "Invalid email" },
//         { status: 400 },
//       );
//     }

//     const newsletter = await prisma.newsletterEmails.findFirst({
//       where: { email },
//     });

//     if (newsletter) {
//       return NextResponse.json({ messge: "Subscribed!" }, { status: 200 });
//     }

//     await prisma.newsletterEmails.create({
//       data: {
//         email,
//       },
//     });

//     return NextResponse.json({ message: "Subscribed!" }, { status: 200 });

//   } catch (err) {
//     console.log("error", err);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// };

export const GET = async (req: NextRequest) => {
  const email = req.nextUrl.searchParams.get('email');
  let opentime = req.nextUrl.searchParams.get('opentime');
  const newsletterId = req.nextUrl.searchParams.get('newsletterId');
  if (!email || !newsletterId) {
    return NextResponse.json({ error: "Email Required" }, { status: 400 });
  }

  // if(!opentime){
  //   opentime = new Date();
  // }

  try {
    const emailobj = await prisma.email.update({
      where: {
        id: newsletterId,
        emailAddress: email,
      },
      data: {
        status: "read",
        openedAt: opentime
      }
    })
    console.log(`Email has been opened by ${email} at ${opentime}`);
  } catch (error) {
    console.log(error);
  }

  return NextResponse.json({ status: 200 });
}


export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { emails, subject, content } = body;

    if (!emails || !subject || !content) {
      return NextResponse.json(
        { error: "Emails, subject, and content are required" },
        { status: 400 }
      );
    }

    const EmailsMailString = emails.join(", ");

    try {
      const res = await sendEmail(EmailsMailString, subject, content);

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
            newsletter: updatedNewsletter
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
      console.error("Error sending emails:", error);
      return NextResponse.json(
        { error: "Internal Server Error", errormsg: error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", errormsg:  error },
      { status: 500 }
    );
  }
};
