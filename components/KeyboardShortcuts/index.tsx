"use client";

import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

const shortcuts = [
  { key: "Ctrl + Enter", description: "Submit / Generate images" },
  { key: "Tab", description: "Navigate fields" },
  { key: "1, 2, 3, 4", description: "Select number of outputs" },
  { key: "Arrow → / ←", description: "Switch models" },
  { key: "/ (slash key)", description: "Focus prompt instantly" },
  { key: "Ctrl + K", description: "Open model picker" },
  { key: "Esc", description: "Close modals or popups" },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? to open shortcuts
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
                    {shortcut.key}
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