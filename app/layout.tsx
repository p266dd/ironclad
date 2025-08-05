import { cookies } from "next/headers";
import { Open_Sans } from "next/font/google";
import "./globals.css";

import InstallPrompt from "@/components/install-prompt";
import { Toaster } from "@/components/ui/sonner";

import { TourProvider } from "@/lib/tour/tour-context";
import Tour from "@/lib/tour/tour";
import { CustomCard } from "@/lib/tour/custom-card";
import { Tour as TourInterface } from "@/lib/tour/types";
import { RulerIcon } from "lucide-react";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["300", "400", "600", "700"],
});

export const metadata = {
  title: "Ironclad App",
  description: "Ironclad wholesaler application.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
};

const tours: TourInterface[] = [
  {
    // Home Tour
    tour: "home-tour",
    steps: [
      {
        // Open product preview
        icon: null,
        title: "Open Preview",
        content: (
          <>
            <span className="hidden md:block">
              You can double click the image to open a preview.
            </span>
            <span className="md:hidden">Tap and hold to open preview.</span>
          </>
        ),
        selector: "#preview-item",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
    ],
  },
  {
    // Product Tour
    tour: "product-tour",
    steps: [
      {
        // Product size
        icon: <RulerIcon />,
        title: "Available Sizes",
        content: <>All the available sizes for this product.</>,
        selector: "#product-sizes",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Order quantity
        icon: null,
        title: "Order Quantity",
        content: (
          <>
            <p>Choose how many items to add to your cart.</p>
            <p className="font-bold text-sm mt-2">
              Note: To add a product to your cart, at least one size must contain a
              quantity.
            </p>
          </>
        ),
        selector: "#order-quantity",
        side: "left",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Engraving
        icon: null,
        title: "Brand Engraving",
        content: (
          <>
            <p>Choose what to engrave on your product.</p>
            <p className="text-xs text-gray-400 mb-2">
              * Not all products can be changed.
            </p>
          </>
        ),
        selector: "#product-engraving",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Handle
        icon: null,
        title: "Custom Handle",
        content: (
          <>
            <p>Choose a different handle for your product.</p>
            <p className="text-xs text-gray-400 mb-2">
              * Not all products can be changed.
            </p>
          </>
        ),
        selector: "#product-handle",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Request
        icon: null,
        title: "Add Additional Requests",
        content: (
          <>
            <p>Write any relevant information for this product in your order.</p>
          </>
        ),
        selector: "#product-request",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Get help
        icon: null,
        title: "Show Again",
        content: <>Click here to show this explanation again.</>,
        selector: "#product-help",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
    ],
  },
  {
    // Search Tour
    tour: "search-tour",
    steps: [
      {
        // Search preview
        icon: null,
        title: "Search Preview",
        content: (
          <>
            <p>Start typing to see a results preview.</p>
            <p className="text-sm mt-2 text-gray-600">Preview starts after 3 letters.</p>
          </>
        ),
        selector: "#preview-search",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Product Type
        icon: null,
        title: "Product Type",
        content: (
          <>
            <p>Narrow search by product type.</p>
          </>
        ),
        selector: "#type-search",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Product style
        icon: null,
        title: "Knife Styles",
        content: (
          <>
            <p>This filter only work when searching for knives.</p>
          </>
        ),
        selector: "#style-search",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Product Stock
        icon: null,
        title: "Stock Status",
        content: (
          <>
            <p>Select this if you are looking for items with a large stock.</p>
          </>
        ),
        selector: "#stock-search",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Product Price
        icon: null,
        title: "Price Range",
        content: (
          <>
            <p>Use this option to search for a specific price range.</p>
            <p className="text-sm mt-2 text-gray-600">
              * Drag the dots to fit your desired price range.
            </p>
          </>
        ),
        selector: "#price-search",
        side: "bottom",
        showControls: false,
        pointerPadding: 20,
        pointerRadius: 6,
      },
      {
        // Product Size
        icon: null,
        title: "Size Range",
        content: (
          <>
            <p>Use this option to search for a specific size range.</p>
            <p className="text-sm mt-2 text-gray-600">
              * Drag the dots to fit your desired size range.
            </p>
          </>
        ),
        selector: "#size-search",
        side: "top",
        showControls: false,
        pointerPadding: 20,
        pointerRadius: 6,
      },
      {
        // Product Brand
        icon: null,
        title: "Brands",
        content: (
          <>
            <p>Search products within a specific brand.</p>
          </>
        ),
        selector: "#brand-search",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Product Material
        icon: null,
        title: "Material",
        content: (
          <>
            <p>Search products made using a specific material.</p>
          </>
        ),
        selector: "#material-search",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Get help
        icon: null,
        title: "Open Help",
        content: <>Click any time to see this help again.</>,
        selector: "#search-help",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
    ],
  },
  {
    // Cart Tour
    tour: "cart-tour",
    steps: [
      {
        // Cart Tour
        icon: null,
        title: "Edit Product",
        content: <p>Click on the product to edit it in your cart.</p>,
        selector: "#cart-item",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Cart Tour
        icon: null,
        title: "Add New Size",
        content: (
          <>
            <p>- You can only edit the sizes you added to your cart.</p>
            <p className="text-sm font-semibold mt-2">
              Open product page to add new size.
            </p>
          </>
        ),
        selector: "#cart-item",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Cart Tour
        icon: null,
        title: "Complete Order",
        content: <p>Ready to order? Click here.</p>,
        selector: "#cart-order",
        side: "bottom-left",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
    ],
  },
  {
    // Home Tour
    tour: "account-tour",
    steps: [
      {
        icon: null,
        title: "Order History",
        content: (
          <>
            <p>See your previous orders.</p>
          </>
        ),
        selector: "#account-history",
        side: "bottom-left",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        icon: null,
        title: "Update Password",
        content: (
          <>
            <p>Update your password.</p>
            <p>Remember to save it.</p>
          </>
        ),
        selector: "#pass-update",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        icon: null,
        title: "Business Code",
        content: (
          <>
            <p>
              We use this to keep track your orders. You can choose to write your name
              here.
            </p>
            <p className="font-semibold mt-3">
              This is a unique code across all clients.
            </p>
          </>
        ),
        selector: "#business-code",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        icon: null,
        title: "Generate Code",
        content: (
          <>
            <p>Click here to generate a unique code.</p>
          </>
        ),
        selector: "#generate-code",
        side: "top-right",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        icon: null,
        title: "Save Your Preferences",
        content: (
          <>
            <p>
              You can save a text to be used later, when adding products to your cart.
            </p>
          </>
        ),
        selector: "#preferences",
        side: "top",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        icon: null,
        title: "Connecting Accounts",
        content: (
          <>
            <p>If your company has more than one account, you can connect them here.</p>
            <p>
              After connection, the accounts will be able to see their combined orders.
            </p>
          </>
        ),
        selector: "#connecting-accounts",
        side: "top-left",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        icon: null,
        title: "Connecting Accounts",
        content: (
          <>
            <p>To be able to connect, you will need:</p>
            <p>- Allow connection.</p>
            <p>- Setup a Business code.</p>
            <p className="text-sm font-semibold mt-3">
              * Each account must have a unique business code.
            </p>
          </>
        ),
        selector: "#connecting-accounts",
        side: "top-left",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
      {
        // Get help
        icon: null,
        title: "Show Again",
        content: <>Click any time to see this explanation again.</>,
        selector: "#account-help",
        side: "bottom",
        showControls: false,
        pointerPadding: 6,
        pointerRadius: 6,
      },
    ],
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const doNotDisplayPrompt = cookieStore.get("doNotDisplayPrompt");

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-title" content="Ironclad" />
        <meta name="application-name" content="Ironclad" />
        <meta name="theme-color" content="#1d293d" />
      </head>
      <body className={`${openSans.variable} antialiased`}>
        {!doNotDisplayPrompt && <InstallPrompt />}
        <TourProvider>
          <Tour
            tours={tours}
            showTour={true}
            shadowRgb="0,0,0"
            shadowOpacity="0.8"
            cardComponent={CustomCard}
          >
            {children}
          </Tour>
        </TourProvider>
        <Toaster position="top-center" richColors={true} />
      </body>
    </html>
  );
}
