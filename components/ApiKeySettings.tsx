"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useApiKey } from "@/components/ApiKeyProvider";

export default function ApiKeySettings() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(apiKey || "");

  const handleSave = () => {
    setApiKey(input.trim());
    setEditing(false);
  };

  return (
    <Card className="mt-4 animate-in">
      <CardHeader>
        <CardTitle className="text-sm">API Key</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {editing ? (
          <div className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter your Void AI API key"
              className="flex-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-none"
            />
            <Button 
              onClick={handleSave} 
              disabled={!input.trim()}
              className="bg-zinc-900 text-white dark:bg-zinc-200 dark:text-black border-none"
            >
              Save
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setEditing(false)}
              className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-none"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={apiKey ? apiKey.replace(/./g, '*') : ''}
              disabled
              className="flex-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-none"
              placeholder="No API key set"
            />
            <Button 
              onClick={() => setEditing(true)}
              className="bg-zinc-900 text-white dark:bg-zinc-200 dark:text-black border-none"
            >
              {apiKey ? "Change" : "Set Key"}
            </Button>
            {apiKey && (
              <Button 
                variant="destructive" 
                onClick={clearApiKey}
                className="text-white"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
