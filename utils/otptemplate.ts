const emailTemplate = `
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive HTML Email Template</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            background-color: #cccccc;
            font-family: Arial, sans-serif;
        }

        table {
            border-spacing: 0;
            border-collapse: collapse;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }

        .outer-wrapper {
            width: 100%;
            height: 100vh;
            background-color: #cccccc;
        }

        .main-table {
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 5px;
            border: 1px solid #e5ecee;
            margin: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        p {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #555555;
            margin: 10px 20px;
        }

        .content {
            padding: 10px;
        }

        .otp {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: black;
            margin: 20px 0;
        }

        .closure {
            line-height: 1.2;
            padding-top: 20px;
        }
    </style>
</head>

<body>
    <table class="outer-wrapper" width="100%" cellspacing="0" cellpadding="0" align="center" valign="middle">
        <tr>
            <td align="center" valign="middle">
                <table class="main-table" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style=" padding: 20px;">
                            <img src="https://myimgs.org/storage/images/1183/wizelogo.png" alt="Logo"
                                style="max-width: 130px;" />
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <p
                                style="font-weight: bold; font-size: 20px;color: black; text-align: center; margin-bottom: 8px;">
                                Verify Your Email Address to Complete Registration</p>
                            <p style="font-size: 16px;font-weight: 500; margin-top: 19px;">
                                Hi <span style="font-weight: 500;">{{USER_NAME}}</span>,
                            </p>
                            <p style="margin-top: 16px;">
                                Thanks for your interest in wiZe. We received a request to verify your identity. Please
                                use the OTP below to complete the verification process:
                            </p>
                            <p class="otp">Your OTP: {{OTP_CODE}}</p>
                            <p style="margin-top: 14px;">
                                The OTP is valid for the next 10 minutes. If you did not request this OTP, please ignore
                                this email or contact our support team.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="content" style="text-align: center; padding-top: 10px;">
                            <a href="https://wize.co.in/" 
                               style="background-color: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; 
                                      border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; margin-top: 10px;">
                                Start your journey today!
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td class="closure">
                            <p >Thanks for your time,<br> The wiZe Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
`;

export default emailTemplate;
