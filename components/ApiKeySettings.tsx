"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useApiKey } from "@/components/ApiKeyProvider";

export default function ApiKeySettings() {
  const { apiKeys, addApiKey, removeApiKey, getUsage, clearAllKeys } = useApiKey();
  const [input, setInput] = useState("");
  const [rpmInputs, setRpmInputs] = useState<{ [key: string]: string }>({});

  const handleAdd = () => {
    if (input.trim()) {
      const rpm = parseInt(rpmInputs[input.trim()]) || 5;
      addApiKey(input.trim(), rpm);
      setInput("");
      setRpmInputs(prev => ({ ...prev, [input.trim()]: "" }));
    }
  };

  return (
    <Card className="mt-4 animate-in">
      <CardHeader>
        <CardTitle className="text-sm">API Keys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter new API key"
            className="flex-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-none"
          />
          <Input
            type="number"
            min={1}
            value={rpmInputs[input] !== undefined ? rpmInputs[input] : 5}
            onChange={e => setRpmInputs(prev => ({ ...prev, [input]: e.target.value }))}
            className="w-16 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-none text-xs px-1"
            placeholder="RPM"
          />
          <Button 
            onClick={handleAdd} 
            disabled={!input.trim()}
            className="bg-zinc-900 text-white dark:bg-zinc-200 dark:text-black border-none"
          >
            Add
          </Button>
          <Button 
            variant="destructive" 
            onClick={clearAllKeys}
            className="text-white"
            disabled={apiKeys.length === 0}
          >
            Clear All
          </Button>
        </div>
        <div className="space-y-2 mt-2">
          {apiKeys.length === 0 && (
            <div className="text-xs text-zinc-400">No API keys added.</div>
          )}
          {apiKeys.map(({ key, rpm }) => (
            <div key={key} className="flex items-center gap-2">
              <Input
                type="text"
                value={key.replace(/./g, '*')}
                disabled
                className="flex-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-none"
                placeholder="API key"
              />
              <span className="text-xs text-zinc-400">{getUsage(key)}/{rpm || 5} RPM</span>
              <Button 
                variant="secondary" 
                onClick={() => removeApiKey(key)}
                className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-none"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
