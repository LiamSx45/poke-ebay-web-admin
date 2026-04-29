import { AppFrame } from "../components/AppFrame";
import { ListingBuilderClient } from "../components/ListingBuilderClient";
import { getCardIndex } from "../lib/card-data";

export default async function ListingPage({
  searchParams
}: {
  searchParams: Promise<{ card?: string }>;
}) {
  const index = await getCardIndex();
  const { card } = await searchParams;

  return (
    <AppFrame active="listing" title="Listing Builder" totalCards={index.totalCards}>
      <ListingBuilderClient cardId={card} />
    </AppFrame>
  );
}
