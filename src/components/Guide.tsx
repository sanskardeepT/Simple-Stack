import React from 'react';
import { motion } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  FileJson, 
  Download, 
  Smartphone, 
  Monitor, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface GuideProps {
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube';
  onClose: () => void;
}

export const DataExportGuide: React.FC<GuideProps> = ({ platform, onClose }) => {
  const guides = {
    instagram: {
      name: 'Instagram',
      icon: <Instagram className="w-6 h-6 text-pink-500" />,
      steps: [
        "Open Instagram and go to your Profile.",
        "Tap the Menu (three lines) and select 'Settings and privacy'.",
        "Tap 'Accounts Center' at the top.",
        "Select 'Your information and permissions' and then 'Download your information'.",
        "Tap 'Request a download' and pick your Instagram account.",
        "Choose 'Complete copy'.",
        "IMPORTANT: Change 'Format' to JSON.",
        "Tap 'Submit Request'. You'll get an email when your ZIP file is ready.",
        "Download the ZIP file and upload it here to 3rd EYE."
      ],
      flow: `
Open App
  ↓
Go to Settings
  ↓
Download Your Information
  ↓
Choose JSON
  ↓
Download ZIP
  ↓
Upload to 3rd EYE`,
    },
    facebook: {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6 text-blue-500" />,
      steps: [
        "Open Facebook and tap your profile picture.",
        "Go to 'Settings & privacy' and then 'Settings'.",
        "Tap 'Accounts Center' at the top.",
        "Select 'Your information and permissions' and then 'Download your information'.",
        "Tap 'Request a download' and pick your Facebook account.",
        "Choose 'Complete copy'.",
        "IMPORTANT: Change 'Format' to JSON.",
        "Tap 'Submit Request'. You'll get an email when your ZIP file is ready.",
        "Download the ZIP file and upload it here to 3rd EYE."
      ],
      flow: `
Open App
  ↓
Go to Settings
  ↓
Download Your Information
  ↓
Choose JSON
  ↓
Download ZIP
  ↓
Upload to 3rd EYE`,
    },
    twitter: {
      name: 'X (Twitter)',
      icon: <Twitter className="w-6 h-6 text-zinc-400" />,
      steps: [
        "Open X and tap your profile icon.",
        "Go to 'Settings and Support' and then 'Settings and privacy'.",
        "Tap 'Your account' and then 'Download an archive of your data'.",
        "Verify your identity with your password or a code.",
        "Tap 'Request archive'.",
        "Wait 24-48 hours. X will notify you when it's ready.",
        "Download the ZIP file and upload it here to 3rd EYE."
      ],
      flow: `
Open App
  ↓
Go to Settings
  ↓
Download Your Information
  ↓
Wait 24-48 Hours
  ↓
Download ZIP
  ↓
Upload to 3rd EYE`,
    },
    youtube: {
      name: 'YouTube',
      icon: <Youtube className="w-6 h-6 text-red-500" />,
      steps: [
        "Go to takeout.google.com on your phone or computer.",
        "Click 'Deselect all'.",
        "Find 'YouTube and YouTube Music' and check the box.",
        "Click 'Multiple formats' and make sure 'History' is set to JSON.",
        "Scroll to the bottom and click 'Next step'.",
        "Click 'Create export'.",
        "Check your email for the download link.",
        "Download the ZIP file and upload it here to 3rd EYE."
      ],
      flow: `
Go to Google Takeout
  ↓
Select YouTube
  ↓
Choose JSON
  ↓
Create Export
  ↓
Check Email
  ↓
Download ZIP
  ↓
Upload to 3rd EYE`,
    }
  };

  const guide = guides[platform];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/5">
            {guide.icon}
          </div>
          <div>
            <h3 className="font-display font-bold text-xl">How to download your {guide.name} data</h3>
            <p className="text-zinc-500 text-xs">Simple Step-by-Step Guide</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <AlertCircle className="w-6 h-6 text-zinc-500 rotate-45" />
        </button>
      </div>

      <div className="overflow-y-auto p-8 space-y-8">
        <section className="space-y-4">
          <div className="space-y-3">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-6 border-t border-white/5">
          <h4 className="font-bold mb-4 text-zinc-400 text-xs uppercase tracking-widest">Process Flow</h4>
          <pre className="font-mono text-xs text-blue-400 bg-black/40 p-6 rounded-2xl border border-white/5 leading-relaxed text-center">
            {guide.flow}
          </pre>
        </section>

        <div className="pt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all"
          >
            I'm ready to upload
          </button>
        </div>
      </div>
    </motion.div>
  );
};
