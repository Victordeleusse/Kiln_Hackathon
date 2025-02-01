import { PutForm } from "@/components/forms/putForm";
import { getEthOnchainStakes } from "@/actions/kiln";

export default async function Home() {
  const result = await getEthOnchainStakes();
  console.log(result);
  return (
    <section className="container min-h-screen ">
      <PutForm />
    </section>
  );
}
