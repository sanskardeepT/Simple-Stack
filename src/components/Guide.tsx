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
  ArrowRight,
  X
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
      description: "You can request a complete copy of your Instagram data through the Accounts Center. The data will be delivered as a .zip file. Make sure to select JSON format so it can be analyzed by our system.",
      steps: [
        "Open Instagram and go to your Profile.",
        "Tap the Menu (☰) and select Settings and Privacy.",
        "Open Accounts Center.",
        "Go to Your Information and Permissions.",
        "Select Download Your Information.",
        "Tap Request a Download.",
        "Choose Complete Copy.",
        "Select JSON format.",
        "Submit the request and wait for the email download link.",
      ],
      dataIncluded: [
        "Posts and media",
        "Comments and likes",
        "Stories and reels",
        "Direct messages",
        "Profile information",
      ]
    },
    facebook: {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6 text-blue-500" />,
      description: "Facebook allows you to download a full archive of your activity through the Accounts Center.",
      steps: [
        "Open Facebook and go to Menu.",
        "Select Settings & Privacy → Settings.",
        "Open Accounts Center.",
        "Select Your Information and Permissions.",
        "Click Download Your Information.",
        "Choose your Facebook account.",
        "Select Complete Copy.",
        "Choose JSON format.",
        "Submit the request and wait for the email download link.",
      ],
      dataIncluded: [
        "Posts and photos",
        "Videos and comments",
        "Messenger conversations",
        "Friends list",
        "Activity history",
      ]
    },
    twitter: {
      name: 'X (Twitter)',
      icon: <Twitter className="w-6 h-6 text-zinc-400" />,
      description: "X allows you to download a full archive of your account data including tweets and messages.",
      steps: [
        "Open X and go to Settings and Privacy.",
        "Select Your Account.",
        "Click Download an Archive of Your Data.",
        "Verify your password.",
        "Tap Request Archive.",
        "Wait for the notification or email.",
        "Download the ZIP file when ready.",
      ],
      dataIncluded: [
        "Tweets and retweets",
        "Likes",
        "Direct messages",
        "Profile data",
        "Account activity history",
      ]
    },
    youtube: {
      name: 'YouTube',
      icon: <Youtube className="w-6 h-6 text-red-500" />,
      description: "YouTube data can be exported using Google Takeout.",
      steps: [
        "Go to takeout.google.com.",
        "Sign in to your Google account.",
        "Click Deselect All.",
        "Select YouTube and YouTube Music.",
        "Click Multiple Formats and ensure History = JSON.",
        "Click Next Step.",
        "Choose Send download link via email.",
        "Click Create Export.",
        "Download the ZIP file from the email link.",
      ],
      dataIncluded: [
        "Watch history",
        "Search history",
        "Video comments",
        "Uploaded videos",
        "Playlists and subscriptions",
      ]
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
            <p className="text-zinc-400 text-sm mt-1 max-w-md">{guide.description}</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-zinc-500" />
        </button>
      </div>

      <div className="overflow-y-auto p-8 space-y-8">
        <section className="space-y-4">
          <h4 className="font-bold mb-4 text-zinc-400 text-xs uppercase tracking-widest">Steps to Download</h4>
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

        <section className="pt-8 border-t border-white/5">
          <h4 className="font-bold mb-4 text-zinc-400 text-xs uppercase tracking-widest">Data Included</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {guide.dataIncluded.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 text-center md:text-left">Upload the downloaded ZIP file to our platform to analyze your social media activity.</p>
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all w-full md:w-auto shrink-0"
          >
            I'm ready to upload
          </button>
        </div>
      </div>
    </motion.div>
  );
};
