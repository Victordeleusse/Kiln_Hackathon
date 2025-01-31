"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import * as motion from "motion/react-client"
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  return (
    <motion.header
      className={`fixed w-full z-50 transition-colors duration-300 border-b border-gray-200 backdrop-filter backdrop-blur-lg  
         ${isScrolled ? "shadow-md md:text-lg" : "bg-transparent md:text-lg"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Image
          src="/logo.svg"
          alt="logo"
          width="60"
          height="60"
          className="h-12 w-12 rounded-lg transition-transform  animate-slow-spin"
        />

        <nav className="hidden md:flex items-center space-x-8 text-lg">
          <Link
            href="/"
            className="text-lg font-semibold rounded-md px-2 py-1 transition-all duration-300  
              hover:bg-slate-600"          >
            Dashboard
          </Link>
          <Link
            href="/marketplace"
            className="text-lg font-semibold rounded-md px-2 py-1 transition-all duration-300  
              hover:bg-slate-600"
          >
            Marketplace
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ConnectButton
            showBalance={false}
            label="Connect Your Wallet"
            chainStatus="icon"
          />
        </div>
      </section>
    </motion.header>
  );
}


