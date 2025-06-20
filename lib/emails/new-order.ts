import { Prisma } from "../generated/prisma";

type orderDetails = Prisma.OrderGetPayload<{
  select: {
    id: true;
    code: true;
    createdAt: true;
    orderProduct: {
      select: {
        details: true;
        brand: true;
        handle: true;
        request: true;
        product: {
          include: {
            sizes: true;
          };
        };
      };
    };
  };
}>;

export function NewOrderEmailClient({
  name,
  order,
}: {
  name: string;
  order: orderDetails;
}) {
  const orderDate = new Date(order.createdAt).toLocaleDateString();

  let textBody = `Hello ${name},\n\n`;
  textBody += `We have successfully received your order #${order.code} placed on ${orderDate}.\n`;
  textBody += `If you have any questions, or want to discuss about this order, please contact us at staff@ironcladknives.com.\n\n`;
  textBody += `Order Details:\n`;

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
          <h2>Order Confirmation</h2>
          <p>Hello ${name},</p>
          <p>
            We have successfully received your order on ${orderDate}. <br />
            <strong>#${order.code}</strong>
          </p>

          <p>If you have any questions, or want to discuss about this order, please contact us at staff@ironcladknives.com</p>

          <div class="order-summary">
            <h3>Order Details</h3>
  `;

  for (const orderProduct of order.orderProduct) {
    textBody += `\n---\n`;
    textBody += `${orderProduct.product && orderProduct.product.name}\n`;
    textBody += `Engraving: ${orderProduct.brand} - Brand: ${orderProduct.brand} - Handle: ${orderProduct.handle}\n`;
    textBody += `Request: ${orderProduct.request || "None"}\n`;

    htmlBody += `
      <div class="product-details">
        <h3>${orderProduct.product && orderProduct.product.name}</h3>
        <p>
        ${
          orderProduct.product && orderProduct.product.name !== orderProduct.brand
            ? `<strong>Engraving:</strong> ${orderProduct.brand} - `
            : ""
        }
        <strong>Brand:</strong> ${
          orderProduct.product && orderProduct.product.brand
        }<strong> - Handle:</strong> ${orderProduct.handle} <br />
        <strong>Request:</strong> ${orderProduct.request || "No special request."}</p>
        <div class="size-details">
          <p>
    `;

    const productDetails = orderProduct.details as Prisma.JsonArray;

    for (const detail of productDetails) {
      const sizeDetail = detail as {
        id: number;
        quantity: number;
        nameAtOrder: string;
      } | null;

      // Find the size info from the product's sizes array
      const sizeInfo =
        sizeDetail !== null &&
        orderProduct.product &&
        orderProduct.product.sizes.find((size) => size.id === sizeDetail.id);

      if (sizeInfo) {
        textBody += `Size: ${sizeInfo.name} ${sizeInfo.size} ---- Ordered: ${sizeDetail.quantity}\n`;
        htmlBody += `Size: ${sizeInfo.name} ${sizeInfo.size} ---- Ordered: ${sizeDetail.quantity}<br />`;
      }
    }

    htmlBody += `</div></div>`;
  }

  textBody += `\n---\n\n`;
  textBody += `Best,\nIronclad`;

  htmlBody += `
            </p>
          </div>
          <p class="footer">Best, <br> Ironclad</p>
        </div>
      </body>
    </html>
  `;

  return { text: textBody, html: htmlBody };
}
