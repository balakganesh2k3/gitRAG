"use client"

import { useState } from "react"
import { useRepoContext } from "../context/repocontext"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { Card } from "../ui/card"
import { Check, Copy } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

export default function EmbedCodeGenerator() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { repositories } = useRepoContext()

  const embedCode = `<script>
(function(w,d,s,o,f,js,fjs){
  w['GitRAG-Widget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
  js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
  js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
}(window,document,'script','gitrag','${window.location.origin}/widget.js'));

gitrag('init', {
  containerId: 'gitrag-chat',
  repositories: ${JSON.stringify(repositories.map(r => r.id))}
});
</script>
<div id="gitrag-chat"></div>`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Embed code copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy embed code",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Embed Code</Label>
        <Card className="relative">
          <Textarea
            value={embedCode}
            readOnly
            className="min-h-[200px] font-mono text-sm"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">
        Add this code to any webpage where you want to embed the chatbot.
      </p>
    </div>
  )
}

