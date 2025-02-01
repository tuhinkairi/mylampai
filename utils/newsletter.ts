const newemailTemplate = `
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
                <td>
                {{EMAIL_CONTENT}}
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
` 

export default newemailTemplate;