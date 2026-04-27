type OnboardingTourProps = {
  onClose: () => void;
};

const steps = [
  ["1", "Create your website space", "Open Connect and keep your project ID plus API key handy."],
  ["2", "Choose what content you need", "Create a shape like Menu Items, Blog Posts, or Testimonials."],
  ["3", "Add your first item", "Write the actual content your website should show."],
  ["4", "Paste the connect script", "Drop one script tag into your website and watch updates flow through."],
];

export function OnboardingTour({ onClose }: OnboardingTourProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal onboarding-modal stack" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Welcome to SimpleStack</div>
            <div className="muted text-sm">A quick first-time guide so the dashboard feels less like a cockpit.</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="grid-2">
          {steps.map(([step, title, text]) => (
            <div key={step} className="panel stack-sm">
              <span className="marketing-step-number">{step}</span>
              <strong>{title}</strong>
              <span className="muted text-sm">{text}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Let&apos;s go</button>
        </div>
      </div>
    </div>
  );
}
