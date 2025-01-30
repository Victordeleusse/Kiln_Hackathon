"use client"
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { hello } from "@/api/actions";

export default function Home() {
  const [greeting, setGreeting] = useState("victor le bg");

  useEffect(() => {
    const salut = async () => {
      const response = await hello();//
      setGreeting(response);
    }
    salut();
  }, [])

  return (
    <section>
      <h1>{greeting}</h1>

    </section>
  );
}
