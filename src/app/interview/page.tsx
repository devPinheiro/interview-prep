import { Interviewer } from "@/components/Interviewer";
import { toInterviewBrief } from "@/lib/interview-brief";
import { getAllQuestions } from "@/lib/content";

export default function InterviewPage() {
  const briefs = getAllQuestions()
    .filter((question) => question.status === "ready")
    .map(toInterviewBrief);

  return <Interviewer briefs={briefs} />;
}
