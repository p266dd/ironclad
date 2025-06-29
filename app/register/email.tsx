export const RegistrationEmailText = `
    Hello from Ironclad!,\n\n
    We have successfully received your registration request.\n
    Our staff will review your application and get back to you shortly. You will receive a confirmation email when your request has been approved.\n\n\n
  
    If you didn't request this, you can safely ignore this email.\n\n
    Best,\n
    Ironclad
  `;

export const RegistrationEmailHTML = `
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
          .button {
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
          <h2 style="font-size: 22px; margin-bottom: 30px; ">New User Registration</h2>
          <p>Hello from Ironclad!</p>
          <p>We have successfully received your registration request.<br />
            Our staff will review your application and get back to you shortly. 
            You will receive a confirmation email when your request has been approved.
          </p>
          <br />
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p class="footer">Best, <br> Ironclad</p>
        </div>
      </body>
    </html>
  `;

export const RegistrationEmailStaffText = `
  You have a new user registration request!,\n\n
  Please open your application to see this request.\n\n
  Best,\n
  Ironclad
`;

export const RegistrationEmailStaffHTML = `
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
          .button {
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
          <h2 style="font-size: 22px; margin-bottom: 30px; ">New User Registration</h2>
          <p>You have a new user registration request!</p>
          <p>Please open your application to see this request.</p>
          <br />
          <p class="footer">Best, <br> Ironclad</p>
        </div>
      </body>
    </html>
  `;
