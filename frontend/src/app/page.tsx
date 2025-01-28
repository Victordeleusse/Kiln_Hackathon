import Image from "next/image";

export default function Home() {
  return (
    <section>
      <h1>Home</h1>
      <Image
        src="/logo.svg"
        alt="Logo"
        width={200}
        height={200}
      />
    </section>
  );
}
