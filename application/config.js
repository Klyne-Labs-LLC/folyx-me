import themes from "daisyui/src/theming/themes.js";

const config = {
  // REQUIRED
  appName: "Folyx",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Folyx - AI-powered portfolio generation platform. Create stunning professional portfolios automatically.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "app.folyx.me",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (mailgun.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_456",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Starter",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfect for getting started with portfolio creation",
        // The price you want to display, the one user will be charged on Stripe.
        price: 19,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 29,
        features: [
          {
            name: "3 Portfolios",
          },
          { name: "All Templates (15+)" },
          { name: "Platform Integrations (GitHub, LinkedIn)" },
          { name: "Custom Domain" },
          { name: "AI Content Generation" },
          { name: "Weekly Auto-Updates" },
        ],
      },
      {
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp7iftKnrrpw"
            : "price_456",
        name: "Pro",
        description: "For professionals who need advanced features",
        price: 49,
        priceAnchor: 69,
        features: [
          {
            name: "Unlimited Portfolios",
          },
          { name: "Advanced AI Content & SEO" },
          { name: "All Platform Integrations" },
          { name: "Advanced Analytics" },
          { name: "CV/Resume Parsing" },
          { name: "Daily Auto-Updates" },
          { name: "Priority Support" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  mailgun: {
    // subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
    subdomain: "mg",
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `Folyx <anian@folyx.me>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Anian at Folyx <anian@folyx.me>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "anian@folyx.me",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "anian@folyx.me",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#3b82f6", // Primary blue to match root app
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/",
  },
  payments: {
    // FEATURE FLAG: Set to false to disable all payment features (grants free access to all users)
    // Set to true when ready to enable Stripe payments after getting EIN number
    enabled: false,
    // When payments are disabled, all users get full access without paying
    freeAccessMode: true,
  },
};

export default config;
