"use client";

import { Moon, Sun, Heart } from "lucide-react";
import { useTheme } from "@/components/providers";
import { Button } from "@/components/ui/button";
import ModelSelector, { Model } from "@/components/ModelSelector";

interface HeaderProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
}

export default function Header({ selectedModel, onModelChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Drift</h1>
          <span className="text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 px-2 py-1 rounded-full">
            AI Image Generation
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a href="/favorites" title="View Favorites">
            <Button
              variant="ghost"
              size="icon"
              className="text-pink-600 hover:bg-pink-50 dark:hover:bg-zinc-900 transition-all duration-300 ease-in-out"
            >
              <Heart className="h-[1.3rem] w-[1.3rem]" />
              <span className="sr-only">Favorites</span>
            </Button>
          </a>
          <ModelSelector 
            selectedModel={selectedModel}
            onModelChange={onModelChange}
          />
          <Button
            variant="outline"
            size="icon"
            className="bg-white dark:bg-zinc-900 text-black dark:text-white border border-gray-200 dark:border-zinc-800 transition-all duration-300 ease-in-out hover:text-zinc-900 dark:hover:text-zinc-50"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem] animate-in scale-90" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] animate-in scale-90" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
} 