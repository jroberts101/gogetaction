Designing a GoFundMe-Inspired Campaign Platform Frontend
========================================================

**Overview:** We will build a modern **React** frontend (using **Vite** + **TypeScript**) for a campaign platform, following the look-and-feel inspirations of GoFundMe. The design emphasizes **accessibility**, **responsive** layouts, and **SEO-friendly** practices. We'll use popular libraries like **Tailwind CSS** and **Headless UI** to speed development while ensuring a delightful UX. All pages will be **WCAG 2.1 AA** compliant and have semantic, indexable HTML for search engines. Subtle animations and micro-interactions (e.g. hover effects) will enrich the user experience without overwhelming it. Integration points for **Keycloak** (auth), **Stripe** (payments), and **ClickSend** (letters) are scaffolded with secure placeholders. The result is a friendly, maintainable frontend ready for backend integration.

Technology Stack & Frameworks
-----------------------------

-   **React + Vite + TypeScript:** The app is a SPA built with React for a dynamic UX, using Vite for fast bundling and an optimized dev experience. TypeScript provides type safety and documentation in code, helping catch errors early.

-   **Tailwind CSS for Styling:** Tailwind's utility-first classes allow rapid development of a consistent design system. We can compose utility classes (e.g. `flex`, `p-4`, `text-center`, `shadow-lg`) to style components directly in markup​[tailwindcss.com](https://tailwindcss.com/#:~:text=Rapidly%20build%20modern%20websites%20without,ever%20leaving%20your%20HTML). This yields a highly **customizable** UI without writing lots of custom CSS. Tailwind's responsive design features (prefixes like `sm:`, `md:`) make it easy to adapt layouts for **mobile, tablet, and desktop** from the start.

