import { User } from "../generated/prisma";

export function userActivationEmail({
  user,
}: {
  user: {
    name: string;
    businessName: string;
  };
}) {
  const date = new Date().toLocaleDateString();

  let textBody = `Hello ${user.name ?? "User"},\n\n`;
  textBody += `We have reviewed your account application for ${
    user.businessName ?? "Business Name"
  }.\n`;
  textBody += `Your account is now active, you can sign in at https://app.ironclad.co.jp/login\n\n`;

  let htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.25; color: #1d293d; }
          .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          h2 { color: #1d293d; }
          .logo { width: 200px; height: auto; margin-bottom: 20px; }
          .logo img { display: block; width: 100%; }
          .order-summary { margin-top: 20px; border-top: 1px solid #eee; padding-top: 12px; }
          .product-details { margin-bottom: 8px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
          .product-details h3 { margin-top: 0; }
          .footer { margin-top: 30px; text-align: center; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <p class="logo"><img src="cid:logo@ironclad" alt="Ironclad logo" /></p>
          <h2>Account Reviewed</h2>
          <p>Hello ${user.name ?? "User Name"},</p>
          <p>
            We have reviewed your account application for ${
              user.businessName ?? "Business Name"
            }.<br />
            Your account is now active, you can sign in at  <a href="${
              process.env.NEXT_PUBLIC_BASE_URL
            }/login" target="_blank"><strong>
    https://app.ironclad.co.jp/login
  </strong></a>
          </p>

          <p>If you have any questions, please contact us at staff@ironcladknives.com</p>

          
  `;

  textBody += `\n---\n\n`;
  textBody += `Best,\nIronclad`;

  htmlBody += `
          <p class="footer">Best, <br> Ironclad</p>
        </div>
      </body>
    </html>
  `;

  return { text: textBody, html: htmlBody };
}
