import { servicePageSchema, type ServicePage } from "@/lib/schemas";
import { z } from "zod";

/**
 * Long form, individually written SEO landing pages — one per service. These
 * are deliberately a separate content module from `content/services.ts`
 * (which only feeds the compact homepage card and the contact form's service
 * picker): a ranking page needs far more real, specific copy than a card ever
 * should carry, and the two lists are allowed to drift slightly in wording as
 * a result.
 */
export const servicePages: ServicePage[] = z.array(servicePageSchema).parse([
  {
    slug: "social-media-marketing",
    name: "Social Media Marketing",
    metaTitle: "Social Media Marketing Services | Muhammad Umaid Sadiq",
    metaDescription:
      "Social media marketing services for businesses in Pakistan, the UAE, Saudi Arabia, the UK, and the USA. Strategy, content, and paid growth run as one system.",
    ogTitle: "Social Media Marketing Services That Turn Followers Into Customers",
    ogDescription:
      "Strategy, content, community management, and Meta advertising run as one system, built to turn followers into paying customers rather than just likes.",
    eyebrow: "Social Media Marketing",
    h1: "Social Media Marketing Services That Turn Followers Into Paying Customers",
    intro: [
      "Posting consistently is not the same thing as growing. Most business pages stay active yet quiet, because content and strategy are rarely built to work together.",
      "I run social media marketing as one connected system, joining content, community management, and Meta advertising so every post moves your business toward real customers, not just likes.",
    ],
    heroImage: "/images/services/social-media-marketing.webp",
    heroImageAlt: "Smartphone displaying social media apps at night, representing social media marketing services",
    overview: {
      heading: "How Social Media Marketing Actually Grows A Business",
      paragraphs: [
        "A search for social media marketing services usually comes from one of two places: a business that tried posting on its own and stalled, or one that never had a real plan for its channels to begin with.",
        "Either way, the fix looks the same. Social platforms reward consistency, but consistency without a clear message and a defined audience just produces noise. My approach starts with understanding who your customer actually is, what they respond to, and where they already spend their time online.",
        "From there, content, engagement, and paid promotion are planned together instead of separately, so one campaign idea can appear as an organic post, a story sequence, and a Meta ad without feeling repeated or disconnected.",
      ],
    },
    offerings: {
      heading: "What Is Included In My Social Media Marketing Service",
      items: [
        { title: "Platform strategy", description: "A clear plan for which platforms matter for your business, what to post, and how often, based on where your customers actually are." },
        { title: "Content calendar and scheduling", description: "A structured monthly calendar so your pages stay active without you needing to think about it every day." },
        { title: "Community management", description: "Comments, messages, and enquiries handled promptly, so interested followers get a response instead of being ignored." },
        { title: "Meta advertising support", description: "Paid promotion planned alongside organic content, connecting naturally with my dedicated Meta Ads service when a campaign needs wider reach." },
        { title: "Performance reporting", description: "Regular updates on what is working, explained in plain language rather than a dashboard full of numbers with no context." },
      ],
    },
    process: {
      heading: "How I Work",
      steps: [
        { title: "Understand your business", description: "A short discovery call to learn about your products, customers, and what growth means for you specifically." },
        { title: "Build the content plan", description: "A monthly plan covering themes, formats, and posting frequency, matched to your industry and audience." },
        { title: "Create and manage", description: "Content gets produced, scheduled, and published, while comments and messages are monitored and answered." },
        { title: "Review and adjust", description: "Performance is reviewed regularly, and the plan is refined based on what your audience actually responds to." },
      ],
    },
    benefits: {
      heading: "Benefits For Your Business",
      items: [
        "A consistent, professional presence across every social channel",
        "Content built around your real audience instead of guesswork",
        "Faster response times to enquiries, which often decide whether a customer buys",
        "A clear connection between social activity and actual leads",
        "More time back in your week, since posting and replying are handled for you",
        "A foundation that paid advertising can build on rather than compete with",
      ],
    },
    industries: {
      heading: "Industries I Work With",
      items: ["Retail and ecommerce", "Restaurants and cafes", "Clinics and healthcare providers", "Real estate", "Fashion and beauty brands", "Education and training providers", "Home services", "Professional services"],
    },
    locations: {
      heading: "Social Media Marketing Services Across Multiple Regions",
      items: [
        { region: "Pakistan", blurb: "Businesses in Karachi, Lahore, and Islamabad often need a social presence that feels credible to a specific local audience while still supporting national growth. As a Pakistani social media marketing freelancer, I build campaigns around how customers in these cities actually shop and engage." },
        { region: "UAE", blurb: "For businesses in Dubai and across the UAE, social media usually needs to work for a mix of local residents and an international audience at once. I plan content and Meta campaigns that speak to both without losing focus." },
        { region: "Saudi Arabia", blurb: "In Riyadh and other major Saudi cities, social platforms are central to how customers discover new businesses. I build social media marketing plans suited to Saudi audiences and shopping habits." },
        { region: "United Kingdom", blurb: "For businesses in London and across the UK, I focus on clear, professional messaging suited to a more research driven audience before they commit to a purchase or enquiry." },
        { region: "United States", blurb: "Working with businesses across the USA, I build social strategies suited to competitive, high volume markets where consistency and paid support matter from day one." },
        { region: "Canada", blurb: "For Canadian businesses, I build social plans that respect a more measured buying pattern, focusing on trust and clarity over aggressive promotion." },
      ],
    },
    faqs: [
      { question: "How much does social media marketing cost?", answer: "Pricing depends on how many platforms you need managed, how much content is required each month, and whether Meta advertising is included. After a short discovery call, I put together a proposal based on your specific goals rather than a fixed package that may not fit your business." },
      { question: "Do I need to provide content or photos?", answer: "Not necessarily. I can work with photos and videos you already have, or plan content around graphic design and video editing produced as part of the service. If you have existing brand assets, they are simply built into the plan." },
      { question: "How long does it take to see results?", answer: "Organic growth is gradual and usually shows a clear shift within the first two to three months of consistent activity. If faster visibility is the priority, Meta advertising can be added to reach a wider audience sooner while the organic side builds in the background." },
      { question: "Can you manage social media for a business outside Pakistan?", answer: "Yes. I work remotely with businesses across the UAE, Saudi Arabia, the UK, the USA, and Canada, and calls are scheduled to suit your time zone." },
      { question: "Do you also run the Meta ads for my page?", answer: "Yes, Meta advertising can be included as part of this service or handled separately through my dedicated Meta Ads service, depending on what your campaign needs." },
    ],
    cta: {
      heading: "Ready For Social Media That Actually Grows Your Business?",
      text: "Book a free consultation and I will walk you through exactly what a working social media plan would look like for your business, with no pressure and no generic pitch.",
    },
    relatedSlugs: ["meta-ads", "graphic-design", "video-editing"],
    order: 0,
  },
  {
    slug: "meta-ads",
    name: "Meta Ads",
    metaTitle: "Meta Ads Services | Facebook and Instagram Advertising",
    metaDescription:
      "Meta Ads services for businesses in Pakistan, the UAE, Saudi Arabia, the UK, and the USA. Facebook and Instagram campaigns built around real leads and sales.",
    ogTitle: "Meta Ads Services Built Around Real Leads, Not Just Reach",
    ogDescription:
      "Facebook and Instagram advertising built around a specific goal, whether that is leads, messages, or online sales, with reporting that connects to real results.",
    eyebrow: "Meta Ads",
    h1: "Meta Ads Services Built To Bring In Real Leads And Sales",
    intro: [
      "A boosted post is not the same thing as a properly built Meta ads campaign. Most wasted ad spend comes from targeting that is too broad, creative that does not match the offer, or a campaign that was never structured for a clear result.",
      "I manage Facebook and Instagram advertising as a dedicated service, building campaigns around a specific goal, whether that is website visits, form submissions, direct messages, or online sales.",
    ],
    heroImage: "/images/services/meta-ads.webp",
    heroImageAlt: "Dark analytics dashboard displaying advertising performance charts",
    overview: {
      heading: "Why Meta Advertising Needs A Proper Strategy",
      paragraphs: [
        "Someone searching for a Meta ads expert has usually already tried running ads through the app on their own, or been disappointed by an agency that reported clicks without ever mentioning actual leads or sales.",
        "Meta advertising works when account structure, audience targeting, creative, and offer are all aligned toward one outcome. A single ad shown to the wrong audience will always underperform, no matter how much budget sits behind it.",
        "My focus stays on the metric that actually matters to your business, whether that is cost per lead, cost per purchase, or return on ad spend, rather than vanity numbers like reach that look good in a report but do not pay bills.",
      ],
    },
    offerings: {
      heading: "What My Meta Ads Service Includes",
      items: [
        { title: "Campaign strategy and setup", description: "Full account structure built around your specific goal, from awareness through to conversion, rather than one generic campaign." },
        { title: "Audience research and targeting", description: "Custom and lookalike audiences built from your existing customers, page engagement, and website activity where available." },
        { title: "Ad creative direction", description: "Guidance on which formats and messages typically perform for your industry, working closely with graphic design and video editing to produce creative that fits the strategy." },
        { title: "Budget management and optimisation", description: "Daily monitoring and adjustment so budget moves toward what is working and away from what is not." },
        { title: "Transparent reporting", description: "Clear reporting on cost per result, not just reach, explained in a way that connects directly to your business goals." },
      ],
    },
    process: {
      heading: "How I Manage A Meta Ads Campaign",
      steps: [
        { title: "Goal and offer review", description: "We define exactly what a successful result looks like for your business before a single ad goes live." },
        { title: "Audience and account setup", description: "Pixel and conversion tracking are checked or installed, and audiences are built around your actual customer base." },
        { title: "Creative and copy", description: "Ad creative and messaging are prepared to match the audience and platform, whether that is Facebook, Instagram, or both." },
        { title: "Launch and daily monitoring", description: "Campaigns are launched, tracked closely in the early days, and adjusted based on real performance data." },
        { title: "Scaling what works", description: "Budget shifts toward the best performing ads and audiences, while underperforming ones are paused or reworked." },
      ],
    },
    benefits: {
      heading: "Benefits Of Working With A Dedicated Meta Ads Manager",
      items: [
        "Ad spend directed by data rather than guesswork",
        "Campaigns structured around leads and sales, not just reach",
        "Faster identification of what actually works for your audience",
        "Creative and copy tested properly instead of running one ad indefinitely",
        "Clear reporting that connects ad performance to real business outcomes",
        "One point of contact who understands both the ads and your broader marketing",
      ],
    },
    industries: {
      heading: "Industries I Run Meta Ads For",
      items: ["Ecommerce and online stores", "Real estate", "Clinics and healthcare", "Restaurants and food brands", "Education and training", "Fashion and beauty", "Home services and contractors", "Local retail businesses"],
    },
    locations: {
      heading: "Meta Ads Management Across Multiple Countries",
      items: [
        { region: "Pakistan", blurb: "As a Meta ads manager based in Pakistan, I run Facebook and Instagram campaigns for businesses in Karachi, Lahore, and Islamabad, with budgets and targeting suited to local buying behaviour." },
        { region: "UAE", blurb: "For businesses in Dubai and the wider UAE, Meta campaigns often need to reach both residents and a broader Gulf audience, and account structures are built with that mix in mind." },
        { region: "Saudi Arabia", blurb: "Meta advertising in Riyadh and other Saudi cities benefits from creative and targeting adjusted for local platform habits and language preferences, which I factor into every campaign." },
        { region: "United Kingdom", blurb: "For London and UK based businesses, I build Meta campaigns around a research driven customer journey, since UK audiences typically compare options before converting." },
        { region: "United States", blurb: "In the competitive USA market, Facebook ads management focuses heavily on testing multiple creative angles quickly to find what earns attention at a reasonable cost." },
        { region: "Canada", blurb: "For Canadian clients, I manage Meta campaigns with careful attention to budget efficiency, since acquisition costs across many Canadian categories can run high without tight targeting." },
      ],
    },
    faqs: [
      { question: "What is the difference between boosting a post and running Meta ads?", answer: "Boosting a post simply shows an existing post to more people. A properly built Meta ads campaign is structured around a specific business goal, with dedicated targeting, tracking, and creative, which is why it consistently performs better." },
      { question: "How much budget do I need for Meta ads?", answer: "This depends on your industry, goal, and market. During the initial consultation, I review your business and suggest a realistic starting budget rather than a generic number that may not suit your situation." },
      { question: "Do you manage the ad account or do I need my own?", answer: "You keep full ownership of your ad account and page at all times. I work inside your account as a manager, which keeps your data and ad history fully in your control." },
      { question: "How soon will I see results from Meta advertising?", answer: "Initial data usually starts coming in within the first few days, though meaningful optimisation typically takes two to three weeks as the campaign gathers enough information to improve." },
      { question: "Can Meta ads work alongside my organic social media?", answer: "Yes, and they work best together. Meta ads perform better when supported by an active page, which is why this service connects naturally with my social media marketing and content work." },
    ],
    cta: {
      heading: "Stop Guessing With Your Ad Budget",
      text: "Book a free consultation and I will review your current advertising, or help you plan your first campaign properly from the start.",
    },
    relatedSlugs: ["social-media-marketing", "ai-ads", "graphic-design"],
    order: 1,
  },
  {
    slug: "graphic-design",
    name: "Graphic Design",
    metaTitle: "Graphic Design Services | Branding and Marketing Design",
    metaDescription:
      "Graphic design services for businesses in Pakistan, the UAE, Saudi Arabia, the UK, and the USA. Logos, social creatives, and print design built to one brand standard.",
    ogTitle: "Graphic Design Services Built Around One Consistent Brand Standard",
    ogDescription:
      "Logos, brand identity, social creatives, and print design, all built to one visual standard so your business looks established from the first impression.",
    eyebrow: "Graphic Design",
    h1: "Graphic Design Services That Make Your Brand Look Established",
    intro: [
      "Inconsistent design quietly costs businesses credibility. A sharp logo paired with mismatched social posts and a rushed brochure sends a mixed signal before a customer even reads a word.",
      "I provide graphic design as an ongoing service built around one visual standard, covering logos and brand identity through to the social media creatives and print materials your business uses every week.",
    ],
    heroImage: "/images/services/graphic-design.webp",
    heroImageAlt: "Creative design software icons glowing on a dark screen",
    overview: {
      heading: "Why Consistent Design Matters More Than One Great Logo",
      paragraphs: [
        "Most searches for a graphic designer start with a single need, a logo, a set of social posts, or a brochure for an upcoming event. The businesses that get the most value from design, though, treat it as an ongoing standard rather than a one off purchase.",
        "When every post, banner, and printed piece follows the same colours, type, and visual language, a business starts to look established even while it is still small. That consistency often decides whether a customer trusts a brand enough to buy, or simply scrolls past it.",
        "My work covers both the foundational identity, logo, colour palette, and typography, and the everyday output built on top of it, so nothing you publish ever feels disconnected from the rest of your brand.",
      ],
    },
    offerings: {
      heading: "Graphic Design Services I Offer",
      items: [
        { title: "Logo and brand identity", description: "A logo built around your business, along with the colour palette and typography that support it across every future design." },
        { title: "Social media creatives", description: "Posts and carousels designed to match your social media marketing plan, so content looks intentional rather than templated." },
        { title: "Business cards and stationery", description: "Professional printed materials that reflect the same standard as your digital presence." },
        { title: "Banners and signage", description: "Designs for physical or digital banners used at events, storefronts, or on your website." },
        { title: "Brochures and print materials", description: "Clear, well organised layouts for print pieces that need to communicate more information without feeling cluttered." },
      ],
    },
    process: {
      heading: "How I Approach A Design Project",
      steps: [
        { title: "Brief and research", description: "Understanding your business, audience, and any existing brand elements before any design work starts." },
        { title: "Concept development", description: "Initial concepts prepared based on the brief, focused on clarity and how the design will actually be used." },
        { title: "Refinement", description: "Feedback is incorporated and the chosen direction is refined until it is ready to use." },
        { title: "Delivery in usable formats", description: "Final files are delivered in the formats you need, whether for print, web, or social platforms." },
      ],
    },
    benefits: {
      heading: "Benefits Of Professional Graphic Design",
      items: [
        "A consistent look across every platform and printed material",
        "A brand that reads as established and trustworthy from the first impression",
        "Design that supports your marketing rather than working against it",
        "Faster turnaround once a visual standard is already in place",
        "Materials ready for both digital use and print without last minute rework",
        "A visual identity that scales as your business grows",
      ],
    },
    industries: {
      heading: "Industries I Design For",
      items: ["Startups and new businesses", "Retail and ecommerce", "Restaurants and cafes", "Real estate agencies", "Clinics and healthcare providers", "Event organisers", "Education and training centres", "Professional service firms"],
    },
    locations: {
      heading: "Graphic Design Services Across Multiple Regions",
      items: [
        { region: "Pakistan", blurb: "Working as a graphic designer based in Karachi, I support businesses across Pakistan with branding and marketing design suited to both local and national audiences." },
        { region: "UAE", blurb: "For businesses in Dubai and across the UAE, I design with a more premium visual standard in mind, matching what customers in the region typically expect from established brands." },
        { region: "Saudi Arabia", blurb: "Design work for clients in Riyadh and other Saudi cities often includes bilingual layouts and visual choices suited to local audiences and platforms." },
        { region: "United Kingdom", blurb: "For London and UK based businesses, I focus on clean, professional design that fits a market where subtlety often reads as more credible than heavy visual branding." },
        { region: "United States", blurb: "Across the USA, I design with bold, attention holding visuals suited to fast moving social feeds and competitive local markets." },
        { region: "Canada", blurb: "For Canadian businesses, my design work leans toward clear, approachable visuals that build trust without feeling overly promotional." },
      ],
    },
    faqs: [
      { question: "Do you only design logos or full brand identities too?", answer: "Both. I can design a standalone logo, or build a complete brand identity including colour palette, typography, and templates for social media, print, and other materials." },
      { question: "How many revisions are included?", answer: "Revisions are discussed and agreed before the project starts, based on the scope of work, so there are no surprises partway through the process." },
      { question: "Can you match my existing brand style?", answer: "Yes. If you already have brand guidelines or existing materials, new design work is built to match them rather than replace what already works." },
      { question: "What file formats will I receive?", answer: "You receive files suited to how the design will actually be used, which typically includes formats ready for print, web, and social platforms." },
      { question: "Do you design social media posts as an ongoing service?", answer: "Yes, ongoing social media creative design connects directly with my social media marketing service, so posts are planned and designed together rather than as separate, disconnected tasks." },
    ],
    cta: {
      heading: "Give Your Brand A Design Standard Worth Trusting",
      text: "Book a free consultation and share what you need designed. I will explain how a consistent visual system could work for your business.",
    },
    relatedSlugs: ["social-media-marketing", "video-editing", "ai-ads"],
    order: 2,
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    metaTitle: "Video Editing Services | Reels, Ads, and Brand Video",
    metaDescription:
      "Video editing services for businesses in Pakistan, the UAE, Saudi Arabia, the UK, and the USA. Reels, ads, and brand videos edited for retention, not just visuals.",
    ogTitle: "Video Editing Services Built To Hold Attention To The Last Frame",
    ogDescription:
      "Reels, advertisement editing, and brand video, edited for pacing and retention so viewers actually stay for the message rather than scrolling past it.",
    eyebrow: "Video Editing",
    h1: "Video Editing Services That Keep Viewers Watching",
    intro: [
      "Raw footage rarely performs on its own. What decides whether a video gets watched to the end is pacing, captions, and the small editing decisions most viewers never consciously notice.",
      "I edit video for businesses that need reels, ads, and brand videos to actually hold attention, not just look polished, covering everything from social content to longer event and message videos.",
    ],
    heroImage: "/images/services/video-editing.webp",
    heroImageAlt: "Video editor working at a monitor in a dark studio",
    overview: {
      heading: "Why Editing Decides Whether A Video Actually Works",
      paragraphs: [
        "Businesses searching for a video editor usually already have footage, from a phone, a camera, or a recorded event, and need someone to turn it into something people will actually watch.",
        "Attention on social platforms drops within the first few seconds, so pacing at the start of a video matters more than almost anything else. Captions, sound design, and cuts timed to the message all play a role in whether a viewer stays or scrolls past.",
        "My editing work is built around retention first, aiming for videos that hold attention long enough for the message, offer, or story to actually land, rather than edits that simply look busy.",
      ],
    },
    offerings: {
      heading: "Video Editing Services I Provide",
      items: [
        { title: "Social media reels", description: "Short form video edited for Instagram, TikTok, and Facebook, with pacing and captions built for how people actually watch on these platforms." },
        { title: "Advertisement editing", description: "Video ads edited to support a specific campaign goal, working closely with Meta Ads when the video is part of a paid campaign." },
        { title: "Event video editing", description: "Highlights and recaps from weddings, conferences, and business events, edited into a clear, watchable narrative." },
        { title: "Message and monologue videos", description: "Talking head and message videos edited with clean cuts, captions, and pacing suited to founder led or personal brand content." },
        { title: "Brand and promotional video", description: "Longer form video content for websites and campaigns, edited to represent your brand clearly and professionally." },
      ],
    },
    process: {
      heading: "How I Edit A Project",
      steps: [
        { title: "Footage review", description: "Raw footage is reviewed in full to understand what usable material is available before editing begins." },
        { title: "Structure and pacing", description: "A rough cut is built around the strongest moments and the message the video needs to communicate." },
        { title: "Refinement", description: "Captions, sound, colour, and pacing are refined until the video holds together as a finished piece." },
        { title: "Delivery in the right format", description: "Final video is exported in the formats and dimensions needed for the platform it will be published on." },
      ],
    },
    benefits: {
      heading: "Benefits Of Professional Video Editing",
      items: [
        "Higher watch time and completion rates on social platforms",
        "Video content that supports your broader marketing rather than sitting on its own",
        "Consistent quality across every video you publish",
        "Faster turnaround than editing footage yourself between other work",
        "Editing built specifically for how people actually watch on each platform",
        "Content ready to support paid advertising when needed",
      ],
    },
    industries: {
      heading: "Industries I Edit Video For",
      items: ["Ecommerce and retail brands", "Real estate", "Event organisers", "Clinics and healthcare providers", "Education and training providers", "Restaurants and hospitality", "Personal brands and coaches", "Corporate and business communication"],
    },
    locations: {
      heading: "Video Editing Services Across Multiple Regions",
      items: [
        { region: "Pakistan", blurb: "As a video editor based in Karachi, I work with businesses across Pakistan on everything from social reels to full event coverage." },
        { region: "UAE", blurb: "For clients in Dubai and across the UAE, video content often needs a more premium finish, which shapes pacing, colour, and sound choices." },
        { region: "Saudi Arabia", blurb: "Video editing for businesses in Riyadh and other Saudi cities is adapted for local platform habits and audience expectations." },
        { region: "United Kingdom", blurb: "For London and UK based clients, I favour clean, understated editing that fits a market where overly flashy video can feel less trustworthy." },
        { region: "United States", blurb: "Across the USA, competition for attention is high, so editing leans toward fast pacing and strong hooks in the opening seconds." },
        { region: "Canada", blurb: "For Canadian clients, video editing focuses on clear, approachable storytelling that builds trust over time rather than chasing quick virality." },
      ],
    },
    faqs: [
      { question: "Do you shoot the video too, or only edit existing footage?", answer: "My focus is editing. If you already have footage from a phone, camera, or event, I turn it into a finished, publish ready video. For projects that need filming as well, this can be discussed separately." },
      { question: "What is the typical turnaround time for a video?", answer: "Turnaround depends on the length and complexity of the footage, though most short form social videos are completed within a few days of receiving the raw material." },
      { question: "Can you add captions and subtitles?", answer: "Yes, captions are included as standard for social content, since a large share of viewers watch with sound off, especially on Instagram and Facebook." },
      { question: "Do you edit long form video as well as reels?", answer: "Yes, alongside short form reels, I edit longer content including event recaps, brand videos, and message or monologue style videos." },
      { question: "Can video editing be combined with Meta advertising?", answer: "Yes, video ads are often edited specifically for a Meta advertising campaign, and this connects directly with my Meta Ads service when paid promotion is part of the plan." },
    ],
    cta: {
      heading: "Turn Your Footage Into Video Worth Watching",
      text: "Book a free consultation and send over a sample of your footage. I will explain how it could be edited to hold attention and support your goals.",
    },
    relatedSlugs: ["graphic-design", "meta-ads", "ai-ads"],
    order: 3,
  },
  {
    slug: "ai-ads",
    name: "AI Ads",
    metaTitle: "AI Advertising Services | AI Generated Ad Creative",
    metaDescription:
      "AI advertising services for businesses in Pakistan, the UAE, Saudi Arabia, the UK, and the USA. AI generated ad creative and video ads, produced faster and at lower cost.",
    ogTitle: "AI Advertising Services For Faster, More Affordable Ad Creative",
    ogDescription:
      "AI generated video ads and UGC style creative built for Meta advertising, letting a business test far more ideas without traditional production cost.",
    eyebrow: "AI Ads",
    h1: "AI Advertising Services For Faster, More Affordable Ad Creative",
    intro: [
      "Producing enough ad creative to test properly used to mean expensive shoots and long production timelines that most small and medium businesses could not justify.",
      "AI advertising changes that. I produce AI generated ad creative and video ads, including UGC style content, that let a business test far more ideas without the cost or wait of traditional production.",
    ],
    heroImage: "/images/services/ai-ads.webp",
    heroImageAlt: "Glowing neon tunnel representing AI generated advertising creative",
    overview: {
      heading: "How AI Advertising Fits Into A Real Marketing Plan",
      paragraphs: [
        "Interest in AI advertising usually comes from businesses that already understand the value of testing multiple ad ideas, but have been limited by production cost or turnaround time in the past.",
        "AI generated creative does not replace strategy. It changes how quickly and affordably that strategy can be tested. Instead of committing budget to one expensive video and hoping it performs, a business can test several AI produced variations and quickly see which message actually connects.",
        "This service is built around the same principle as my other advertising work. The goal is real performance for your Meta campaigns, not creative for its own sake.",
      ],
    },
    offerings: {
      heading: "What My AI Advertising Service Includes",
      items: [
        { title: "AI generated video ads", description: "Short form video ads produced using AI tools, suited to Meta and other paid platforms, at a fraction of traditional production cost." },
        { title: "AI generated UGC style content", description: "Ad creative styled to look and feel like organic, customer made content, which often performs strongly on social platforms." },
        { title: "Multiple creative variations", description: "Several versions of an ad concept produced quickly, so campaigns can be tested properly instead of running on a single guess." },
        { title: "Creative aligned to your offer", description: "Every AI produced ad is built around your actual product or service and the specific action you want a viewer to take." },
        { title: "Integration with paid campaigns", description: "AI generated creative delivered ready to plug directly into a Meta Ads campaign for testing and scaling." },
      ],
    },
    process: {
      heading: "How I Produce AI Advertising Content",
      steps: [
        { title: "Understand the offer and audience", description: "A clear picture of your product, audience, and campaign goal before any creative is produced." },
        { title: "Concept and script direction", description: "Ad angles and messaging are planned first, since AI tools work best when guided by a clear creative direction." },
        { title: "AI production", description: "Creative is generated using AI tools suited to the format, whether that is video, UGC style content, or static ad variations." },
        { title: "Review and refinement", description: "Output is reviewed and refined to make sure it looks natural, on brand, and ready to run." },
        { title: "Delivery for testing", description: "Final ad creative is delivered ready to launch, often as multiple variations for proper testing." },
      ],
    },
    benefits: {
      heading: "Benefits Of AI Advertising For Your Business",
      items: [
        "Significantly lower production cost compared to traditional video shoots",
        "Faster turnaround, often days instead of weeks",
        "More creative variations available for genuine testing",
        "UGC style ads that often outperform overly polished traditional advertising",
        "Easier to scale creative output as campaigns grow",
        "Creative built to work directly with your Meta advertising strategy",
      ],
    },
    industries: {
      heading: "Industries That Benefit From AI Advertising",
      items: ["Ecommerce and online stores", "Beauty and personal care brands", "Health and wellness businesses", "Fashion and apparel", "Technology and software businesses", "Coaches and course creators", "Home and lifestyle products", "Local service businesses"],
    },
    locations: {
      heading: "AI Advertising Services Across Multiple Regions",
      items: [
        { region: "Pakistan", blurb: "For businesses across Pakistan, AI advertising offers a genuinely affordable way to produce professional looking ad creative without the cost of a full production setup." },
        { region: "UAE", blurb: "In Dubai and across the UAE, where ad production costs can run high, AI generated creative gives businesses a faster, more affordable way to keep campaigns fresh." },
        { region: "Saudi Arabia", blurb: "For businesses in Riyadh and other Saudi cities, AI advertising allows more frequent creative refreshes without the delay of traditional shoots." },
        { region: "United Kingdom", blurb: "UK businesses often use AI generated ad creative to test new messaging quickly before committing budget to larger scale production." },
        { region: "United States", blurb: "In the fast moving USA advertising market, AI generated video ads help businesses keep pace with constantly changing creative trends without ballooning production budgets." },
        { region: "Canada", blurb: "For Canadian businesses, AI advertising provides an efficient way to test multiple campaign ideas before scaling spend behind the strongest performer." },
      ],
    },
    faqs: [
      { question: "Does AI generated advertising actually perform well?", answer: "It can perform very well, particularly UGC style AI creative, which often feels more authentic to viewers than heavily produced traditional ads. Performance still depends on the offer, audience, and targeting, which is why this service is built around your actual campaign strategy." },
      { question: "Will the ads look obviously artificial?", answer: "Every piece of AI produced creative is reviewed and refined before delivery to make sure it looks natural and on brand, rather than generic or obviously synthetic." },
      { question: "Is AI advertising cheaper than traditional video production?", answer: "Yes, in almost every case. AI generated creative removes most of the cost associated with filming, actors, and locations, which is one of the main reasons businesses choose this service." },
      { question: "Can AI ad creative be used with my existing Meta Ads account?", answer: "Yes, AI generated creative is delivered ready to run directly inside your existing Meta advertising campaigns, and connects naturally with my Meta Ads management service." },
      { question: "How many ad variations can be produced for testing?", answer: "This depends on your budget and campaign goals, though producing several variations is one of the main advantages of AI advertising compared to traditional production." },
    ],
    cta: {
      heading: "Test More Ideas Without The Traditional Production Cost",
      text: "Book a free consultation and I will show you what AI generated ad creative could look like for your business and your budget.",
    },
    relatedSlugs: ["meta-ads", "video-editing", "graphic-design"],
    order: 4,
  },
  {
    slug: "ai-development",
    name: "AI Development",
    metaTitle: "AI Powered Web Development Services | Custom Business Software",
    metaDescription:
      "AI powered web development for businesses in Pakistan, the UAE, Saudi Arabia, the UK, and the USA. Custom websites, CMS platforms, ERP systems, and business software.",
    ogTitle: "AI Powered Development Of Custom Websites And Business Software",
    ogDescription:
      "Custom websites, content management systems, ERP platforms, and business management software, built faster through AI assisted development.",
    eyebrow: "AI Development",
    h1: "AI Powered Development Of Websites And Business Software",
    intro: [
      "Many businesses are still running on spreadsheets, paper records, or software that was never actually built for how they operate. That gap usually shows up as wasted time, lost information, or a website that cannot do what the business actually needs it to do.",
      "I build custom websites and business software using AI assisted development, which means faster delivery without cutting corners on quality, covering everything from content managed websites to full business management systems.",
    ],
    heroImage: "/images/services/ai-development.webp",
    heroImageAlt: "Dark screen displaying code, representing custom software development",
    overview: {
      heading: "What AI Powered Development Actually Means For Your Business",
      paragraphs: [
        "This service is not about programming languages or technical trends. It is about the actual problem your business needs solved, whether that is a website you can update yourself, a system to manage patients or clients, or software that finally replaces a spreadsheet held together with formulas.",
        "AI assisted development means I can build these systems faster and at a more reasonable cost than fully manual development, while still producing a system built specifically around your workflow rather than a generic template stretched to fit.",
        "The result is a working solution, a dynamic website, a content management system your team can actually use, or a full business management platform, delivered without the long timelines traditional custom development usually requires.",
      ],
    },
    offerings: {
      heading: "What I Build",
      items: [
        { title: "Custom business websites", description: "Dynamic websites built around your actual business, not a generic template, with the structure and content control your team needs." },
        { title: "Content management systems", description: "A CMS that lets your team update pages, pricing, and content directly, without needing a developer for every small change." },
        { title: "Business management software", description: "Custom systems for managing appointments, staff, orders, or day to day operations, replacing manual processes and spreadsheets." },
        { title: "Clinic and healthcare software", description: "Systems for managing patient records, appointments, and clinic operations, built around how a clinic actually runs day to day." },
        { title: "ERP systems", description: "Resource planning software that connects inventory, sales, and operations into one system instead of several disconnected tools." },
      ],
    },
    process: {
      heading: "How I Build Custom Software",
      steps: [
        { title: "Understand the actual problem", description: "Before any development starts, I focus on how your business currently operates and exactly what is not working." },
        { title: "Plan the system", description: "The structure of the website or software is planned around your real workflow, not a generic feature list." },
        { title: "Build with AI assisted development", description: "Development moves faster using AI assisted tools, without sacrificing the quality or reliability of the final system." },
        { title: "Test against real use cases", description: "The system is tested against how it will actually be used day to day, not just checked for obvious errors." },
        { title: "Deliver and support", description: "The finished system is handed over along with guidance on how to use and maintain it going forward." },
      ],
    },
    benefits: {
      heading: "Benefits Of AI Powered Development",
      items: [
        "Faster delivery than traditional custom development timelines",
        "Software built around your actual workflow instead of a generic template",
        "A website or system your team can genuinely manage and update",
        "Business processes replaced with a single reliable system instead of scattered tools",
        "Development cost that reflects AI assisted efficiency rather than fully manual build time",
        "A digital foundation built to last, rather than a quick fix",
      ],
    },
    industries: {
      heading: "Businesses I Build Software For",
      items: ["Clinics and healthcare providers", "Retail and ecommerce businesses", "Real estate agencies", "Educational institutions", "Restaurants and hospitality businesses", "Professional service firms", "Manufacturing and distribution businesses", "Startups needing a custom platform"],
    },
    locations: {
      heading: "AI Powered Development Services Across Multiple Regions",
      items: [
        { region: "Pakistan", blurb: "For businesses across Pakistan, I build custom websites, CMS platforms, and business management software suited to local operating needs and budgets." },
        { region: "UAE", blurb: "In Dubai and across the UAE, custom software often needs to meet a higher standard of polish and reliability, which shapes how these systems are planned and built." },
        { region: "Saudi Arabia", blurb: "For businesses in Riyadh and other Saudi cities, I build websites and systems that account for bilingual content and local business requirements." },
        { region: "United Kingdom", blurb: "UK businesses often need software that integrates cleanly with existing tools, so systems are planned with that kind of compatibility in mind from the start." },
        { region: "United States", blurb: "Across the USA, businesses typically need systems that can scale quickly, so architecture decisions are made with future growth in mind from day one." },
        { region: "Canada", blurb: "For Canadian businesses, I focus on building reliable, well documented systems that a team can maintain confidently long after launch." },
      ],
    },
    faqs: [
      { question: "Is this service only about building websites?", answer: "No. While custom websites are part of this service, the main focus is complete business solutions, including CMS platforms, ERP systems, clinic software, and business management software built around how your business actually operates." },
      { question: "What does AI powered development actually mean?", answer: "It means AI assisted tools are used throughout planning and development to build software faster and more efficiently, while the system itself is still designed and reviewed around your specific business needs, not generated blindly." },
      { question: "Can you build software to replace our current spreadsheets or paper process?", answer: "Yes, this is one of the most common projects I take on, replacing manual spreadsheets or paper based processes with a single reliable system built for how your team actually works." },
      { question: "Will I be able to update the website myself after it is built?", answer: "Yes, websites are built with a content management system where relevant, so your team can update pages, pricing, and content without needing a developer for routine changes." },
      { question: "How long does a custom software project take?", answer: "Timelines vary depending on the complexity of the system, though AI assisted development typically shortens delivery time significantly compared to fully manual custom builds." },
    ],
    cta: {
      heading: "Replace The Systems Holding Your Business Back",
      text: "Book a free consultation and describe what your business actually needs. I will explain what a custom website or business system could look like, and how AI assisted development could get it built faster.",
    },
    relatedSlugs: ["graphic-design", "social-media-marketing", "meta-ads"],
    order: 5,
  },
]);

export function getServicePage(slug: string) {
  return servicePages.find((s) => s.slug === slug);
}
