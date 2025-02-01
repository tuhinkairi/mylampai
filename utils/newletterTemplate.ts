const emailTemplate = `
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>wiZe Email Template</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            background-color: #CCCCCC;
            font-family: sans-serif;
        }

        table {
            border-spacing: 0;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
        }

        .main {
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
        }

        p {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #555555;
            margin: 10px 20px;
        }

        .outer {
            max-width: 600px;
            background-color: #ffffff;
            border-left: 1px solid #E5ECEE;
            border-right: 1px solid #E5ECEE;
        }
    </style>
</head>

<body>
    <center class="wrapper">
        <div class="outer" style="background: linear-gradient(135deg, #cdb6fa, #b799d5);">
            <table class="main" align="center">
                <tr>
                    <td>
                        <img src="https://myimgs.org/storage/images/1183/wizelogo.png" alt="Logo"
                            style="top: 2px; left: 4px; max-width: 130px;" />
                    </td>
                    <td>
                        <img src="{{SERVER_URL}}?email={{USER_EMAIL}}" width="1" height="1" alt="" style="display: none;">
                    </td>
                </tr>
                <tr>
                    <td style="padding: 16px;">
                        <p style="font-size: 18px;font-weight: 500; margin-top: 16px;">
                            Hi <span style="font-weight: 500;">{{USER_NAME}}</span>,
                        </p>
                        <p style="margin-bottom: 16px;">
                            At <strong style="color: #7C3AED;">wiZe</strong>, we’re here to make your career journey
                            smooth, exciting, and tailored just for you. Whether you're exploring your interests,
                            gearing up for placements, or taking the first steps towards your dream career, we’ve got
                            your back!
                        </p>
                        <p
                            style="font-weight: bold; font-size: 18px; color: #7C3AED; text-align: center; margin-bottom: 8px;">
                            Why Choose wiZe?
                        </p>
                        <div
                            style="background-color: white; border: 1px solid #D1D5DB; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 8px; margin-top: 8px;">
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="margin-bottom: 16px;">
                                    <strong style="color: #111827;">All-Round Support</strong>
                                    <br />
                                    <span style="color: #4B5563;">
                                        From career exploration, coding practice, and interview prep to competitions,
                                        projects, and CV building—all in one place!
                                    </span>
                                </li>
                                <li style="margin-bottom: 16px;">
                                    <strong style="color: #111827;">Expert Insights</strong>
                                    <br />
                                    <span style="color: #4B5563;">
                                        Backed by 1,000+ industry professionals, including partnerships with IITs, IIMs,
                                        and Microsoft.
                                    </span>
                                    <a href="https://wize.co.in/"
                                        style="color: #2563EB; text-decoration: underline; font-weight: 500;">Get
                                        Started</a>
                                </li>
                                <li style="margin-bottom: 16px;">
                                    <strong style="color: #111827;">Ace Your Coding Skills</strong>
                                    <br />
                                    <span style="color: #4B5563;">
                                        Solve 400+ coding problems from top companies to boost your expertise.
                                    </span>
                                </li>
                                <li style="margin-bottom: 16px;">
                                    <strong style="color: #111827;">Prep for Interviews Like a Pro</strong>
                                    <br />
                                    <span style="color: #4B5563;">
                                        Mock interviews and expert feedback to help you shine.
                                    </span>
                                    <a href="#"
                                        style="color: #2563EB; text-decoration: underline; font-weight: 500;">Learn
                                        More</a>
                                </li>
                                <li style="margin-bottom: 16px;">
                                    <strong style="color: #111827;">Advanced Features</strong>
                                    <br />
                                    <span style="color: #4B5563;">
                                        AI-powered community, self-assessments, and more to simplify your career
                                        journey.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p style="padding: 8px;">WiZe is specially designed for your convenience, offering 100% online, AI-powered
                            learning tailored to your unique journey. Backed by 1,000+ industry experts and trusted by
                            IITs, IIMs, Microsoft, and more, WiZe has guided 10k+ successful premium admits, making it
                            the go-to platform for career success. With features like an AI-powered smart community to
                            learn, grow, and collaborate, self-evaluation tools to identify your strengths and gaps, and
                            expert guidance from top industry professionals, WiZe is your ultimate savior and buddy.
                            From college to career and beyond, WiZe has your back every step of the way.<a href="#"
                            style="color: #2563EB; text-decoration: underline;">Explore
                            wiZe</a>
                            today and unlock your dream future!</p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div style="margin-top: 24px; text-align: center;">
                            <a href="https://wize.co.in/"
                                style="display: inline-block; background-color: #7C3AED; color: white; font-weight: 600; padding: 8px 16px; border-radius: 8px; text-decoration: none;">Join
                                Now!</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <h4 style="font-weight: 400; color: white; text-align: center; margin-bottom: 4px;">
                            Follow Us
                        </h4>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; width: 100%; padding: 14px;">
                        <a href="https://www.instagram.com/wize.mylamp/" style="text-decoration: none;" >
                            <img src="https://myimgs.org/storage/images/1180/white-instagram.png" width="30px" style="background-color: #DB2777; border-radius: 8px;" />
                        </a>
                        <a href="https://www.linkedin.com/company/wize-mylamp/" style="text-decoration: none;" >
                            <img src="https://myimgs.org/storage/images/1181/white-linkedin.png" width="30px" style="background-color: #2563EB; border-radius: 8px;" />
                        </a>
                        <a href="https://www.youtube.com/@wize-mylamp" style="text-decoration: none;">
                            <img src="https://myimgs.org/storage/images/1182/white-youtube.png" width="30px" style="background-color: #DC2626; border-radius: 8px;" />
                        </a>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 16px; text-align: center; color: #111827;">
                        <p style="margin-top: 16px;">
                            <a href="#" style="color: #1D4ED8;">Privacy Policy</a> |
                            <a href="#" style="color: #1D4ED8;">Contact Support</a> |
                            <a href="#" style="color: #1D4ED8;">Unsubscribe</a>
                        </p>
                        <p style="color: #6B7280;">
                            IIT Kharagpur (W Bengal) 721302
                        </p>
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>
</html>
`;

export default emailTemplate;