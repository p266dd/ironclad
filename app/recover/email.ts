export function RecoverEmailText({ code }: { code: string }) {
  return `
    Hello from Ironclad,\n
    We received a password recovery request for your account! Please use the code below to reset your password.\n\n
    ${code}\n\n
    If you didn't request this, you can safely ignore this email.\n\n
    Best,\n
    Ironclad
  `;
}

export function RecoverEmailHTML({ code }: { code: string }) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .container {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            text-align: center;
          }
          .logo {
          text-align: center;
          }
          .code {
              margin: 30px 0;
              text-size: 12px;
          }
          .button,
          .button:hover,
          .button:visited {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            font-size: 12px;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo"><img src="cid:logo@ironclad" alt="Ironclad logo" style="width: 200px;" /></div>
          <h2>Password Recovery Code</h2>
          <p>Someone has requested a password recovery for your account! Please use the code below to reset your password.</p>
          <a target="_blank" href="${code}">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p class="footer">Best, <br> Ironclad</p>
        </div>
      </body>
    </html>
  `;
}
