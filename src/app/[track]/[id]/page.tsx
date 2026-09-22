import { notFound } from "next/navigation";
import { TRACKS, type Track } from "@/lib/types";
import { getQuestion, getQuestionsByTrack } from "@/lib/content";
import { QuestionView } from "@/components/QuestionView";
import { QuestionBreadcrumb } from "@/components/QuestionBreadcrumb";

type Props = { params: Promise<{ track: string; id: string }> };

export function generateStaticParams() {
  return TRACKS.flatMap((t) =>
    getQuestionsByTrack(t.id).map((q) => ({ track: t.id, id: q.id })),
  );
}

export default async function QuestionPage({ params }: Props) {
  const { track: trackParam, id } = await params;
  const meta = TRACKS.find((t) => t.id === trackParam);
  if (!meta) notFound();
  const track = meta.id as Track;
  const question = getQuestion(track, id);
  if (!question) notFound();

  const list = getQuestionsByTrack(track);
  const idx = list.findIndex((q) => q.id === id);
  const next = list[idx + 1];
  const nextHref = next ? `/${track}/${next.id}` : undefined;

  return (
    <div>
      <QuestionBreadcrumb trackLabel={meta.label} trackHref={`/${track}`} />
      <QuestionView question={question} nextHref={nextHref} />
    </div>
  );
}