-   **Headless UI Components:** We will leverage Headless UI (React version) for pre-built accessible components (modals, lists, comboboxes, etc.). Headless UI provides **"completely unstyled, fully accessible UI components"** that integrate beautifully with Tailwind CSS​[headlessui.com](https://headlessui.com/#:~:text=Completely%20unstyled%2C%20fully%20accessible%20UI,integrate%20beautifully%20with%20Tailwind%20CSS). For example, we can use a Headless UI `<Dialog>` for a modal form or `<Listbox>` for a custom select, and then apply Tailwind classes to match our theme. This ensures complex interactions (like dialog focus trapping or keyboard navigation in dropdowns) meet accessibility standards out-of-the-box.

-   **React Router:** For client-side routing between pages (Home, Campaign, etc.), ensuring each route can have its own metadata and state. URLs will be clean and descriptive (e.g. `/campaigns/new` for creation, `/campaigns/{id}` or slug for details) to improve SEO and clarity.

-   **State Management:** We will primarily use React's built-in state and context. A Context provider will likely handle global auth state (user tokens/roles from Keycloak) and perhaps a context or lightweight store for the letter "cart" (selected letters/recipients before payment). This avoids heavy libraries unless needed, keeping the bundle light.

-   **Build & Deployment:** The frontend will be built as static assets via Vite. In production, these can be served by Nginx (as per the backend architecture)​file-3a3u9bnva51mnfd2ubqh7q. We will configure a strong Content Security Policy via the server, given we handle external scripts (Stripe)​file-3a3u9bnva51mnfd2ubqh7q. The code will be containerized for deployment consistency (e.g. using a Node Alpine image to build, then serving via Nginx container as static files).

Global Design Principles
------------------------

-   **Responsive Layout:** We adopt a mobile-first design that expands gracefully to larger screens. Tailwind's responsive utilities ensure that components like navigation, cards, and multi-column layouts adjust at common breakpoints. All pages will be tested on various screen sizes (small smartphones up to large desktops) to guarantee usability. We utilize flexible grids and flexbox for structure, and make images/fluid typography adapt to screen width.

-   **Accessibility (WCAG 2.1 AA):** Accessibility is built in from the start. We use proper **semantic HTML5** elements -- e.g. `<header>` for the nav bar, `<main>` for content, `<footer>` for the site info, `<form>` for forms, and appropriate headings (`<h1>...<h2>` hierarchy) -- to give meaning to the content. All interactive controls (links, buttons, form fields) will be reachable via **keyboard** (e.g., using `:focus` styles along with `:hover` so keyboard users get the same cues​[blog.pixelfreestudio.com](https://blog.pixelfreestudio.com/how-to-create-hover-effects-with-micro-interactions/#:~:text=For%20example%2C%20if%20you%E2%80%99re%20using,as%20those%20using%20a%20mouse)). We ensure sufficient **color contrast** for text and UI elements (meeting AA contrast ratios). ARIA attributes are added where needed (for example, ARIA labels on icons or status messages, role attributes on region containers) to assist screen readers. Headless UI helps here by providing accessible widget behavior (like focus management in dialogs) by default. If any hover-triggered content is used, it will also be made available on focus or click so it's not mouse-only​[blog.pixelfreestudio.com](https://blog.pixelfreestudio.com/how-to-create-hover-effects-with-micro-interactions/#:~:text=Accessibility%20is%20a%20critical%20consideration,create%20barriers%20for%20these%20users). We'll also respect user preferences, e.g. disabling animations if `prefers-reduced-motion` is set (using Tailwind's `motion-reduce` utility to turn off non-essential animations).

-   **SEO & Metadata:** Following SEO best practices, each page will have a **unique, descriptive title and meta description**. We will use **React Helmet** (or Vite's HTML templates) to manage `<head>` tags dynamically, allowing us to insert relevant SEO metadata per page (e.g., campaign titles in the title tag). We'll include **Open Graph** tags and **Twitter Card** meta on campaign pages so that sharing a campaign on social media yields a nice preview (campaign image, title, description). The HTML is semantic and indexable, though as an SPA we might consider server-side rendering or pre-rendering in the future for optimal crawlability. *(Note: In a pure SPA, search engines can index content with dynamic rendering, but SSR could be introduced later for improvement​[codewalnut.com](https://www.codewalnut.com/learn/is-react-js-seo-friendly#:~:text=%2A%20Server,using%20JavaScript%20routing%20frameworks%20like).)* We will ensure the React Router URLs are human-readable and reflect content (e.g. `/campaigns/climate-action`), which search engines prefer for rankings​[codewalnut.com](https://www.codewalnut.com/learn/is-react-js-seo-friendly#:~:text=,hierarchy%20and%20incorporate%20relevant%20keywords). The site will also include a robots.txt and sitemap.xml (generated by the backend) to assist indexing.

-   **Performance & Optimization:** The frontend will be optimized for fast loads. Vite's bundling produces efficient chunks; we'll employ **code-splitting** for routes (e.g. the Stripe-heavy payment component can load only when needed). Assets are optimized: images can be lazy-loaded if there are many (e.g. campaign thumbnails below the fold). We use Tailwind to avoid large CSS files -- it will purge unused styles in production, keeping CSS minimal. Additionally, all external integrations (Stripe JS, etc.) will be loaded asynchronously to not block rendering. We keep animations subtle to maintain performance (and use CSS transitions which are GPU-accelerated). Cross-browser testing on Chrome, Firefox, Safari, and Edge will be done to fix any compatibility issues; we stick to standard APIs and have autoprefixing via PostCSS (built into Tailwind) to ensure CSS works across vendors.

-   **Security Best Practices:** Although mostly a frontend concern, we ensure no sensitive data is exposed in the client. All API calls (to our backend or third parties) happen over HTTPS. **Authentication tokens** from Keycloak are stored in memory or Redux store (not in `localStorage` to prevent XSS leaks)​file-kvj2hbtsptrprkhqd3h9xe. We use the **OIDC PKCE flow** with Keycloak, meaning no client secret is exposed and the authorization code exchange is protected by a proof key​file-kvj2hbtsptrprkhqd3h9xe. For Stripe, only publishable keys are used on the client; actual card data never touches our servers (it's sent directly to Stripe), which keeps us in a lower PCI scope​[docs.stripe.com](https://docs.stripe.com/security/guide#:~:text=use%20one%20of%20our%20low,servers%2C%20reducing%20your%20PCI%20obligations). We will also sanitize any user-generated content displayed (like campaign descriptions) to avoid injection issues (though this may be handled server-side). Finally, we'll review the app with OWASP guidelines in mind (e.g. using `Helmet` for setting secure response headers via Nginx, and avoiding vulnerable dependencies by keeping libraries updated​file-3a3u9bnva51mnfd2ubqh7q​file-3a3u9bnva51mnfd2ubqh7q).

Pages and User Flows
--------------------

### 1\. Homepage

The homepage is designed to engage users immediately with a friendly introduction and clear calls to action. It will contain:

-   **Hero Section:** A welcoming banner with a tagline introducing the platform's purpose (e.g. "Empower Your Cause -- Start a Campaign or Support One Today"). This section has an appealing background (could be a subtle image or gradient) with **high-contrast text** for readability. Prominent **CTA buttons** are placed here: "**Start a Campaign**" (for campaigners) and "**Browse Campaigns**" (for general users). These buttons will be styled as large, accessible buttons (using Tailwind classes like `px-6 py-3 rounded-lg font-semibold text-white`) with a primary brand color. On hover or focus, the buttons might slightly lift or accentuate (e.g. a shadow grows) to indicate interactivity.

-   **Navigation:** A top navigation bar that is persistently available. It includes the platform logo (linked to home), and menu items like **Browse Campaigns**, **How It Works**, **About**, **Login/Register** (or user avatar if logged in). This nav will collapse into a mobile menu (hamburger icon) on small screens -- for this we can use Headless UI's `<Disclosure>` or custom logic to toggle a dropdown menu. The nav will be keyboard-navigable (using proper `<button>` for the mobile toggle and a focus outline on links).

-   **Featured/Trending Campaigns:** A section showcasing a few highlighted campaigns to entice browsing. This could be a grid of **campaign cards**. Each **Campaign Card** will display a cover image (with alt text), the campaign title, a short description or tagline, and maybe a stat (like number of supporters or days active). The card design uses a **rounded corner** container with a soft drop shadow for a friendly feel. On hover, the card will subtly raise or brighten (e.g., using Tailwind hover:shadow-xl and transition classes). This provides a micro-interaction to indicate it's clickable​[blog.pixelfreestudio.com](https://blog.pixelfreestudio.com/how-to-create-hover-effects-with-micro-interactions/#:~:text=Tailwind%E2%80%99s%20utility%20classes%20make%20it,in%20hover%20variants). Importantly, the same effect triggers on focus for accessibility. Clicking a card leads to the campaign's detail page.

-   **Footer:** A comprehensive footer with links to **Terms of Service**, **Privacy Policy**, **About Us**, and **Contact**. We'll also include social media icons (linked to platform's socials) if applicable. The footer text will use small but readable font, and a high-contrast background (e.g. dark background, light text) for distinction. It might also reiterate the site tagline or copyright notice. The HTML structure uses `<footer>` and possibly an `<nav>` inside it for the link list, marked with `aria-label="Footer"` for screen readers.

*Accessibility:* All images on the homepage have descriptive `alt` attributes. The hero's text and buttons meet color contrast requirements against the background. The CTAs are also keyboard-focusable (we ensure a visible focus style, possibly a Tailwind ring outline). Landmarks like `<header>`, `<main>` (wrapping hero and features), and `<footer>` enable assistive tech to skim the page structure easily.

*SEO:* The homepage will have an `<h1>` (the tagline) and meta description welcoming users. Open Graph tags will identify it as the site's main page. We'll include relevant keywords in content (like "start a campaign", "support causes") in a natural way, to improve search relevance.

### 2\. Campaign Creation Flow (Multi-Step Form)

Campaign creation is a **wizard-style, multi-step form** that lets a **Campaigner** user set up a new campaign. It will be accessible only to authenticated users with the Campaigner role (if not logged in, clicking "Start a Campaign" will prompt login via Keycloak first). The flow is broken into clear steps with a progress indicator:

-   **Step 1: Campaign Details** -- The user enters basic info about the campaign. This page (likely at route `/campaigns/new` or `/campaigns/create`) presents a form with fields:

    -   *Title*: Text input for the campaign title (with a character limit shown).

    -   *Description*: A larger textarea for the campaign description or cause details. This can include guidance text about what to write.

    -   *Target Goal (optional)*: A number input for a fundraising or letters-sent goal (since these campaigns might measure support). If not applicable, the user can leave it blank.

    -   We use **Tailwind forms** styles (either via a plugin or custom classes) to style inputs consistently -- for example, all inputs have padding, border radius, and focus outline (Tailwind's `focus:ring` classes) for clarity. Labels are associated with each input for accessibility (using `<label for=...>`). We may also use helper text below fields for validation hints.

    -   A **Next** button advances to Step 2. We'll validate required fields before moving on (e.g., Title cannot be empty). Validation errors appear in an accessible way (like an error message with an icon, colored red, and the input gets `aria-invalid="true"`).

    -   *UX Note:* We can indicate the step number at the top (e.g., "Step 1 of 3: Details"), perhaps as a progress bar or simply text. This helps users know where they are in the process.

-   **Step 2: Payment (Campaign Fee via Stripe)** -- To publish a campaign, the user must pay a creation fee (as per requirements). This step will integrate **Stripe** checkout elements:

    -   We display a summary of the campaign (title and fee amount) and then present a **payment form**. Using **Stripe Elements**, we embed a secure card input field. For example, we use Stripe's CardElement or PaymentElement UI component inside our form. This field is styled to match our site (Stripe Elements can be customized with CSS variables/Tailwind classes to harmonize with our theme).

    -   We show the price (fee) clearly and any terms (e.g., "This one-time fee will activate your campaign"). The user enters their card details. On submission, we call our backend's Stripe Proxy to create a Payment Intent for this fee, then confirm the payment using the client secret.

    -   During processing, a loading spinner or progress indicator is shown on the **Pay** button to prevent duplicate submissions. We also handle errors: if the card is declined or any error from Stripe occurs, an error message is shown with guidance (and the user can retry).

    -   Security: The card data never hits our server; it goes direct to Stripe via their JS library, ensuring **PCI compliance** (this approach reduces our obligations by **transmitting payment info directly to Stripe**​[docs.stripe.com](https://docs.stripe.com/security/guide#:~:text=use%20one%20of%20our%20low,servers%2C%20reducing%20your%20PCI%20obligations)). The frontend simply receives a token or confirmation from Stripe.

    -   This step needs to be **authenticated** (only campaign creators use it). We ensure the API call for payment is authorized with the user's token. If the user's login expired, we prompt re-auth (Keycloak silent refresh or login redirect).

    -   *Micro-interaction:* To make this payment step feel smooth, we can slightly fade in the form or use a slide transition from Step 1 to Step 2 (perhaps using a library like Framer Motion or CSS transitions). This provides a continuity effect.

-   **Step 3: Confirmation** -- Upon successful payment, the campaign is created and marked active. We show a confirmation screen summarizing the new campaign:

    -   A thank-you message like "Congrats! Your campaign is live."

    -   Key campaign info (title, maybe a generated campaign ID or link to view it).

    -   Possibly prompts to "Share your campaign" with social media share buttons (which would use the campaign's Open Graph metadata). This encourages the user to spread the word.

    -   A button to "Go to Campaign Dashboard" where they can manage it (or view it as the public would).

    -   We also trigger any backend updates: for instance, the backend would send a confirmation email or receipt. But from the UI perspective, we might show a note like "A receipt has been sent to your email."

    -   This page emphasizes a positive reinforcement (maybe include a celebratory graphic or icon).

Throughout the multi-step flow, we maintain accessibility: the form fields have appropriate labels and focus order. If using a modal or separate route for the wizard, we ensure screen readers are informed of the step changes (updating the step indicator aria-live region, for example). Also, each step's primary heading (<h2>) changes to reflect the step (so a screen reader user hears "Campaign Details", then "Payment", etc.). The **form is keyboard-navigable**, and we avoid any time limits that would rush the user. Form errors are announced via ARIA live regions if possible.

### 3\. Campaign Browsing and Viewing

This includes the **campaign listing page** for browsing all campaigns and the **campaign detail page** for viewing a specific campaign.

-   **Campaign Listing Page:** This page (`/campaigns` route) displays a searchable, filterable list of campaigns.

    -   At the top, a simple **search bar** allows users to search campaigns by keywords (title or tags). This could be an input with a search icon and "Search campaigns..." placeholder. We'll implement it to filter the list in real-time or trigger a search on enter. For accessibility, the search input has an associated label (visually hidden perhaps, using `.sr-only` utility) so screen readers identify it.

    -   Filters might include categories or sorting options (e.g., filter by topic or sort by newest, popular). These can be presented as a horizontal list of buttons or a dropdown (using Headless UI `<Listbox>` or a toggle group). For example, a dropdown to select "All Categories" vs specific cause categories.

    -   **Campaign Cards Grid:** We reuse the campaign card component (as seen on the homepage) in a grid layout. The grid is responsive: on mobile, one column; on tablet, two; on desktop, three or four columns. Each card provides a snapshot of the campaign. The card also includes a **"View" button or link** that is focusable. In addition to the hover effect, we ensure the card or its internal "View details" link is reachable via keyboard.

    -   Pagination or Infinite scroll: If there are many campaigns, we might include pagination controls or an infinite scroll (but pagination is more SEO-friendly since it allows indexing page 2, 3, etc. of campaigns). We could implement simple numbered page links or a "Load more" button.

-   **Campaign Detail Page:** When a user clicks a campaign, they go to `/campaigns/{campaignId}` (or slug). This page provides full details about the campaign and is the springboard for sending letters for that campaign.

    -   **Campaign Header:** Shows the campaign title prominently (<h1> tag for SEO), the campaign description text, and any image or banner associated with the campaign. We ensure the text is well-formatted (line breaks or paragraphs preserved). If the campaign has a goal/progress, we can show a progress bar (for example, "150 letters sent of 200 goal" or similar) -- this can update dynamically if we want to show real-time effect, but initially it can be static text or a styled progress indicator with proper ARIA attributes (like `role="progressbar"` and aria-valuenow).

    -   **Letter Templates Section:** The unique feature here is that each campaign has one or more **letter templates** associated, which general users can send. We will list the available letter templates on this page. Possibly, each template is shown as a collapsible preview:

        -   A letter template card or accordion: showing the template name or short description. Users can expand it to read the full letter content (for example, an excerpt with a "Read more" that expands). We can use a Headless UI **Disclosure** for accessible accordion behavior.

        -   Next to each template (or within it), there's a checkbox or selection mechanism if the user wants to send that letter. Users can choose one or multiple templates to send.

    -   **Recipient Input:** If the user decides to send a letter, they will need to provide recipient details. We might not show the full form by default on the campaign page; instead, the user clicks "Send Letters" to initiate the letter sending flow (which could be a dedicated flow or modal --- see next section). However, we might allow a quick action: e.g. each template card could have a "Send this letter" button that jumps to the letter sending form with that template pre-selected.

    -   **Campaigner Info:** Optionally, show information about the campaign creator (name or organization, if public), and when the campaign was created. If appropriate, include a way for users to share the campaign (social share buttons).

    -   The campaign detail page will also include a call-to-action to send letters (e.g., a button at the bottom "Prepare Letters to Send" that scrolls to or opens the letter sending form).

*Accessibility/SEO:* The detail page is marked up with proper headings (campaign title as H1, sections like "Letter Templates" as H2). Content like the campaign description will be plain text or sanitized HTML to maintain accessibility. If the letter templates are in expandable panels, we ensure keyboard and screen reader users can activate those (the Disclosure component will manage focus and `aria-expanded` states properly). This page is a prime candidate for social sharing, so we ensure meta tags (OG title, description, and perhaps an image) reflect the campaign's content​[crystallize.com](https://crystallize.com/blog/seo-for-react-ecommerce-spa#:~:text=Optimizing%20React%20eCommerce%20Single%20Page,Solutions%29%20for%20SPA%20SEO). For example, `<meta property="og:title" content="Save the Rainforest Campaign" />` etc., so when shared it looks appealing.

### 4\. Letter Sending Flow

The letter sending flow allows a user (anonymous or logged-in general user) to select letter templates from a campaign, specify recipients, and pay for the letters to be physically mailed via ClickSend. We aim to make this process as simple and clear as possible, even though it involves multiple sub-steps (select templates, add recipients, confirm cost, payment). Key characteristics:

-   **Selecting Letter Templates:** On the campaign detail page (or via a "Send Letters" button), the user is presented with the available letter templates to choose from. If they clicked from a specific template "Send" button, that one could be pre-selected. Otherwise, they might see a list of checkboxes next to each template. We will allow multiple selection (e.g., a user could send two different letters). Each template choice is labeled clearly (e.g. "Letter in support of X policy"). If there's a limit or recommendation (like "choose up to 3 letters"), we'll enforce or hint it.

-   **Selecting/Add Recipients:** After choosing templates, the user proceeds to input recipient addresses. This could be done in a form listing each recipient's details:

    -   We might allow adding multiple recipients (e.g., an interface where the user can "Add another recipient"). For instance, initially show one recipient form (Name, Address fields). Beneath, a button "+ Add Recipient" duplicates the fields for another. We will use a consistent format for postal addresses (e.g., separate fields for street, city, state, ZIP for US addresses, or a single textarea if international -- depending on scope).

    -   If the user chooses multiple templates and multiple recipients, effectively the number of letters = (# templates * # recipients). We should communicate that clearly ("You are sending 2 different letters to 3 recipients = 6 total letters.").

    -   The form will validate address fields (at least non-empty, perhaps basic format checks for ZIP code etc., though final validation might be done server-side by ClickSend API).

    -   This part of the flow can be on the campaign page as an expanded section or as a pop-up modal. Another approach is to make it a separate route (like `/campaigns/{id}/send`).

    -   We will ensure the form is not overwhelming: perhaps using a multi-step within this as well (Step 1: choose letters, Step 2: enter recipients). If done in a modal or same page, we can hide/show sections as needed rather than all at once.

-   **Cost Calculation:** As the user adds recipients or selects letters, the UI will dynamically show the **total cost** for sending. For example, if each letter costs a fixed amount, the cost = (number of letters) * (price per letter). We will display this prominently before payment so the user knows the charge. This can update in real-time when the user adds/removes a recipient or toggles a letter template. For implementation, we might call a backend API to get the cost (especially if pricing is complex or location-dependent) or calculate it in JS if it's straightforward. Either way, an element on the page will say "Total: $X.XX" and update accordingly​file-kvj2hbtsptrprkhqd3h9xe. This number will be used when initiating the Stripe payment.

-   **Stripe Payment for Letters:** Once letters and recipients are finalized, the user clicks "Proceed to Payment" (or a similar button). This triggers the payment step, which is similar to the campaign creation payment:

    -   We might integrate **Stripe Checkout** or **Elements** here. A simple approach: use Stripe Elements (card input) directly in our form flow to collect payment just as we did for campaign fee. Alternatively, for a smoother one-click experience, Stripe **Checkout** (hosted page) could be used by redirecting the user. However, to keep control in our app and allow multiple payment options, using the Card Element inline is fine.

    -   The user enters card details and confirms. We display the total amount and what it covers ("Pay $15 to send 6 letters"). After submitting, we call our backend (Stripe Proxy) to create a Payment Intent for this letter-sending transaction, then confirm payment with Stripe.js.

    -   On success, we show a **confirmation** message. This can be on the same page (e.g., the form is replaced with "Thank you, your letters are being mailed!"). The confirmation should reassure the user that their letters will be sent and perhaps provide an order ID or summary. We also mention that a confirmation email is sent (since the backend will likely send a receipt email).

    -   After payment, the backend will handle generating PDFs and calling ClickSend. The frontend doesn't do that directly, but we can show a loading state until the backend acknowledges that everything is initiated. Possibly, we poll an endpoint or rely on the immediate response. Given it's a proxy, likely the backend will respond success right after payment intent success and handle mailing asynchronously.

-   **User Feedback & Errors:** Throughout the letter flow, we provide clear feedback. If any required field is missing, the form will show an error highlighting that field (and move focus to it). If payment fails, we show an error and allow retry or card change. We also consider partial errors -- e.g., if one recipient's address is invalid as per ClickSend validation (this would come after payment in a real flow, perhaps via a callback or error message). In such a case, we'd inform the user if possible ("The address for John Doe appears invalid, please check and resend or contact support."). However, since the prompt says these will be handled by backend, our primary job is to gather correct info and display any known validation messages prior to submission.

*Accessibility:* The letter sending form is lengthy, so we ensure it's well-structured. We group recipient fields in fieldsets with a legend ("Recipient 1", "Recipient 2", etc.) for screen reader clarity. We provide instructions text where needed (e.g., format of addresses). The cost update could be announced via an ARIA live region (so that blind users are aware of the price change). All form controls are standard inputs/selects that are keyboard operable. If using a modal for this flow, focus will be trapped inside until the user completes or cancels, and we'll return focus to the originating control after closing.

### 5\. Authentication Screens (Keycloak Integration)

Authentication (Login, Registration, Password Reset) will rely on **Keycloak** to manage the heavy lifting, but we'll integrate it into the frontend seamlessly:

-   **Login Screen:** When a user chooses to log in (for example, a Campaigner clicking "Start a Campaign" or a user clicking a "Login" link), we redirect them to Keycloak's hosted login page via the OIDC Authorization Code flow. Keycloak will handle social logins (Facebook, Instagram) on its page if configured -- the user can choose those options there. We prefer using Keycloak's page for security and to avoid duplicating forms. However, we will have a **login route/page** in our app (`/login`) that serves as a callback handler. This page can show a loading spinner or friendly "Logging you in..." message while Keycloak redirects back with an authorization code. Using the **Keycloak JS adapter** (maintained by the Keycloak team​[medium.hexadefence.com](https://medium.hexadefence.com/securing-a-react-app-using-keycloak-ac0ee5dd4bfc#:~:text=,who%20maintain%20the%20Keycloak%20project)), the frontend will process the OIDC code -> token exchange (with PKCE). Once tokens are obtained (ID token, access token, refresh token), we mark the user as logged in in our React state.

    -   If for some reason we implemented a custom UI for login (not likely here), we would use Keycloak's REST API or OpenID endpoints to authenticate, but given Keycloak's robust UI and the need for social login, redirecting is simpler.

    -   **Social Login:** Because Keycloak is configured to broker Facebook/Instagram, those options appear on the Keycloak login page. We don't have to implement OAuth for those in our frontend; Keycloak handles it and returns to us an authenticated session.

    -   **Feedback:** In case of login errors (wrong password, etc.), Keycloak's page will show it. If the user cancels or an error occurs, our callback page can detect no token and show an "Authentication failed or canceled" message with an option to try again.

-   **Registration Screen:** Similarly, if a user chooses to sign up, we can direct them to Keycloak's **Self-Registration** page (if enabled). Typically, Keycloak has a registration link on the login page. We could also deep-link directly to registration by adding a parameter in the auth URL. The user would sign up (entering name, email, password), and Keycloak then returns them to our app logged in. We'll ensure that after first login, they might be prompted to choose a user type or given some onboarding, if needed. But initially, just having them registered as a General User (or if we want, we could assign Campaigner role on invite only -- depending on requirements).

    -   If we needed a custom registration form in-app (for more control over design), we could use Keycloak's Admin REST API to create the user, but that complicates flows. It's better to leverage Keycloak's own flows to ensure security (they handle password rules, email verification, etc. in one place).

-   **Password Reset:** When the user clicks "Forgot Password" (likely on the Keycloak login page link), Keycloak will handle sending a reset email. We might not have a dedicated screen for this in our app at all -- it's fully handled by Keycloak. If we did have a UI, it would just ask for an email and call Keycloak's reset endpoint, but again, that's duplicative. So our strategy is to rely on Keycloak's interfaces for any credential management. This keeps our frontend free of handling passwords directly, which is more secure.

-   **Post-Login State:** After login/registration, the user is back on our app with a valid session. We will show their authenticated state in the UI: e.g., the nav bar "Login" link changes to maybe their name or avatar with a menu (including "Dashboard" and "Logout"). The **Logout** action will call Keycloak's logout endpoint to invalidate the tokens and then redirect the user (Keycloak can be configured with a post-logout redirect to our homepage). We also clear any client state related to the user. Logging out should be seamless, ending the session both client-side and server-side.

*Integration Details:* Using **OIDC Code Flow with PKCE**, our React app (as a public client) does not use a client secret, but instead generates a PKCE verifier/challenge to securely get the token​file-kvj2hbtsptrprkhqd3h9xe​file-kvj2hbtsptrprkhqd3h9xe. The `keycloak-js` library can handle this under the hood (in recent versions, Keycloak supports PKCE for public clients). We'll initialize Keycloak with the realm URL, client ID, etc., on app start. Protected routes (like campaign creation) will check if Keycloak has a token; if not, we trigger `keycloak.login()` which does the redirect. The Access Token we get is then included in API requests to our backend for protected operations (like creating campaigns or submitting letter orders) via Authorization header. We will **not** store tokens in localStorage or expose them to JavaScript unnecessarily; instead, keep them in memory (e.g., in a React context)​file-kvj2hbtsptrprkhqd3h9xe. The Keycloak adapter can also silently refresh tokens using the refresh token, which we'll enable to keep sessions active without forcing relogin, improving UX.

### 6\. User Dashboards

We will provide simple dashboard pages for users to manage their campaigns or view their activity, accessible after login:

-   **Campaigner Dashboard:** Once logged in, a user with the Campaigner role can navigate to their dashboard (e.g., `/dashboard/campaigns`). This page will list all campaigns they have created in a manageable format:

    -   A list or table of campaigns showing each campaign's title, status (active/inactive), and key stats (letters sent, date created, etc.). Each entry might have action buttons: **Edit**, **View**, **Deactivate**.

        -   **Edit Campaign:** Allows editing the campaign details (title/description) or adding new letter templates. This could link to an edit form similar to creation (pre-filled fields). We will reuse form components for consistency.

        -   **Manage Templates:** Perhaps the campaigner can edit the text of letter templates or add new ones for their campaign. This might be a separate page or modal where they can input template content. (This is an extension not fully detailed in the prompt, but it was hinted that campaigners manage letter templates).

        -   **Deactivate:** The campaigner could toggle a campaign off (making it unbrowseable to others). If implemented, we'll ask for confirmation (yes/no modal) to prevent accidents. On confirm, an update is sent to backend and the UI marks that campaign as inactive (and maybe it no longer shows up for general users).

    -   The dashboard will also have a prominent button "Create New Campaign" as another entry point to the creation flow, for convenience.

    -   Layout-wise, this dashboard can be a simple vertical list on mobile, turning into a table on larger screens. We ensure the table/list is accessible (proper table semantics if using `<table>`, or list with headings if not).

    -   We'll also display any important notices for campaigners, such as if a payment is pending or if their Keycloak profile isn't complete, etc., as needed.

-   **General User Dashboard (optional):** If general users can register and have accounts (not strictly required for sending letters, but possible for tracking), we might include a basic dashboard for them too (e.g., `/dashboard` or `/dashboard/letters`). This could show a history of letters they have sent:

    -   List of past letter orders with date, campaign name, maybe number of letters and status (e.g., "Sent").

    -   This would require login; if many users remain anonymous when sending, this feature is only for those who chose to register. It's an extra, so we can leave it as a stub or optional page for now.

    -   If implemented, ensure privacy (only show the logged-in user's data). The design would be similar to campaigner list, perhaps a simple timeline or list of actions.

-   **Profile/Settings:** Through Keycloak, most profile management is handled in Keycloak's account console (if enabled). We might simply provide a link "Manage Your Account" that goes to Keycloak's account page where they can change password or social linkages. Or we implement a minimal profile page that shows their name, email (from ID token) and an option to log out. Deep profile management beyond that is likely deferred to Keycloak.

The dashboards maintain the same styling principles: use Tailwind to create card or table layouts, with consistent typography and spacing. They will be protected routes -- attempting to access them without login redirects to login. We make sure to handle the loading state (e.g., show a spinner or "Please log in" if data is still fetching or if not authenticated).

Styling, Theming, and UX Details
--------------------------------

The overall aesthetic is **friendly, professional, and not overly flashy** -- similar in spirit to GoFundMe's approachable design, but tailored to our brand. Key styling choices:

-   **Color Scheme:** We'll choose a primary brand color (for example, a calm blue or green that evokes trust and positivity, similar to GoFundMe's green accent). This will be used for primary buttons and highlights. Tailwind allows us to define custom colors in its config (or we use one of its default palette shades). All colors will be picked with accessibility in mind (e.g., avoid light green text on white, ensure contrast).

-   **Typography:** Use a clean, legible sans-serif font (e.g., Tailwind's default font stack or a Google Font like **Inter** or **Roboto**). Headings will be bold and clear. We maintain a consistent scale -- large for heroes/h1, medium for section headings, regular for body text, and slightly smaller for metadata like form labels or timestamps. By using Tailwind's text size utilities and perhaps the `font-medium`, `font-bold` classes, we keep typography consistent.

-   **Spacing and Layout:** We apply a consistent spacing scale (Tailwind's default spacing units) for padding and margins, giving the UI a comfortable amount of whitespace. Elements won't feel cluttered. For example, form fields and buttons will have adequate padding (to meet the recommended target size ~44px for touch). Sections on pages are separated by generous whitespace or light dividers.

-   **Cards and Containers:** Many components (campaign cards, form containers, modals) have **rounded corners** (e.g. `rounded-xl` for cards, `rounded-md` for smaller elements) and **soft shadows** (`shadow-md` or `lg`). This echoes a modern "soft UI" feel and separates elements from the background in a subtle way. We avoid harsh edges to make the interface feel welcoming.

-   **Imagery and Icons:** We'll incorporate icons for intuitive cues -- e.g., a letter icon next to "Send Letter", a user icon for profile, etc. We can use an open-source icon set (such as **Heroicons**, which pairs well with Tailwind). Icons will include appropriate `aria-hidden="true"` and have screen-reader text if they convey important info. Any images (like campaign photos) will have alt text. We won't overuse stock images; where needed (like a default campaign image if none provided), we'll ensure they are lightweight and relevant.

-   **Micro-Interactions:** We implement small animations to make the UI feel alive:

    -   Hover states: Links and buttons will change styling on hover/focus (color darken or underline for links, shadow grow for cards, etc.). These transitions will be smooth (using `transition` classes from Tailwind for easing). For example, a campaign card might use `transition-transform duration-200 ease-in-out` and on hover add `transform scale-105` and a drop-shadow -- causing it to gently "lift".

    -   Form interactions: When moving between steps in the multi-step form, we use a fade or slide animation to indicate progress. Error messages might appear with a slight slide-down or fade in, drawing attention briefly.

    -   Loading states: A spinner icon or skeleton elements will display during API calls (like during payment processing or data loading). This gives feedback that something is happening. We can use a simple CSS animation (Tailwind has `animate-spin` utility for an icon spinner, for instance).

    -   These animations will be **subtle and performant** -- mostly CSS-based. We will avoid excessive use of JavaScript for animation to keep things smooth. Also, we honor the user's reduced-motion preference by disabling non-essential animations for those who opt out.

-   **Consistent Theme:** Because we are using a utility framework, we ensure to define a few custom utilities or base styles so that components are uniform. For example, define a `.btn` class (using Tailwind's `@apply`) that applies our common button styles, and use that everywhere for buttons. This way, if the design needs a tweak, we change it in one place. We maintain consistency in things like border radius values, shadows, etc., to present a cohesive look across the site.

Integration Stubs: Keycloak, Stripe, ClickSend
----------------------------------------------

Integration with external services will be represented cleanly in the frontend, with the actual heavy lifting done by backend proxies or the services' own widgets:

-   **Authentication via Keycloak:** As detailed above, we use Keycloak's OIDC for login. In the frontend code, we initialize the Keycloak JS adapter with PKCE support​[medium.hexadefence.com](https://medium.hexadefence.com/securing-a-react-app-using-keycloak-ac0ee5dd4bfc#:~:text=Client%20ID%20%20%20,%3A%20S256)​[medium.hexadefence.com](https://medium.hexadefence.com/securing-a-react-app-using-keycloak-ac0ee5dd4bfc#:~:text=Post%20logout%20redirect%20URI%20%3A,%3A%20S256). When authentication is needed, we call `keycloak.login()` which redirects to Keycloak's site. For now, in development, we might stub this by simulating a login (since without a running Keycloak, we can't fully test). But we will clearly mark these flows in code with comments like `// TODO: integrate Keycloak login`. The Keycloak config (realm URL, client ID) will reside in a config file or environment variables. Once integrated, we ensure the JWT tokens from Keycloak are used in API calls (for example, when creating a campaign via the backend API, include `Authorization: Bearer <token>`).

    -   We will test this flow with Keycloak's demo setup to ensure it works. The important part is the **security**: using PKCE and **storing tokens in memory** to prevent XSS and refresh when needed​file-kvj2hbtsptrprkhqd3h9xe. This matches Keycloak's recommendations for SPAs.

-   **Stripe Integration (Payments):** We include Stripe's official JS library via script or npm (`@stripe/stripe-js`). The publishable key will be loaded from env config. For the payment forms, we'll use **Stripe Elements**, which gives us pre-built secure card input fields. This means our form never sees the raw card number (the element is an iframe from Stripe). As Stripe notes, using such integration **securely collects and transmits payment info directly to Stripe** without touching our servers​[docs.stripe.com](https://docs.stripe.com/security/guide#:~:text=use%20one%20of%20our%20low,servers%2C%20reducing%20your%20PCI%20obligations), keeping us PCI compliant. Our code will:

    -   On loading a payment step, initialize Stripe with our key, create an `Elements` instance, and mount a `CardElement` into a `<div>` in our form.

    -   When the user submits payment, call our backend (e.g., `POST /payments/create-intent`) to get a `client_secret` for the transaction. Then use `stripe.confirmCardPayment(client_secret, {payment_method: {card: CardElement, billing_details: {...}}})` to complete the payment securely on Stripe's side​file-kvj2hbtsptrprkhqd3h9xe.

    -   Handle the promise result (success or error). On success, proceed to confirmation steps (and maybe call backend to finalize the process if needed).

    -   For development, we can stub the backend call by using Stripe's test mode or simply simulating an immediate success response with a dummy clientSecret. We will mark these code paths as stubs if the backend isn't ready, so they can be connected later.

-   **ClickSend Integration (Letter Mailing):** The actual sending of letters via ClickSend is done server-side (through a ClickSend Proxy service as per the architecture). From the frontend perspective, after a successful letter payment, we might call an endpoint like `POST /letters/send` with details of what to send (template IDs, recipient addresses, etc.). The backend will then call ClickSend's **"Post Letter" API** with the generated PDFs. We'll represent this in the UI flow by showing that confirmation message ("Letters are being sent!") immediately after payment. If needed, we can poll for a status (like "sent" confirmation), but likely unnecessary if it's quick or done async.

    -   We include a placeholder in the code where this happens, e.g., after stripe payment success: `// TODO: trigger letter send via backend`. For now, we assume it succeeds. Any failure from ClickSend (like invalid address) will be handled by backend and possibly emailed to user; the UI might not get real-time error unless we choose to implement a webhook to front-end (probably overkill).

    -   We ensure that we do not expose the ClickSend API key or similar in the frontend; all such secrets remain in backend. The user just sees that the letters will be mailed. Optionally, we could show an estimated delivery time or something if that info is available, but that might be later enhancement.

In summary, the frontend will have clearly defined interfaces where it talks to backend for auth (Keycloak tokens), payments (Stripe intents), and mailing (triggering ClickSend). These are done securely and the code is organized such that swapping out a stub for a real API call is straightforward. We use **axios or fetch** for API calls, with a central configuration to include auth tokens and handle errors globally (e.g., if a 401 comes back, redirect to login).

Maintainability and Future-Proofing
-----------------------------------

To ensure this frontend is maintainable and scalable in the long run, we will:

-   **Organize Code Modularly:** Separate components for reuse and clarity. For example, have components like `<CampaignCard>`, `<CampaignFormWizard>`, `<LetterForm>`, `<NavBar>`, `<Footer>`, etc. Each component resides in its own file with cohesive responsibility. We will group related components (maybe under folders like `components/campaign/...`, `components/layout/...`). This modular structure makes it easy for developers to find and update parts of the UI.

-   **Use TypeScript for Reliability:** All components and functions will be typed. We'll define interfaces for entities like Campaign, LetterTemplate, Recipient, etc. Props for components will have well-defined types, which serves as documentation for other developers. This reduces bugs when integrating with the backend API because our models can match the API contracts.

-   **Styling Maintenance:** Because we rely on utility classes, there's minimal custom CSS to maintain. We will, however, define a few high-level styles (possibly using Tailwind's config for theme colors, font, and maybe a few components via the plugin system). This acts like a design system. We'll document these design decisions (in a README or a small style-guide) so future devs know the primary color codes, the spacing scale, etc. Consistent use of Tailwind means fewer context switches for devs (they see class names and know exactly what style is applied).

-   **Component Library & Testing:** We plan to use Headless UI for complex components to avoid reinventing the wheel. For any custom complex component we build, we ensure it's tested and documented. We can create Storybook stories for key components (optional, but helpful for visual testing and for designers to see components in isolation). We will also write unit tests for critical logic (using Jest + React Testing Library for form validation logic, for instance) and perhaps integration tests for major flows. This automated testing ensures that as the codebase grows, changes don't break existing functionality.

-   **Scalability:** The design and code will allow adding more campaigns and users without performance issues. Listing pages will use efficient pagination and not try to load everything at once. We also keep an eye on bundle size -- using only necessary libraries (Tailwind and Headless UI are lightweight compared to heavy UI kits). If down the line the project grows, adopting Next.js or server-side rendering is possible without scrapping everything (since our components are already written in React/TypeScript). The integration with Keycloak and Stripe is standards-based (OIDC, Stripe API) so it can scale or be replaced with minimal changes if needed.

-   **Security & Upkeep:** We will keep dependencies updated. Keycloak JS, Stripe JS, etc., will be pegged to stable versions and monitored. We follow secure coding practices on the frontend: avoiding eval or dangerous DOM manipulations, using `DOMPurify` or similar if we ever dangerously set HTML (like for campaign descriptions), and generally trusting data only as much as necessary. We also ensure our frontend checks user roles to hide forbidden actions (though backend will enforce anyway). For example, don't show "Edit campaign" button to a user who isn't the owner, etc.

-   **Comments and Documentation:** The code will include comments especially around the integration points (e.g., "// Keycloak login flow starts here"). We will provide a README explaining how to run the frontend, how to configure env variables (like Keycloak URLs, Stripe keys), and how the overall flow works. This smooths the handover to backend or new developers. Additionally, we might document how to theme the site (for designers) via Tailwind config.

By adhering to these principles, the frontend will not only meet the initial requirements (beautiful, accessible, SEO-friendly) but also remain **easy to maintain** as the project evolves. All these pages and components come together to create a cohesive platform for campaign advocacy, with a user experience that feels familiar (akin to GoFundMe's simplicity) yet tailored to our unique letter-sending functionality. Every user -- whether a campaign creator or a supporter sending letters -- can navigate and operate the site with ease and confidence. The foundation is set for a secure and scalable application, ready for the backend integration and real-world use.