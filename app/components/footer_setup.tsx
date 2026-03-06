"use client";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Dribbble,
  Globe,
} from "lucide-react";
import {FooterBackgroundGradient} from "./footer";
import { TextHoverEffect } from "./footer";
import Link from "next/link";

function HoverFooter() {
  // Footer link data
  const footerLinks = [
    {
        title: "Navigation",
        links: [
          { label: "Home", href: "/" },
          { label: "Mods", href: "/mods" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },],
    },
    {
      title: "Resources",
      links: [
        { label: "Privacy Policy", href: "/resources/privacy" },
        { label: "Terms of Service", href: "/resources/terms" },
        { label: "Safety Guidelines", href: "/resources/safety" },
        { label: "DMCA Compliance", href: "/resources/dmca" },
        { label: "", href: "#" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Contact Us", href: "/contact" },
       
     
      ],
    },
  ];



  // Social media icons
 
  return (
    <footer className="bg-[#0F0F11]/10 relative h-fit rounded-[1rem] overflow-hidden backdrop-blur-sm m-8">
      <div className="max-w-7xl mx-auto p-8 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-10 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-[#3ca2fa] text-3xl font-extrabold">
                <img src="/icon/logo_1.png" alt="" className="h-[50px]" />
              </span>
              <span className="text-white text-3xl font-bold">Modshaven</span>
            </div>
            <p className="text-sm leading-relaxed font-[700] text-[#a7a8b5]">
              Your ultimate destination for game modifications, tools, and resources.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-lg font-[800] mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3 text-[#a7a8b5] font-[700]">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <Link
                      href={link.href}
                      className="hover:text-[#ff6600] transition-colors"
                    >
                      {link.label}
                    </Link>
                
                  </li>
                ))}
              </ul>
            </div>
          ))}

                    
        </div>
{/* Footer bottom */}
        <div className="flex flex-col justify-center text-[#a7a8b5] font-[900]  md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          {/* Social icons */}
          

          {/* Copyright */}
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} modshaven. All rights reserved.
          </p>
        </div>
        <hr className="border-t border-[#ff6600] my-15 p-8" />

        
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[35rem] -mt-52 -mb-36">
        <TextHoverEffect text="Modshaven" className="z-5 " />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default HoverFooter;