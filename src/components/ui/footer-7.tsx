import React from "react";
import { FaFacebook, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
  onStart?: () => void;
}

const defaultSections = [
  {
    title: "Solutions",
    links: [
      { name: "iOS/Android App", href: "#" },
      { name: "Self-hosted", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Docs", href: "#" },
      { name: "Cal.ai - AI Phone Agent", href: "#" },
      { name: "Enterprise", href: "#" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { name: "Sales", href: "#" },
      { name: "Marketing", href: "#" },
      { name: "Talent Acquisition", href: "#" },
      { name: "Customer Support", href: "#" },
      { name: "Higher Education", href: "#" },
      { name: "Telehealth", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Affiliate Program", href: "#" },
      { name: "Help Docs", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Cal Fonts", href: "#" },
      { name: "Teams", href: "#" },
      { name: "Embed", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "Jobs", href: "#" },
      { name: "About", href: "#" },
      { name: "Open Startup", href: "#" },
      { name: "Support", href: "#" },
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaTwitter size={20} />, href: "#", label: "Twitter" },
  { icon: <FaGithub size={20} />, href: "#", label: "Github" },
  { icon: <FaLinkedin size={20} />, href: "#", label: "LinkedIn" },
  { icon: <FaFacebook size={20} />, href: "#", label: "Facebook" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer7 = ({
  logo = {
    url: "/",
    src: "https://www.shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg", // Placeholder, will be styled as text in implementation if needed
    alt: "Cal.com",
    title: "Cal.com",
  },
  sections = defaultSections,
  description = "Cal.com® and Cal® are a registered trademark by Cal.com, Inc. All rights reserved.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 Cal.com, Inc. All rights reserved.",
  legalLinks = defaultLegalLinks,
  onStart,
}: Footer7Props) => {
  return (
    <section className="py-24 border-t border-gray-100 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url} className="text-2xl font-bold tracking-tighter">
                {logo.title}
              </a>
            </div>
            <p className="max-w-[300px] text-sm text-gray-400 leading-relaxed">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-gray-400">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-black transition-colors">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-6 font-bold text-sm">{section.title}</h3>
                <ul className="space-y-4 text-sm text-gray-500">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-black transition-colors"
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-gray-100 py-8 text-xs font-medium text-gray-400 md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-black transition-colors">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
