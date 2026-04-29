import { AppFrame } from "../components/AppFrame";
import { SearchClient } from "../components/SearchClient";
import { getCardIndex } from "../lib/card-data";

export default async function SearchPage() {
  const index = await getCardIndex();

  return (
    <AppFrame active="search" title="Search Cards" totalCards={index.totalCards}>
      <SearchClient />
    </AppFrame>
  );
}
