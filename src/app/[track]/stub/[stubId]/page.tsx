import { notFound } from "next/navigation";
import { TRACKS, type Track } from "@/lib/types";
import { getCatalog, stubFromCatalog } from "@/lib/content";
import { QuestionView } from "@/components/QuestionView";
import { QuestionBreadcrumb } from "@/components/QuestionBreadcrumb";

type Props = { params: Promise<{ track: string; stubId: string }> };

/** Only prebuild hand-authored stubs; bulk catalog resolves on demand. */
export const dynamicParams = true;

export function generateStaticParams() {
  return getCatalog()
    .filter((c) => c.status !== "ready" && !c.id.startsWith("bulk-"))
    .map((c) => ({ track: c.track, stubId: c.id }));
}

export default async function StubPage({ params }: Props) {
  const { track: trackParam, stubId } = await params;
  const meta = TRACKS.find((t) => t.id === trackParam);
  if (!meta) notFound();
  const question = stubFromCatalog(stubId);
  if (!question || question.track !== (trackParam as Track)) notFound();

  return (
    <div>
      <QuestionBreadcrumb trackLabel={meta.label} trackHref={`/${meta.id}`} suffix="stub" />
      <QuestionView question={question} />
    </div>
  );
}
