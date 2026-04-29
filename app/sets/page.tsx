import { AppFrame } from "../components/AppFrame";
import { SetsClient } from "../components/SetsClient";
import { getCardIndex, getSets } from "../lib/card-data";

export default async function SetsPage() {
  const index = await getCardIndex();
  const { sets } = await getSets();

  return (
    <AppFrame active="sets" title="Set Browser" totalCards={index.totalCards}>
      <SetsClient sets={sets} />
    </AppFrame>
  );
}
