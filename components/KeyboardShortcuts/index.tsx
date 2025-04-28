"use client";

import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Improved MacOS detection for modern browsers
function isMac() {
  if (typeof window === 'undefined') return false;
  // Prefer userAgentData if available
  // @ts-expect-error: userAgentData is not standard on all browsers, but used for Mac detection
  if (window.navigator.userAgentData && window.navigator.userAgentData.platform) {
    // @ts-expect-error: userAgentData is not standard on all browsers, but used for Mac detection
    return window.navigator.userAgentData.platform.toLowerCase().includes('mac');
  }
  // Fallback to userAgent and platform
  if (window.navigator.platform) {
    return window.navigator.platform.toLowerCase().includes('mac');
  }
  if (window.navigator.userAgent) {
    return window.navigator.userAgent.toLowerCase().includes('mac');
  }
  return false;
}

function formatKey(key: string, mac: boolean): string {
  if (!mac) return key;
  // Replace common keys with Mac symbols
  return key
    .replace(/Ctrl/g, '⌘')
    .replace(/Alt/g, '⌥')
    .replace(/Shift/g, '⇧')
    .replace(/Enter/g, '⏎')
    .replace(/Esc/g, '⎋');
}

const shortcuts = [
  { key: "Ctrl + Enter", description: "Submit / Generate images" },
  { key: "Tab", description: "Navigate fields" },
  { key: "1, 2, 3, 4", description: "Select number of outputs" },
  { key: "q, w, e, r", description: "Change image quality (q=first, w=second, etc.)" },
  { key: "Arrow → / ←", description: "Switch models" },
  { key: "/ (slash key)", description: "Focus prompt instantly" },
  { key: "Ctrl + K", description: "Open model picker" },
  { key: "Esc", description: "Close modals or popups" },
  { key: "Shift + F", description: "Open favorites page" },
];

const imageDialogShortcuts = [
  { key: "F", description: "Favorite/unfavorite image (when expanded)" },
  { key: "D", description: "Download image (when expanded)" },
  { key: "C", description: "Copy image to clipboard (when expanded)" },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMacOS(isMac());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? to open shortcuts
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setIsOpen(true);
      }
      // Shift + F to open favorites
      if (e.shiftKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        router.push("/favorites");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="transition-all duration-300 ease-in-out hover:scale-[0.98] active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <Keyboard className="h-5 w-5" />
        <span className="sr-only">Keyboard shortcuts</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="animate-in max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="text-xs text-muted-foreground mb-2">
              Press <span className="font-mono bg-muted px-1 py-0.5 rounded">Shift + ?</span> to open this dialog anytime
            </div>
            <div className="grid gap-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{shortcut.description}</span>
                  <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {formatKey(shortcut.key, isMacOS)}
                  </code>
                </div>
              ))}
              <div className="pt-2 pb-1 font-semibold text-xs text-zinc-500 uppercase tracking-wider">Image Dialog</div>
              {imageDialogShortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{shortcut.description}</span>
                  <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {formatKey(shortcut.key, isMacOS)}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 