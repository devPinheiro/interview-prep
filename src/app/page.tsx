import Link from "next/link";
import { TRACKS } from "@/lib/types";
import { countByTrack } from "@/lib/content";
import { ContinueStudying } from "@/components/ContinueStudying";
import { LevelPicker } from "@/components/LevelPicker";

const TRACK_MARKS = ["01", "02", "03", "04", "05"];

export default function HomePage() {
  const counts = countByTrack();
  const firstTrack = TRACKS[0];
  const readyCount = Object.values(counts).reduce((total, track) => total + track.ready, 0);

  return (
    <div className="home-shell">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="animate-fade-up home-eyebrow">Frontend interview practice, on your terms</p>
          <h1 className="animate-fade-up animate-delay-1 home-title">
            Get ready for
            <span>the room.</span>
          </h1>
          <p className="animate-fade-up animate-delay-2 home-intro">
            Build the clarity, craft, and stories that turn a frontend interview into a
            conversation you can lead.
          </p>
          <div className="animate-fade-up animate-delay-3 home-actions">
            <Link href={`/${firstTrack.id}`} className="primary-action">
              Start a practice session <span aria-hidden="true">→</span>
            </Link>
            <a href="#tracks" className="secondary-action">
              Explore every track
            </a>
          </div>
        </div>

        <aside className="animate-fade-up animate-delay-2 prep-card" aria-label="Study coverage">
          <div className="prep-card-topline">
            <span>Interview readiness</span>
            <span className="prep-card-live">Live practice</span>
          </div>
          <div className="prep-orbit" aria-hidden="true">
            <div className="prep-orbit-ring" />
            <span className="prep-orbit-label prep-orbit-label-one">Think</span>
            <span className="prep-orbit-label prep-orbit-label-two">Build</span>
            <span className="prep-orbit-label prep-orbit-label-three">Tell</span>
            <strong>{readyCount}</strong>
            <small>ready prompts</small>
          </div>
          <p className="prep-card-copy">
            One place for technical depth, system thinking, and the human side of the offer.
          </p>
        </aside>
      </section>

      <section className="home-utility" aria-label="Study preferences">
        <div className="home-utility-lead">
          <p className="section-kicker">Make it yours</p>
          <p>Set the bar you’re aiming for, then pick up exactly where you left off.</p>
        </div>
        <LevelPicker />
        <ContinueStudying />
      </section>

      <section id="tracks" className="home-tracks">
        <div className="home-section-heading">
          <div>
            <p className="section-kicker">Your practice plan</p>
            <h2>Five ways to show up prepared.</h2>
          </div>
          <p>
            Move through the technical and human parts of the interview. Each track is built
            for deliberate, repeatable practice.
          </p>
        </div>

        <ul className="track-grid">
          {TRACKS.map((track, index) => {
            const count = counts[track.id];
            return (
              <li key={track.id} className="animate-reveal" style={{ animationDelay: `${0.06 * index}s` }}>
                <Link href={`/${track.id}`} className="track-card">
                  <div className="track-card-meta">
                    <span>{TRACK_MARKS[index]}</span>
                    <span>{count.ready} ready</span>
                  </div>
                  <div>
                    <h3>{track.label}</h3>
                    <p>{track.blurb}</p>
                  </div>
                  <span className="track-card-arrow" aria-hidden="true">↗</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="home-closing">
        <p className="section-kicker">Keep the signal</p>
        <h2>Practice the answer.<br />Own the conversation.</h2>
        <Link href="/interview" className="secondary-action">
          Sit a practice interview <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
