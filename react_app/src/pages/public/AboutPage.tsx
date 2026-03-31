import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { useAuthModal } from 'hooks/useAuthModal';

export function AboutPage() {
  const { openAuth } = useAuthModal();

  return (
    <div className="ra-page-stack">
      <Card>
        <div className="ra-split-hero">
          <div className="ra-hero-copy">
            <div className="pub-copy-badges">
              <Badge variant="info">THE STORY BEHIND RESUMEAI</Badge>
            </div>
            <h1 className="ra-page-title">Built by a student. For students.</h1>
            <p className="ra-subtitle">resumeai started from the same frustration most early-career people know well: good experience trapped inside bad tooling, ugly documents, and confusing workflows.</p>
            <div className="ra-chip-row">
              <Badge>TeX-first output</Badge>
              <Badge variant="accent">Student-friendly workflow</Badge>
              <Badge variant="info">Shared editor + ATS + JD</Badge>
            </div>
          </div>
          <div className="ra-image-frame">
            <img src="/Images/Graduation_Day.png" alt="Graduation day illustration" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="ra-stack-md">
          <div className="section-label">MISSION</div>
          <h2 className="ra-card-title">Make powerful resume tooling feel approachable.</h2>
          <p className="ra-subtitle">The product tries to keep the serious parts serious and the intimidating parts softer. That means real structure, real output quality, and a friendlier surface.</p>
          <div className="ra-grid-3">
            <Card><div className="ra-stack-md"><div className="pub-icon">AL</div><div className="ra-card-title">Always free</div><div className="ra-card-copy">The product stays focused on low-friction resume building instead of paywall anxiety.</div></div></Card>
            <Card><div className="ra-stack-md"><div className="pub-icon">SF</div><div className="ra-card-title">Student-first</div><div className="ra-card-copy">The writing guidance, structure, and workflows are built with early-career users in mind.</div></div></Card>
            <Card><div className="ra-stack-md"><div className="pub-icon">HD</div><div className="ra-card-title">Honest by default</div><div className="ra-card-copy">The product tries to make resumes clearer and stronger without encouraging fake experience or keyword spam.</div></div></Card>
          </div>
        </div>
      </Card>

      <Card>
        <div className="ra-stack-md">
          <div className="section-label">WHY TEX</div>
          <h2 className="ra-card-title">Serious output without making users think like typesetters.</h2>
          <div className="ra-grid-3">
            <Card><div className="ra-stack-md"><div className="pub-icon">PX</div><div className="ra-card-title">Pixel-stable output</div><div className="ra-card-copy">TeX gives us reliable typography, consistent margins, and fewer layout surprises than ad hoc document editing.</div></div></Card>
            <Card><div className="ra-stack-md"><div className="pub-icon">AS</div><div className="ra-card-title">ATS-safe structure</div><div className="ra-card-copy">The app keeps resume content in a canonical schema so analysis and PDF generation stay aligned.</div></div></Card>
            <Card><div className="ra-stack-md"><div className="pub-icon">LP</div><div className="ra-card-title">Shared product loop</div><div className="ra-card-copy">The same resume flows through editor, ATS, and JD instead of fragmenting into separate tools.</div></div></Card>
          </div>
        </div>
      </Card>

      <Card>
        <div className="ra-split-hero">
          <div className="ra-image-frame">
            <img src="/Images/DP.jpg" alt="Builder portrait" />
          </div>
          <div className="ra-hero-copy">
            <div className="section-label">BUILDER</div>
            <h2 className="ra-card-title">The human behind the product.</h2>
            <p className="ra-subtitle">This project is being built with a student mindset: keep the product sharp, honest, and useful without overcomplicating the experience.</p>
            <div className="ra-stack-md">
              <Badge variant="accent">SOLO BUILD</Badge>
              <p className="ra-card-copy">resumeai is not trying to be every job tool at once. It is trying to make one important workflow feel coherent: write a better resume, render it well, and understand how it performs.</p>
            </div>
            <div className="ra-actions">
              <Button onClick={() => openAuth()}>Get Started</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
