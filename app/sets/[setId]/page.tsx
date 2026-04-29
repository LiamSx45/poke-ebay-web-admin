import { notFound } from "next/navigation";
import { AppFrame } from "../../components/AppFrame";
import { SetDetailClient } from "../../components/SetDetailClient";
import { getCardIndex, getSets } from "../../lib/card-data";

export default async function SetDetailPage({
  params
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const index = await getCardIndex();
  const { sets } = await getSets();
  const set = sets.find((candidate) => candidate.id === setId);

  if (!set) {
    notFound();
  }

  return (
    <AppFrame active="sets" kicker={set.series} title={set.name} totalCards={index.totalCards}>
      <SetDetailClient set={set} />
    </AppFrame>
  );
}
