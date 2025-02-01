import { PutForm } from "@/components/forms/putForm";

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
    <section className="container min-h-screen ">
      <PutForm />
    </section>
  );
}
