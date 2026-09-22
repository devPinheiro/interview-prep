import { notFound } from "next/navigation";
import { TRACKS, type Track } from "@/lib/types";
import { getCatalogByTrack, getQuestionsByTrack } from "@/lib/content";
import { TrackIndex } from "@/components/TrackIndex";

type Props = { params: Promise<{ track: string }> };

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }));
}

export default async function TrackPage({ params }: Props) {
  const { track: trackParam } = await params;
  const meta = TRACKS.find((t) => t.id === trackParam);
  if (!meta) notFound();
  const track = meta.id as Track;
  const questions = getQuestionsByTrack(track);
  const catalog = getCatalogByTrack(track);

  return (
    <TrackIndex
      track={track}
      questions={questions}
      catalog={catalog}
      label={meta.label}
      blurb={meta.blurb}
    />
  );
}
